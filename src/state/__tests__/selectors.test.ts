import { EvolutionStage, AdTouchpoint } from "~/types/game";
import type { Bloomling, GardenState, ActiveBoost } from "~/types/game";
import type { GameStore } from "../store";
import {
  calculateUpgradeCost,
  calculateLevelUpCost,
  calculateBloomlingProduction,
  totalSunlightPerSecond,
  totalSunlightPerSecondSimple,
  effectiveTapValue,
  getBaseTapValue,
  getZoneThreshold,
  hasReachedZoneThreshold,
  canAffordUpgrade,
  calculateNectarOnRebirth,
  getComboMultiplier,
  getActiveBoosts,
  getBoostMultiplier,
  BLOOMLING_LEVEL_UP_SCALING,
} from "../selectors";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBloomling(
  id: string,
  templateId: string,
  stage: EvolutionStage = EvolutionStage.Sprout,
  level: number = 1
): Bloomling {
  return {
    templateId,
    instanceId: id,
    level,
    evolutionStage: stage,
    inGarden: true,
    gardenSlot: 0,
    unlocked: true,
    totalProduced: 0,
  };
}

function makeGarden(slots: (string | null)[]): GardenState {
  return {
    maxSlots: slots.length,
    slots,
    activeSynergyIds: [],
    specialMeterProgress: 0,
  };
}

function makeBoost(
  multiplier: number,
  expiresAt: number,
  source: AdTouchpoint = AdTouchpoint.SunbeamBoost
): ActiveBoost {
  return { source, multiplier, expiresAt };
}

// ---------------------------------------------------------------------------
// calculateUpgradeCost
// ---------------------------------------------------------------------------

describe("calculateUpgradeCost", () => {
  it("formula: baseCost * scalingFactor^level", () => {
    expect(calculateUpgradeCost(100, 1.1, 0)).toBeCloseTo(100);
    expect(calculateUpgradeCost(100, 1.1, 1)).toBeCloseTo(110);
    expect(calculateUpgradeCost(100, 1.1, 2)).toBeCloseTo(121);
  });

  it("returns baseCost when level=0 regardless of scalingFactor", () => {
    expect(calculateUpgradeCost(500, 2.0, 0)).toBeCloseTo(500);
  });

  it("doubles cost per level when scalingFactor=2", () => {
    expect(calculateUpgradeCost(100, 2, 3)).toBeCloseTo(800);
  });
});

// ---------------------------------------------------------------------------
// calculateLevelUpCost
// ---------------------------------------------------------------------------

describe("calculateLevelUpCost", () => {
  it("applies the standard geometric formula at rapidGrowthLevel=0", () => {
    const raw = 10 * Math.pow(BLOOMLING_LEVEL_UP_SCALING, 5);
    // discount = max(0.25, 1 - 0 * 0.1) = 1.0
    expect(calculateLevelUpCost(10, 5, 0)).toBe(Math.ceil(raw));
  });

  it("applies a 10% discount per Rapid Growth level", () => {
    // Level 3: discount = max(0.25, 1 - 0.3) = 0.7
    const raw = 10 * Math.pow(BLOOMLING_LEVEL_UP_SCALING, 0);
    const expected = Math.ceil(raw * 0.7);
    expect(calculateLevelUpCost(10, 0, 3)).toBe(expected);
  });

  it("caps discount at 75% off (floor = 0.25)", () => {
    // Level 10: 1 - 1.0 = 0.0 → floored to 0.25
    const raw = 10 * Math.pow(BLOOMLING_LEVEL_UP_SCALING, 0);
    const expected = Math.ceil(raw * 0.25);
    expect(calculateLevelUpCost(10, 0, 10)).toBe(expected);
    // Level 20: same floor
    expect(calculateLevelUpCost(10, 0, 20)).toBe(expected);
  });

  it("returns a ceiling integer", () => {
    const result = calculateLevelUpCost(7, 3, 1);
    expect(Number.isInteger(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// calculateBloomlingProduction
// ---------------------------------------------------------------------------

describe("calculateBloomlingProduction", () => {
  it("Sprout: baseProduction * level * 1", () => {
    expect(calculateBloomlingProduction(2, 5, EvolutionStage.Sprout)).toBe(10);
  });

  it("Bloom: baseProduction * level * 3", () => {
    expect(calculateBloomlingProduction(2, 5, EvolutionStage.Bloom)).toBe(30);
  });

  it("Elder: baseProduction * level * 9", () => {
    expect(calculateBloomlingProduction(2, 5, EvolutionStage.Elder)).toBe(90);
  });

  it("scales linearly with level", () => {
    const at1 = calculateBloomlingProduction(1, 1, EvolutionStage.Sprout);
    const at10 = calculateBloomlingProduction(1, 10, EvolutionStage.Sprout);
    expect(at10).toBe(at1 * 10);
  });
});

// ---------------------------------------------------------------------------
// totalSunlightPerSecond / totalSunlightPerSecondSimple
// ---------------------------------------------------------------------------

describe("totalSunlightPerSecond", () => {
  it("returns 0 when garden is empty", () => {
    const state = {
      bloomlings: {},
      garden: makeGarden([]),
    };
    expect(totalSunlightPerSecond(state, () => 1)).toBe(0);
  });

  it("sums production of all garden bloomlings", () => {
    const state = {
      bloomlings: {
        a: makeBloomling("a", "fernley", EvolutionStage.Sprout, 1),
        b: makeBloomling("b", "mosswick", EvolutionStage.Sprout, 2),
      },
      garden: makeGarden(["a", "b"]),
    };
    // Both at Sprout: base * level * 1; getBaseProduction returns 1
    // a: 1 * 1 * 1 = 1; b: 1 * 2 * 1 = 2; total = 3
    expect(totalSunlightPerSecond(state, () => 1)).toBe(3);
  });

  it("uses getBaseProduction per templateId", () => {
    const state = {
      bloomlings: {
        a: makeBloomling("a", "fernley", EvolutionStage.Sprout, 1),
      },
      garden: makeGarden(["a"]),
    };
    const getBase = (id: string) => id === "fernley" ? 5 : 1;
    expect(totalSunlightPerSecond(state, getBase)).toBe(5);
  });

  it("skips empty (null) slots and unknown bloomlings", () => {
    const state = {
      bloomlings: {
        a: makeBloomling("a", "fernley", EvolutionStage.Sprout, 1),
      },
      garden: makeGarden(["a", null, "ghost"]),
    };
    expect(totalSunlightPerSecond(state, () => 1)).toBe(1);
  });
});

describe("totalSunlightPerSecondSimple", () => {
  it("uses baseProduction=1 for all bloomlings and skips synergies", () => {
    const state = {
      bloomlings: {
        a: makeBloomling("a", "fernley", EvolutionStage.Elder, 10),
      },
      garden: makeGarden(["a"]),
    };
    // Elder: 1 * 10 * 9 = 90
    expect(totalSunlightPerSecondSimple(state)).toBe(90);
  });
});

// ---------------------------------------------------------------------------
// effectiveTapValue
// ---------------------------------------------------------------------------

describe("effectiveTapValue", () => {
  it("multiplies baseTapValue by tapMultiplier", () => {
    expect(effectiveTapValue(5, 2)).toBe(10);
    expect(effectiveTapValue(1, 1)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// getBaseTapValue
// ---------------------------------------------------------------------------

describe("getBaseTapValue", () => {
  it("returns 1 when no tap_power upgrades", () => {
    expect(getBaseTapValue({ upgrades: {} })).toBe(1);
  });

  it("adds 0.25 per tap_power level", () => {
    const state = { upgrades: { tap_power: { templateId: "tap_power", level: 4 } } };
    expect(getBaseTapValue(state)).toBeCloseTo(1 + 4 * 0.25);
  });
});

// ---------------------------------------------------------------------------
// getZoneThreshold
// ---------------------------------------------------------------------------

describe("getZoneThreshold", () => {
  it("returns 50 * 1.12^zone", () => {
    expect(getZoneThreshold(1)).toBeCloseTo(50 * 1.12);
    expect(getZoneThreshold(5)).toBeCloseTo(50 * Math.pow(1.12, 5));
    expect(getZoneThreshold(0)).toBeCloseTo(50);
  });

  it("increases with zone number", () => {
    expect(getZoneThreshold(10)).toBeGreaterThan(getZoneThreshold(5));
  });
});

// ---------------------------------------------------------------------------
// hasReachedZoneThreshold
// ---------------------------------------------------------------------------

describe("hasReachedZoneThreshold", () => {
  it("returns false when progress is below threshold", () => {
    const state = {
      bloomlings: {} as GameStore["bloomlings"],
      garden: { maxSlots: 4, slots: [], activeSynergyIds: [], specialMeterProgress: 0 } as GameStore["garden"],
      zoneProgress: {
        currentZone: 1,
        currentZoneProgress: 0,
        gateActive: false,
        gateTimerRemainingMs: null,
        gateFailCount: 0,
        gateAssistUsed: false,
        bossActive: false,
        bossHpRemaining: null,
        bossHpMax: null,
        bossTimerRemainingMs: null,
        bossFailCount: 0,
        bossSmashUsed: false,
      },
    };
    expect(hasReachedZoneThreshold(state)).toBe(false);
  });

  it("returns true when progress >= threshold", () => {
    const threshold = getZoneThreshold(1);
    const state = {
      bloomlings: {} as GameStore["bloomlings"],
      garden: { maxSlots: 4, slots: [], activeSynergyIds: [], specialMeterProgress: 0 } as GameStore["garden"],
      zoneProgress: {
        currentZone: 1,
        currentZoneProgress: threshold,
        gateActive: false,
        gateTimerRemainingMs: null,
        gateFailCount: 0,
        gateAssistUsed: false,
        bossActive: false,
        bossHpRemaining: null,
        bossHpMax: null,
        bossTimerRemainingMs: null,
        bossFailCount: 0,
        bossSmashUsed: false,
      },
    };
    expect(hasReachedZoneThreshold(state)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// canAffordUpgrade
// ---------------------------------------------------------------------------

describe("canAffordUpgrade", () => {
  const richState = {
    resources: {
      sunlight: 9_999_999,
      nectar: 0,
      essence: 0,
      dewdrops: 0,
      totalSunlightEarned: 0,
      runSunlightEarned: 0,
    },
    upgrades: {},
  };

  it("returns true when player has enough sunlight", () => {
    expect(canAffordUpgrade(richState, "tap_power", 100, 1.1, null)).toBe(true);
  });

  it("returns false when player cannot afford the cost", () => {
    const poorState = { ...richState, resources: { ...richState.resources, sunlight: 0 } };
    expect(canAffordUpgrade(poorState, "tap_power", 100, 1.1, null)).toBe(false);
  });

  it("returns false when upgrade is already at maxLevel", () => {
    const state = {
      ...richState,
      upgrades: { tap_power: { templateId: "tap_power", level: 5 } },
    };
    expect(canAffordUpgrade(state, "tap_power", 100, 1.1, 5)).toBe(false);
  });

  it("allows purchase when below maxLevel", () => {
    const state = {
      ...richState,
      upgrades: { tap_power: { templateId: "tap_power", level: 4 } },
    };
    expect(canAffordUpgrade(state, "tap_power", 1, 1.0, 5)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// calculateNectarOnRebirth
// ---------------------------------------------------------------------------

describe("calculateNectarOnRebirth", () => {
  it("returns 0 when currentRunHighestZone < 40", () => {
    const state = {
      prestige: {
        rebirthCount: 0,
        currentSeason: 1,
        totalNectarEarned: 0,
        totalNectarSpent: 0,
        currentRunHighestZone: 39,
        allTimeHighestZone: 39,
        rebirthUnlocked: false,
        transcendenceCount: 0,
        totalEssenceEarned: 0,
        totalEssenceSpent: 0,
        transcendenceUnlocked: false,
      },
    };
    expect(calculateNectarOnRebirth(state)).toBe(0);
  });

  it("returns >= 1 at zone 40", () => {
    const state = {
      prestige: {
        rebirthCount: 0,
        currentSeason: 1,
        totalNectarEarned: 0,
        totalNectarSpent: 0,
        currentRunHighestZone: 40,
        allTimeHighestZone: 40,
        rebirthUnlocked: true,
        transcendenceCount: 0,
        totalEssenceEarned: 0,
        totalEssenceSpent: 0,
        transcendenceUnlocked: false,
      },
    };
    expect(calculateNectarOnRebirth(state)).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// getComboMultiplier
// ---------------------------------------------------------------------------

describe("getComboMultiplier", () => {
  it("returns 1.0 at combo count 0", () => {
    expect(getComboMultiplier(0)).toBeCloseTo(1.0);
  });

  it("returns 1 + count * 0.05 for count <= 100", () => {
    expect(getComboMultiplier(10)).toBeCloseTo(1.5);
    expect(getComboMultiplier(20)).toBeCloseTo(2.0);
    expect(getComboMultiplier(100)).toBeCloseTo(6.0);
  });

  it("caps at count=100 (1 + 100 * 0.05 = 6.0)", () => {
    expect(getComboMultiplier(100)).toBeCloseTo(getComboMultiplier(200));
    expect(getComboMultiplier(999)).toBeCloseTo(6.0);
  });
});

// ---------------------------------------------------------------------------
// getActiveBoosts
// ---------------------------------------------------------------------------

describe("getActiveBoosts", () => {
  const now = 1_700_000_000_000;

  it("returns only boosts that have not expired", () => {
    const state = {
      activeBoosts: [
        makeBoost(2, now + 10000), // active
        makeBoost(3, now - 1),      // expired
      ],
    };
    const result = getActiveBoosts(state, now);
    expect(result).toHaveLength(1);
    expect(result[0]!.multiplier).toBe(2);
  });

  it("returns empty array when all boosts are expired", () => {
    const state = { activeBoosts: [makeBoost(2, now - 1)] };
    expect(getActiveBoosts(state, now)).toHaveLength(0);
  });

  it("returns empty array when no boosts exist", () => {
    expect(getActiveBoosts({ activeBoosts: [] }, now)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getBoostMultiplier
// ---------------------------------------------------------------------------

describe("getBoostMultiplier", () => {
  const now = 1_700_000_000_000;

  it("returns 1 when no active boosts", () => {
    expect(getBoostMultiplier({ activeBoosts: [] }, now)).toBe(1);
  });

  it("returns the multiplier of a single active boost", () => {
    const state = { activeBoosts: [makeBoost(2, now + 1000)] };
    expect(getBoostMultiplier(state, now)).toBe(2);
  });

  it("multiplies all active boost multipliers together", () => {
    const state = {
      activeBoosts: [
        makeBoost(2, now + 1000),
        makeBoost(3, now + 1000, AdTouchpoint.LuckySprout),
      ],
    };
    expect(getBoostMultiplier(state, now)).toBe(6);
  });

  it("ignores expired boosts in the calculation", () => {
    const state = {
      activeBoosts: [
        makeBoost(2, now + 1000),
        makeBoost(99, now - 1), // expired
      ],
    };
    expect(getBoostMultiplier(state, now)).toBe(2);
  });
});
