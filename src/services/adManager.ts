// =============================================================================
// Ad Manager — Rewarded-ad lifecycle for Bloomlings monetization
// =============================================================================
// Wraps `react-native-google-mobile-ads` with:
//   • Lazy SDK initialization (idempotent)
//   • Per-touchpoint preload cache so taps feel instant
//   • React hook `useRewardedAd(unit)` returning { isLoaded, isLoading, show }
//   • Graceful failure modes: 'no_fill', 'load_error',
//     'closed_without_reward', 'web_unsupported'
//   • Platform guard: on web (and Expo Go without the native module) every
//     call surfaces `web_unsupported` via `onUnavailable` instead of crashing
//
// Design rules (from docs/design/05-ad-economy.md):
//   • Rewarded-only, opt-in. No interstitials, no banners, no forced ads.
//   • Ads pre-load in the background; tapping a touchpoint plays instantly.
//   • Reward is delivered the moment the ad finishes.
//
// Used by the six touchpoint consumers (first shipping consumer:
// `src/components/offline/WelcomeBackModal.tsx` — Double-Offline Earnings).
// =============================================================================

import { useEffect, useSyncExternalStore } from "react";
import { Platform } from "react-native";
import { trackEvent } from "~/services/analyticsService";

// -----------------------------------------------------------------------------
// Native module — guarded import so web/Expo Go don't crash on load
// -----------------------------------------------------------------------------

/**
 * The `react-native-google-mobile-ads` module is native-only. On web it
 * throws on import, and in Expo Go (no native module compiled in) it's
 * simply absent. We require() it behind a try/catch and operate in
 * "no-op mode" if it isn't available.
 */
type GoogleMobileAdsModule = typeof import("react-native-google-mobile-ads");

let nativeModule: GoogleMobileAdsModule | null = null;

if (Platform.OS !== "web") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    nativeModule = require("react-native-google-mobile-ads");
  } catch {
    nativeModule = null;
  }
}

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

/**
 * One rewarded-ad slot per game touchpoint. Each unit has its own preload
 * cache so e.g. the Sunbeam Boost and Dewdrop Garden don't fight each other.
 */
export type RewardedAdUnit =
  | "doubleOffline"
  | "sunbeamBoost"
  | "dewdropGarden"
  | "luckySprout"
  | "gateAssist"
  | "bossSmash"
  | "comboKeeper";

export type AdUnavailableReason =
  | "no_fill"
  | "load_error"
  | "closed_without_reward"
  | "web_unsupported";

export interface AdShowOptions {
  /** Called when Google confirms the reward. `amount` / `type` come from AdMob. */
  onReward: (amount: number, type: string) => void;
  /** Called when we cannot deliver a reward — the caller should degrade gracefully. */
  onUnavailable: (reason: AdUnavailableReason) => void;
  /** Optional: fired after the ad closes, regardless of reward outcome. */
  onClosed?: () => void;
}

export interface UseRewardedAdResult {
  /** True when a fresh ad is preloaded and `show()` will play immediately. */
  isLoaded: boolean;
  /** True while a preload is in flight. */
  isLoading: boolean;
  /** Request the ad. Exactly one of `onReward` / `onUnavailable` will fire. */
  show: (opts: AdShowOptions) => void;
}

// -----------------------------------------------------------------------------
// Ad unit IDs
// -----------------------------------------------------------------------------

/**
 * Resolve the rewarded ad unit ID for a touchpoint.
 * In dev we always use Google's canonical `TestIds.REWARDED` so the emulator
 * shows the branded "Test Ad" overlay.
 * TODO(prod-ids): wire real unit IDs before Phase 8 (launch).
 */
function getAdUnitId(unit: RewardedAdUnit): string {
  if (nativeModule === null) {
    return "";
  }
  if (__DEV__) {
    return nativeModule.TestIds.REWARDED;
  }
  // Production unit IDs — replace before launch.
  // TODO(prod-ids): Replace all placeholder IDs with real AdMob unit IDs before store submission
  const prodIds: Record<RewardedAdUnit, { ios: string; android: string }> = {
    doubleOffline: { ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/1000000001', android: 'ca-app-pub-XXXXXXXXXXXXXXXX/2000000001' },
    sunbeamBoost: { ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/1000000002', android: 'ca-app-pub-XXXXXXXXXXXXXXXX/2000000002' },
    dewdropGarden: { ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/1000000003', android: 'ca-app-pub-XXXXXXXXXXXXXXXX/2000000003' },
    luckySprout: { ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/1000000004', android: 'ca-app-pub-XXXXXXXXXXXXXXXX/2000000004' },
    gateAssist: { ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/1000000005', android: 'ca-app-pub-XXXXXXXXXXXXXXXX/2000000005' },
    bossSmash: { ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/1000000006', android: 'ca-app-pub-XXXXXXXXXXXXXXXX/2000000006' },
    comboKeeper: { ios: 'ca-app-pub-XXXXXXXXXXXXXXXX/1000000007', android: 'ca-app-pub-XXXXXXXXXXXXXXXX/2000000007' },
  };
  return prodIds[unit][Platform.OS === 'ios' ? 'ios' : 'android'];
}

// -----------------------------------------------------------------------------
// SDK initialization
// -----------------------------------------------------------------------------

let initPromise: Promise<void> | null = null;

/**
 * Initialize the Google Mobile Ads SDK. Idempotent — subsequent calls return
 * the in-flight (or resolved) promise. Never rejects; errors are swallowed so
 * the game never blocks on ad initialization.
 */
export function initializeAds(): Promise<void> {
  if (initPromise !== null) {
    return initPromise;
  }
  if (nativeModule === null) {
    initPromise = Promise.resolve();
    return initPromise;
  }
  initPromise = (async () => {
    try {
      await nativeModule!.default().initialize();
    } catch (err) {
      if (__DEV__) {
        console.warn("[adManager] initializeAds failed:", err);
      }
    }
  })();
  return initPromise;
}

// -----------------------------------------------------------------------------
// Preload cache
// -----------------------------------------------------------------------------

type LoadState = "idle" | "loading" | "loaded" | "error";

interface CacheEntry {
  // `RewardedAd` from the native module. We can't name it precisely while
  // keeping the web/Expo-Go path safe, so we use `unknown` + a type guard.
  ad: unknown;
  state: LoadState;
  lastErrorAt: number;
  /** If a show() is waiting on LOADED, remember the options here. */
  pending: AdShowOptions | null;
  /** Prevent double-dispatch when CLOSED fires after EARNED_REWARD. */
  rewardedThisShow: boolean;
  unsubscribe: (() => void) | null;
}

const cache: Map<RewardedAdUnit, CacheEntry> = new Map();

// --- Subscriber plumbing for useRewardedAd ------------------------------------

type Listener = () => void;
const listeners: Map<RewardedAdUnit, Set<Listener>> = new Map();

function subscribe(unit: RewardedAdUnit, listener: Listener): () => void {
  let set = listeners.get(unit);
  if (set === undefined) {
    set = new Set();
    listeners.set(unit, set);
  }
  set.add(listener);
  return () => {
    set!.delete(listener);
  };
}

function emit(unit: RewardedAdUnit): void {
  const set = listeners.get(unit);
  if (set === undefined) return;
  set.forEach((listener) => listener());
}

function getEntry(unit: RewardedAdUnit): CacheEntry | undefined {
  return cache.get(unit);
}

// -----------------------------------------------------------------------------
// Preload
// -----------------------------------------------------------------------------

/**
 * Kick off an ad load for the given touchpoint. Safe to call repeatedly;
 * no-ops if an ad is already loaded or loading.
 */
export function preloadRewardedAd(unit: RewardedAdUnit): void {
  if (nativeModule === null) return;

  const existing = cache.get(unit);
  if (existing && (existing.state === "loaded" || existing.state === "loading")) {
    return;
  }

  const { RewardedAd, RewardedAdEventType, AdEventType } = nativeModule;
  const adUnitId = getAdUnitId(unit);
  const ad = RewardedAd.createForAdRequest(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  const entry: CacheEntry = {
    ad,
    state: "loading",
    lastErrorAt: 0,
    pending: null,
    rewardedThisShow: false,
    unsubscribe: null,
  };
  cache.set(unit, entry);

  // Wire event listeners — each returns an unsubscribe fn.
  const unsubLoaded = ad.addAdEventListener(
    RewardedAdEventType.LOADED,
    () => {
      entry.state = "loaded";
      emit(unit);
      // If a show() was queued before load completed, run it now.
      if (entry.pending !== null) {
        const opts = entry.pending;
        entry.pending = null;
        showNow(unit, opts);
      }
    }
  );

  const unsubEarned = ad.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    (reward: { amount: number; type: string }) => {
      entry.rewardedThisShow = true;
      trackEvent("ad_rewarded", { unit, result: "completed" });
      // The consumer stored their `onReward` on the entry during `show()`.
      const opts = (entry as { _showOpts?: AdShowOptions })._showOpts;
      if (opts !== undefined) {
        opts.onReward(reward.amount, reward.type);
      }
    }
  );

  const unsubError = ad.addAdEventListener(
    AdEventType.ERROR,
    (err: unknown) => {
      if (__DEV__) {
        console.warn(`[adManager:${unit}] load error:`, err);
      }
      trackEvent("ad_failed", { unit, error: String(err) });
      entry.state = "error";
      entry.lastErrorAt = Date.now();
      emit(unit);
      // If a show() was waiting, surface the error now.
      if (entry.pending !== null) {
        const opts = entry.pending;
        entry.pending = null;
        opts.onUnavailable("load_error");
      }
      // Single retry after a short backoff.
      setTimeout(() => {
        if (entry.state === "error") {
          cache.delete(unit);
          preloadRewardedAd(unit);
        }
      }, ERROR_RETRY_DELAY_MS);
    }
  );

  const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
    const opts = (entry as { _showOpts?: AdShowOptions })._showOpts;
    const wasRewarded = entry.rewardedThisShow;
    // Clear per-show state.
    delete (entry as { _showOpts?: AdShowOptions })._showOpts;
    entry.rewardedThisShow = false;

    if (opts !== undefined) {
      opts.onClosed?.();
      if (!wasRewarded) {
        opts.onUnavailable("closed_without_reward");
      }
    }

    // The ad instance is single-shot — drop it and preload the next one.
    entry.unsubscribe?.();
    cache.delete(unit);
    preloadRewardedAd(unit);
  });

  entry.unsubscribe = () => {
    unsubLoaded();
    unsubEarned();
    unsubError();
    unsubClosed();
  };

  // Kick off the network load.
  try {
    ad.load();
  } catch (err) {
    if (__DEV__) {
      console.warn(`[adManager:${unit}] ad.load() threw:`, err);
    }
    entry.state = "error";
    emit(unit);
  }
}

// -----------------------------------------------------------------------------
// Show
// -----------------------------------------------------------------------------

/** Max time to wait for a preload to complete when show() is called. */
const SHOW_LOAD_TIMEOUT_MS = 3_000;
/** Backoff before retrying after a load error. */
const ERROR_RETRY_DELAY_MS = 5_000;

/**
 * Show a rewarded ad for the given touchpoint. If no ad is ready, we try to
 * preload one and wait up to SHOW_LOAD_TIMEOUT_MS before giving up with
 * `no_fill`.
 */
export function showRewardedAd(
  unit: RewardedAdUnit,
  opts: AdShowOptions
): void {
  if (Platform.OS === "web" || nativeModule === null) {
    opts.onUnavailable("web_unsupported");
    return;
  }

  const entry = getEntry(unit);
  if (entry && entry.state === "loaded") {
    showNow(unit, opts);
    return;
  }
  if (entry && entry.state === "loading") {
    queueShow(unit, entry, opts);
    return;
  }
  // No entry, or entry is in 'error'/'idle' — kick off a load and queue.
  preloadRewardedAd(unit);
  const fresh = getEntry(unit);
  if (fresh === undefined) {
    opts.onUnavailable("load_error");
    return;
  }
  queueShow(unit, fresh, opts);
}

function queueShow(
  unit: RewardedAdUnit,
  entry: CacheEntry,
  opts: AdShowOptions
): void {
  entry.pending = opts;
  // Fail after the timeout if load still hasn't completed.
  setTimeout(() => {
    if (entry.pending === opts) {
      entry.pending = null;
      opts.onUnavailable("no_fill");
    }
  }, SHOW_LOAD_TIMEOUT_MS);
}

function showNow(unit: RewardedAdUnit, opts: AdShowOptions): void {
  const entry = getEntry(unit);
  if (entry === undefined || entry.state !== "loaded") {
    opts.onUnavailable("load_error");
    return;
  }
  // Stash per-show options on the entry so the event listeners can reach them.
  (entry as { _showOpts?: AdShowOptions })._showOpts = opts;
  entry.rewardedThisShow = false;
  try {
    (entry.ad as { show: () => Promise<void> }).show().catch((err) => {
      if (__DEV__) {
        console.warn(`[adManager:${unit}] show() rejected:`, err);
      }
      delete (entry as { _showOpts?: AdShowOptions })._showOpts;
      opts.onUnavailable("load_error");
    });
  } catch (err) {
    if (__DEV__) {
      console.warn(`[adManager:${unit}] show() threw:`, err);
    }
    delete (entry as { _showOpts?: AdShowOptions })._showOpts;
    opts.onUnavailable("load_error");
  }
}

// -----------------------------------------------------------------------------
// React hook
// -----------------------------------------------------------------------------

/**
 * Subscribe a component to a touchpoint's load state. Auto-preloads on mount.
 *
 * Usage:
 *   const { isLoaded, show } = useRewardedAd("doubleOffline");
 *   ...
 *   <Pressable onPress={() => show({ onReward, onUnavailable })}>
 */
export function useRewardedAd(unit: RewardedAdUnit): UseRewardedAdResult {
  const snapshot = useSyncExternalStore(
    (listener) => subscribe(unit, listener),
    () => getEntry(unit)?.state ?? "idle",
    () => "idle" // server snapshot — we only render on native/web client
  );

  useEffect(() => {
    if (Platform.OS === "web" || nativeModule === null) return;
    preloadRewardedAd(unit);
  }, [unit]);

  if (Platform.OS === "web" || nativeModule === null) {
    return {
      isLoaded: false,
      isLoading: false,
      show: (opts: AdShowOptions) => opts.onUnavailable("web_unsupported"),
    };
  }

  return {
    isLoaded: snapshot === "loaded",
    isLoading: snapshot === "loading",
    show: (opts: AdShowOptions) => showRewardedAd(unit, opts),
  };
}
