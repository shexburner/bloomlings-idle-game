import { EvolutionStage } from "~/types/game";
import type { Bloomling, GameState } from "~/types/game";
import {
  computeGardenSlotBreakdown,
  getMaxGardenSlots,
  resizeGardenSlots,
  hasEmptySlot,
  findFirstEmptySlot,
  validateAddToGarden,
  placeBloomlingInSlot,
  removeBloomlingFromGarden,
  BASE_GARDEN_SLOTS,
  GARDEN_SLOT_HARD_CAP,
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
// computeGardenSlotBreakdown / getMaxGardenSlots
// ---------------------------------------------------------------------------

describe("computeGardenSlotBreakdown", () => {
  it("starts at BASE_GARDEN_SLOTS (1) with no unlocks", () => {
    const state = baseState();
    const breakdown = computeGardenSlotBreakdown(state);
    expect(breakdown.base).toBe(BASE_GARDEN_SLOTS);
    expect(breakdown.zoneUnlocks).toBe(0);
    expect(breakdown.total).toBe(1);
    expect(breakdown.capped).toBe(false);
  });

  it("adds 1 slot at zone 5", () => {
    const state = baseState({ zoneProgress: { ...baseState().zoneProgress, currentZone: 5 } });
    const breakdown = computeGardenSlotBreakdown(state);
    expect(breakdown.zoneUnlocks).toBe(1);
    expect(breakdown.total).toBe(2);
  });

  it("adds 2 slots at zone 15 (zones 5 and 15)", () => {
    const state = baseState({ zoneProgress: { ...baseState().zoneProgress, currentZone: 15 } });
    const breakdown = computeGardenSlotBreakdown(state);
    expect(breakdown.zoneUnlocks).toBe(2);
    expect(breakdown.total).toBe(3);
  });

  it("adds 3 slots at zone 30 (zones 5, 15, and 30)", () => {
    const state = baseState({ zoneProgress: { ...baseState().zoneProgress, currentZone: 30 } });
    const breakdown = computeGardenSlotBreakdown(state);
    expect(breakdown.zoneUnlocks).toBe(3);
    expect(breakdown.total).toBe(4);
  });

  it("counts upgrade levels toward slot total", () => {
    const state = baseState({
      upgrades: { idle_garden_slots: { templateId: "idle_garden_slots", level: 2 } },
    });
    const breakdown = computeGardenSlotBreakdown(state);
    expect(breakdown.upgrades["idle_garden_slots"]).toBe(2);
    expect(breakdown.total).toBe(3); // 1 base + 2 upgrade
  });

  it("adds 1 slot for dewdrop perk when purchased", () => {
    const state = baseState({
      perks: {
        dewdrop_bonus_slot: {
          id: "dewdrop_bonus_slot",
          name: "",
          description: "",
          cost: 0,
          permanent: true,
          purchased: true,
          quantity: 0,
        },
      },
    });
    const breakdown = computeGardenSlotBreakdown(state);
    expect(breakdown.dewdropPerk).toBe(1);
    expect(breakdown.total).toBe(2);
  });

  it("does not exceed GARDEN_SLOT_HARD_CAP (9)", () => {
    const state = baseState({
      zoneProgress: { ...baseState().zoneProgress, currentZone: 30 },
      upgrades: {
        idle_garden_slots: { templateId: "idle_garden_slots", level: 2 },
        nectar_garden_expansion: { templateId: "nectar_garden_expansion", level: 2 },
        essence_eternal_garden: { templateId: "essence_eternal_garden", level: 2 },
      },
      perks: {
        dewdrop_bonus_slot: {
          id: "dewdrop_bonus_slot",
          name: "",
          description: "",
          cost: 0,
          permanent: true,
          purchased: true,
          quantity: 0,
        },
      },
    });
    const breakdown = computeGardenSlotBreakdown(state);
    expect(breakdown.total).toBe(GARDEN_SLOT_HARD_CAP);
    expect(breakdown.capped).toBe(true); // rawTotal=11 exceeds cap of 9
  });
});

describe("getMaxGardenSlots", () => {
  it("returns 1 for a fresh game", () => {
    expect(getMaxGardenSlots(baseState())).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// resizeGardenSlots
// ---------------------------------------------------------------------------

describe("resizeGardenSlots", () => {
  it("grows the array by appending nulls", () => {
    const result = resizeGardenSlots([null], 3);
    expect(result).toEqual([null, null, null]);
  });

  it("shrinks the array by slicing", () => {
    const result = resizeGardenSlots(["a", "b", "c"], 2);
    expect(result).toEqual(["a", "b"]);
  });

  it("returns a copy of same length when sizes match", () => {
    const slots = ["a", null];
    const result = resizeGardenSlots(slots, 2);
    expect(result).toEqual(["a", null]);
  });

  it("preserves existing entries on grow", () => {
    const result = resizeGardenSlots(["a", null], 4);
    expect(result[0]).toBe("a");
    expect(result[1]).toBeNull();
    expect(result[2]).toBeNull();
    expect(result[3]).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// hasEmptySlot
// ---------------------------------------------------------------------------

describe("hasEmptySlot", () => {
  it("returns true when a null slot exists within capacity", () => {
    expect(hasEmptySlot([null, "a"], 2)).toBe(true);
  });

  it("returns false when all slots within capacity are filled", () => {
    expect(hasEmptySlot(["a", "b"], 2)).toBe(false);
  });

  it("returns true when slots array is shorter than maxSlots", () => {
    expect(hasEmptySlot(["a"], 3)).toBe(true);
  });

  it("returns false for empty array with maxSlots=0", () => {
    expect(hasEmptySlot([], 0)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// findFirstEmptySlot
// ---------------------------------------------------------------------------

describe("findFirstEmptySlot", () => {
  it("finds index 0 when first slot is null", () => {
    expect(findFirstEmptySlot([null, "a"], 2)).toBe(0);
  });

  it("finds the first null in the middle", () => {
    expect(findFirstEmptySlot(["a", null, "b"], 3)).toBe(1);
  });

  it("returns -1 when all slots within capacity are full", () => {
    expect(findFirstEmptySlot(["a", "b"], 2)).toBe(-1);
  });

  it("returns slots.length when array is shorter than maxSlots", () => {
    expect(findFirstEmptySlot(["a"], 3)).toBe(1);
  });

  it("returns -1 for empty array with maxSlots=0", () => {
    expect(findFirstEmptySlot([], 0)).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// validateAddToGarden
// ---------------------------------------------------------------------------

describe("validateAddToGarden", () => {
  it("returns 'unknown_bloomling' when instanceId not in bloomlings", () => {
    const state = baseState();
    expect(validateAddToGarden("ghost", state)).toBe("unknown_bloomling");
  });

  it("returns 'already_in_garden' when bloomling is already in garden", () => {
    const state = baseState({
      bloomlings: { a: makeBloomling("a", { inGarden: true }) },
    });
    expect(validateAddToGarden("a", state)).toBe("already_in_garden");
  });

  it("returns 'no_empty_slot' when garden is full and no slot specified", () => {
    const state = baseState({
      bloomlings: { a: makeBloomling("a") },
      garden: {
        maxSlots: 1,
        slots: ["occupied"],
        activeSynergyIds: [],
        specialMeterProgress: 0,
      },
    });
    expect(validateAddToGarden("a", state)).toBe("no_empty_slot");
  });

  it("returns null when garden has empty slot", () => {
    const state = baseState({
      bloomlings: { a: makeBloomling("a") },
      garden: {
        maxSlots: 1,
        slots: [null],
        activeSynergyIds: [],
        specialMeterProgress: 0,
      },
    });
    expect(validateAddToGarden("a", state)).toBeNull();
  });

  it("returns 'invalid_slot' when slotIndex is out of bounds", () => {
    const state = baseState({
      bloomlings: { a: makeBloomling("a") },
    });
    expect(validateAddToGarden("a", state, 5)).toBe("invalid_slot");
  });

  it("returns null for valid specific slot index", () => {
    const state = baseState({
      bloomlings: { a: makeBloomling("a") },
      zoneProgress: { ...baseState().zoneProgress, currentZone: 5 },
      garden: {
        maxSlots: 2,
        slots: ["other", null],
        activeSynergyIds: [],
        specialMeterProgress: 0,
      },
    });
    expect(validateAddToGarden("a", state, 1)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// placeBloomlingInSlot
// ---------------------------------------------------------------------------

describe("placeBloomlingInSlot", () => {
  it("returns null when bloomling does not exist", () => {
    const state = baseState();
    expect(placeBloomlingInSlot(state, "ghost", 0)).toBeNull();
  });

  it("returns null when slotIndex is out of bounds", () => {
    const state = baseState({
      bloomlings: { a: makeBloomling("a") },
    });
    expect(placeBloomlingInSlot(state, "a", 5)).toBeNull();
  });

  it("places a bloomling in the specified slot", () => {
    const state = baseState({
      bloomlings: { a: makeBloomling("a") },
      garden: {
        maxSlots: 1,
        slots: [null],
        activeSynergyIds: [],
        specialMeterProgress: 0,
      },
    });
    const result = placeBloomlingInSlot(state, "a", 0);
    expect(result).not.toBeNull();
    expect(result!.garden.slots[0]).toBe("a");
    expect(result!.bloomlings["a"]!.inGarden).toBe(true);
    expect(result!.bloomlings["a"]!.gardenSlot).toBe(0);
  });

  it("evicts displaced bloomling when a slot is occupied", () => {
    const state = baseState({
      bloomlings: {
        a: makeBloomling("a"),
        b: makeBloomling("b", { inGarden: true, gardenSlot: 0 }),
      },
      garden: {
        maxSlots: 1,
        slots: ["b"],
        activeSynergyIds: [],
        specialMeterProgress: 0,
      },
    });
    const result = placeBloomlingInSlot(state, "a", 0)!;
    expect(result.garden.slots[0]).toBe("a");
    expect(result.bloomlings["b"]!.inGarden).toBe(false);
    expect(result.bloomlings["b"]!.gardenSlot).toBeNull();
  });

  it("moves a bloomling from one slot to another", () => {
    const state = baseState({
      bloomlings: {
        a: makeBloomling("a", { inGarden: true, gardenSlot: 0 }),
        b: makeBloomling("b"),
      },
      zoneProgress: { ...baseState().zoneProgress, currentZone: 5 },
      garden: {
        maxSlots: 2,
        slots: ["a", null],
        activeSynergyIds: [],
        specialMeterProgress: 0,
      },
    });
    const result = placeBloomlingInSlot(state, "a", 1)!;
    expect(result.garden.slots[0]).toBeNull();
    expect(result.garden.slots[1]).toBe("a");
    expect(result.bloomlings["a"]!.gardenSlot).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// removeBloomlingFromGarden
// ---------------------------------------------------------------------------

describe("removeBloomlingFromGarden", () => {
  it("returns null when bloomling does not exist", () => {
    const state = baseState();
    expect(removeBloomlingFromGarden(state, "ghost")).toBeNull();
  });

  it("returns null when bloomling is not in garden", () => {
    const state = baseState({
      bloomlings: { a: makeBloomling("a") },
    });
    expect(removeBloomlingFromGarden(state, "a")).toBeNull();
  });

  it("removes the bloomling from garden and clears its slot", () => {
    const state = baseState({
      bloomlings: {
        a: makeBloomling("a", { inGarden: true, gardenSlot: 0 }),
      },
      garden: {
        maxSlots: 1,
        slots: ["a"],
        activeSynergyIds: [],
        specialMeterProgress: 0,
      },
    });
    const result = removeBloomlingFromGarden(state, "a")!;
    expect(result.garden.slots[0]).toBeNull();
    expect(result.bloomlings["a"]!.inGarden).toBe(false);
    expect(result.bloomlings["a"]!.gardenSlot).toBeNull();
  });
});
