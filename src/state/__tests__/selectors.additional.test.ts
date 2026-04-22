import { EvolutionStage } from "~/types/game";
import type { Bloomling } from "~/types/game";
import {
  totalSunlightPerSecondFromRegistry,
  selectEffectiveTapValue,
  getTapMultiplier,
} from "../selectors";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBloomling(
  id: string,
  templateId: string,
  overrides: Partial<Bloomling> = {}
): Bloomling {
  return {
    templateId,
    instanceId: id,
    level: 1,
    evolutionStage: EvolutionStage.Sprout,
    inGarden: true,
    gardenSlot: 0,
    unlocked: true,
    totalProduced: 0,
    ...overrides,
  };
}

const emptyPrestige = {
  rebirthCount: 0,
  currentSeason: 1,
  totalNectarEarned: 0,
  totalNectarSpent: 0,
  currentRunHighestZone: 0,
  allTimeHighestZone: 0,
  rebirthUnlocked: false,
  transcendenceCount: 0,
  totalEssenceEarned: 0,
  totalEssenceSpent: 0,
  transcendenceUnlocked: false,
};

// ---------------------------------------------------------------------------
// totalSunlightPerSecondFromRegistry
// ---------------------------------------------------------------------------

describe("totalSunlightPerSecondFromRegistry", () => {
  it("returns 0 with empty garden", () => {
    const state = {
      bloomlings: {},
      garden: { maxSlots: 1, slots: [] as (string | null)[], activeSynergyIds: [] as string[], specialMeterProgress: 0 },
      upgrades: {} as Record<string, { templateId: string; level: number }>,
    };
    expect(totalSunlightPerSecondFromRegistry(state)).toBe(0);
  });

  it("uses real template baseProduction for fernley", () => {
    const state = {
      bloomlings: { a: makeBloomling("a", "fernley") },
      garden: { maxSlots: 1, slots: ["a"], activeSynergyIds: [] as string[], specialMeterProgress: 0 },
      upgrades: {} as Record<string, { templateId: string; level: number }>,
    };
    // fernley: baseProduction=1, level=1, Sprout=1x → 1 sun/sec
    expect(totalSunlightPerSecondFromRegistry(state)).toBeCloseTo(1);
  });

  it("applies idle_production upgrade multiplier", () => {
    const state = {
      bloomlings: { a: makeBloomling("a", "fernley") },
      garden: { maxSlots: 1, slots: ["a"], activeSynergyIds: [] as string[], specialMeterProgress: 0 },
      upgrades: { idle_production: { templateId: "idle_production", level: 5 } },
    };
    // 1 sun/sec * (1 + 5*0.10) = 1.5
    expect(totalSunlightPerSecondFromRegistry(state)).toBeCloseTo(1.5);
  });

  it("sums multiple garden bloomlings", () => {
    const state = {
      bloomlings: {
        a: makeBloomling("a", "fernley"),
        b: makeBloomling("b", "thornwick", { level: 2, gardenSlot: 1 }),
      },
      garden: { maxSlots: 2, slots: ["a", "b"], activeSynergyIds: [] as string[], specialMeterProgress: 0 },
      upgrades: {} as Record<string, { templateId: string; level: number }>,
    };
    // fernley: 1*1*1=1, thornwick: 5*2*1=10 → total=11
    expect(totalSunlightPerSecondFromRegistry(state)).toBeCloseTo(11);
  });
});

// ---------------------------------------------------------------------------
// selectEffectiveTapValue
// ---------------------------------------------------------------------------

describe("selectEffectiveTapValue", () => {
  it("returns 1 with no upgrades", () => {
    const state = {
      upgrades: {} as Record<string, { templateId: string; level: number }>,
      prestige: emptyPrestige,
    };
    expect(selectEffectiveTapValue(state)).toBeCloseTo(1);
  });

  it("increases with tap_power upgrade levels", () => {
    const state = {
      upgrades: { tap_power: { templateId: "tap_power", level: 4 } },
      prestige: emptyPrestige,
    };
    // baseTapValue = 1 + 4*0.25 = 2, tapMultiplier = 1.0
    expect(selectEffectiveTapValue(state)).toBeCloseTo(2);
  });
});

// ---------------------------------------------------------------------------
// getTapMultiplier
// ---------------------------------------------------------------------------

describe("getTapMultiplier", () => {
  it("returns 1.0 with no stronger_roots upgrade", () => {
    const state = {
      upgrades: {} as Record<string, { templateId: string; level: number }>,
      prestige: emptyPrestige,
    };
    expect(getTapMultiplier(state)).toBe(1.0);
  });

  it("returns 1 + level * 0.20 for stronger_roots", () => {
    const state = {
      upgrades: { stronger_roots: { templateId: "stronger_roots", level: 3 } },
      prestige: emptyPrestige,
    };
    // 1 + 3 * 0.20 = 1.6
    expect(getTapMultiplier(state)).toBeCloseTo(1.6);
  });

  it("returns 1.0 at level 0", () => {
    const state = {
      upgrades: { stronger_roots: { templateId: "stronger_roots", level: 0 } },
      prestige: emptyPrestige,
    };
    expect(getTapMultiplier(state)).toBe(1.0);
  });
});
