// =============================================================================
// Tap System — Tap handling with combo, crits, and anti-autoclicker
// =============================================================================
// Pure functions for tap reward calculation, combo tracking, and tap
// validation. Plus a React hook that connects to the Zustand store.
// =============================================================================

import { useCallback, useRef } from "react";
import { useGameStore } from "~/state/store";
import {
  selectEffectiveTapValue,
  getComboMultiplier,
} from "~/state/selectors";
import type { GameStore } from "~/state/store";
import { LUCKY_SPROUT_TAP_BOOST_MULTIPLIER } from "./luckySprout";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** Base critical tap multiplier. */
const BASE_CRIT_MULTIPLIER = 5;

/** Base critical tap chance (5%). */
const BASE_CRIT_CHANCE = 0.05;

/** Combo decay window in milliseconds. */
const COMBO_DECAY_MS = 1500;

/** Maximum combo count. */
const MAX_COMBO = 100;

/** Maximum allowed taps per second (anti-autoclicker). */
const MAX_TAPS_PER_SECOND = 20;

/** Window in milliseconds for anti-autoclicker check. */
const ANTI_CLICK_WINDOW_MS = 1000;

// -----------------------------------------------------------------------------
// Tap Result Type
// -----------------------------------------------------------------------------

/** Result of a single tap, returned to the UI for display. */
export interface TapResult {
  /** Sunlight earned from this tap. */
  sunlight: number;
  /** Whether this was a critical tap. */
  isCritical: boolean;
  /** Current combo count after this tap. */
  comboCount: number;
  /** Current combo multiplier after this tap. */
  comboMultiplier: number;
}

// -----------------------------------------------------------------------------
// Pure Functions
// -----------------------------------------------------------------------------

/**
 * Calculate the reward for a single tap.
 *
 * Formula: baseTapValue * tapMultiplier * comboMultiplier * (isCrit ? critMultiplier : 1)
 * - comboMultiplier = 1 + (comboCount * 0.05)
 * - Critical roll: Math.random() < critChance => 5x multiplier
 */
export function calculateTapReward(
  baseTapValue: number,
  tapMultiplier: number,
  comboCount: number,
  critChance: number = BASE_CRIT_CHANCE,
  critMultiplier: number = BASE_CRIT_MULTIPLIER,
  randomValue?: number
): TapResult {
  const comboMultiplier = getComboMultiplier(comboCount);
  const roll = randomValue ?? Math.random();
  const isCritical = roll < critChance;

  const sunlight =
    baseTapValue *
    tapMultiplier *
    comboMultiplier *
    (isCritical ? critMultiplier : 1);

  return {
    sunlight,
    isCritical,
    comboCount,
    comboMultiplier,
  };
}

/**
 * Whether the combo should reset based on time since last tap.
 * Combo resets if > 1500ms since last tap.
 */
export function shouldResetCombo(lastTapTimestamp: number, now: number): boolean {
  if (lastTapTimestamp === 0) return false;
  return now - lastTapTimestamp > COMBO_DECAY_MS;
}

/**
 * Get the new combo count after a tap.
 * If the combo should reset (gap > 1.5s), starts fresh at 1.
 * Otherwise increments, capped at MAX_COMBO.
 */
export function getNextComboCount(
  currentCount: number,
  lastTapTimestamp: number,
  now: number,
  frozen: boolean
): number {
  // If frozen, never reset — just increment
  if (frozen) {
    return Math.min(currentCount + 1, MAX_COMBO);
  }

  // If gap too large, reset to 1 (this tap starts a new combo)
  if (shouldResetCombo(lastTapTimestamp, now)) {
    return 1;
  }

  return Math.min(currentCount + 1, MAX_COMBO);
}

// -----------------------------------------------------------------------------
// Anti-Autoclicker
// -----------------------------------------------------------------------------

/**
 * Validate a tap against the anti-autoclicker system.
 * Returns true if the tap should be accepted, false if it should be dropped.
 *
 * Rule: Maximum 20 taps within the last 1 second.
 *
 * @param tapHistory - Array of recent tap timestamps (most recent last).
 * @param now - Current timestamp.
 */
export function isValidTap(tapHistory: readonly number[], now: number): boolean {
  // Count taps within the last 1 second
  const windowStart = now - ANTI_CLICK_WINDOW_MS;
  let recentCount = 0;
  for (let i = tapHistory.length - 1; i >= 0; i--) {
    const ts = tapHistory[i];
    if (ts === undefined) break;
    if (ts < windowStart) break;
    recentCount++;
  }

  return recentCount < MAX_TAPS_PER_SECOND;
}

// -----------------------------------------------------------------------------
// useTapHandler Hook
// -----------------------------------------------------------------------------

/** Return type of the useTapHandler hook. */
export interface TapHandler {
  /** Call this on each tap event. Returns the TapResult, or null if tap was rejected. */
  onTap: () => TapResult | null;
  /** Current combo count. */
  comboCount: number;
  /** Current combo multiplier. */
  comboMultiplier: number;
}

/**
 * React hook that connects tap logic to the Zustand store.
 *
 * Validates taps, calculates rewards, and updates state (addSunlight,
 * incrementCombo, zone progress, stats).
 */
export function useTapHandler(): TapHandler {
  const tapHistoryRef = useRef<number[]>([]);

  const comboCount = useGameStore((state) => state.combo.count);
  const comboMultiplier = getComboMultiplier(comboCount);

  const onTap = useCallback((): TapResult | null => {
    const now = Date.now();
    const tapHistory = tapHistoryRef.current;

    // --- Anti-autoclicker validation ---
    if (!isValidTap(tapHistory, now)) {
      return null;
    }

    // Record this tap in history (keep last 30 entries for efficiency)
    tapHistory.push(now);
    if (tapHistory.length > 30) {
      tapHistory.splice(0, tapHistory.length - 30);
    }

    const state = useGameStore.getState();

    // --- Determine new combo count ---
    const newComboCount = getNextComboCount(
      state.combo.count,
      state.combo.lastTapAt,
      now,
      state.combo.frozen
    );

    // --- Calculate tap reward ---
    const baseTapValue = selectEffectiveTapValue(state);

    const critChanceLevel = state.upgrades["tap_crit_chance"]?.level ?? 0;
    const critDamageLevel = state.upgrades["tap_crit_damage"]?.level ?? 0;
    const effectiveCritChance = BASE_CRIT_CHANCE + critChanceLevel * 0.02;
    const effectiveCritMultiplier = BASE_CRIT_MULTIPLIER + critDamageLevel * 0.50;

    // tapMultiplier is already folded into baseTapValue via selectEffectiveTapValue,
    // so we pass 1.0 as the tapMultiplier to avoid double-multiplying.
    const rawResult = calculateTapReward(
      baseTapValue,
      1.0,
      newComboCount,
      effectiveCritChance,
      effectiveCritMultiplier
    );

    // Apply Lucky Sprout 2× tap boost if active.
    const tapBoostActive =
      state.luckySproutTapBoostExpiresAt !== null &&
      now < state.luckySproutTapBoostExpiresAt;
    const result: TapResult = tapBoostActive
      ? { ...rawResult, sunlight: rawResult.sunlight * LUCKY_SPROUT_TAP_BOOST_MULTIPLIER }
      : rawResult;

    // --- Apply state updates ---
    // Update combo (this also updates lastTapAt and sessionMaxCombo)
    if (shouldResetCombo(state.combo.lastTapAt, now) && !state.combo.frozen) {
      state.resetCombo();
    }
    state.incrementCombo(now);

    // Add sunlight reward
    state.addSunlight(result.sunlight);

    // Add to zone progress
    state.addZoneProgress(result.sunlight);

    // Update stats
    useGameStore.setState((prev) => ({
      stats: {
        ...prev.stats,
        totalTaps: prev.stats.totalTaps + 1,
        totalCriticalTaps:
          prev.stats.totalCriticalTaps + (result.isCritical ? 1 : 0),
        highestCombo: Math.max(prev.stats.highestCombo, newComboCount),
      },
    }));

    return result;
  }, []);

  return {
    onTap,
    comboCount,
    comboMultiplier,
  };
}
