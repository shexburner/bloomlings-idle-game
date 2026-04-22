// =============================================================================
// Game Loop — Delta-time tick system with offline progress
// =============================================================================
// Pure game-logic functions + a React hook that orchestrates them.
// The hook runs at ~10 ticks/sec, pauses on background, and applies
// offline progress on resume.
// =============================================================================

import { useEffect, useRef, useCallback } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useGameStore } from "~/state/store";
import {
  totalSunlightPerSecondFromRegistry,
  getActiveBoosts,
  getBoostMultiplier,
  hasReachedZoneThreshold,
} from "~/state/selectors";
import type { GameStore } from "~/state/store";
import {
  calculateOfflineProgress,
  type OfflineProgressResult,
} from "./offlineProgress";
import { nextLuckySproutIntervalMs } from "./luckySprout";
import * as audioService from "~/services/audioService";
import { zoneAdvanceHaptic, achievementHaptic } from "~/utils/haptics";
import {
  cancelGameNotifications,
  scheduleGameNotifications,
} from "~/services/notificationService";
import { trackEvent } from "~/services/analyticsService";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** Target tick interval in milliseconds (~10 ticks/sec). */
const TICK_INTERVAL_MS = 100;

/** Module-level session counter for analytics (not persisted). */
let sessionCount = 0;
let sessionStartedAt = Date.now();

/** How often (ms) to check if a Lucky Sprout should be triggered (foreground only). */
const LUCKY_SPROUT_CHECK_INTERVAL_MS = 30_000;

/** How often (ms) to run the passive achievement check (foreground only). */
const ACHIEVEMENT_CHECK_INTERVAL_MS = 30_000;

/** Offline duration that triggers the "Patient Gardener" hidden achievement (ms). */
const PATIENT_GARDENER_THRESHOLD_MS = 24 * 60 * 60 * 1000;

/** Hour range (local) for the "Night Owl" hidden achievement (midnight to 5 AM). */
const NIGHT_OWL_START_HOUR = 0;
const NIGHT_OWL_END_HOUR = 5;

/** Combo decay window: reset combo if no tap for 1.5 seconds. */
const COMBO_DECAY_MS = 1500;

/**
 * Don't surface the Welcome Back modal for tiny away windows — prevents it
 * from popping up during brief tab/app switches.
 */
const OFFLINE_MODAL_MIN_MS = 30 * 1000;

// -----------------------------------------------------------------------------
// Pure Tick Function
// -----------------------------------------------------------------------------

/** Result of a single game tick. */
export interface TickResult {
  /** Sunlight earned from idle production this tick. */
  sunlightEarned: number;
  /** Whether the combo was reset this tick. */
  comboReset: boolean;
  /** Whether the zone threshold was reached. */
  zoneThresholdReached: boolean;
  /** IDs of boosts that expired this tick. */
  expiredBoostCount: number;
}

/**
 * Core tick function — pure game logic, no side effects.
 *
 * @param state - A readonly snapshot of the game store.
 * @param now - Current timestamp in milliseconds.
 * @param deltaMs - Milliseconds elapsed since the last tick.
 * @returns Actions to apply to the store.
 */
export function gameTick(
  state: Pick<
    GameStore,
    | "resources"
    | "bloomlings"
    | "garden"
    | "combo"
    | "activeBoosts"
    | "zoneProgress"
    | "upgrades"
  >,
  now: number,
  deltaMs: number
): TickResult {
  const deltaSeconds = deltaMs / 1000;

  // --- 1. Idle Sunlight production ---
  const baseIdleRate = totalSunlightPerSecondFromRegistry(state);
  const boostMultiplier = getBoostMultiplier(state, now);
  const sunlightEarned = baseIdleRate * deltaSeconds * boostMultiplier;

  // --- 2. Combo decay ---
  let comboReset = false;
  if (
    state.combo.count > 0 &&
    !state.combo.frozen &&
    now - state.combo.lastTapAt > COMBO_DECAY_MS
  ) {
    comboReset = true;
  }

  // Handle frozen combo expiration
  if (
    state.combo.frozen &&
    state.combo.freezeExpiresAt !== null &&
    now > state.combo.freezeExpiresAt
  ) {
    // Freeze expired — combo may also decay on next tick
    comboReset = false; // Don't reset yet; just unfreeze. Next tick will check.
  }

  // --- 3. Zone threshold check ---
  const zoneThresholdReached = hasReachedZoneThreshold(state);

  // --- 4. Boost timer expiration ---
  const activeBoostsBefore = state.activeBoosts.length;
  const activeBoostsAfter = getActiveBoosts(state, now).length;
  const expiredBoostCount = activeBoostsBefore - activeBoostsAfter;

  return {
    sunlightEarned,
    comboReset,
    zoneThresholdReached,
    expiredBoostCount,
  };
}

/**
 * Apply a tick result to the store.
 * Separated from the pure tick function for testability.
 */
export function applyTick(
  store: {
    addSunlight: GameStore["addSunlight"];
    resetCombo: GameStore["resetCombo"];
    setComboFrozen: GameStore["setComboFrozen"];
    advanceZone: GameStore["advanceZone"];
    setLastTickAt: GameStore["setLastTickAt"];
    setActiveBoosts: GameStore["setActiveBoosts"];
    addZoneProgress: GameStore["addZoneProgress"];
  },
  state: Pick<GameStore, "combo" | "activeBoosts">,
  result: TickResult,
  now: number
): void {
  // Apply idle sunlight
  if (result.sunlightEarned > 0) {
    store.addSunlight(result.sunlightEarned);
    store.addZoneProgress(result.sunlightEarned);
  }

  // Reset combo if decayed
  if (result.comboReset) {
    store.resetCombo();
  }

  // Unfreeze combo if freeze expired
  if (
    state.combo.frozen &&
    state.combo.freezeExpiresAt !== null &&
    now > state.combo.freezeExpiresAt
  ) {
    store.setComboFrozen(false, null);
  }

  // Remove expired boosts
  if (result.expiredBoostCount > 0) {
    const remaining = state.activeBoosts.filter(
      (boost) => boost.expiresAt > now
    );
    store.setActiveBoosts(remaining);
  }

  // Auto-advance zone if threshold met
  if (result.zoneThresholdReached) {
    store.advanceZone();
  }

  // Update tick timestamp
  store.setLastTickAt(now);
}

// -----------------------------------------------------------------------------
// Offline Progress Application
// -----------------------------------------------------------------------------

/**
 * Apply offline progress to the store for the period since `lastTickAt`.
 *
 * Safe to call on cold start (when lastTickAt > 0) and on foreground resume.
 * Guards against brand-new saves (lastTickAt === 0) and zero-duration windows.
 *
 * @returns The OfflineProgressResult if progress was computed, null otherwise.
 */
export function applyOfflineProgress(now: number): OfflineProgressResult | null {
  const state = useGameStore.getState();

  // Brand-new save — nothing to credit yet.
  if (state.lastTickAt <= 0) return null;

  const result = calculateOfflineProgress(state, state.lastTickAt, now);

  if (result.sunlightEarned > 0) {
    state.addSunlight(result.sunlightEarned);
    state.addZoneProgress(result.sunlightEarned);
  }

  if (result.sunlightEarned > 0 && result.durationMs >= OFFLINE_MODAL_MIN_MS) {
    state.setLastOfflineSession({
      sunlightEarned: result.sunlightEarned,
      durationMs: result.durationMs,
      wasCapped: result.wasCapped,
      efficiency: result.efficiency,
    });
  }

  if (result.sunlightEarned > 0) {
    if (result.durationMs >= PATIENT_GARDENER_THRESHOLD_MS) {
      useGameStore.getState().triggerHiddenAchievement("patient_gardener");
    }
    const hour = new Date(now).getHours();
    if (hour >= NIGHT_OWL_START_HOUR && hour < NIGHT_OWL_END_HOUR) {
      useGameStore.setState((s) => ({
        stats: {
          ...s.stats,
          nightOwlOfflineCollections: s.stats.nightOwlOfflineCollections + 1,
        },
      }));
      useGameStore.getState().checkAndGrantAchievements();
    }
  }

  state.setLastActiveAt(now);
  state.setLastTickAt(now);

  return result;
}

// -----------------------------------------------------------------------------
// useGameLoop Hook
// -----------------------------------------------------------------------------

/**
 * React hook that drives the game loop.
 *
 * - Runs ~10 ticks per second via setInterval.
 * - Pauses when the app goes to background.
 * - Applies offline progress when the app comes back to foreground.
 *
 * Mount this hook once at the root of the app.
 */
export function useGameLoop(): void {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(Date.now());
  const luckySproutLastCheckRef = useRef<number>(Date.now());
  const achievementLastCheckRef = useRef<number>(Date.now());
  // Pre-rolled target interval; re-rolled only after each spawn resolves so the
  // distribution stays uniform rather than biased toward the minimum.
  const luckySproutNextIntervalRef = useRef<number>(nextLuckySproutIntervalMs());

  const tick = useCallback(() => {
    const now = Date.now();
    const state = useGameStore.getState();
    const deltaMs = now - lastTickRef.current;

    // Skip if delta is unreasonably small (< 10ms)
    if (deltaMs < 10) return;

    // Lucky Sprout scheduler: check every 30s of foreground play.
    if (now - luckySproutLastCheckRef.current >= LUCKY_SPROUT_CHECK_INTERVAL_MS) {
      luckySproutLastCheckRef.current = now;
      if (state.lastLuckySproutAt === null) {
        // First launch: seed the timestamp so the 10–15 min interval starts
        // from now rather than triggering immediately on the first check.
        useGameStore.setState({ lastLuckySproutAt: now });
        luckySproutNextIntervalRef.current = nextLuckySproutIntervalMs();
      } else if (
        !state.luckySproutPending &&
        state.lastOfflineSession === null &&
        now - state.lastLuckySproutAt > luckySproutNextIntervalRef.current
      ) {
        state.triggerLuckySprout();
        // Re-roll the interval for the next spawn cycle.
        luckySproutNextIntervalRef.current = nextLuckySproutIntervalMs();
      }
    }

    // Achievement check: every 30s of foreground play.
    if (now - achievementLastCheckRef.current >= ACHIEVEMENT_CHECK_INTERVAL_MS) {
      achievementLastCheckRef.current = now;
      const achievementsBefore = Object.values(
        useGameStore.getState().achievements
      ).filter((a) => a.completedAt !== null).length;
      useGameStore.getState().checkAndGrantAchievements();
      const achievementsAfter = Object.values(
        useGameStore.getState().achievements
      ).filter((a) => a.completedAt !== null).length;
      if (achievementsAfter > achievementsBefore) {
        achievementHaptic();
        audioService.play("achievement");
      }
    }

    const result = gameTick(state, now, deltaMs);
    applyTick(state, state, result, now);

    if (result.zoneThresholdReached) {
      zoneAdvanceHaptic();
      audioService.play("zoneAdvance");
    }

    lastTickRef.current = now;
  }, []);

  const startLoop = useCallback(() => {
    if (intervalRef.current !== null) return;
    lastTickRef.current = Date.now();
    intervalRef.current = setInterval(tick, TICK_INTERVAL_MS);
    useGameStore.getState().setEngineRunning(true);
  }, [tick]);

  const stopLoop = useCallback(() => {
    if (intervalRef.current === null) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    useGameStore.getState().setEngineRunning(false);
  }, []);

  // Handle app state changes (foreground/background)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        // Roll daily counters first so streaks/caps reflect the current
        // calendar day before any Dewdrop-shop interactions happen.
        useGameStore.getState().rolloverDailyState();

        const now = Date.now();
        applyOfflineProgress(now);
        lastTickRef.current = now;

        // Clear any expired boosts
        const state = useGameStore.getState();
        const activeBoosts = state.activeBoosts.filter(
          (b) => b.expiresAt > now
        );
        if (activeBoosts.length !== state.activeBoosts.length) {
          state.setActiveBoosts(activeBoosts);
        }

        // Reset combo (was inactive, combo decayed)
        if (state.combo.count > 0) {
          state.resetCombo();
        }

        void cancelGameNotifications();
        startLoop();
        trackEvent("session_start", { session_count: ++sessionCount });
        sessionStartedAt = Date.now();
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        trackEvent("session_end", { duration_seconds: Math.round((Date.now() - sessionStartedAt) / 1000) });
        // App going to background — stop the loop and record the timestamp
        const now = Date.now();
        useGameStore.getState().setLastTickAt(now);
        useGameStore.getState().setLastActiveAt(now);
        stopLoop();
        void scheduleGameNotifications(useGameStore.getState());
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Cold-start: apply any offline progress accumulated since the last save.
    // AppState does not fire "active" on initial mount, so we must handle it
    // here explicitly.
    useGameStore.getState().rolloverDailyState();
    const coldStartNow = Date.now();
    applyOfflineProgress(coldStartNow);
    lastTickRef.current = coldStartNow;
    trackEvent("session_start", { session_count: ++sessionCount });
    sessionStartedAt = coldStartNow;

    startLoop();

    return () => {
      subscription.remove();
      stopLoop();
    };
  }, [startLoop, stopLoop]);
}
