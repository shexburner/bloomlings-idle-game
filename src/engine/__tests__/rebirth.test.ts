import {
  calculateNectarEarned,
  canRebirth,
  getRebirthPreview,
  getRetainedEvolutionStage,
  resetBloomlingsForRebirth,
  filterUpgradesForRebirth,
  getStartingZone,
  getStartingComboCount,
  getUpgradeLevel,
  NECTAR_BASE,
  NECTAR_THRESHOLD,
  NECTAR_EXPONENT,
  REBIRTH_UNLOCK_ZONE,
} from "../rebirth";
import { EvolutionStage } from "~/types/game";
import type { Bloomling, Upgrade } from "~/types/game";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBloomling(
  id: string,
  overrides: Partial<Bloomling> = {}
): Bloomling {
  return {
    templateId: "fernley",
    instanceId: id,
    level: 1,
    evolutionStage: EvolutionStage.Sprout,
    inGarden: false,
    gardenSlot: null,
    unlocked: true,
    totalProduced: 0,
    ...overrides,
  };
}

function makeUpgrade(id: string, level: number): Upgrade {
  return { templateId: id, level };
}

// ---------------------------------------------------------------------------
// calculateNectarEarned
// ---------------------------------------------------------------------------

describe("calculateNectarEarned", () => {
  it("returns 0 when highestZone is below REBIRTH_UNLOCK_ZONE", () => {
    expect(calculateNectarEarned(39)).toBe(0);
    expect(calculateNectarEarned(0)).toBe(0);
  });

  it("returns 0 at the unlock threshold boundary (zone 40 → formula)", () => {
    const expected = Math.floor(
      NECTAR_BASE * Math.pow(REBIRTH_UNLOCK_ZONE / NECTAR_THRESHOLD, NECTAR_EXPONENT)
    );
    expect(calculateNectarEarned(REBIRTH_UNLOCK_ZONE)).toBe(expected);
    expect(calculateNectarEarned(REBIRTH_UNLOCK_ZONE)).toBeGreaterThanOrEqual(1);
  });

  it("increases with higher zones", () => {
    expect(calculateNectarEarned(80)).toBeGreaterThan(calculateNectarEarned(60));
  });

  it("applies nectarRootsLevel bonus (+10% per level)", () => {
    const base = calculateNectarEarned(80, 0);
    const level1 = calculateNectarEarned(80, 1);
    const level5 = calculateNectarEarned(80, 5);
    expect(level1).toBeGreaterThanOrEqual(base);
    expect(level5).toBeGreaterThanOrEqual(level1);
    // 5 levels → 1.50x multiplier → floor may be same or higher
    expect(level5 / base).toBeCloseTo(1.5, 0);
  });

  it("applies rebirthBoostMultiplier (1.5x)", () => {
    const base = calculateNectarEarned(80, 0, 1);
    const boosted = calculateNectarEarned(80, 0, 1.5);
    expect(boosted).toBeGreaterThanOrEqual(base);
  });

  it("floors the result", () => {
    const result = calculateNectarEarned(41, 0);
    expect(Number.isInteger(result)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// canRebirth
// ---------------------------------------------------------------------------

describe("canRebirth", () => {
  it("returns false below zone 40", () => {
    expect(canRebirth(39)).toBe(false);
    expect(canRebirth(0)).toBe(false);
  });

  it("returns true at zone 40 (earns >= 1 Nectar)", () => {
    expect(canRebirth(REBIRTH_UNLOCK_ZONE)).toBe(true);
  });

  it("returns true for high zones", () => {
    expect(canRebirth(100)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getRebirthPreview
// ---------------------------------------------------------------------------

describe("getRebirthPreview", () => {
  it("includes nectarEarned from formula", () => {
    const preview = getRebirthPreview(80, 0);
    expect(preview.nectarEarned).toBe(calculateNectarEarned(80));
  });

  it("returns percentageIncrease=Infinity when currentNectar is 0 and earning > 0", () => {
    const preview = getRebirthPreview(80, 0);
    expect(preview.percentageIncrease).toBe(Infinity);
  });

  it("returns percentageIncrease=0 when currentNectar=0 and earning=0", () => {
    const preview = getRebirthPreview(1, 0);
    expect(preview.percentageIncrease).toBe(0);
  });

  it("calculates percentageIncrease correctly when currentNectar > 0", () => {
    const earned = calculateNectarEarned(80);
    const preview = getRebirthPreview(80, earned);
    expect(preview.percentageIncrease).toBeCloseTo(100);
  });

  it("recommended is true when currentNectar=0 and earning >= 1", () => {
    const preview = getRebirthPreview(80, 0);
    expect(preview.recommended).toBe(true);
  });

  it("recommended is true when earning >= 2x currentNectar", () => {
    const earned = calculateNectarEarned(80);
    const preview = getRebirthPreview(80, Math.floor(earned / 2) - 1);
    expect(preview.recommended).toBe(true);
  });

  it("recommended is false when earning < 2x currentNectar", () => {
    const earned = calculateNectarEarned(80);
    const preview = getRebirthPreview(80, earned * 10);
    expect(preview.recommended).toBe(false);
  });

  it("includes 4 projections at +5, +10, +15, +20 zones", () => {
    const preview = getRebirthPreview(80, 0);
    expect(preview.projections).toHaveLength(4);
    expect(preview.projections[0]!.additionalZones).toBe(5);
    expect(preview.projections[3]!.additionalZones).toBe(20);
  });

  it("projections have increasing nectarEarned as zones increase", () => {
    const preview = getRebirthPreview(80, 0);
    for (let i = 1; i < preview.projections.length; i++) {
      expect(preview.projections[i]!.nectarEarned).toBeGreaterThanOrEqual(
        preview.projections[i - 1]!.nectarEarned
      );
    }
  });
});

// ---------------------------------------------------------------------------
// getRetainedEvolutionStage
// ---------------------------------------------------------------------------

describe("getRetainedEvolutionStage", () => {
  it("returns Sprout when no retention upgrades", () => {
    expect(getRetainedEvolutionStage(EvolutionStage.Sprout, 0, 0)).toBe(EvolutionStage.Sprout);
    expect(getRetainedEvolutionStage(EvolutionStage.Bloom, 0, 0)).toBe(EvolutionStage.Sprout);
    expect(getRetainedEvolutionStage(EvolutionStage.Elder, 0, 0)).toBe(EvolutionStage.Sprout);
  });

  it("returns Bloom for Bloom-stage with bloomRetention > 0", () => {
    expect(getRetainedEvolutionStage(EvolutionStage.Bloom, 1, 0)).toBe(EvolutionStage.Bloom);
  });

  it("returns Bloom for Elder-stage with only bloomRetention (no elder retention)", () => {
    expect(getRetainedEvolutionStage(EvolutionStage.Elder, 1, 0)).toBe(EvolutionStage.Bloom);
  });

  it("returns Elder for Elder-stage with elderRetention > 0", () => {
    expect(getRetainedEvolutionStage(EvolutionStage.Elder, 0, 1)).toBe(EvolutionStage.Elder);
    expect(getRetainedEvolutionStage(EvolutionStage.Elder, 1, 1)).toBe(EvolutionStage.Elder);
  });

  it("returns Sprout for Sprout-stage regardless of retention upgrades", () => {
    expect(getRetainedEvolutionStage(EvolutionStage.Sprout, 1, 1)).toBe(EvolutionStage.Sprout);
  });
});

// ---------------------------------------------------------------------------
// resetBloomlingsForRebirth
// ---------------------------------------------------------------------------

describe("resetBloomlingsForRebirth", () => {
  it("resets all bloomlings to level 1", () => {
    const bloomlings = {
      a: makeBloomling("a", { level: 50 }),
      b: makeBloomling("b", { level: 100 }),
    };
    const result = resetBloomlingsForRebirth(bloomlings, 0, 0);
    expect(result["a"]!.level).toBe(1);
    expect(result["b"]!.level).toBe(1);
  });

  it("removes all bloomlings from garden", () => {
    const bloomlings = {
      a: makeBloomling("a", { inGarden: true, gardenSlot: 0 }),
    };
    const result = resetBloomlingsForRebirth(bloomlings, 0, 0);
    expect(result["a"]!.inGarden).toBe(false);
    expect(result["a"]!.gardenSlot).toBeNull();
  });

  it("preserves unlocked and totalProduced", () => {
    const bloomlings = {
      a: makeBloomling("a", { unlocked: true, totalProduced: 9999 }),
    };
    const result = resetBloomlingsForRebirth(bloomlings, 0, 0);
    expect(result["a"]!.unlocked).toBe(true);
    expect(result["a"]!.totalProduced).toBe(9999);
  });

  it("applies evolution retention via getRetainedEvolutionStage", () => {
    const bloomlings = {
      elder: makeBloomling("elder", { evolutionStage: EvolutionStage.Elder }),
      bloom: makeBloomling("bloom", { evolutionStage: EvolutionStage.Bloom }),
    };
    const result = resetBloomlingsForRebirth(bloomlings, 1, 1);
    expect(result["elder"]!.evolutionStage).toBe(EvolutionStage.Elder);
    expect(result["bloom"]!.evolutionStage).toBe(EvolutionStage.Bloom);
  });

  it("handles empty bloomlings map", () => {
    expect(resetBloomlingsForRebirth({}, 0, 0)).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// filterUpgradesForRebirth
// ---------------------------------------------------------------------------

describe("filterUpgradesForRebirth", () => {
  it("keeps Nectar upgrades", () => {
    const upgrades = { enriched_soil: makeUpgrade("enriched_soil", 2) };
    const result = filterUpgradesForRebirth(upgrades);
    expect(result["enriched_soil"]).toBeDefined();
  });

  it("keeps Essence upgrades", () => {
    const upgrades = { primordial_vigor: makeUpgrade("primordial_vigor", 1) };
    const result = filterUpgradesForRebirth(upgrades);
    expect(result["primordial_vigor"]).toBeDefined();
  });

  it("discards regular Tap/Idle upgrades", () => {
    const upgrades = {
      tap_power: makeUpgrade("tap_power", 5),
      idle_production: makeUpgrade("idle_production", 3),
    };
    const result = filterUpgradesForRebirth(upgrades);
    expect(result["tap_power"]).toBeUndefined();
    expect(result["idle_production"]).toBeUndefined();
  });

  it("handles mixed upgrades: keeps Nectar/Essence, discards others", () => {
    const upgrades = {
      tap_power: makeUpgrade("tap_power", 5),
      enriched_soil: makeUpgrade("enriched_soil", 2),
      primordial_vigor: makeUpgrade("primordial_vigor", 1),
    };
    const result = filterUpgradesForRebirth(upgrades);
    expect(Object.keys(result)).toHaveLength(2);
    expect(result["enriched_soil"]).toBeDefined();
    expect(result["primordial_vigor"]).toBeDefined();
  });

  it("returns empty object for empty upgrades", () => {
    expect(filterUpgradesForRebirth({})).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// getStartingZone
// ---------------------------------------------------------------------------

describe("getStartingZone", () => {
  it("returns zone 1 at level 0", () => {
    expect(getStartingZone(0)).toBe(1);
  });

  it("returns zone 5 at level 1", () => {
    expect(getStartingZone(1)).toBe(5);
  });

  it("returns zone 10 at level 2", () => {
    expect(getStartingZone(2)).toBe(10);
  });

  it("returns zone 15 at level 3", () => {
    expect(getStartingZone(3)).toBe(15);
  });

  it("returns zone 20 at level 4", () => {
    expect(getStartingZone(4)).toBe(20);
  });

  it("caps at the max level (4 → zone 20)", () => {
    expect(getStartingZone(10)).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// getStartingComboCount
// ---------------------------------------------------------------------------

describe("getStartingComboCount", () => {
  it("returns 0 when comboMemoryLevel is 0", () => {
    expect(getStartingComboCount(0)).toBe(0);
  });

  it("returns 10 when comboMemoryLevel >= 1", () => {
    expect(getStartingComboCount(1)).toBe(10);
    expect(getStartingComboCount(5)).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// getUpgradeLevel
// ---------------------------------------------------------------------------

describe("getUpgradeLevel", () => {
  it("returns 0 when upgrade is not found", () => {
    expect(getUpgradeLevel({}, "tap_power")).toBe(0);
  });

  it("returns the upgrade level when present", () => {
    const upgrades = { tap_power: makeUpgrade("tap_power", 7) };
    expect(getUpgradeLevel(upgrades, "tap_power")).toBe(7);
  });
});
