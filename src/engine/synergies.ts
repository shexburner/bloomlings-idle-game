// =============================================================================
// Synergy System — Tag-matching bonuses and named-pair synergies
// =============================================================================
// Pure functions for calculating which synergies are active in the Garden and
// how much each participating Bloomling's production is multiplied.
//
// Design (docs/design/02-bloomling-mechanics.md §Synergy System):
//
//   Tag synergies (generic):
//     Each Bloomling has one or more synergy tags (e.g. "Mossy", "Luminous").
//     When 2+ Garden Bloomlings share a tag, a tiered production bonus
//     activates for those tagged Bloomlings:
//       2 with same tag → +15%
//       3 with same tag → +35%
//       4+ with same tag → +60%
//     Per the design doc, tag synergies only apply to Elder-stage Bloomlings.
//
//   Named synergies (specific pairs):
//     Hardcoded pair bonuses with unique names and lore. Sourced from
//     docs/content/01-biome1-bloomlings.md and 02-biome2-bloomlings.md.
//     Unlike tag synergies, named synergies are not gated by evolution stage.
//
//   Stacking:
//     A single Bloomling can participate in multiple tag and named synergies
//     simultaneously. Multipliers stack MULTIPLICATIVELY on the Bloomling's
//     base production — chosen because it rewards deliberate team-building and
//     matches typical idle-game conventions. If later tuning shows this is too
//     generous, flip the combine function in `combineMultipliers` below.
//
//   Discovery:
//     Each synergy has a stable identifier. On first activation, the player
//     should receive a Dewdrop reward (wired up in Phase 5 when the Dewdrop
//     shop ships). This module tracks *which* synergies are newly discovered;
//     the slice wrapper is responsible for persisting them and firing rewards.
// =============================================================================

import { EvolutionStage } from "~/types/game";
import type { Bloomling, BloomlingTemplate } from "~/types/game";

// -----------------------------------------------------------------------------
// Tier Constants
// -----------------------------------------------------------------------------

/** Production multiplier when exactly 2 Bloomlings share a tag. */
export const SYNERGY_TIER_2_MULTIPLIER = 1.15;

/** Production multiplier when exactly 3 Bloomlings share a tag. */
export const SYNERGY_TIER_3_MULTIPLIER = 1.35;

/** Production multiplier when 4 or more Bloomlings share a tag. */
export const SYNERGY_TIER_4_PLUS_MULTIPLIER = 1.6;

/**
 * Whether tag-based synergies require the Bloomling to be at Elder stage.
 * Per docs/design/02-bloomling-mechanics.md §Synergy System: "Each Bloomling
 * (at Elder stage) has Synergy Tags". Flip to `false` to make tag synergies
 * work for all stages (useful during early playtesting before Elders exist).
 */
export const TAG_SYNERGIES_REQUIRE_ELDER = true;

// -----------------------------------------------------------------------------
// Named Synergy Registry
// -----------------------------------------------------------------------------

/**
 * Hardcoded pair/group synergy with a named identity. Sourced from the
 * content docs (01-biome1-bloomlings.md, 02-biome2-bloomlings.md).
 */
export interface NamedSynergyDef {
  /** Stable identifier. */
  readonly id: string;
  /** Display name shown to the player. */
  readonly name: string;
  /**
   * Bloomling template IDs that must *all* be in the Garden for this
   * synergy to activate.
   */
  readonly requiredBloomlingIds: readonly string[];
  /**
   * Flat production bonus applied to the participating Bloomlings.
   * 0.15 means +15% (multiplier of 1.15). Use 0 if this synergy does not
   * affect idle production.
   */
  readonly productionBonus: number;
  /**
   * Flat tap-value bonus applied while any participant is in the Garden.
   * 0.10 means +10% (multiplier of 1.10). Use 0 if this synergy does not
   * affect tap value. Consumed by the tap system, not idle production.
   */
  readonly tapValueBonus: number;
  /** Lore blurb displayed on first discovery. */
  readonly lore: string;
}

/** All named synergies in the game, sourced from content docs. */
export const NAMED_SYNERGIES: readonly NamedSynergyDef[] = [
  // --- Biome 1: The Mossy Cradle ---
  {
    id: "synergy_undergrowth_alliance",
    name: "Undergrowth Alliance",
    requiredBloomlingIds: ["fernley", "mosswick"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "The first two Bloomlings in the greenhouse grew up together in the same patch of damp earth. Fernley's curiosity and Mosswick's calm balance each other — one reaches, the other holds steady.",
  },
  {
    id: "synergy_bloom_and_briar",
    name: "Bloom and Briar",
    requiredBloomlingIds: ["petaline", "thornwick"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Petaline's vanity meets Thornwick's stoicism. She calls him her \"stage guard.\" He calls her \"noisy.\" But nothing gets past his thorns to harm her petals, and nothing brightens his shadow like her glow.",
  },
  {
    id: "synergy_cradle_guard",
    name: "Cradle Guard",
    requiredBloomlingIds: ["mosswick", "thornwick"],
    productionBonus: 0,
    tapValueBonus: 0.1,
    lore: "Stone and thorn, patience and vigilance. Together they are the walls of the Mossy Cradle — nothing enters uninvited, and nothing leaves unnoticed. Mosswick provides the foundation; Thornwick provides the teeth.",
  },

  // --- Biome 2: The Sunlit Glade ---
  {
    id: "synergy_golden_canopy",
    name: "Golden Canopy",
    requiredBloomlingIds: ["solara", "dapplebark"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Light and wood, warmth and patience. Solara's radiance feeds Dapplebark's leaves, and Dapplebark's steady branches give Solara a place to rest when even the most relentless optimist needs shade.",
  },
  {
    id: "synergy_nectar_and_thorn",
    name: "Nectar and Thorn",
    requiredBloomlingIds: ["honeyveil", "briarthorn"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Briarthorn's thorns keep the predators away. Honeyveil's nectar keeps the pollinators close. Together, they are a fortress and a feast — a garden that defends itself.",
  },
  {
    id: "synergy_meadow_chorus",
    name: "Meadow Chorus",
    requiredBloomlingIds: ["solara", "honeyveil"],
    productionBonus: 0.1,
    tapValueBonus: 0,
    lore: "When Solara sings encouragement and Honeyveil hums her wordless melody, the notes weave together into something the other Bloomlings call \"the Meadow Chorus.\" Flowers bloom faster when they hear it.",
  },

  // --- Cross-biome ---
  {
    id: "synergy_thorned_pact",
    name: "Thorned Pact",
    requiredBloomlingIds: ["thornwick", "briarthorn"],
    productionBonus: 0.2,
    tapValueBonus: 0,
    lore: "One guarded the greenhouse. The other guarded the glade. When they meet, there is no rivalry — only recognition. They lock thorns in an ancient gesture of mutual respect, and the garden between them becomes untouchable.",
  },
  {
    id: "synergy_first_light",
    name: "First Light",
    requiredBloomlingIds: ["fernley", "solara"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Fernley remembers the first beam of sunlight to reach the greenhouse floor. Solara was born from that same beam on the other side of the door. They are, in a sense, siblings — one raised in quiet patience, the other in boundless warmth.",
  },

  // --- Biome 3: Twilight Hollow ---
  {
    id: "synergy_hollow_glow",
    name: "Hollow Glow",
    requiredBloomlingIds: ["glowcap", "lumivine"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Glowcap's steady pulse and Lumivine's trailing light weave together into a lantern that never dims. The hollow has not known true darkness since they met.",
  },
  {
    id: "synergy_twilight_veil",
    name: "Twilight Veil",
    requiredBloomlingIds: ["nightbloom", "deeproot"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Nightbloom's shadow petals and Deeproot's ancient stone form a veil between day and night. Beneath it, time moves differently — slower, kinder.",
  },
  {
    id: "synergy_fungal_network",
    name: "Fungal Network",
    requiredBloomlingIds: ["glowcap", "deeproot"],
    productionBonus: 0,
    tapValueBonus: 0.1,
    lore: "Glowcap's mycelium threads through Deeproot's stone, creating a network that pulses with shared energy. What one knows, the other feels.",
  },

  // --- Biome 4: Crystal Caverns ---
  {
    id: "synergy_prismatic_resonance",
    name: "Prismatic Resonance",
    requiredBloomlingIds: ["crystalbloom", "gemsprout"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Crystalbloom refracts light; Gemsprout amplifies it. Together they fill the cavern with a resonance that makes the very walls hum with color.",
  },
  {
    id: "synergy_crystal_heart",
    name: "Crystal Heart",
    requiredBloomlingIds: ["crystalbloom", "prismaflora"],
    productionBonus: 0.2,
    tapValueBonus: 0,
    lore: "Prismaflora was born from the cavern's heart, and Crystalbloom was its first facet. Reunited, they pulse in perfect harmony — the heart and its reflection.",
  },

  // --- Biome 5: Scorched Expanse ---
  {
    id: "synergy_ember_trail",
    name: "Ember Trail",
    requiredBloomlingIds: ["cinderbloom", "magmaroot"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Cinderbloom marks the path; Magmaroot paves it in cooling stone. Together they carve safe roads through the scorched expanse.",
  },
  {
    id: "synergy_inferno_crown",
    name: "Inferno Crown",
    requiredBloomlingIds: ["ashveil", "pyranthus"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Ashveil's drifting embers settle on Pyranthus like a crown of fire. The expanse bows to their combined heat — not in fear, but in recognition.",
  },
  {
    id: "synergy_scorched_earth",
    name: "Scorched Earth",
    requiredBloomlingIds: ["cinderbloom", "pyranthus"],
    productionBonus: 0,
    tapValueBonus: 0.1,
    lore: "Where Cinderbloom blooms and Pyranthus burns, the ground itself transforms — ash becomes fertile soil, and fire becomes warmth.",
  },

  // --- Biome 6: Abyssal Depths ---
  {
    id: "synergy_deep_current",
    name: "Deep Current",
    requiredBloomlingIds: ["coralchime", "abyssvine"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Coralchime's song rides Abyssvine's tendrils through the deep, carrying melody to places sound has never reached.",
  },
  {
    id: "synergy_abyssal_throne",
    name: "Abyssal Throne",
    requiredBloomlingIds: ["pearlcrest", "tidalwarden"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Pearlcrest's iridescent crown and Tidalwarden's steadfast guard — a throne and its sentinel, ruling the deep with quiet grace.",
  },
  {
    id: "synergy_tidal_chorus",
    name: "Tidal Chorus",
    requiredBloomlingIds: ["coralchime", "pearlcrest"],
    productionBonus: 0,
    tapValueBonus: 0.1,
    lore: "Coralchime sings and Pearlcrest glows in time. The abyss listens, and for a moment, the crushing dark feels like a cathedral.",
  },

  // --- Biome 7: Celestial Canopy ---
  {
    id: "synergy_sky_garden",
    name: "Sky Garden",
    requiredBloomlingIds: ["zephyrbud", "skybloom"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Zephyrbud scatters seeds on the wind; Skybloom catches them in the clouds. Together they tend a garden that floats above the world.",
  },
  {
    id: "synergy_celestial_arch",
    name: "Celestial Arch",
    requiredBloomlingIds: ["cloudweaver", "aethervane"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Cloudweaver builds the bridge; Aethervane reads the wind to place it true. Their arch spans the sky, connecting earth to the heavens.",
  },
  {
    id: "synergy_wind_chime",
    name: "Wind Chime",
    requiredBloomlingIds: ["zephyrbud", "aethervane"],
    productionBonus: 0,
    tapValueBonus: 0.1,
    lore: "Zephyrbud's gentle breeze and Aethervane's sharp edges create a sound like crystal bells. The canopy rings with their duet.",
  },

  // --- Biome 8: Frozen Thicket ---
  {
    id: "synergy_frozen_garden",
    name: "Frozen Garden",
    requiredBloomlingIds: ["frostpetal", "hollowpine"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Frostpetal's ice crystals cling to Hollowpine's branches like ornaments. Together they are a winter garden — still, silent, and impossibly beautiful.",
  },
  {
    id: "synergy_aurora_veil",
    name: "Aurora Veil",
    requiredBloomlingIds: ["aurorabloom", "permafrost"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Aurorabloom's shifting light plays across Permafrost's ancient ice, painting the thicket in colors that have no name. The cold has never been so warm.",
  },
  {
    id: "synergy_eternal_frost",
    name: "Eternal Frost",
    requiredBloomlingIds: ["frostpetal", "permafrost"],
    productionBonus: 0,
    tapValueBonus: 0.1,
    lore: "Frostpetal's delicate crystals and Permafrost's unyielding ice — one is fragile beauty, the other is enduring strength. Together, they are winter itself.",
  },

  // --- Cross-biome synergies ---
  {
    id: "synergy_stone_sentinels",
    name: "Stone Sentinels",
    requiredBloomlingIds: ["mosswick", "deeproot"],
    productionBonus: 0.2,
    tapValueBonus: 0,
    lore: "Two Stonekin from different worlds, both born from the bones of the earth. When they stand together, the ground itself feels safer.",
  },
  {
    id: "synergy_radiant_convergence",
    name: "Radiant Convergence",
    requiredBloomlingIds: ["solara", "crystalbloom"],
    productionBonus: 0.2,
    tapValueBonus: 0,
    lore: "Solara's light enters Crystalbloom's facets and emerges as a thousand beams. The glade and the cavern share a single, brilliant moment.",
  },
  {
    id: "synergy_verdant_web",
    name: "Verdant Web",
    requiredBloomlingIds: ["lumivine", "abyssvine"],
    productionBonus: 0.2,
    tapValueBonus: 0,
    lore: "One vine climbs toward light; the other reaches into darkness. Where they meet, a web of green connects the hollow to the deep.",
  },
  {
    id: "synergy_ember_and_ice",
    name: "Ember and Ice",
    requiredBloomlingIds: ["pyranthus", "permafrost"],
    productionBonus: 0.2,
    tapValueBonus: 0,
    lore: "Fire and frost, sworn opposites, find balance in the garden. Pyranthus melts what Permafrost freezes, and the cycle feeds them both.",
  },
  {
    id: "synergy_sky_and_sea",
    name: "Sky and Sea",
    requiredBloomlingIds: ["skybloom", "pearlcrest"],
    productionBonus: 0.2,
    tapValueBonus: 0,
    lore: "One blooms where the air is thinnest; the other glows where the water is deepest. They are the garden's two horizons, meeting at last.",
  },
  {
    id: "synergy_thorn_circle",
    name: "Thorn Circle",
    requiredBloomlingIds: ["thornwick", "nightbloom"],
    productionBonus: 0.2,
    tapValueBonus: 0,
    lore: "Thornwick's ancient thorns and Nightbloom's shadow petals form a circle of protection. Nothing enters uninvited; nothing leaves unblessed.",
  },
  {
    id: "synergy_luminous_chain",
    name: "Luminous Chain",
    requiredBloomlingIds: ["petaline", "glowcap"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Petaline's theatrical glow and Glowcap's quiet pulse link together like lanterns on a string. The garden path is always lit when they are near.",
  },
  {
    id: "synergy_wind_and_flame",
    name: "Wind and Flame",
    requiredBloomlingIds: ["aethervane", "ashveil"],
    productionBonus: 0.2,
    tapValueBonus: 0,
    lore: "Aethervane's wind feeds Ashveil's embers into a roaring blaze. Dangerous apart, magnificent together — a controlled wildfire that clears the way forward.",
  },
  {
    id: "synergy_deep_freeze",
    name: "Deep Freeze",
    requiredBloomlingIds: ["tidalwarden", "hollowpine"],
    productionBonus: 0.2,
    tapValueBonus: 0,
    lore: "Tidalwarden's deep currents meet Hollowpine's frozen breath. Where water meets ice, a crystalline fortress forms — beautiful and unbreakable.",
  },
  {
    id: "synergy_cloud_coral",
    name: "Cloud Coral",
    requiredBloomlingIds: ["cloudweaver", "coralchime"],
    productionBonus: 0.15,
    tapValueBonus: 0,
    lore: "Cloudweaver shapes the sky; Coralchime shapes the deep. Their creations mirror each other — coral towers below, cloud castles above.",
  },
  {
    id: "synergy_magma_crystal",
    name: "Magma Crystal",
    requiredBloomlingIds: ["magmaroot", "gemsprout"],
    productionBonus: 0.2,
    tapValueBonus: 0,
    lore: "Magmaroot's molten veins cool inside Gemsprout's crystal lattice, forging gems that glow with inner fire. The rarest treasures are born from this union.",
  },

  // --- Legendary/Mythic synergies ---
  {
    id: "synergy_solstice_root",
    name: "Solstice Root",
    requiredBloomlingIds: ["solstara", "worldroot"],
    productionBonus: 0.3,
    tapValueBonus: 0,
    lore: "The sun's chosen and the earth's foundation. When Solstara's light reaches Worldroot's deepest tendril, every biome blooms at once.",
  },
  {
    id: "synergy_eclipse_bloom",
    name: "Eclipse Bloom",
    requiredBloomlingIds: ["eclipsyn", "bloommother"],
    productionBonus: 0.35,
    tapValueBonus: 0,
    lore: "The child of Transcendence and the mother of all Bloomlings. When they meet, the garden remembers its beginning and glimpses its end — and chooses to keep growing.",
  },
  {
    id: "synergy_celestial_cradle",
    name: "Celestial Cradle",
    requiredBloomlingIds: ["solstara", "fernley"],
    productionBonus: 0.25,
    tapValueBonus: 0,
    lore: "The first Bloomling and the sun's emissary. Fernley looks up at Solstara and sees what it might become. Solstara looks down and remembers where it all began.",
  },
  {
    id: "synergy_mythic_convergence",
    name: "Mythic Convergence",
    requiredBloomlingIds: ["eclipsyn", "prismaflora"],
    productionBonus: 0.3,
    tapValueBonus: 0,
    lore: "Eclipsyn's dual nature and Prismaflora's prismatic light create a convergence of every color and every shadow. The garden trembles with the beauty of it.",
  },
];

/** Lookup map keyed by named synergy ID. */
export const NAMED_SYNERGIES_BY_ID: Readonly<Record<string, NamedSynergyDef>> =
  Object.fromEntries(NAMED_SYNERGIES.map((s) => [s.id, s])) as Record<
    string,
    NamedSynergyDef
  >;

// -----------------------------------------------------------------------------
// Tier Lookup
// -----------------------------------------------------------------------------

/**
 * Tag-synergy multiplier for a given count of matching Bloomlings.
 * Returns 1.0 when the count is below the 2-member threshold.
 */
export function getTagSynergyMultiplier(matchCount: number): number {
  if (matchCount >= 4) return SYNERGY_TIER_4_PLUS_MULTIPLIER;
  if (matchCount === 3) return SYNERGY_TIER_3_MULTIPLIER;
  if (matchCount === 2) return SYNERGY_TIER_2_MULTIPLIER;
  return 1;
}

// -----------------------------------------------------------------------------
// Active Synergy Computation
// -----------------------------------------------------------------------------

/** A single tag-based synergy that is currently active. */
export interface ActiveTagSynergy {
  /** The tag name (e.g. "Mossy", "Luminous"). */
  readonly tag: string;
  /** Bloomling instance IDs that share this tag (and meet stage requirements). */
  readonly participantInstanceIds: readonly string[];
  /** Number of participants (equivalent to participantInstanceIds.length). */
  readonly matchCount: number;
  /** Production multiplier applied to participants (1.15 / 1.35 / 1.60). */
  readonly multiplier: number;
  /**
   * Stable synergy ID: `tag:<Tag>`. Intentionally tier-agnostic so a player's
   * first-discovery list doesn't churn when a synergy changes tier.
   */
  readonly id: string;
}

/** A single named pair/group synergy that is currently active. */
export interface ActiveNamedSynergy {
  /** Reference to the definition. */
  readonly def: NamedSynergyDef;
  /** Bloomling instance IDs that make up this named synergy. */
  readonly participantInstanceIds: readonly string[];
}

/** Full result of evaluating all synergies for the current Garden. */
export interface ActiveSynergies {
  /** All active tag synergies. */
  readonly tag: readonly ActiveTagSynergy[];
  /** All active named synergies. */
  readonly named: readonly ActiveNamedSynergy[];
  /**
   * Per-Bloomling idle production multipliers. Already combined
   * multiplicatively across all tag and named synergies the Bloomling
   * participates in. Defaults to 1.0 for Bloomlings with no active synergies
   * (may be absent from the map entirely).
   */
  readonly productionMultiplierByInstanceId: Readonly<Record<string, number>>;
  /**
   * Per-Bloomling tap-value multipliers from named synergies (e.g. Cradle
   * Guard's +10% tap value). Combined multiplicatively. Absent entries = 1.0.
   */
  readonly tapValueMultiplierByInstanceId: Readonly<Record<string, number>>;
  /**
   * Flat list of all active synergy IDs (both `tag:*` and `synergy_*`).
   * Suitable for assigning to `garden.activeSynergyIds` and for discovery
   * tracking.
   */
  readonly activeSynergyIds: readonly string[];
}

/**
 * Find every tag synergy that is currently active given the Bloomlings in
 * the Garden. Applies the Elder-stage gate when `TAG_SYNERGIES_REQUIRE_ELDER`
 * is true.
 */
export function findActiveTagSynergies(
  gardenBloomlings: readonly Bloomling[],
  getTemplate: (templateId: string) => BloomlingTemplate | undefined
): ActiveTagSynergy[] {
  const eligible = TAG_SYNERGIES_REQUIRE_ELDER
    ? gardenBloomlings.filter(
        (b) => b.evolutionStage === EvolutionStage.Elder
      )
    : gardenBloomlings;

  if (eligible.length < 2) return [];

  // tag → list of instanceIds that carry that tag
  const byTag = new Map<string, string[]>();
  for (const bloomling of eligible) {
    const tmpl = getTemplate(bloomling.templateId);
    if (!tmpl) continue;
    for (const tag of tmpl.synergyTags) {
      const bucket = byTag.get(tag);
      if (bucket) {
        bucket.push(bloomling.instanceId);
      } else {
        byTag.set(tag, [bloomling.instanceId]);
      }
    }
  }

  const result: ActiveTagSynergy[] = [];
  for (const [tag, participantInstanceIds] of byTag) {
    const matchCount = participantInstanceIds.length;
    if (matchCount < 2) continue;
    result.push({
      tag,
      participantInstanceIds,
      matchCount,
      multiplier: getTagSynergyMultiplier(matchCount),
      id: `tag:${tag}`,
    });
  }
  return result;
}

/**
 * Find every named synergy that is currently active. A named synergy is
 * active iff every Bloomling in `requiredBloomlingIds` is present in the
 * Garden (by templateId). Unlike tag synergies, named synergies are not
 * gated by evolution stage.
 */
export function findActiveNamedSynergies(
  gardenBloomlings: readonly Bloomling[]
): ActiveNamedSynergy[] {
  if (gardenBloomlings.length < 2) return [];

  // templateId → first matching instanceId in the Garden. (If a player
  // somehow has multiple instances of the same template we pick the first.)
  const templateToInstance = new Map<string, string>();
  for (const b of gardenBloomlings) {
    if (!templateToInstance.has(b.templateId)) {
      templateToInstance.set(b.templateId, b.instanceId);
    }
  }

  const result: ActiveNamedSynergy[] = [];
  for (const def of NAMED_SYNERGIES) {
    const participantInstanceIds: string[] = [];
    let allPresent = true;
    for (const templateId of def.requiredBloomlingIds) {
      const instanceId = templateToInstance.get(templateId);
      if (!instanceId) {
        allPresent = false;
        break;
      }
      participantInstanceIds.push(instanceId);
    }
    if (allPresent) {
      result.push({ def, participantInstanceIds });
    }
  }
  return result;
}

/**
 * Multiply two multipliers. Broken out so we have one place to change the
 * stacking model if we decide to tune it (e.g. to additive or max-only).
 */
function combineMultipliers(a: number, b: number): number {
  return a * b;
}

/**
 * Top-level: compute every active synergy and the per-Bloomling multipliers
 * that result. This is the function the production math should call.
 */
export function calculateActiveSynergies(
  gardenBloomlings: readonly Bloomling[],
  getTemplate: (templateId: string) => BloomlingTemplate | undefined
): ActiveSynergies {
  const tag = findActiveTagSynergies(gardenBloomlings, getTemplate);
  const named = findActiveNamedSynergies(gardenBloomlings);

  const productionMultiplierByInstanceId: Record<string, number> = {};
  const tapValueMultiplierByInstanceId: Record<string, number> = {};

  const applyProduction = (instanceId: string, mult: number): void => {
    const prev = productionMultiplierByInstanceId[instanceId] ?? 1;
    productionMultiplierByInstanceId[instanceId] = combineMultipliers(
      prev,
      mult
    );
  };
  const applyTap = (instanceId: string, mult: number): void => {
    const prev = tapValueMultiplierByInstanceId[instanceId] ?? 1;
    tapValueMultiplierByInstanceId[instanceId] = combineMultipliers(prev, mult);
  };

  for (const t of tag) {
    for (const pid of t.participantInstanceIds) {
      applyProduction(pid, t.multiplier);
    }
  }

  for (const n of named) {
    if (n.def.productionBonus > 0) {
      const mult = 1 + n.def.productionBonus;
      for (const pid of n.participantInstanceIds) {
        applyProduction(pid, mult);
      }
    }
    if (n.def.tapValueBonus > 0) {
      const mult = 1 + n.def.tapValueBonus;
      for (const pid of n.participantInstanceIds) {
        applyTap(pid, mult);
      }
    }
  }

  const activeSynergyIds: string[] = [
    ...tag.map((t) => t.id),
    ...named.map((n) => n.def.id),
  ];

  return {
    tag,
    named,
    productionMultiplierByInstanceId,
    tapValueMultiplierByInstanceId,
    activeSynergyIds,
  };
}

/**
 * Production multiplier for a single Bloomling from the active synergies.
 * Convenience wrapper over the `productionMultiplierByInstanceId` map.
 */
export function getSynergyProductionMultiplier(
  instanceId: string,
  active: ActiveSynergies
): number {
  return active.productionMultiplierByInstanceId[instanceId] ?? 1;
}

/**
 * Tap-value multiplier for a single Bloomling from the active synergies.
 * Convenience wrapper over the `tapValueMultiplierByInstanceId` map.
 */
export function getSynergyTapValueMultiplier(
  instanceId: string,
  active: ActiveSynergies
): number {
  return active.tapValueMultiplierByInstanceId[instanceId] ?? 1;
}

// -----------------------------------------------------------------------------
// Discovery Tracking
// -----------------------------------------------------------------------------

/** Result of reconciling the discovery list against active synergies. */
export interface SynergyDiscoveryUpdate {
  /** New combined discovery list (previous ∪ newly discovered). */
  readonly discoveredSynergyIds: readonly string[];
  /** IDs that are in `active` but were not in `previouslyDiscovered`. */
  readonly newlyDiscovered: readonly string[];
}

/**
 * Given the player's previously-discovered synergy IDs and the currently
 * active synergy IDs, compute the new discovery list and the subset that
 * was newly discovered this evaluation. Pure; caller is responsible for
 * persisting the result and firing any rewards.
 *
 * The previously-discovered list is treated as a set — duplicates are
 * collapsed in the output.
 */
export function reconcileSynergyDiscovery(
  previouslyDiscovered: readonly string[],
  activeSynergyIds: readonly string[]
): SynergyDiscoveryUpdate {
  const discovered = new Set(previouslyDiscovered);
  const newlyDiscovered: string[] = [];
  for (const id of activeSynergyIds) {
    if (!discovered.has(id)) {
      discovered.add(id);
      newlyDiscovered.push(id);
    }
  }
  return {
    discoveredSynergyIds: [...discovered],
    newlyDiscovered,
  };
}
