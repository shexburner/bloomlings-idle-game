// =============================================================================
// Offline Progress — Compute Sunlight earned while the app was backgrounded
// =============================================================================
// Pure engine module. Reads store state + a timestamp, returns earnings.
// Upgrade wiring:
//   - Cosmic Roots (Essence) lifts offline *efficiency* from 50% toward 100%,
//     at 1/3 of the remaining gap per level (max level 3).
//   - Deep Roots (Nectar) adds a +10%-per-level multiplier on final offline
//     yield (max level 10 → +100%).
//   - Offline Boost (Dewdrop perk) raises the efficiency *floor* from 50%
//     to 75% — effectively halving the gap Cosmic Roots still needs to close.
// The `adBoost` flag doubles final earnings and exists so the future AdMob
// "Double Offline" touchpoint can wire in without touching engine shape.
// =============================================================================
import {
  OFFLINE_BOOST_EFFICIENCY,
  PERK_ID,
} from "~/data/perkTemplates";
import { totalSunlightPerSecondFromRegistry } from "~/state/selectors";
import type { GameStore } from "~/state/store";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** Maximum offline time to award progress for (24 hours). */
export const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000;

/** Base offline production efficiency (50% of real-time). */
export const BASE_OFFLINE_EFFICIENCY = 0.5;

/** Deep Roots Nectar upgrade: +10% offline yield per level. */
export const DEEP_ROOTS_BONUS_PER_LEVEL = 0.1;

/** Deep Roots hard cap (sourced from docs/content/03-upgrades-flavor.md). */
export const DEEP_ROOTS_MAX_LEVEL = 10;

/** Cosmic Roots Essence upgrade: drives efficiency toward 100% in `max` steps. */
export const COSMIC_ROOTS_MAX_LEVEL = 3;

/** Double-Offline ad touchpoint multiplier. */
export const AD_BOOST_MULTIPLIER = 2;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/** Result of an offline progress calculation. */
export interface OfflineProgressResult {
  /** Total sunlight earned while offline (already includes efficiency, Deep Roots, ad boost). */
  sunlightEarned: number;
  /** Duration in milliseconds actually used (post-cap). */
  durationMs: number;
  /** Whether the raw duration was capped at MAX_OFFLINE_MS. */
  wasCapped: boolean;
  /** Effective efficiency fraction [0.5, 1.0] — exposed so UI can surface it. */
  efficiency: number;
}

/** Optional modifiers for the offline calc. */
export interface OfflineProgressOptions {
  /** If true, double the final earnings (the Double-Offline ad touchpoint). */
  adBoost?: boolean;
}

// -----------------------------------------------------------------------------
// Efficiency + Yield Multiplier
// -----------------------------------------------------------------------------

/**
 * Offline efficiency fraction. The floor is lifted by the Offline Boost
 * Dewdrop perk (50% → 75%), then Cosmic Roots closes the remaining gap
 * toward 100% across its three levels.
 * Returns a value in `[BASE_OFFLINE_EFFICIENCY, 1.0]`.
 */
export function getOfflineEfficiency(
  state: Pick<GameStore, "upgrades" | "perks">
): number {
  const cosmicLevel = Math.min(
    state.upgrades["cosmic_roots"]?.level ?? 0,
    COSMIC_ROOTS_MAX_LEVEL
  );
  const hasOfflineBoost =
    state.perks?.[PERK_ID.OfflineBoost]?.purchased === true;
  const floor = hasOfflineBoost ? OFFLINE_BOOST_EFFICIENCY : BASE_OFFLINE_EFFICIENCY;
  const gap = 1 - floor;
  return floor + gap * (cosmicLevel / COSMIC_ROOTS_MAX_LEVEL);
}

/**
 * Final-yield multiplier from Deep Roots. Independent of efficiency;
 * can legitimately push total offline yield above real-time.
 */
export function getDeepRootsMultiplier(
  state: Pick<GameStore, "upgrades">
): number {
  const level = Math.min(
    state.upgrades["deep_roots"]?.level ?? 0,
    DEEP_ROOTS_MAX_LEVEL
  );
  return 1 + DEEP_ROOTS_BONUS_PER_LEVEL * level;
}

// -----------------------------------------------------------------------------
// Main Calculation
// -----------------------------------------------------------------------------

/**
 * Calculate offline progress from `lastTickAt` to `now`.
 * Pure: no store writes. Caller is responsible for applying the result.
 *
 * Active boosts are intentionally NOT applied to offline progress — their
 * exact expiry within the offline window would make the math brittle.
 */
export function calculateOfflineProgress(
  state: Pick<GameStore, "bloomlings" | "garden" | "upgrades" | "perks">,
  lastTickAt: number,
  now: number,
  options: OfflineProgressOptions = {}
): OfflineProgressResult {
  const rawDuration = now - lastTickAt;
  const wasCapped = rawDuration > MAX_OFFLINE_MS;
  const durationMs = Math.min(Math.max(rawDuration, 0), MAX_OFFLINE_MS);
  const efficiency = getOfflineEfficiency(state);

  if (durationMs <= 0) {
    return { sunlightEarned: 0, durationMs: 0, wasCapped: false, efficiency };
  }

  const durationSeconds = durationMs / 1000;
  const baseIdleRate = totalSunlightPerSecondFromRegistry(state);
  const deepRootsMult = getDeepRootsMultiplier(state);
  const adMult = options.adBoost ? AD_BOOST_MULTIPLIER : 1;

  const sunlightEarned =
    baseIdleRate * durationSeconds * efficiency * deepRootsMult * adMult;

  return { sunlightEarned, durationMs, wasCapped, efficiency };
}
