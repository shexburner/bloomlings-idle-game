// =============================================================================
// Bloomling Template Registry — Static data for all Bloomling species
// =============================================================================
// Content sourced from docs/content/01-biome1-bloomlings.md and
// docs/content/02-biome2-bloomlings.md. Economy values from
// docs/economy/03-bloomling-stats.md.
// =============================================================================

import {
  AbilityType,
  BiomeType,
  Rarity,
  UnlockMethod,
} from "~/types/game";
import type { BloomlingTemplate } from "~/types/game";

/** All Bloomling templates in the game, keyed by id. */
export const BLOOMLING_TEMPLATES: readonly BloomlingTemplate[] = [
  // -------------------------------------------------------------------------
  // Biome 1 — The Mossy Cradle (Zones 1-25)
  // -------------------------------------------------------------------------
  {
    id: "fernley",
    name: "Fernley",
    rarity: Rarity.Common,
    biome: BiomeType.MossyCradle,
    baseProduction: 1,
    baseLevelCost: 10,
    abilityType: AbilityType.ProductionBoost,
    abilityDescription: "+2% idle Sunlight production to all Garden Bloomlings",
    abilityValue: 0.02,
    synergyTags: ["Mossy", "Verdant"],
    unlockMethod: UnlockMethod.ZoneMilestone,
    unlockCondition: "zone_1",
    personality: "Curious, gentle, slightly nervous",
    lore: "The first Bloomling to sprout in the abandoned greenhouse. For weeks it was alone, watching dust motes dance in the light. It learned patience from the silence and kindness from the rain that leaked through the broken roof.",
  },
  {
    id: "mosswick",
    name: "Mosswick",
    rarity: Rarity.Common,
    biome: BiomeType.MossyCradle,
    baseProduction: 1,
    baseLevelCost: 10,
    abilityType: AbilityType.TapBoost,
    abilityDescription: "+1 to base tap value",
    abilityValue: 1,
    synergyTags: ["Mossy", "Stonekin"],
    unlockMethod: UnlockMethod.ZoneMilestone,
    unlockCondition: "zone_3",
    personality: "Easygoing, drowsy, quietly dependable",
    lore: "Mosswick didn't so much sprout as accumulate. One day the moss on the greenhouse floor simply gathered itself up and blinked. It doesn't move fast, doesn't worry much, and produces Sunlight with the steady patience of stone.",
  },
  {
    id: "petaline",
    name: "Petaline",
    rarity: Rarity.Uncommon,
    biome: BiomeType.MossyCradle,
    baseProduction: 2,
    baseLevelCost: 40,
    abilityType: AbilityType.ProductionBoost,
    abilityDescription: "+4% Sunlight production to all Garden Bloomlings",
    abilityValue: 0.04,
    synergyTags: ["Verdant", "Luminous"],
    unlockMethod: UnlockMethod.ZoneMilestone,
    unlockCondition: "zone_10",
    personality: "Expressive, vain (in a charming way), theatrical",
    lore: "Petaline pushed through a crack in the greenhouse tiles and immediately demanded to know where the sun was brightest. She arranges herself to catch every stray beam of light, convinced the world is a stage and she is the opening number.",
  },
  {
    id: "thornwick",
    name: "Thornwick",
    rarity: Rarity.Rare,
    biome: BiomeType.MossyCradle,
    baseProduction: 5,
    baseLevelCost: 200,
    abilityType: AbilityType.ZoneBoost,
    abilityDescription: "-3% zone Sunlight threshold for all zones",
    abilityValue: 0.03,
    synergyTags: ["Thorned", "Mossy"],
    unlockMethod: UnlockMethod.BiomeBoss,
    unlockCondition: "boss_biome1",
    personality: "Protective, stoic, secretly tender",
    lore: "Thornwick grew from the thickest tangle of the Overgrowth \u2014 the great vine that once sealed the greenhouse door. When the Gardener cleared the way, Thornwick was the heart left behind, loyal now to the one who set it free.",
  },

  // -------------------------------------------------------------------------
  // Biome 2 — The Sunlit Glade (Zones 26-50)
  // -------------------------------------------------------------------------
  {
    id: "solara",
    name: "Solara",
    rarity: Rarity.Uncommon,
    biome: BiomeType.SunlitGlade,
    baseProduction: 2,
    baseLevelCost: 40,
    abilityType: AbilityType.ProductionBoost,
    abilityDescription: "+4% Sunlight production to all Garden Bloomlings",
    abilityValue: 0.04,
    synergyTags: ["Luminous", "Radiant"],
    unlockMethod: UnlockMethod.ZoneMilestone,
    unlockCondition: "zone_28",
    personality: "Optimistic, energetic, relentlessly encouraging",
    lore: "Solara sprouted the moment the greenhouse door opened, as if the meadow had been waiting for permission. She believes every shadow is just a place the light hasn't reached yet, and she intends to fix that personally.",
  },
  {
    id: "dapplebark",
    name: "Dapplebark",
    rarity: Rarity.Uncommon,
    biome: BiomeType.SunlitGlade,
    baseProduction: 2,
    baseLevelCost: 40,
    abilityType: AbilityType.ComboBoost,
    abilityDescription: "+0.3s to combo decay timer",
    abilityValue: 0.3,
    synergyTags: ["Stonekin", "Verdant"],
    unlockMethod: UnlockMethod.ZoneMilestone,
    unlockCondition: "zone_33",
    personality: "Patient, wise, quietly humorous",
    lore: "Dapplebark claims to be the oldest living thing in the glade, though no one can confirm this because he tells a different origin story every time he's asked. What is certain: his roots run deep, and his advice is surprisingly good.",
  },
  {
    id: "honeyveil",
    name: "Honeyveil",
    rarity: Rarity.Rare,
    biome: BiomeType.SunlitGlade,
    baseProduction: 5,
    baseLevelCost: 200,
    abilityType: AbilityType.ProductionBoost,
    abilityDescription: "+8% Sunlight production to all Garden Bloomlings",
    abilityValue: 0.08,
    synergyTags: ["Luminous", "Pollinator"],
    unlockMethod: UnlockMethod.ZoneMilestone,
    unlockCondition: "zone_40",
    personality: "Alluring, generous, gently mysterious",
    lore: "Where Honeyveil walks, pollinators follow. She hums a melody no one taught her, and flowers lean toward her as she passes. She gives freely of her nectar, asking nothing in return \u2014 though the garden always seems richer after her visits.",
  },
  {
    id: "briarthorn",
    name: "Briarthorn",
    rarity: Rarity.Rare,
    biome: BiomeType.SunlitGlade,
    baseProduction: 5,
    baseLevelCost: 200,
    abilityType: AbilityType.TapBoost,
    abilityDescription: "+2% critical tap chance",
    abilityValue: 0.02,
    synergyTags: ["Thorned", "Radiant"],
    unlockMethod: UnlockMethod.BiomeBoss,
    unlockCondition: "boss_biome2",
    personality: "Protective, resolute, fiercely loyal",
    lore: "The Briar Wall was not a barrier \u2014 it was a guardian. When the Gardener proved their resolve, Briarthorn stepped free from the tangled wall and knelt. It had been waiting for someone worth protecting.",
  },
];

/** Lookup map keyed by template ID. */
export const BLOOMLING_TEMPLATE_MAP: Readonly<
  Record<string, BloomlingTemplate>
> = Object.fromEntries(
  BLOOMLING_TEMPLATES.map((t) => [t.id, t])
) as Record<string, BloomlingTemplate>;

/** Get a template by ID, returning undefined if not found. */
export function getBloomlingTemplate(
  id: string
): BloomlingTemplate | undefined {
  return BLOOMLING_TEMPLATE_MAP[id];
}
