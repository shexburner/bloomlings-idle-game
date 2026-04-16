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
import { calculateOfflineProgress } from "./offlineProgress";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** Target tick interval in milliseconds (~10 ticks/sec). */
const TICK_INTERVAL_MS = 100;

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

  const tick = useCallback(() => {
    const now = Date.now();
    const state = useGameStore.getState();
    const deltaMs = now - lastTickRef.current;

    // Skip if delta is unreasonably small (< 10ms)
    if (deltaMs < 10) return;

    const result = gameTick(state, now, deltaMs);
    applyTick(state, state, result, now);

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
        // App coming to foreground — roll the daily counters first so
        // streaks / caps reflect the current calendar day before any
        // Dewdrop-shop interactions happen later in this session.
        useGameStore.getState().rolloverDailyState();
        // App coming to foreground — calculate offline progress
        const state = useGameStore.getState();
        const now = Date.now();
        const offlineResult = calculateOfflineProgress(
          state,
          state.lastTickAt,
          now
        );

        if (offlineResult.sunlightEarned > 0) {
          state.addSunlight(offlineResult.sunlightEarned);
          state.addZoneProgress(offlineResult.sunlightEarned);
        }

        // Surface a welcome-back summary for the UI. Skip for very short
        // away windows (tab switches, etc.) to keep the modal non-annoying.
        if (
          offlineResult.sunlightEarned > 0 &&
          offlineResult.durationMs >= OFFLINE_MODAL_MIN_MS
        ) {
          state.setLastOfflineSession({
            sunlightEarned: offlineResult.sunlightEarned,
            durationMs: offlineResult.durationMs,
            wasCapped: offlineResult.wasCapped,
            efficiency: offlineResult.efficiency,
          });
        }

        state.setLastActiveAt(now);
        state.setLastTickAt(now);
        lastTickRef.current = now;

        // Clear any expired boosts
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

        startLoop();
      } else if (nextAppState === "background" || nextAppState === "inactive") {
        // App going to background — stop the loop and record the timestamp
        const now = Date.now();
        useGameStore.getState().setLastTickAt(now);
        useGameStore.getState().setLastActiveAt(now);
        stopLoop();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    // Start the loop immediately
    startLoop();

    return () => {
      subscription.remove();
      stopLoop();
    };
  }, [startLoop, stopLoop]);
}
