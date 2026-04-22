// =============================================================================
// Rebirth System — Prestige Layer 1 (Nectar)
// =============================================================================
// Pure functions for checking rebirth eligibility, calculating Nectar earned,
// previewing rewards, and transforming state on reset. Constants are the
// **tuned** values from docs/economy/04-prestige-math.md (not the design-doc
// defaults).
//
// Design contract:
// - Bloomling *unlocks* are never lost (the player keeps every species).
// - Nectar and Essence upgrades persist through Rebirth.
// - stats.discoveredSynergyIds / synergiesDiscovered are lifetime-persistent
//   (meta-progression like achievements) — callers must NOT reset them.
// =============================================================================

import { EvolutionStage } from "~/types/game";
import type { Bloomling, Upgrade, RebirthPreview } from "~/types/game";

// -----------------------------------------------------------------------------
// Formula Constants (tuned — docs/economy/04-prestige-math.md §1)
// -----------------------------------------------------------------------------

/** Base Nectar earned (multiplied by the zone ratio). */
export const NECTAR_BASE = 1;

/**
 * Zone divisor in the Nectar formula. Lowered from the design-doc default of
 * 40 to 32 to steepen the early curve (economy doc §1).
 */
export const NECTAR_THRESHOLD = 32;

/**
 * Exponent in the Nectar formula. Raised from the design-doc default of 2.2
 * to 3.1 for meaningful Nectar differentiation between zone pushes.
 */
export const NECTAR_EXPONENT = 3.1;

/** Minimum zone to enable the Rebirth button. */
export const REBIRTH_UNLOCK_ZONE = 40;

// -----------------------------------------------------------------------------
// Nectar Upgrade IDs — persist through Rebirth
// (from docs/design/04-prestige-systems.md §Nectar Upgrades)
// -----------------------------------------------------------------------------

export const NECTAR_UPGRADE_IDS: ReadonlySet<string> = new Set([
  "enriched_soil",
  "stronger_roots",
  "rapid_growth",
  "nectar_garden_expansion",
  "seasonal_memory",
  "nectar_roots",
  "bloom_retention",
  "elder_retention",
  "deep_roots",
  "combo_memory",
]);

// -----------------------------------------------------------------------------
// Essence Upgrade IDs — persist through Rebirth AND Transcendence
// (from docs/design/04-prestige-systems.md §Essence Upgrades)
// -----------------------------------------------------------------------------

export const ESSENCE_UPGRADE_IDS: ReadonlySet<string> = new Set([
  "primordial_vigor",
  "ancient_wisdom",
  "essence_eternal_garden",
  "biome_attunement",
  "accelerated_seasons",
  "bloomling_awakening",
  "essence_conduit",
  "mythic_seedbed",
  "cosmic_roots",
]);

// -----------------------------------------------------------------------------
// Upgrade IDs that modify Rebirth behavior
// -----------------------------------------------------------------------------

export const BLOOM_RETENTION_ID = "bloom_retention";
export const ELDER_RETENTION_ID = "elder_retention";
export const SEASONAL_MEMORY_ID = "seasonal_memory";
export const COMBO_MEMORY_ID = "combo_memory";
export const NECTAR_ROOTS_ID = "nectar_roots";

/** Seasonal Memory: starting zone per level (index = level). */
const SEASONAL_MEMORY_ZONES: readonly number[] = [1, 5, 10, 15, 20];

/** Combo Memory: starting combo count when the upgrade is owned. */
const COMBO_MEMORY_START = 10;

// -----------------------------------------------------------------------------
// Nectar Formula
// -----------------------------------------------------------------------------

/**
 * Calculate Nectar earned from a Rebirth.
 *
 * ```
 * nectarEarned = floor(NECTAR_BASE * (highestZone / NECTAR_THRESHOLD)^NECTAR_EXPONENT
 *                      * (1 + nectarRootsLevel * 0.10)
 *                      * rebirthBoostMultiplier)
 * ```
 *
 * `rebirthBoostMultiplier` is the Dewdrop Instant Rebirth Boost consumable
 * (1.5×). Defaults to 1.0 (no boost). Returns 0 if `highestZone` is below
 * `REBIRTH_UNLOCK_ZONE`.
 */
export function calculateNectarEarned(
  highestZone: number,
  nectarRootsLevel: number = 0,
  rebirthBoostMultiplier: number = 1,
  ancientWisdomLevel: number = 0,
): number {
  if (highestZone < REBIRTH_UNLOCK_ZONE) return 0;

  const raw =
    NECTAR_BASE * Math.pow(highestZone / NECTAR_THRESHOLD, NECTAR_EXPONENT);
  const nectarMultiplier = 1 + nectarRootsLevel * 0.1;
  const wisdomMultiplier = Math.pow(1.5, ancientWisdomLevel);
  return Math.floor(raw * nectarMultiplier * wisdomMultiplier * rebirthBoostMultiplier);
}

// -----------------------------------------------------------------------------
// Eligibility
// -----------------------------------------------------------------------------

/**
 * Whether the player can Rebirth right now.
 *
 * Requirements (from design doc §Rebirth):
 * 1. Highest zone in the current run >= 40.
 * 2. Would earn at least 1 Nectar.
 */
export function canRebirth(
  highestZone: number,
  nectarRootsLevel: number = 0,
): boolean {
  return (
    highestZone >= REBIRTH_UNLOCK_ZONE &&
    calculateNectarEarned(highestZone, nectarRootsLevel) >= 1
  );
}

// -----------------------------------------------------------------------------
// Preview
// -----------------------------------------------------------------------------

/**
 * Build a preview of what a Rebirth would yield at the current moment.
 *
 * Includes:
 * - Nectar earned
 * - Percentage increase over current total
 * - Whether the Rebirth is "recommended" (≥ 2× current Nectar, per design doc)
 * - Projections for pushing 5 / 10 / 15 / 20 more zones
 */
export function getRebirthPreview(
  highestZone: number,
  currentNectar: number,
  nectarRootsLevel: number = 0,
  rebirthBoostMultiplier: number = 1,
): RebirthPreview {
  const nectarEarned = calculateNectarEarned(
    highestZone,
    nectarRootsLevel,
    rebirthBoostMultiplier,
  );

  const percentageIncrease =
    currentNectar > 0
      ? (nectarEarned / currentNectar) * 100
      : nectarEarned > 0
        ? Infinity
        : 0;

  // Design doc: "Recommended tag when Rebirth would earn 2x+ current total"
  const recommended =
    currentNectar === 0
      ? nectarEarned >= 1
      : nectarEarned >= currentNectar * 2;

  const projectionSteps = [5, 10, 15, 20] as const;
  const projections = projectionSteps.map((additionalZones) => ({
    additionalZones,
    nectarEarned: calculateNectarEarned(
      highestZone + additionalZones,
      nectarRootsLevel,
      rebirthBoostMultiplier,
    ),
  }));

  return { nectarEarned, percentageIncrease, recommended, projections };
}

// -----------------------------------------------------------------------------
// Bloomling Reset
// -----------------------------------------------------------------------------

/**
 * Determine the evolution stage a Bloomling retains after Rebirth.
 *
 * - Elder Retention (Nectar upgrade, max Lv.1): Elders keep Elder stage.
 * - Bloom Retention (Nectar upgrade, max Lv.1): Blooms (and Elders without
 *   Elder Retention) keep Bloom stage.
 * - Without either: everything resets to Sprout.
 */
export function getRetainedEvolutionStage(
  currentStage: EvolutionStage,
  bloomRetentionLevel: number,
  elderRetentionLevel: number,
): EvolutionStage {
  if (currentStage === EvolutionStage.Elder && elderRetentionLevel > 0) {
    return EvolutionStage.Elder;
  }
  if (
    (currentStage === EvolutionStage.Bloom ||
      currentStage === EvolutionStage.Elder) &&
    bloomRetentionLevel > 0
  ) {
    return EvolutionStage.Bloom;
  }
  return EvolutionStage.Sprout;
}

/**
 * Transform all Bloomlings for a Rebirth reset.
 *
 * - Resets level to 1.
 * - Resets evolution stage (respecting Bloom / Elder Retention upgrades).
 * - Removes from Garden (`inGarden = false`, `gardenSlot = null`).
 * - Preserves `unlocked`, `totalProduced`, `templateId`, `instanceId`.
 */
export function resetBloomlingsForRebirth(
  bloomlings: Record<string, Bloomling>,
  bloomRetentionLevel: number,
  elderRetentionLevel: number,
): Record<string, Bloomling> {
  return Object.fromEntries(
    Object.entries(bloomlings).map(([id, b]) => [
      id,
      {
        ...b,
        level: 1,
        evolutionStage: getRetainedEvolutionStage(
          b.evolutionStage,
          bloomRetentionLevel,
          elderRetentionLevel,
        ),
        inGarden: false,
        gardenSlot: null,
      },
    ]),
  );
}

// -----------------------------------------------------------------------------
// Upgrade Reset
// -----------------------------------------------------------------------------

/**
 * Filter upgrades to keep only those that persist through Rebirth:
 * Nectar-category and Essence-category upgrades.
 *
 * Tap and Idle upgrades are discarded.
 */
export function filterUpgradesForRebirth(
  upgrades: Record<string, Upgrade>,
): Record<string, Upgrade> {
  const kept: Record<string, Upgrade> = {};
  for (const [id, upgrade] of Object.entries(upgrades)) {
    if (NECTAR_UPGRADE_IDS.has(id) || ESSENCE_UPGRADE_IDS.has(id)) {
      kept[id] = upgrade;
    }
  }
  return kept;
}

// -----------------------------------------------------------------------------
// Post-Rebirth Starting Conditions
// -----------------------------------------------------------------------------

/**
 * Get the starting zone for a new run after Rebirth, based on the Seasonal
 * Memory Nectar upgrade level.
 *
 * Level 0 → Zone 1, Level 1 → Zone 5, Level 2 → Zone 10, etc.
 */
export function getStartingZone(
  seasonalMemoryLevel: number,
  acceleratedSeasonsLevel: number = 0,
): number {
  let zone = 1;
  if (seasonalMemoryLevel > 0) {
    const idx = Math.min(
      seasonalMemoryLevel,
      SEASONAL_MEMORY_ZONES.length - 1,
    );
    zone = SEASONAL_MEMORY_ZONES[idx] ?? 1;
  }
  return zone + acceleratedSeasonsLevel * 5;
}

/**
 * Get the starting combo count for a new run after Rebirth.
 *
 * Without Combo Memory: 0. With Combo Memory (Lv.1): 10.
 */
export function getStartingComboCount(comboMemoryLevel: number): number {
  return comboMemoryLevel > 0 ? COMBO_MEMORY_START : 0;
}

// -----------------------------------------------------------------------------
// Utility
// -----------------------------------------------------------------------------

/**
 * Look up the purchased level of an upgrade by ID, returning 0 if not found.
 */
export function getUpgradeLevel(
  upgrades: Record<string, Upgrade>,
  upgradeId: string,
): number {
  return upgrades[upgradeId]?.level ?? 0;
}
