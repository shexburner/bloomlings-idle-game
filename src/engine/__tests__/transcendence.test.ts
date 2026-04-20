import { EvolutionStage } from "~/types/game";
import type { Bloomling } from "~/types/game";
import {
  calculateEssenceEarned,
  canTranscend,
  getTranscendencePreview,
  resetBloomlingsForTranscendence,
  ESSENCE_THRESHOLD,
  TRANSCENDENCE_MIN_REBIRTHS,
  TRANSCENDENCE_MIN_ZONE,
} from "../transcendence";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBloomling(id: string, overrides: Partial<Bloomling> = {}): Bloomling {
  return {
    templateId: "fernley",
    instanceId: id,
    level: 50,
    evolutionStage: EvolutionStage.Elder,
    inGarden: true,
    gardenSlot: 0,
    unlocked: true,
    totalProduced: 999,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// calculateEssenceEarned
// ---------------------------------------------------------------------------

describe("calculateEssenceEarned", () => {
  it("returns 0 when totalNectarSpent is below ESSENCE_THRESHOLD", () => {
    expect(calculateEssenceEarned({ totalNectarSpent: 0 })).toBe(0);
    expect(calculateEssenceEarned({ totalNectarSpent: ESSENCE_THRESHOLD - 1 })).toBe(0);
  });

  it("returns >= 1 when totalNectarSpent equals ESSENCE_THRESHOLD", () => {
    // floor(1 * (50/50)^1.8) = floor(1) = 1
    expect(calculateEssenceEarned({ totalNectarSpent: ESSENCE_THRESHOLD })).toBe(1);
  });

  it("increases with more nectar spent", () => {
    const low = calculateEssenceEarned({ totalNectarSpent: 100 });
    const high = calculateEssenceEarned({ totalNectarSpent: 500 });
    expect(high).toBeGreaterThan(low);
  });

  it("returns an integer (floored)", () => {
    const result = calculateEssenceEarned({ totalNectarSpent: 200 });
    expect(Number.isInteger(result)).toBe(true);
  });

  it("matches the formula: floor(1 * (spent / 50) ^ 1.8)", () => {
    const spent = 250;
    const expected = Math.floor(Math.pow(spent / ESSENCE_THRESHOLD, 1.8));
    expect(calculateEssenceEarned({ totalNectarSpent: spent })).toBe(expected);
  });
});

// ---------------------------------------------------------------------------
// canTranscend
// ---------------------------------------------------------------------------

describe("canTranscend", () => {
  const fullState = {
    rebirthCount: TRANSCENDENCE_MIN_REBIRTHS,
    allTimeHighestZone: TRANSCENDENCE_MIN_ZONE,
  };

  it("returns true when both conditions are met", () => {
    expect(canTranscend(fullState)).toBe(true);
  });

  it("returns false when rebirthCount < MIN_REBIRTHS", () => {
    expect(canTranscend({ ...fullState, rebirthCount: TRANSCENDENCE_MIN_REBIRTHS - 1 })).toBe(false);
  });

  it("returns false when allTimeHighestZone < MIN_ZONE", () => {
    expect(canTranscend({ ...fullState, allTimeHighestZone: TRANSCENDENCE_MIN_ZONE - 1 })).toBe(false);
  });

  it("returns false when both conditions are unmet", () => {
    expect(canTranscend({ rebirthCount: 0, allTimeHighestZone: 1 })).toBe(false);
  });

  it("returns true with rebirthCount and zone exceeding minimums", () => {
    expect(
      canTranscend({
        rebirthCount: TRANSCENDENCE_MIN_REBIRTHS + 5,
        allTimeHighestZone: TRANSCENDENCE_MIN_ZONE + 50,
      })
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// getTranscendencePreview
// ---------------------------------------------------------------------------

describe("getTranscendencePreview", () => {
  const state = {
    totalNectarSpent: 200,
    rebirthCount: TRANSCENDENCE_MIN_REBIRTHS,
    allTimeHighestZone: TRANSCENDENCE_MIN_ZONE,
    totalEssenceEarned: 5,
  };

  it("includes the correct essenceEarned from formula", () => {
    const preview = getTranscendencePreview(state);
    expect(preview.essenceEarned).toBe(calculateEssenceEarned({ totalNectarSpent: 200 }));
  });

  it("totalEssenceAfter is current + earned", () => {
    const preview = getTranscendencePreview(state);
    expect(preview.totalEssenceAfter).toBe(
      state.totalEssenceEarned + preview.essenceEarned
    );
  });

  it("canTranscend reflects eligibility", () => {
    const eligible = getTranscendencePreview(state);
    expect(eligible.canTranscend).toBe(true);

    const ineligible = getTranscendencePreview({
      ...state,
      rebirthCount: 0,
    });
    expect(ineligible.canTranscend).toBe(false);
  });

  it("rebirthsThisCycle equals rebirthCount", () => {
    const preview = getTranscendencePreview(state);
    expect(preview.rebirthsThisCycle).toBe(state.rebirthCount);
  });
});

// ---------------------------------------------------------------------------
// resetBloomlingsForTranscendence
// ---------------------------------------------------------------------------

describe("resetBloomlingsForTranscendence", () => {
  it("resets all bloomlings to Sprout, level 1, out of garden", () => {
    const bloomlings = {
      a: makeBloomling("a", {
        level: 100,
        evolutionStage: EvolutionStage.Elder,
        inGarden: true,
        gardenSlot: 0,
      }),
      b: makeBloomling("b", {
        level: 50,
        evolutionStage: EvolutionStage.Bloom,
        inGarden: false,
        gardenSlot: null,
      }),
    };
    const result = resetBloomlingsForTranscendence(bloomlings);

    expect(result["a"]!.level).toBe(1);
    expect(result["a"]!.evolutionStage).toBe(EvolutionStage.Sprout);
    expect(result["a"]!.inGarden).toBe(false);
    expect(result["a"]!.gardenSlot).toBeNull();

    expect(result["b"]!.level).toBe(1);
    expect(result["b"]!.evolutionStage).toBe(EvolutionStage.Sprout);
    expect(result["b"]!.inGarden).toBe(false);
    expect(result["b"]!.gardenSlot).toBeNull();
  });

  it("preserves unlocked, totalProduced, templateId, instanceId", () => {
    const bloomlings = {
      a: makeBloomling("a", { totalProduced: 12345 }),
    };
    const result = resetBloomlingsForTranscendence(bloomlings);
    expect(result["a"]!.unlocked).toBe(true);
    expect(result["a"]!.totalProduced).toBe(12345);
    expect(result["a"]!.templateId).toBe("fernley");
    expect(result["a"]!.instanceId).toBe("a");
  });

  it("handles empty bloomlings map", () => {
    expect(resetBloomlingsForTranscendence({})).toEqual({});
  });

  it("does not mutate the original map", () => {
    const b = makeBloomling("a");
    const original = { a: b };
    resetBloomlingsForTranscendence(original);
    expect(original["a"]).toBe(b);
  });
});
