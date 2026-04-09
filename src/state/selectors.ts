// =============================================================================
// Selectors — Computed values derived from game state
// =============================================================================
// All game math lives here as pure functions. These are called both by
// React components (via the store) and by game-loop / prestige logic.
// =============================================================================

import { EvolutionStage } from "~/types/game";
import type { GameStore } from "./store";

// -----------------------------------------------------------------------------
// Constants (from economy docs)
// -----------------------------------------------------------------------------

/** Zone threshold formula: 50 * 1.12^zoneNumber */
const ZONE_THRESHOLD_BASE = 50;
const ZONE_THRESHOLD_SCALING = 1.12;

/** Nectar formula constants (from 04-prestige-systems.md) */
const NECTAR_BASE = 1;
const NECTAR_THRESHOLD = 40;
const NECTAR_EXPONENT = 2.2;

/** Essence formula constants (from 04-prestige-systems.md) */
const ESSENCE_BASE = 1;
const ESSENCE_THRESHOLD = 50;
const ESSENCE_EXPONENT = 1.8;

/** Evolution stage production multipliers */
const EVOLUTION_MULTIPLIERS: Record<EvolutionStage, number> = {
  [EvolutionStage.Sprout]: 1,
  [EvolutionStage.Bloom]: 3,
  [EvolutionStage.Elder]: 9,
};

/** Upgrade cost formula: baseCost * scalingFactor^level */
export function calculateUpgradeCost(
  baseCost: number,
  scalingFactor: number,
  level: number
): number {
  return baseCost * Math.pow(scalingFactor, level);
}

// -----------------------------------------------------------------------------
// Bloomling Production
// -----------------------------------------------------------------------------

/**
 * Calculate a single Bloomling's Sunlight production per second.
 * Formula: baseProduction * level * evolutionMultiplier
 */
export function calculateBloomlingProduction(
  baseProduction: number,
  level: number,
  evolutionStage: EvolutionStage
): number {
  const evolutionMultiplier = EVOLUTION_MULTIPLIERS[evolutionStage];
  return baseProduction * level * evolutionMultiplier;
}

// -----------------------------------------------------------------------------
// Total Idle Rate
// -----------------------------------------------------------------------------

/**
 * Sum of all garden Bloomlings' production (before idle multiplier / synergy).
 * NOTE: This is a simplified version. A full implementation would need
 * BloomlingTemplate data to look up baseProduction. For now we use
 * Bloomling.totalProduced as a fallback hint, but the real implementation
 * requires a template registry. We store the base production on the
 * Bloomling template and look it up from a registry.
 *
 * For the engine to work without a template registry, we accept a
 * lookup function.
 */
export function totalSunlightPerSecond(
  state: Pick<GameStore, "bloomlings" | "garden">,
  getBaseProduction: (templateId: string) => number
): number {
  let total = 0;
  for (const slot of state.garden.slots) {
    if (slot === null) continue;
    const bloomling = state.bloomlings[slot];
    if (!bloomling) continue;

    const baseProduction = getBaseProduction(bloomling.templateId);
    total += calculateBloomlingProduction(
      baseProduction,
      bloomling.level,
      bloomling.evolutionStage
    );
  }
  return total;
}

/**
 * Simplified totalSunlightPerSecond that uses a default base-production
 * lookup based on rarity. Useful when template registry is not yet loaded.
 * This approximation uses the Bloomling's templateId convention:
 * we fall back to 1 Sun/sec (Common) if unknown.
 */
export function totalSunlightPerSecondSimple(
  state: Pick<GameStore, "bloomlings" | "garden">
): number {
  // Without a template registry we cannot determine base production.
  // Use a default of 1 (Common) -- the real game will wire up the registry.
  return totalSunlightPerSecond(state, () => 1);
}

// -----------------------------------------------------------------------------
// Tap Value
// -----------------------------------------------------------------------------

/**
 * Effective tap value before combo and crit.
 * baseTapValue * tapMultiplier (from prestige upgrades).
 *
 * baseTapValue starts at 1 and is increased by tap upgrades.
 * tapMultiplier starts at 1.0 and is increased by Nectar upgrades.
 *
 * NOTE: In a full implementation, we would sum up all tap upgrade effects.
 * For now we expose a pure function that takes the values.
 */
export function effectiveTapValue(
  baseTapValue: number,
  tapMultiplier: number
): number {
  return baseTapValue * tapMultiplier;
}

/**
 * Derive baseTapValue from the store (1 + sum of all tap upgrade effects).
 * This is a placeholder -- the real implementation would use the upgrade
 * template registry to determine each upgrade's contribution.
 */
export function getBaseTapValue(_state: Pick<GameStore, "upgrades">): number {
  // Starting base tap value
  return 1;
}

/**
 * Derive tapMultiplier from prestige upgrades.
 * Starts at 1.0 -- real implementation would sum Nectar "Stronger Roots" effects.
 */
export function getTapMultiplier(
  _state: Pick<GameStore, "upgrades" | "prestige">
): number {
  return 1.0;
}

/**
 * Convenience: full effective tap value from store state.
 */
export function selectEffectiveTapValue(
  state: Pick<GameStore, "upgrades" | "prestige">
): number {
  return effectiveTapValue(getBaseTapValue(state), getTapMultiplier(state));
}

// -----------------------------------------------------------------------------
// Zone Threshold
// -----------------------------------------------------------------------------

/**
 * Zone threshold: 50 * 1.12^zoneNumber
 */
export function getZoneThreshold(zoneNumber: number): number {
  return ZONE_THRESHOLD_BASE * Math.pow(ZONE_THRESHOLD_SCALING, zoneNumber);
}

/**
 * Whether the current zone's threshold has been met.
 */
export function hasReachedZoneThreshold(
  state: Pick<GameStore, "zoneProgress">
): boolean {
  const threshold = getZoneThreshold(state.zoneProgress.currentZone);
  return state.zoneProgress.currentZoneProgress >= threshold;
}

// -----------------------------------------------------------------------------
// Can Afford Upgrade
// -----------------------------------------------------------------------------

/**
 * Check if the player can afford a given upgrade at its next level.
 * Requires the upgrade template data (baseCost, scalingFactor).
 */
export function canAffordUpgrade(
  state: Pick<GameStore, "resources" | "upgrades">,
  templateId: string,
  baseCost: number,
  scalingFactor: number,
  maxLevel: number | null
): boolean {
  const currentLevel = state.upgrades[templateId]?.level ?? 0;
  if (maxLevel !== null && currentLevel >= maxLevel) return false;

  const nextLevelCost = calculateUpgradeCost(
    baseCost,
    scalingFactor,
    currentLevel + 1
  );
  return state.resources.sunlight >= nextLevelCost;
}

// -----------------------------------------------------------------------------
// Prestige Formulas
// -----------------------------------------------------------------------------

/**
 * Nectar earned on Rebirth.
 * Formula: floor(baseNectar * (highestZone / nectarThreshold)^nectarExponent)
 * From docs/design/04-prestige-systems.md
 */
export function calculateNectarOnRebirth(
  state: Pick<GameStore, "prestige">
): number {
  const highestZone = state.prestige.currentRunHighestZone;
  if (highestZone < NECTAR_THRESHOLD) return 0;

  return Math.floor(
    NECTAR_BASE * Math.pow(highestZone / NECTAR_THRESHOLD, NECTAR_EXPONENT)
  );
}

/**
 * Essence earned on Transcendence.
 * Formula: floor(baseEssence * (totalNectarSpent / essenceThreshold)^essenceExponent)
 * From docs/design/04-prestige-systems.md
 */
export function calculateEssenceOnTranscendence(
  state: Pick<GameStore, "prestige">
): number {
  const totalSpent = state.prestige.totalNectarSpent;
  if (totalSpent < ESSENCE_THRESHOLD) return 0;

  return Math.floor(
    ESSENCE_BASE * Math.pow(totalSpent / ESSENCE_THRESHOLD, ESSENCE_EXPONENT)
  );
}

// -----------------------------------------------------------------------------
// Combo
// -----------------------------------------------------------------------------

/**
 * Combo multiplier: 1 + (comboCount * 0.05), capped at count=100.
 */
export function getComboMultiplier(comboCount: number): number {
  const capped = Math.min(comboCount, 100);
  return 1 + capped * 0.05;
}

// -----------------------------------------------------------------------------
// Active Boosts
// -----------------------------------------------------------------------------

/**
 * Filter out expired boosts and return only active ones.
 */
export function getActiveBoosts(
  state: Pick<GameStore, "activeBoosts">,
  now: number
): GameStore["activeBoosts"] {
  return state.activeBoosts.filter((boost) => boost.expiresAt > now);
}

/**
 * Total production multiplier from active boosts.
 */
export function getBoostMultiplier(
  state: Pick<GameStore, "activeBoosts">,
  now: number
): number {
  const active = getActiveBoosts(state, now);
  if (active.length === 0) return 1;
  return active.reduce((mult, boost) => mult * boost.multiplier, 1);
}
