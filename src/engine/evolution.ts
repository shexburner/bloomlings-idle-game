// =============================================================================
// Evolution System — Bloomling evolution (Sprout -> Bloom -> Elder)
// =============================================================================
// Pure functions for checking evolution eligibility, calculating costs,
// and performing the evolution transformation. Costs come from
// docs/economy/02-upgrade-costs.md Sections 4.1 and 4.2.
// =============================================================================

import { EvolutionStage, Rarity } from "~/types/game";
import type { Bloomling } from "~/types/game";
import { BLOOMLING_TEMPLATE_MAP } from "~/data/bloomlingTemplates";

// -----------------------------------------------------------------------------
// Evolution Cost Tables (from docs/economy/02-upgrade-costs.md)
// -----------------------------------------------------------------------------

/** Sunlight cost for Sprout -> Bloom evolution, per rarity. */
const SPROUT_TO_BLOOM_SUNLIGHT: Record<Rarity, number> = {
  [Rarity.Common]: 10_000,
  [Rarity.Uncommon]: 50_000,
  [Rarity.Rare]: 250_000,
  [Rarity.Epic]: 1_000_000,
  [Rarity.Legendary]: 10_000_000,
  [Rarity.Mythic]: 100_000_000,
};

/** Sunlight cost for Bloom -> Elder evolution, per rarity. */
const BLOOM_TO_ELDER_SUNLIGHT: Record<Rarity, number> = {
  [Rarity.Common]: 100_000,
  [Rarity.Uncommon]: 500_000,
  [Rarity.Rare]: 2_500_000,
  [Rarity.Epic]: 10_000_000,
  [Rarity.Legendary]: 100_000_000,
  [Rarity.Mythic]: 1_000_000_000,
};

/** Nectar cost for Bloom -> Elder evolution, per rarity. */
const BLOOM_TO_ELDER_NECTAR: Record<Rarity, number> = {
  [Rarity.Common]: 5,
  [Rarity.Uncommon]: 15,
  [Rarity.Rare]: 50,
  [Rarity.Epic]: 150,
  [Rarity.Legendary]: 500,
  [Rarity.Mythic]: 2_000,
};

/** Evolution production multiplier (3x per stage). */
const EVOLUTION_PRODUCTION_MULTIPLIER = 3;

// -----------------------------------------------------------------------------
// Evolution Cost
// -----------------------------------------------------------------------------

/** Cost required to evolve a Bloomling to the next stage. */
export interface EvolutionCost {
  sunlight: number;
  nectar: number;
}

/**
 * Get the evolution cost for a Bloomling based on its current stage and rarity.
 *
 * - Sprout -> Bloom: Sunlight only (nectar = 0).
 * - Bloom -> Elder: Sunlight + Nectar.
 * - Elder: cannot evolve, returns { sunlight: 0, nectar: 0 }.
 *
 * Rarity is looked up from the Bloomling template registry.
 */
export function getEvolutionCost(bloomling: Bloomling): EvolutionCost {
  const template = BLOOMLING_TEMPLATE_MAP[bloomling.templateId];
  if (!template) {
    return { sunlight: 0, nectar: 0 };
  }

  const rarity = template.rarity;

  switch (bloomling.evolutionStage) {
    case EvolutionStage.Sprout:
      return {
        sunlight: SPROUT_TO_BLOOM_SUNLIGHT[rarity],
        nectar: 0,
      };
    case EvolutionStage.Bloom:
      return {
        sunlight: BLOOM_TO_ELDER_SUNLIGHT[rarity],
        nectar: BLOOM_TO_ELDER_NECTAR[rarity],
      };
    case EvolutionStage.Elder:
      return { sunlight: 0, nectar: 0 };
  }
}

// -----------------------------------------------------------------------------
// Evolution Eligibility
// -----------------------------------------------------------------------------

/**
 * Check whether a Bloomling can evolve given the player's current resources.
 *
 * Requirements:
 * 1. Bloomling must be at level 100 in its current stage.
 * 2. Bloomling must not already be at Elder stage.
 * 3. Player must have enough Sunlight (and Nectar for Elder evolution).
 */
export function canEvolve(
  bloomling: Bloomling,
  resources: { sunlight: number; nectar: number }
): boolean {
  // Cannot evolve past Elder
  if (bloomling.evolutionStage === EvolutionStage.Elder) {
    return false;
  }

  // Must be at max level (100)
  if (bloomling.level < 100) {
    return false;
  }

  // Must have a valid template
  const template = BLOOMLING_TEMPLATE_MAP[bloomling.templateId];
  if (!template) {
    return false;
  }

  // Must afford the cost
  const cost = getEvolutionCost(bloomling);
  if (resources.sunlight < cost.sunlight) {
    return false;
  }
  if (resources.nectar < cost.nectar) {
    return false;
  }

  return true;
}

// -----------------------------------------------------------------------------
// Evolution Transformation (Pure)
// -----------------------------------------------------------------------------

/** Returns the next evolution stage, or null if already Elder. */
export function getNextEvolutionStage(
  current: EvolutionStage
): EvolutionStage | null {
  switch (current) {
    case EvolutionStage.Sprout:
      return EvolutionStage.Bloom;
    case EvolutionStage.Bloom:
      return EvolutionStage.Elder;
    case EvolutionStage.Elder:
      return null;
  }
}

/**
 * Pure function that transforms a Bloomling to its next evolution stage.
 *
 * - Resets level to 1.
 * - Advances the evolution stage.
 * - Multiplies baseProduction by 3x (reflected in the stage; actual production
 *   calculation uses the evolution multiplier from the stage enum).
 *
 * Returns a new Bloomling object. Does NOT check eligibility or deduct costs --
 * those are the caller's responsibility.
 *
 * Returns the original Bloomling unchanged if it is already Elder.
 */
export function evolveBloomling(bloomling: Bloomling): Bloomling {
  const nextStage = getNextEvolutionStage(bloomling.evolutionStage);
  if (nextStage === null) {
    return bloomling;
  }

  return {
    ...bloomling,
    level: 1,
    evolutionStage: nextStage,
  };
}

/**
 * The evolution production multiplier applied per stage transition (3x).
 * Exported for use by other systems that need this constant.
 */
export { EVOLUTION_PRODUCTION_MULTIPLIER };
