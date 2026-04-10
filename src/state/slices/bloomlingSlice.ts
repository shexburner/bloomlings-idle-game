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
      const bloomling = state.bloomlings[instanceId];
      if (!bloomling || slotIndex < 0 || slotIndex >= state.garden.maxSlots) {
        return state;
      }
      // If the slot is already occupied, remove the existing Bloomling first
      const existingId = state.garden.slots[slotIndex];
      const updatedBloomlings = { ...state.bloomlings };

      if (existingId && updatedBloomlings[existingId]) {
        updatedBloomlings[existingId] = {
          ...updatedBloomlings[existingId],
          inGarden: false,
          gardenSlot: null,
        };
      }

      // If this Bloomling is already in another slot, clear the old slot
      const newSlots = [...state.garden.slots];
      const oldSlot = newSlots.indexOf(instanceId);
      if (oldSlot !== -1) {
        newSlots[oldSlot] = null;
      }

      // Place the Bloomling in the new slot
      newSlots[slotIndex] = instanceId;
      updatedBloomlings[instanceId] = {
        ...bloomling,
        inGarden: true,
        gardenSlot: slotIndex,
      };

      return {
        bloomlings: updatedBloomlings,
        garden: { ...state.garden, slots: newSlots },
      };
    }),

  removeFromGarden: (instanceId: string) =>
    set((state) => {
      const bloomling = state.bloomlings[instanceId];
      if (!bloomling || !bloomling.inGarden) {
        return state;
      }
      const newSlots = state.garden.slots.map((slotId) =>
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
        garden: { ...state.garden, slots: newSlots },
      };
    }),
});
