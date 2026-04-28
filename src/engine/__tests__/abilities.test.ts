import { AbilityType, EvolutionStage } from "~/types/game";
import type { Bloomling, BloomlingTemplate } from "~/types/game";
import {
  getAbilityPower,
  getActiveAbilities,
  computeAbilityBonuses,
  emptyAbilityBonuses,
  type ActiveAbility,
} from "../abilities";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBloomling(
  overrides: Partial<Bloomling> & { templateId: string; instanceId: string }
): Bloomling {
  return {
    level: 1,
    evolutionStage: EvolutionStage.Bloom,
    inGarden: true,
    gardenSlot: 0,
    unlocked: true,
    totalProduced: 0,
    ...overrides,
  };
}

function makeTemplate(
  overrides: Partial<BloomlingTemplate> & { id: string }
): BloomlingTemplate {
  return {
    name: overrides.id,
    rarity: "common" as never,
    biome: "mossy_cradle" as never,
    baseProduction: 1,
    baseLevelCost: 10,
    abilityType: AbilityType.ProductionBoost,
    abilityDescription: "+2% idle Sunlight production to all Garden Bloomlings",
    abilityValue: 0.02,
    synergyTags: [],
    unlockMethod: "zone_milestone" as never,
    unlockCondition: "zone_1",
    personality: "",
    lore: "",
    ...overrides,
  };
}

const templates: Record<string, BloomlingTemplate> = {};
function registerTemplate(t: BloomlingTemplate) {
  templates[t.id] = t;
}
function getTemplate(id: string) {
  return templates[id];
}

beforeEach(() => {
  for (const k of Object.keys(templates)) delete templates[k];
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getAbilityPower", () => {
  it("returns 0 for Sprout", () => {
    expect(getAbilityPower(EvolutionStage.Sprout)).toBe(0);
  });
  it("returns 1 for Bloom", () => {
    expect(getAbilityPower(EvolutionStage.Bloom)).toBe(1);
  });
  it("returns 2 for Elder", () => {
    expect(getAbilityPower(EvolutionStage.Elder)).toBe(2);
  });
});

describe("getActiveAbilities", () => {
  it("filters out Sprouts", () => {
    registerTemplate(makeTemplate({ id: "a" }));
    const bloomlings = [
      makeBloomling({ templateId: "a", instanceId: "a1", evolutionStage: EvolutionStage.Sprout }),
      makeBloomling({ templateId: "a", instanceId: "a2", evolutionStage: EvolutionStage.Bloom }),
    ];
    const result = getActiveAbilities(bloomlings, getTemplate);
    expect(result).toHaveLength(1);
    expect(result[0]!.instanceId).toBe("a2");
    expect(result[0]!.power).toBe(1);
  });

  it("scales abilityValue by power", () => {
    registerTemplate(makeTemplate({ id: "b", abilityValue: 0.04 }));
    const bloomlings = [
      makeBloomling({ templateId: "b", instanceId: "b1", evolutionStage: EvolutionStage.Elder }),
    ];
    const result = getActiveAbilities(bloomlings, getTemplate);
    expect(result[0]!.abilityValue).toBeCloseTo(0.08);
    expect(result[0]!.power).toBe(2);
  });
});

describe("computeAbilityBonuses", () => {
  it("sums ProductionBoost for all Garden correctly", () => {
    registerTemplate(makeTemplate({ id: "f", abilityValue: 0.02, abilityDescription: "+2% to all Garden" }));
    const abilities: ActiveAbility[] = [
      { instanceId: "f1", templateId: "f", abilityType: AbilityType.ProductionBoost, abilityValue: 0.02, power: 1 },
      { instanceId: "f2", templateId: "f", abilityType: AbilityType.ProductionBoost, abilityValue: 0.04, power: 2 },
    ];
    const bonuses = computeAbilityBonuses(abilities, getTemplate);
    expect(bonuses.productionBoostAll).toBeCloseTo(0.06);
  });

  it("caps crit chance at 50%", () => {
    registerTemplate(makeTemplate({
      id: "c",
      abilityType: AbilityType.TapBoost,
      abilityDescription: "+2% critical tap chance",
      abilityValue: 0.02,
    }));
    const abilities: ActiveAbility[] = Array.from({ length: 30 }, (_, i) => ({
      instanceId: `c${i}`,
      templateId: "c",
      abilityType: AbilityType.TapBoost,
      abilityValue: 0.02,
      power: 1,
    }));
    const bonuses = computeAbilityBonuses(abilities, getTemplate);
    expect(bonuses.critChanceBonus).toBe(0.5);
  });

  it("caps zone threshold reduction at 30%", () => {
    registerTemplate(makeTemplate({
      id: "z",
      abilityType: AbilityType.ZoneBoost,
      abilityDescription: "-3% zone Sunlight threshold",
      abilityValue: 0.03,
    }));
    const abilities: ActiveAbility[] = Array.from({ length: 15 }, (_, i) => ({
      instanceId: `z${i}`,
      templateId: "z",
      abilityType: AbilityType.ZoneBoost,
      abilityValue: 0.03,
      power: 1,
    }));
    const bonuses = computeAbilityBonuses(abilities, getTemplate);
    expect(bonuses.zoneThresholdReduction).toBe(0.3);
  });

  it("converts ComboBoost decay seconds to ms", () => {
    registerTemplate(makeTemplate({
      id: "d",
      abilityType: AbilityType.ComboBoost,
      abilityDescription: "+0.3s to combo decay timer",
      abilityValue: 0.3,
    }));
    const abilities: ActiveAbility[] = [
      { instanceId: "d1", templateId: "d", abilityType: AbilityType.ComboBoost, abilityValue: 0.3, power: 1 },
    ];
    const bonuses = computeAbilityBonuses(abilities, getTemplate);
    expect(bonuses.comboDecayExtensionMs).toBe(300);
  });
});

describe("emptyAbilityBonuses", () => {
  it("returns all zeros", () => {
    const b = emptyAbilityBonuses();
    expect(b.productionBoostAll).toBe(0);
    expect(b.tapValueFlat).toBe(0);
    expect(b.critChanceBonus).toBe(0);
    expect(b.comboMultiplierBonus).toBe(0);
    expect(b.comboDecayExtensionMs).toBe(0);
    expect(b.zoneThresholdReduction).toBe(0);
    expect(b.prestigeNectarBonus).toBe(0);
    expect(b.luckBonus).toBe(0);
    expect(Object.keys(b.productionBoostSelf)).toHaveLength(0);
  });
});
