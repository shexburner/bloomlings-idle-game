import { EvolutionStage } from "~/types/game";
import type { Bloomling, GameState } from "~/types/game";
import {
  applyCapacityChange,
  canAddToGarden,
  getGardenBloomlings,
  BASE_GARDEN_SLOTS,
} from "../garden";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type MinimalState = Pick<GameState, "bloomlings" | "garden" | "zoneProgress" | "upgrades" | "perks">;

function makeBloomling(id: string, overrides: Partial<Bloomling> = {}): Bloomling {
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

function baseState(overrides: Partial<MinimalState> = {}): MinimalState {
  return {
    bloomlings: {},
    garden: {
      maxSlots: 1,
      slots: [null],
      activeSynergyIds: [],
      specialMeterProgress: 0,
    },
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
    upgrades: {},
    perks: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// applyCapacityChange
// ---------------------------------------------------------------------------

describe("applyCapacityChange", () => {
  it("adds null slots when capacity increases", () => {
    const state = baseState({
      zoneProgress: { ...baseState().zoneProgress, currentZone: 5 },
      garden: { maxSlots: 1, slots: [null], activeSynergyIds: [], specialMeterProgress: 0 },
    });
    const result = applyCapacityChange(state);
    expect(result.maxSlots).toBe(2);
    expect(result.slots).toEqual([null, null]);
  });

  it("removes slots from end when capacity decreases", () => {
    // Simulate a state where slots are larger than what getMaxGardenSlots returns
    // Zone 1 → maxSlots=1, but current slots has 3
    const state = baseState({
      garden: { maxSlots: 3, slots: ["a", "b", null], activeSynergyIds: [], specialMeterProgress: 0 },
      bloomlings: {
        a: makeBloomling("a", { inGarden: true, gardenSlot: 0 }),
        b: makeBloomling("b", { inGarden: true, gardenSlot: 1 }),
      },
    });
    const result = applyCapacityChange(state);
    expect(result.maxSlots).toBe(BASE_GARDEN_SLOTS);
    expect(result.slots).toHaveLength(BASE_GARDEN_SLOTS);
  });

  it("evicts bloomlings from removed slots", () => {
    const state = baseState({
      garden: { maxSlots: 2, slots: ["a", "b"], activeSynergyIds: [], specialMeterProgress: 0 },
      bloomlings: {
        a: makeBloomling("a", { inGarden: true, gardenSlot: 0 }),
        b: makeBloomling("b", { inGarden: true, gardenSlot: 1 }),
      },
    });
    // Zone 1 → maxSlots=1, slot "b" at index 1 gets evicted
    const result = applyCapacityChange(state);
    expect(result.bloomlings["b"]!.inGarden).toBe(false);
    expect(result.bloomlings["b"]!.gardenSlot).toBeNull();
  });

  it("returns same bloomlings ref when no eviction needed", () => {
    const state = baseState({
      garden: { maxSlots: 2, slots: ["a", null], activeSynergyIds: [], specialMeterProgress: 0 },
      bloomlings: { a: makeBloomling("a", { inGarden: true, gardenSlot: 0 }) },
    });
    const result = applyCapacityChange(state);
    expect(result.bloomlings).toBe(state.bloomlings);
  });

  it("returns same slots ref when capacity unchanged", () => {
    const state = baseState();
    const result = applyCapacityChange(state);
    expect(result.slots).toBe(state.garden.slots);
  });
});

// ---------------------------------------------------------------------------
// canAddToGarden
// ---------------------------------------------------------------------------

describe("canAddToGarden", () => {
  it("returns true when garden has empty slot", () => {
    const state = baseState({
      bloomlings: { a: makeBloomling("a") },
    });
    expect(canAddToGarden("a", state)).toBe(true);
  });

  it("returns false when bloomling is unknown", () => {
    const state = baseState();
    expect(canAddToGarden("ghost", state)).toBe(false);
  });

  it("returns false when bloomling is already in garden", () => {
    const state = baseState({
      bloomlings: { a: makeBloomling("a", { inGarden: true }) },
    });
    expect(canAddToGarden("a", state)).toBe(false);
  });

  it("returns false when garden is full", () => {
    const state = baseState({
      bloomlings: { a: makeBloomling("a") },
      garden: { maxSlots: 1, slots: ["other"], activeSynergyIds: [], specialMeterProgress: 0 },
    });
    expect(canAddToGarden("a", state)).toBe(false);
  });

  it("returns true for valid specific slot index", () => {
    const state = baseState({
      bloomlings: { a: makeBloomling("a") },
      zoneProgress: { ...baseState().zoneProgress, currentZone: 5 },
      garden: { maxSlots: 2, slots: ["other", null], activeSynergyIds: [], specialMeterProgress: 0 },
    });
    expect(canAddToGarden("a", state, 1)).toBe(true);
  });

  it("returns false for out-of-bounds slot index", () => {
    const state = baseState({
      bloomlings: { a: makeBloomling("a") },
    });
    expect(canAddToGarden("a", state, 99)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getGardenBloomlings
// ---------------------------------------------------------------------------

describe("getGardenBloomlings", () => {
  it("returns only non-null entries", () => {
    const state = baseState({
      bloomlings: {
        a: makeBloomling("a", { inGarden: true, gardenSlot: 0 }),
        b: makeBloomling("b", { inGarden: true, gardenSlot: 2 }),
      },
      garden: { maxSlots: 3, slots: ["a", null, "b"], activeSynergyIds: [], specialMeterProgress: 0 },
    });
    const result = getGardenBloomlings(state);
    expect(result).toHaveLength(2);
    expect(result[0]!.instanceId).toBe("a");
    expect(result[1]!.instanceId).toBe("b");
  });

  it("returns empty array for empty garden", () => {
    const state = baseState();
    expect(getGardenBloomlings(state)).toEqual([]);
  });

  it("skips stale references (slot points to missing bloomling)", () => {
    const state = baseState({
      garden: { maxSlots: 1, slots: ["ghost"], activeSynergyIds: [], specialMeterProgress: 0 },
    });
    expect(getGardenBloomlings(state)).toEqual([]);
  });
});
