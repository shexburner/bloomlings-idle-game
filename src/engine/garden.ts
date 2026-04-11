// =============================================================================
// Garden Management — Active Bloomling roster, slot capacity, placement
// =============================================================================
// Pure functions for the Garden (active roster). Handles:
// - Max slot calculation from all sources (base + zone unlocks + upgrades + perk)
// - Slot-array resizing when capacity changes
// - Add/remove Bloomlings with validation and move-between-slots support
// - Reading active Bloomlings for production calculations
//
// Slot sources follow docs/design/02-bloomling-mechanics.md "Garden Slots" table:
//   Base           1
//   Zone 5         +1
//   Zone 15        +1
//   Zone 30        +1
//   Nectar upgrade +1 per level (Garden Expansion, max 2)
//   Essence upgrade +1 per level (Eternal Garden, max 2)
//   Dewdrop perk   +1 bonus
//   Hard cap       9
//
// The existing Phase 3 `idle_garden_slots` Sunlight upgrade also contributes
// while the full Nectar/Essence shops are not yet implemented.
// =============================================================================

import type { Bloomling, GameState } from "~/types/game";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

/** Starting garden slots at a fresh game. */
export const BASE_GARDEN_SLOTS = 1;

/** Zone numbers that grant +1 slot on first reach. */
export const GARDEN_SLOT_ZONE_THRESHOLDS: readonly number[] = [5, 15, 30];

/** Upgrade template IDs that contribute +1 slot per level. */
export const GARDEN_SLOT_UPGRADE_IDS: readonly string[] = [
  // Phase 3 placeholder (Sunlight shop). Kept until Nectar shop ships.
  "idle_garden_slots",
  // Phase 4 Nectar shop (Rebirth upgrade).
  "nectar_garden_expansion",
  // Phase 7 Essence shop (Transcendence upgrade).
  "essence_eternal_garden",
];

/** Dewdrop perk ID that grants a single bonus slot when purchased. */
export const DEWDROP_SLOT_PERK_ID = "dewdrop_bonus_slot";

/** Absolute hard cap on garden capacity (design doc: 8 + 1 Dewdrop bonus). */
export const GARDEN_SLOT_HARD_CAP = 9;

// -----------------------------------------------------------------------------
// Slot Capacity
// -----------------------------------------------------------------------------

/** Slice of GameState needed to compute garden capacity. */
type GardenCapacityState = Pick<
  GameState,
  "zoneProgress" | "upgrades" | "perks"
>;

/** Breakdown of each slot source, for UI or debugging. */
export interface GardenSlotBreakdown {
  base: number;
  zoneUnlocks: number;
  upgrades: Record<string, number>;
  dewdropPerk: number;
  /** Sum before applying the hard cap. */
  rawTotal: number;
  /** Final capacity after applying the hard cap. */
  total: number;
  /** True if rawTotal would exceed GARDEN_SLOT_HARD_CAP. */
  capped: boolean;
}

/**
 * Compute a full breakdown of garden slot sources for the current state.
 * Use `getMaxGardenSlots` if you only need the final number.
 */
export function computeGardenSlotBreakdown(
  state: GardenCapacityState
): GardenSlotBreakdown {
  const zone = state.zoneProgress.currentZone;
  const zoneUnlocks = GARDEN_SLOT_ZONE_THRESHOLDS.filter(
    (threshold) => zone >= threshold
  ).length;

  const upgrades: Record<string, number> = {};
  let upgradesTotal = 0;
  for (const id of GARDEN_SLOT_UPGRADE_IDS) {
    const level = state.upgrades[id]?.level ?? 0;
    upgrades[id] = level;
    upgradesTotal += level;
  }

  const dewdropPerk = state.perks[DEWDROP_SLOT_PERK_ID]?.purchased ? 1 : 0;

  const rawTotal =
    BASE_GARDEN_SLOTS + zoneUnlocks + upgradesTotal + dewdropPerk;
  const total = Math.min(rawTotal, GARDEN_SLOT_HARD_CAP);

  return {
    base: BASE_GARDEN_SLOTS,
    zoneUnlocks,
    upgrades,
    dewdropPerk,
    rawTotal,
    total,
    capped: rawTotal > GARDEN_SLOT_HARD_CAP,
  };
}

/**
 * Current maximum garden slots given progression, upgrades, and perks.
 * Capped at GARDEN_SLOT_HARD_CAP.
 */
export function getMaxGardenSlots(state: GardenCapacityState): number {
  return computeGardenSlotBreakdown(state).total;
}

// -----------------------------------------------------------------------------
// Slot Array Management
// -----------------------------------------------------------------------------

/**
 * Resize a slots array to `newMaxSlots`, preserving existing entries.
 *
 * - Growing: appends null slots.
 * - Shrinking: keeps the first `newMaxSlots`. Bloomlings in removed slots
 *   are dropped from the array (caller is responsible for clearing their
 *   `inGarden`/`gardenSlot` flags — see `applyCapacityChange`).
 * - Equal length: returns the same reference unchanged.
 */
export function resizeGardenSlots(
  currentSlots: readonly (string | null)[],
  newMaxSlots: number
): (string | null)[] {
  if (currentSlots.length === newMaxSlots) {
    return currentSlots as (string | null)[];
  }
  if (currentSlots.length < newMaxSlots) {
    const grown: (string | null)[] = [...currentSlots];
    while (grown.length < newMaxSlots) {
      grown.push(null);
    }
    return grown;
  }
  return currentSlots.slice(0, newMaxSlots);
}

/** Return value of `applyCapacityChange`: only the fields that changed. */
export interface CapacityChangeResult {
  maxSlots: number;
  slots: (string | null)[];
  /** Bloomlings updated as a side effect of shrinking (unchanged = same ref). */
  bloomlings: Record<string, Bloomling>;
}

/**
 * Recompute the garden's max slots from current state and resize the slots
 * array to match. If the new capacity is smaller, any Bloomlings in removed
 * slots are cleared out (`inGarden = false`, `gardenSlot = null`).
 *
 * Pure: returns the new values; does not mutate the input.
 */
export function applyCapacityChange(
  state: Pick<GameState, "bloomlings" | "garden" | "zoneProgress" | "upgrades" | "perks">
): CapacityChangeResult {
  const newMax = getMaxGardenSlots(state);
  const currentSlots = state.garden.slots;

  if (currentSlots.length === newMax) {
    return {
      maxSlots: newMax,
      slots: currentSlots as (string | null)[],
      bloomlings: state.bloomlings,
    };
  }

  if (currentSlots.length < newMax) {
    return {
      maxSlots: newMax,
      slots: resizeGardenSlots(currentSlots, newMax),
      bloomlings: state.bloomlings,
    };
  }

  // Shrinking: evict Bloomlings from removed slots.
  const evicted = currentSlots
    .slice(newMax)
    .filter((id): id is string => id !== null);
  if (evicted.length === 0) {
    return {
      maxSlots: newMax,
      slots: resizeGardenSlots(currentSlots, newMax),
      bloomlings: state.bloomlings,
    };
  }

  const updatedBloomlings = { ...state.bloomlings };
  for (const instanceId of evicted) {
    const b = updatedBloomlings[instanceId];
    if (b) {
      updatedBloomlings[instanceId] = {
        ...b,
        inGarden: false,
        gardenSlot: null,
      };
    }
  }

  return {
    maxSlots: newMax,
    slots: resizeGardenSlots(currentSlots, newMax),
    bloomlings: updatedBloomlings,
  };
}

// -----------------------------------------------------------------------------
// Add / Remove Validation
// -----------------------------------------------------------------------------

/** Slice of state needed to validate add-to-garden. */
type GardenPlacementState = Pick<
  GameState,
  "bloomlings" | "garden" | "zoneProgress" | "upgrades" | "perks"
>;

/** Reasons a Bloomling cannot be added to the garden. */
export type AddToGardenRejection =
  | "unknown_bloomling"
  | "already_in_garden"
  | "invalid_slot"
  | "no_empty_slot";

/**
 * Check whether a Bloomling can be added to the garden. If `slotIndex` is
 * provided, checks that specific slot; otherwise checks for any empty slot
 * within current capacity.
 *
 * Returns a rejection reason if not, or null if OK.
 */
export function validateAddToGarden(
  instanceId: string,
  state: GardenPlacementState,
  slotIndex?: number
): AddToGardenRejection | null {
  const bloomling = state.bloomlings[instanceId];
  if (!bloomling) return "unknown_bloomling";
  if (bloomling.inGarden) return "already_in_garden";

  const maxSlots = getMaxGardenSlots(state);

  if (slotIndex !== undefined) {
    if (slotIndex < 0 || slotIndex >= maxSlots) {
      return "invalid_slot";
    }
    return null;
  }

  const hasEmpty = hasEmptySlot(state.garden.slots, maxSlots);
  return hasEmpty ? null : "no_empty_slot";
}

/** Convenience boolean wrapper around `validateAddToGarden`. */
export function canAddToGarden(
  instanceId: string,
  state: GardenPlacementState,
  slotIndex?: number
): boolean {
  return validateAddToGarden(instanceId, state, slotIndex) === null;
}

/** True if any slot within `[0, maxSlots)` is null. */
export function hasEmptySlot(
  slots: readonly (string | null)[],
  maxSlots: number
): boolean {
  const limit = Math.min(maxSlots, slots.length);
  for (let i = 0; i < limit; i++) {
    if (slots[i] === null) return true;
  }
  return slots.length < maxSlots;
}

/** Return the first empty slot index within capacity, or -1 if none. */
export function findFirstEmptySlot(
  slots: readonly (string | null)[],
  maxSlots: number
): number {
  const limit = Math.min(maxSlots, slots.length);
  for (let i = 0; i < limit; i++) {
    if (slots[i] === null) return i;
  }
  if (slots.length < maxSlots) return slots.length;
  return -1;
}

// -----------------------------------------------------------------------------
// Add / Remove Transformers
// -----------------------------------------------------------------------------

/** Result of a garden mutation: only the fields that changed. */
export interface GardenMutationResult {
  bloomlings: Record<string, Bloomling>;
  garden: GameState["garden"];
}

/**
 * Pure transformer: place a Bloomling into the given slot.
 *
 * Behavior:
 * - Resizes slot array to match current capacity first.
 * - If the target slot is occupied, the displaced Bloomling is removed from
 *   the garden (flags cleared).
 * - If the Bloomling is already in another slot, it moves (old slot cleared).
 *
 * Returns a `GardenMutationResult` with updated `bloomlings` and `garden`.
 * Returns `null` if placement is invalid.
 */
export function placeBloomlingInSlot(
  state: GardenPlacementState,
  instanceId: string,
  slotIndex: number
): GardenMutationResult | null {
  const bloomling = state.bloomlings[instanceId];
  if (!bloomling) return null;

  const maxSlots = getMaxGardenSlots(state);
  if (slotIndex < 0 || slotIndex >= maxSlots) return null;

  // Resize first so `slotIndex` is always in bounds.
  const slots = resizeGardenSlots(state.garden.slots, maxSlots);
  const updatedBloomlings = { ...state.bloomlings };

  // Evict whoever is currently in the target slot.
  const displacedId = slots[slotIndex];
  if (displacedId && displacedId !== instanceId) {
    const displaced = updatedBloomlings[displacedId];
    if (displaced) {
      updatedBloomlings[displacedId] = {
        ...displaced,
        inGarden: false,
        gardenSlot: null,
      };
    }
  }

  // Clear the incoming Bloomling's old slot if it was already placed.
  const oldSlot = slots.indexOf(instanceId);
  if (oldSlot !== -1 && oldSlot !== slotIndex) {
    slots[oldSlot] = null;
  }

  // Place.
  slots[slotIndex] = instanceId;
  updatedBloomlings[instanceId] = {
    ...bloomling,
    inGarden: true,
    gardenSlot: slotIndex,
  };

  return {
    bloomlings: updatedBloomlings,
    garden: {
      ...state.garden,
      maxSlots,
      slots,
    },
  };
}

/**
 * Pure transformer: remove a Bloomling from the garden.
 * Returns `null` if the Bloomling does not exist or is not in the garden.
 */
export function removeBloomlingFromGarden(
  state: Pick<GameState, "bloomlings" | "garden">,
  instanceId: string
): GardenMutationResult | null {
  const bloomling = state.bloomlings[instanceId];
  if (!bloomling || !bloomling.inGarden) return null;

  const slots = state.garden.slots.map((slotId) =>
    slotId === instanceId ? null : slotId
  );

  return {
    bloomlings: {
      ...state.bloomlings,
      [instanceId]: {
        ...bloomling,
        inGarden: false,
        gardenSlot: null,
      },
    },
    garden: {
      ...state.garden,
      slots,
    },
  };
}

// -----------------------------------------------------------------------------
// Reading
// -----------------------------------------------------------------------------

/**
 * Ordered list of Bloomlings currently placed in the garden (skips empty
 * slots and stale references).
 */
export function getGardenBloomlings(
  state: Pick<GameState, "bloomlings" | "garden">
): Bloomling[] {
  const result: Bloomling[] = [];
  for (const slotId of state.garden.slots) {
    if (slotId === null) continue;
    const bloomling = state.bloomlings[slotId];
    if (bloomling) result.push(bloomling);
  }
  return result;
}
