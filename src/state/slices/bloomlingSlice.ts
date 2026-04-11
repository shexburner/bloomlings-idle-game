// =============================================================================
// Bloomling Slice — Bloomling collection, leveling, evolution, garden management
// =============================================================================
import type { StateCreator } from "zustand";
import type { Bloomling } from "~/types/game";
import type { GameStore } from "../store";
import {
  canEvolve,
  getEvolutionCost,
  evolveBloomling as evolveBloomlingPure,
} from "~/engine/evolution";
import {
  applyCapacityChange,
  placeBloomlingInSlot,
  removeBloomlingFromGarden,
} from "~/engine/garden";

export interface BloomlingSlice {
  bloomlings: Record<string, Bloomling>;
  garden: {
    maxSlots: number;
    slots: (string | null)[];
    activeSynergyIds: string[];
    specialMeterProgress: number;
  };

  addBloomling: (bloomling: Bloomling) => void;
  removeBloomling: (instanceId: string) => void;
  levelUpBloomling: (instanceId: string) => void;
  evolveBloomling: (instanceId: string) => void;
  addToGarden: (instanceId: string, slotIndex: number) => void;
  removeFromGarden: (instanceId: string) => void;
  /**
   * Recompute the garden's max slots from progression, upgrades, and perks,
   * and resize the slot array accordingly. Call this after any change to
   * zoneProgress, upgrades, or perks that could alter capacity.
   */
  syncGardenCapacity: () => void;
}

export const initialBloomlings: Record<string, Bloomling> = {};

export const initialGarden = {
  maxSlots: 1,
  slots: [null] as (string | null)[],
  activeSynergyIds: [] as string[],
  specialMeterProgress: 0,
};

export const createBloomlingSlice: StateCreator<
  GameStore,
  [],
  [],
  BloomlingSlice
> = (set) => ({
  bloomlings: initialBloomlings,
  garden: initialGarden,

  addBloomling: (bloomling: Bloomling) =>
    set((state) => ({
      bloomlings: {
        ...state.bloomlings,
        [bloomling.instanceId]: bloomling,
      },
    })),

  removeBloomling: (instanceId: string) =>
    set((state) => {
      const { [instanceId]: _removed, ...remaining } = state.bloomlings;
      // Also remove from garden if placed
      const newSlots = state.garden.slots.map((slotId) =>
        slotId === instanceId ? null : slotId
      );
      return {
        bloomlings: remaining,
        garden: { ...state.garden, slots: newSlots },
      };
    }),

  levelUpBloomling: (instanceId: string) =>
    set((state) => {
      const bloomling = state.bloomlings[instanceId];
      if (!bloomling || bloomling.level >= 100) {
        return state;
      }
      return {
        bloomlings: {
          ...state.bloomlings,
          [instanceId]: {
            ...bloomling,
            level: bloomling.level + 1,
          },
        },
      };
    }),

  evolveBloomling: (instanceId: string) =>
    set((state) => {
      const bloomling = state.bloomlings[instanceId];
      if (!bloomling) {
        return state;
      }

      // Check eligibility using the evolution engine
      if (!canEvolve(bloomling, state.resources)) {
        return state;
      }

      // Calculate and deduct costs
      const cost = getEvolutionCost(bloomling);
      const newSunlight = state.resources.sunlight - cost.sunlight;
      const newNectar = state.resources.nectar - cost.nectar;

      // Apply evolution transformation
      const evolved = evolveBloomlingPure(bloomling);

      return {
        bloomlings: {
          ...state.bloomlings,
          [instanceId]: evolved,
        },
        resources: {
          ...state.resources,
          sunlight: newSunlight,
          nectar: newNectar,
        },
      };
    }),

  addToGarden: (instanceId: string, slotIndex: number) =>
    set((state) => {
      const result = placeBloomlingInSlot(state, instanceId, slotIndex);
      if (result === null) return state;
      return {
        bloomlings: result.bloomlings,
        garden: result.garden,
      };
    }),

  removeFromGarden: (instanceId: string) =>
    set((state) => {
      const result = removeBloomlingFromGarden(state, instanceId);
      if (result === null) return state;
      return {
        bloomlings: result.bloomlings,
        garden: result.garden,
      };
    }),

  syncGardenCapacity: () =>
    set((state) => {
      const result = applyCapacityChange(state);
      if (
        result.maxSlots === state.garden.maxSlots &&
        result.slots === state.garden.slots &&
        result.bloomlings === state.bloomlings
      ) {
        return state;
      }
      return {
        bloomlings: result.bloomlings,
        garden: {
          ...state.garden,
          maxSlots: result.maxSlots,
          slots: result.slots,
        },
      };
    }),
});
