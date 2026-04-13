// =============================================================================
// Bloomling Discovery — Parse unlock conditions and create instances
// =============================================================================
// Pure functions for deciding which Bloomlings should be granted at a given
// zone, plus constructing fresh Bloomling instances. The store slice owns the
// set/merge side effects; this module is plain data transforms.
//
// Zone-based unlocks live in BloomlingTemplate.unlockCondition as
// "zone_<N>". Boss-based unlocks are recognized ("boss_biome<N>") but are
// out of scope for the zone-progression discovery path — the caller should
// filter by `kind === "zone"`.
// =============================================================================

import { EvolutionStage, UnlockMethod } from "~/types/game";
import type { Bloomling, BloomlingTemplate } from "~/types/game";
import { BLOOMLING_TEMPLATES } from "~/data/bloomlingTemplates";

// -----------------------------------------------------------------------------
// Unlock condition parsing
// -----------------------------------------------------------------------------

export type ParsedUnlockCondition =
  | { kind: "zone"; zone: number }
  | { kind: "boss"; biomeIndex: number }
  | null;

/**
 * Parse an `unlockCondition` string into a structured object.
 *
 * Supported formats:
 *  - "zone_<N>" where N is a positive integer → `{ kind: "zone", zone: N }`
 *  - "boss_biome<N>" where N is a positive integer → `{ kind: "boss", biomeIndex: N }`
 *
 * Unknown formats return `null`.
 */
export function parseUnlockCondition(
  condition: string
): ParsedUnlockCondition {
  const zoneMatch = /^zone_(\d+)$/.exec(condition);
  if (zoneMatch && zoneMatch[1]) {
    const zone = Number.parseInt(zoneMatch[1], 10);
    if (Number.isFinite(zone) && zone > 0) {
      return { kind: "zone", zone };
    }
    return null;
  }

  const bossMatch = /^boss_biome(\d+)$/.exec(condition);
  if (bossMatch && bossMatch[1]) {
    const biomeIndex = Number.parseInt(bossMatch[1], 10);
    if (Number.isFinite(biomeIndex) && biomeIndex > 0) {
      return { kind: "boss", biomeIndex };
    }
    return null;
  }

  return null;
}

// -----------------------------------------------------------------------------
// Instance creation
// -----------------------------------------------------------------------------

/**
 * Build a fresh Bloomling instance from a template. One instance per species
 * — the `instanceId` is derived from the template ID so repeated discovery
 * calls are idempotent and save files round-trip cleanly.
 */
export function createBloomlingInstance(template: BloomlingTemplate): Bloomling {
  return {
    templateId: template.id,
    instanceId: `${template.id}-1`,
    level: 1,
    evolutionStage: EvolutionStage.Sprout,
    inGarden: false,
    gardenSlot: null,
    unlocked: true,
    totalProduced: 0,
  };
}

// -----------------------------------------------------------------------------
// Zone-based discovery lookup
// -----------------------------------------------------------------------------

/**
 * Return every template whose `unlockMethod` is ZoneMilestone, whose zone
 * threshold has been met (`<= currentZone`), and whose `id` is not already
 * present in `existing`. Boss-unlock templates are skipped — they need a
 * different trigger pathway.
 *
 * Used both for incremental discovery (on `advanceZone`) and retroactive
 * grants (on app launch, to unlock every species a returning player has
 * already earned).
 */
export function getZoneUnlockTemplates(
  currentZone: number,
  existing: Record<string, Bloomling>
): BloomlingTemplate[] {
  const ownedTemplateIds = new Set<string>();
  for (const b of Object.values(existing)) {
    ownedTemplateIds.add(b.templateId);
  }

  const result: BloomlingTemplate[] = [];
  for (const template of BLOOMLING_TEMPLATES) {
    if (template.unlockMethod !== UnlockMethod.ZoneMilestone) continue;
    if (ownedTemplateIds.has(template.id)) continue;

    const parsed = parseUnlockCondition(template.unlockCondition);
    if (!parsed || parsed.kind !== "zone") continue;
    if (parsed.zone > currentZone) continue;

    result.push(template);
  }
  return result;
}
