import { Rarity, EvolutionStage } from "~/types/game";
import type { Bloomling } from "~/types/game";

// Mock the template map before importing evolution functions
jest.mock("~/data/bloomlingTemplates", () => ({
  BLOOMLING_TEMPLATE_MAP: {
    fernley: { id: "fernley", rarity: "common" },
    petaline: { id: "petaline", rarity: "uncommon" },
    lumivine: { id: "lumivine", rarity: "rare" },
    embercap: { id: "embercap", rarity: "epic" },
    aurorabell: { id: "aurorabell", rarity: "legendary" },
    voidbloom: { id: "voidbloom", rarity: "mythic" },
  },
  getBloomlingTemplate: (id: string) => ({
    fernley: { id: "fernley", rarity: "common" },
    petaline: { id: "petaline", rarity: "uncommon" },
  })[id],
}));

import {
  getEvolutionCost,
  canEvolve,
  getNextEvolutionStage,
  evolveBloomling,
} from "../evolution";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBloomling(
  templateId: string,
  stage: EvolutionStage,
  level: number = 100
): Bloomling {
  return {
    templateId,
    instanceId: `${templateId}-1`,
    level,
    evolutionStage: stage,
    inGarden: false,
    gardenSlot: null,
    unlocked: true,
    totalProduced: 0,
  };
}

// ---------------------------------------------------------------------------
// getEvolutionCost
// ---------------------------------------------------------------------------

describe("getEvolutionCost", () => {
  it("Sprout→Bloom for Common: sunlight only, no nectar", () => {
    const b = makeBloomling("fernley", EvolutionStage.Sprout);
    const cost = getEvolutionCost(b);
    expect(cost.sunlight).toBe(10_000);
    expect(cost.nectar).toBe(0);
  });

  it("Sprout→Bloom for Uncommon: higher sunlight cost", () => {
    const b = makeBloomling("petaline", EvolutionStage.Sprout);
    const cost = getEvolutionCost(b);
    expect(cost.sunlight).toBe(50_000);
    expect(cost.nectar).toBe(0);
  });

  it("Bloom→Elder for Common: both sunlight and nectar", () => {
    const b = makeBloomling("fernley", EvolutionStage.Bloom);
    const cost = getEvolutionCost(b);
    expect(cost.sunlight).toBe(100_000);
    expect(cost.nectar).toBe(5);
  });

  it("Bloom→Elder for Mythic: maximum costs", () => {
    const b = makeBloomling("voidbloom", EvolutionStage.Bloom);
    const cost = getEvolutionCost(b);
    expect(cost.sunlight).toBe(1_000_000_000);
    expect(cost.nectar).toBe(2_000);
  });

  it("Elder: returns zero cost (cannot evolve)", () => {
    const b = makeBloomling("fernley", EvolutionStage.Elder);
    const cost = getEvolutionCost(b);
    expect(cost.sunlight).toBe(0);
    expect(cost.nectar).toBe(0);
  });

  it("applies discount factor (0.5 halves cost, ceiled)", () => {
    const b = makeBloomling("fernley", EvolutionStage.Sprout);
    const discounted = getEvolutionCost(b, 0.5);
    expect(discounted.sunlight).toBe(Math.ceil(10_000 * 0.5));
  });

  it("returns zero cost when template is not found", () => {
    const b = makeBloomling("unknown_template", EvolutionStage.Sprout);
    const cost = getEvolutionCost(b);
    expect(cost.sunlight).toBe(0);
    expect(cost.nectar).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// canEvolve
// ---------------------------------------------------------------------------

describe("canEvolve", () => {
  const fullResources = { sunlight: 999_999_999, nectar: 99_999 };

  it("returns false when already at Elder stage", () => {
    const b = makeBloomling("fernley", EvolutionStage.Elder);
    expect(canEvolve(b, fullResources)).toBe(false);
  });

  it("returns false when level < 100", () => {
    const b = makeBloomling("fernley", EvolutionStage.Sprout, 99);
    expect(canEvolve(b, fullResources)).toBe(false);
  });

  it("returns false when template is not found", () => {
    const b = makeBloomling("unknown_template", EvolutionStage.Sprout);
    expect(canEvolve(b, fullResources)).toBe(false);
  });

  it("returns false when insufficient sunlight for Sprout→Bloom", () => {
    const b = makeBloomling("fernley", EvolutionStage.Sprout);
    expect(canEvolve(b, { sunlight: 9_999, nectar: 0 })).toBe(false);
  });

  it("returns true when exactly enough sunlight for Sprout→Bloom", () => {
    const b = makeBloomling("fernley", EvolutionStage.Sprout);
    expect(canEvolve(b, { sunlight: 10_000, nectar: 0 })).toBe(true);
  });

  it("returns false when insufficient nectar for Bloom→Elder", () => {
    const b = makeBloomling("fernley", EvolutionStage.Bloom);
    expect(canEvolve(b, { sunlight: 100_000, nectar: 4 })).toBe(false);
  });

  it("returns true when exactly enough resources for Bloom→Elder", () => {
    const b = makeBloomling("fernley", EvolutionStage.Bloom);
    expect(canEvolve(b, { sunlight: 100_000, nectar: 5 })).toBe(true);
  });

  it("respects discount factor", () => {
    const b = makeBloomling("fernley", EvolutionStage.Sprout);
    // Discounted cost = ceil(10000 * 0.5) = 5000
    expect(canEvolve(b, { sunlight: 5_000, nectar: 0 }, 0.5)).toBe(true);
    expect(canEvolve(b, { sunlight: 4_999, nectar: 0 }, 0.5)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getNextEvolutionStage
// ---------------------------------------------------------------------------

describe("getNextEvolutionStage", () => {
  it("Sprout → Bloom", () => {
    expect(getNextEvolutionStage(EvolutionStage.Sprout)).toBe(EvolutionStage.Bloom);
  });

  it("Bloom → Elder", () => {
    expect(getNextEvolutionStage(EvolutionStage.Bloom)).toBe(EvolutionStage.Elder);
  });

  it("Elder → null (cannot evolve further)", () => {
    expect(getNextEvolutionStage(EvolutionStage.Elder)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// evolveBloomling
// ---------------------------------------------------------------------------

describe("evolveBloomling", () => {
  it("advances Sprout to Bloom and resets level to 1", () => {
    const b = makeBloomling("fernley", EvolutionStage.Sprout, 100);
    const evolved = evolveBloomling(b);
    expect(evolved.evolutionStage).toBe(EvolutionStage.Bloom);
    expect(evolved.level).toBe(1);
  });

  it("advances Bloom to Elder and resets level to 1", () => {
    const b = makeBloomling("fernley", EvolutionStage.Bloom, 100);
    const evolved = evolveBloomling(b);
    expect(evolved.evolutionStage).toBe(EvolutionStage.Elder);
    expect(evolved.level).toBe(1);
  });

  it("returns the same Bloomling unchanged if already Elder", () => {
    const b = makeBloomling("fernley", EvolutionStage.Elder, 100);
    const result = evolveBloomling(b);
    expect(result).toBe(b);
  });

  it("preserves all other Bloomling fields", () => {
    const b = makeBloomling("fernley", EvolutionStage.Sprout, 100);
    const evolved = evolveBloomling(b);
    expect(evolved.templateId).toBe("fernley");
    expect(evolved.instanceId).toBe("fernley-1");
    expect(evolved.unlocked).toBe(true);
    expect(evolved.inGarden).toBe(false);
    expect(evolved.gardenSlot).toBeNull();
  });
});
