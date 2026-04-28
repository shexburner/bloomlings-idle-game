import { EvolutionStage, Rarity, BiomeType, AbilityType, UnlockMethod } from "~/types/game";
import type { Bloomling, BloomlingTemplate } from "~/types/game";
import {
  getTagSynergyMultiplier,
  findActiveTagSynergies,
  findActiveNamedSynergies,
  calculateActiveSynergies,
  getSynergyProductionMultiplier,
  reconcileSynergyDiscovery,
  SYNERGY_TIER_2_MULTIPLIER,
  SYNERGY_TIER_3_MULTIPLIER,
  SYNERGY_TIER_4_PLUS_MULTIPLIER,
} from "../synergies";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBloomling(
  instanceId: string,
  templateId: string,
  stage: EvolutionStage = EvolutionStage.Elder
): Bloomling {
  return {
    templateId,
    instanceId,
    level: 100,
    evolutionStage: stage,
    inGarden: true,
    gardenSlot: 0,
    unlocked: true,
    totalProduced: 0,
  };
}

function makeTemplate(
  id: string,
  synergyTags: string[]
): BloomlingTemplate {
  return {
    id,
    name: id,
    rarity: Rarity.Common,
    biome: BiomeType.MossyCradle,
    baseProduction: 1,
    baseLevelCost: 10,
    abilityType: AbilityType.ProductionBoost,
    abilityDescription: "",
    abilityValue: 0,
    synergyTags,
    unlockMethod: UnlockMethod.ZoneMilestone,
    unlockCondition: "zone_1",
    personality: "",
    lore: "",
  };
}

const TEMPLATES: Record<string, BloomlingTemplate> = {
  fernley: makeTemplate("fernley", ["Mossy", "Verdant"]),
  mosswick: makeTemplate("mosswick", ["Mossy", "Stonekin"]),
  thornwick: makeTemplate("thornwick", ["Stonekin", "Thorned"]),
  solara: makeTemplate("solara", ["Luminous"]),
  honeyveil: makeTemplate("honeyveil", ["Luminous", "Nectar"]),
  briarthorn: makeTemplate("briarthorn", ["Thorned"]),
};

const getTemplate = (id: string) => TEMPLATES[id];

// ---------------------------------------------------------------------------
// getTagSynergyMultiplier
// ---------------------------------------------------------------------------

describe("getTagSynergyMultiplier", () => {
  it("returns 1.0 for count < 2", () => {
    expect(getTagSynergyMultiplier(0)).toBe(1);
    expect(getTagSynergyMultiplier(1)).toBe(1);
  });

  it("returns SYNERGY_TIER_2_MULTIPLIER (1.15) for count = 2", () => {
    expect(getTagSynergyMultiplier(2)).toBe(SYNERGY_TIER_2_MULTIPLIER);
  });

  it("returns SYNERGY_TIER_3_MULTIPLIER (1.35) for count = 3", () => {
    expect(getTagSynergyMultiplier(3)).toBe(SYNERGY_TIER_3_MULTIPLIER);
  });

  it("returns SYNERGY_TIER_4_PLUS_MULTIPLIER (1.60) for count >= 4", () => {
    expect(getTagSynergyMultiplier(4)).toBe(SYNERGY_TIER_4_PLUS_MULTIPLIER);
    expect(getTagSynergyMultiplier(10)).toBe(SYNERGY_TIER_4_PLUS_MULTIPLIER);
  });
});

// ---------------------------------------------------------------------------
// findActiveTagSynergies
// ---------------------------------------------------------------------------

describe("findActiveTagSynergies", () => {
  it("returns empty array for empty garden", () => {
    const result = findActiveTagSynergies([], getTemplate);
    expect(result).toEqual([]);
  });

  it("returns empty array when only 1 Bloomling in garden", () => {
    const blooms = [makeBloomling("a", "fernley")];
    const result = findActiveTagSynergies(blooms, getTemplate);
    expect(result).toEqual([]);
  });

  it("does not activate tag synergy for non-Elder Bloomlings (TAG_SYNERGIES_REQUIRE_ELDER)", () => {
    const blooms = [
      makeBloomling("a", "fernley", EvolutionStage.Sprout),
      makeBloomling("b", "mosswick", EvolutionStage.Bloom),
    ];
    const result = findActiveTagSynergies(blooms, getTemplate);
    expect(result).toHaveLength(0);
  });

  it("activates tag synergy for 2 Elders sharing a tag", () => {
    const blooms = [
      makeBloomling("a", "fernley"),
      makeBloomling("b", "mosswick"),
    ];
    const result = findActiveTagSynergies(blooms, getTemplate);
    const mossySynergy = result.find((s) => s.tag === "Mossy");
    expect(mossySynergy).toBeDefined();
    expect(mossySynergy?.matchCount).toBe(2);
    expect(mossySynergy?.multiplier).toBe(SYNERGY_TIER_2_MULTIPLIER);
    expect(mossySynergy?.id).toBe("tag:Mossy");
  });

  it("uses tier 3 multiplier when 3 Bloomlings share a tag", () => {
    const extra = makeTemplate("extra_mossy", ["Mossy"]);
    const localGet = (id: string) =>
      id === "extra" ? extra : getTemplate(id);
    const blooms = [
      makeBloomling("a", "fernley"),
      makeBloomling("b", "mosswick"),
      makeBloomling("c", "extra"),
    ];
    const result = findActiveTagSynergies(blooms, localGet);
    const mossySynergy = result.find((s) => s.tag === "Mossy");
    expect(mossySynergy?.matchCount).toBe(3);
    expect(mossySynergy?.multiplier).toBe(SYNERGY_TIER_3_MULTIPLIER);
  });

  it("skips Bloomlings with unknown templates", () => {
    const blooms = [
      makeBloomling("a", "fernley"),
      makeBloomling("b", "unknown"),
    ];
    const result = findActiveTagSynergies(blooms, getTemplate);
    // No synergy because only 1 known template with Mossy
    const mossySynergy = result.find((s) => s.tag === "Mossy");
    expect(mossySynergy).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// findActiveNamedSynergies
// ---------------------------------------------------------------------------

describe("findActiveNamedSynergies", () => {
  it("returns empty array for empty garden", () => {
    expect(findActiveNamedSynergies([])).toEqual([]);
  });

  it("returns empty array for single Bloomling", () => {
    expect(findActiveNamedSynergies([makeBloomling("a", "fernley")])).toEqual([]);
  });

  it("activates 'Undergrowth Alliance' when fernley+mosswick both in garden", () => {
    const blooms = [
      makeBloomling("a", "fernley"),
      makeBloomling("b", "mosswick"),
    ];
    const result = findActiveNamedSynergies(blooms);
    expect(result.some((s) => s.def.id === "synergy_undergrowth_alliance")).toBe(true);
  });

  it("activates 'Cradle Guard' (tap-value synergy) for mosswick+thornwick", () => {
    const blooms = [
      makeBloomling("a", "mosswick"),
      makeBloomling("b", "thornwick"),
    ];
    const result = findActiveNamedSynergies(blooms);
    expect(result.some((s) => s.def.id === "synergy_cradle_guard")).toBe(true);
  });

  it("does not activate synergy when one required Bloomling is missing", () => {
    const blooms = [makeBloomling("a", "fernley")];
    const result = findActiveNamedSynergies(blooms);
    expect(result.some((s) => s.def.id === "synergy_undergrowth_alliance")).toBe(false);
  });

  it("activates multiple named synergies simultaneously", () => {
    const blooms = [
      makeBloomling("a", "fernley"),
      makeBloomling("b", "mosswick"),
      makeBloomling("c", "thornwick"),
    ];
    const result = findActiveNamedSynergies(blooms);
    const ids = result.map((s) => s.def.id);
    expect(ids).toContain("synergy_undergrowth_alliance");
    expect(ids).toContain("synergy_cradle_guard");
  });
});

// ---------------------------------------------------------------------------
// calculateActiveSynergies
// ---------------------------------------------------------------------------

describe("calculateActiveSynergies", () => {
  it("returns empty multiplier maps when no synergies are active", () => {
    const blooms = [makeBloomling("a", "solara")];
    const result = calculateActiveSynergies(blooms, getTemplate);
    expect(result.tag).toHaveLength(0);
    expect(result.named).toHaveLength(0);
    expect(Object.keys(result.productionMultiplierByInstanceId)).toHaveLength(0);
  });

  it("applies stacked multiplier from named synergy + tag synergy (Undergrowth Alliance + Mossy tag)", () => {
    const blooms = [
      makeBloomling("a", "fernley"),
      makeBloomling("b", "mosswick"),
    ];
    const result = calculateActiveSynergies(blooms, getTemplate);
    // Undergrowth Alliance (+15%) × tag:Mossy (+15%) = 1.15 * 1.15 ≈ 1.3225
    expect(result.productionMultiplierByInstanceId["a"]).toBeCloseTo(1.3225, 2);
    expect(result.productionMultiplierByInstanceId["b"]).toBeCloseTo(1.3225, 2);
  });

  it("applies tap-value multiplier from Cradle Guard (+10% tap)", () => {
    const blooms = [
      makeBloomling("a", "mosswick"),
      makeBloomling("b", "thornwick"),
    ];
    const result = calculateActiveSynergies(blooms, getTemplate);
    expect(result.tapValueMultiplierByInstanceId["a"]).toBeCloseTo(1.1);
    expect(result.tapValueMultiplierByInstanceId["b"]).toBeCloseTo(1.1);
  });

  it("stacks multipliers multiplicatively for Bloomlings in multiple synergies", () => {
    // fernley: Undergrowth Alliance (+15%) AND tag:Mossy if 2 Elders with Mossy
    // fernley + mosswick share Mossy tag (both Elders) → tag synergy +15%
    // AND named synergy Undergrowth Alliance → +15%
    // Combined: 1.15 * 1.15 ≈ 1.3225
    const blooms = [
      makeBloomling("a", "fernley"),
      makeBloomling("b", "mosswick"),
    ];
    const result = calculateActiveSynergies(blooms, getTemplate);
    const multA = result.productionMultiplierByInstanceId["a"] ?? 1;
    expect(multA).toBeCloseTo(1.15 * 1.15, 2);
  });

  it("includes all active synergy IDs in activeSynergyIds", () => {
    const blooms = [
      makeBloomling("a", "fernley"),
      makeBloomling("b", "mosswick"),
    ];
    const result = calculateActiveSynergies(blooms, getTemplate);
    expect(result.activeSynergyIds).toContain("synergy_undergrowth_alliance");
    expect(result.activeSynergyIds).toContain("tag:Mossy");
  });
});

// ---------------------------------------------------------------------------
// getSynergyProductionMultiplier
// ---------------------------------------------------------------------------

describe("getSynergyProductionMultiplier", () => {
  it("returns 1.0 for a Bloomling not in any synergy", () => {
    const blooms = [makeBloomling("a", "solara")];
    const active = calculateActiveSynergies(blooms, getTemplate);
    expect(getSynergyProductionMultiplier("a", active)).toBe(1);
  });

  it("returns the combined multiplier for a synergy participant", () => {
    const blooms = [
      makeBloomling("a", "fernley"),
      makeBloomling("b", "mosswick"),
    ];
    const active = calculateActiveSynergies(blooms, getTemplate);
    expect(getSynergyProductionMultiplier("a", active)).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// reconcileSynergyDiscovery
// ---------------------------------------------------------------------------

describe("reconcileSynergyDiscovery", () => {
  it("detects newly discovered synergies", () => {
    const result = reconcileSynergyDiscovery([], ["tag:Mossy", "synergy_foo"]);
    expect(result.newlyDiscovered).toEqual(["tag:Mossy", "synergy_foo"]);
    expect(result.discoveredSynergyIds).toContain("tag:Mossy");
    expect(result.discoveredSynergyIds).toContain("synergy_foo");
  });

  it("does not re-add previously discovered synergies", () => {
    const prev = ["tag:Mossy"];
    const result = reconcileSynergyDiscovery(prev, ["tag:Mossy", "synergy_foo"]);
    expect(result.newlyDiscovered).toEqual(["synergy_foo"]);
    expect(result.discoveredSynergyIds).toHaveLength(2);
  });

  it("collapses duplicates in the previouslyDiscovered list", () => {
    const prev = ["tag:Mossy", "tag:Mossy"];
    const result = reconcileSynergyDiscovery(prev, []);
    expect(result.discoveredSynergyIds).toHaveLength(1);
    expect(result.newlyDiscovered).toHaveLength(0);
  });

  it("returns empty newlyDiscovered when all are already known", () => {
    const prev = ["tag:Mossy", "synergy_foo"];
    const result = reconcileSynergyDiscovery(prev, ["tag:Mossy"]);
    expect(result.newlyDiscovered).toHaveLength(0);
  });

  it("handles empty inputs", () => {
    const result = reconcileSynergyDiscovery([], []);
    expect(result.discoveredSynergyIds).toHaveLength(0);
    expect(result.newlyDiscovered).toHaveLength(0);
  });
});
