// =============================================================================
// Transcendence Engine — Pure functions for Prestige Layer 2
// =============================================================================
// Transcendence is the second prestige layer. It resets everything (including
// Nectar upgrades) in exchange for Essence, a permanent meta-currency that
// funds the Essence shop. Unlock condition: 10+ Rebirths AND Zone 150+.
// =============================================================================

import type { PrestigeState } from "~/types/game";
import { EvolutionStage } from "~/types/game";
import type { Bloomling } from "~/types/game";

// -----------------------------------------------------------------------------
// Constants (from docs/economy/04-prestige-math.md)
// -----------------------------------------------------------------------------

/** Minimum Nectar spent required before any Essence is earned. */
export const ESSENCE_THRESHOLD = 50;

/** Base Essence amount per formula. */
export const ESSENCE_BASE = 1;

/** Exponent for Essence curve. */
export const ESSENCE_EXPONENT = 1.8;

/** Minimum Rebirths required to unlock Transcendence. */
export const TRANSCENDENCE_MIN_REBIRTHS = 10;

/** Minimum all-time zone required to unlock Transcendence. */
export const TRANSCENDENCE_MIN_ZONE = 150;

// -----------------------------------------------------------------------------
// Core Calculations
// -----------------------------------------------------------------------------

/**
 * Essence earned on Transcendence.
 * Formula: floor(1 * (totalNectarSpent / 50)^1.8)
 */
export function calculateEssenceEarned(
  state: Pick<PrestigeState, "totalNectarSpent">
): number {
  const totalSpent = state.totalNectarSpent;
  if (totalSpent < ESSENCE_THRESHOLD) return 0;
  return Math.floor(
    ESSENCE_BASE * Math.pow(totalSpent / ESSENCE_THRESHOLD, ESSENCE_EXPONENT)
  );
}

/**
 * Whether the player meets the requirements to Transcend.
 * Requires 10+ Rebirths AND all-time highest zone >= 150.
 */
export function canTranscend(
  state: Pick<PrestigeState, "rebirthCount" | "allTimeHighestZone">
): boolean {
  return (
    state.rebirthCount >= TRANSCENDENCE_MIN_REBIRTHS &&
    state.allTimeHighestZone >= TRANSCENDENCE_MIN_ZONE
  );
}

/** Summary returned by getTranscendencePreview for UI display. */
export interface TranscendencePreview {
  /** Essence that will be earned. */
  essenceEarned: number;
  /** Cumulative Essence after this Transcendence. */
  totalEssenceAfter: number;
  /** Whether the player meets unlock requirements. */
  canTranscend: boolean;
  /** Rebirths completed this cycle (will be reset to 0). */
  rebirthsThisCycle: number;
}

/**
 * Preview of what a Transcendence will yield — used by the Transcendence UI.
 */
export function getTranscendencePreview(
  state: Pick<PrestigeState, "totalNectarSpent" | "rebirthCount" | "allTimeHighestZone" | "totalEssenceEarned">
): TranscendencePreview {
  const essenceEarned = calculateEssenceEarned(state);
  return {
    essenceEarned,
    totalEssenceAfter: state.totalEssenceEarned + essenceEarned,
    canTranscend: canTranscend(state),
    rebirthsThisCycle: state.rebirthCount,
  };
}

// -----------------------------------------------------------------------------
// State Transformations
// -----------------------------------------------------------------------------

/**
 * Reset all Bloomlings to level 1 / Sprout / out-of-garden for Transcendence.
 * Unlike Rebirth, Transcendence offers no retention — everything resets.
 */
export function resetBloomlingsForTranscendence(
  bloomlings: Record<string, Bloomling>
): Record<string, Bloomling> {
  return Object.fromEntries(
    Object.entries(bloomlings).map(([id, b]) => [
      id,
      {
        ...b,
        level: 1,
        evolutionStage: EvolutionStage.Sprout,
        inGarden: false,
        gardenSlot: null,
      },
    ])
  );
}
