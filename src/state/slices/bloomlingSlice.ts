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
import {
  calculateActiveSynergies,
  reconcileSynergyDiscovery,
} from "~/engine/synergies";
import { getBloomlingTemplate } from "~/data/bloomlingTemplates";

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
  /**
   * Recompute which synergies are active from the current Garden roster and
   * write them to `garden.activeSynergyIds`. Also folds any newly activated
   * synergies into `stats.discoveredSynergyIds` so Phase 5 can fire Dewdrop
   * rewards on first discovery. Safe to call repeatedly — no-op if nothing
   * changed.
   */
  recomputeActiveSynergies: () => void;
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
> = (set, get) => ({
  bloomlings: initialBloomlings,
  garden: initialGarden,

  addBloomling: (bloomling: Bloomling) =>
    set((state) => ({
      bloomlings: {
        ...state.bloomlings,
        [bloomling.instanceId]: bloomling,
      },
    })),

  removeBloomling: (instanceId: string) => {
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
    });
    get().recomputeActiveSynergies();
  },

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

  evolveBloomling: (instanceId: string) => {
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
    });
    // Reaching Elder stage can unlock new tag synergies.
    get().recomputeActiveSynergies();
  },

  addToGarden: (instanceId: string, slotIndex: number) => {
    set((state) => {
      const result = placeBloomlingInSlot(state, instanceId, slotIndex);
      if (result === null) return state;
      return {
        bloomlings: result.bloomlings,
        garden: result.garden,
      };
    });
    get().recomputeActiveSynergies();
  },

  removeFromGarden: (instanceId: string) => {
    set((state) => {
      const result = removeBloomlingFromGarden(state, instanceId);
      if (result === null) return state;
      return {
        bloomlings: result.bloomlings,
        garden: result.garden,
      };
    });
    get().recomputeActiveSynergies();
  },

  syncGardenCapacity: () => {
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
    });
    // Capacity changes can evict Bloomlings, which changes synergies.
    get().recomputeActiveSynergies();
  },

  recomputeActiveSynergies: () =>
    set((state) => {
      // Collect the Bloomlings currently in the Garden.
      const gardenBloomlings: Bloomling[] = [];
      for (const slotId of state.garden.slots) {
        if (slotId === null) continue;
        const b = state.bloomlings[slotId];
        if (b) gardenBloomlings.push(b);
      }

      const active = calculateActiveSynergies(
        gardenBloomlings,
        getBloomlingTemplate
      );

      // Update active IDs if they changed.
      const prevIds = state.garden.activeSynergyIds;
      const nextIds = active.activeSynergyIds;
      const idsChanged =
        prevIds.length !== nextIds.length ||
        prevIds.some((id, i) => id !== nextIds[i]);

      // Fold any newly active synergies into the lifetime discovery list.
      const discovery = reconcileSynergyDiscovery(
        state.stats.discoveredSynergyIds,
        nextIds
      );
      const discoveryChanged = discovery.newlyDiscovered.length > 0;

      if (!idsChanged && !discoveryChanged) {
        return state;
      }

      return {
        garden: idsChanged
          ? { ...state.garden, activeSynergyIds: [...nextIds] }
          : state.garden,
        stats: discoveryChanged
          ? {
              ...state.stats,
              discoveredSynergyIds: [...discovery.discoveredSynergyIds],
              synergiesDiscovered: discovery.discoveredSynergyIds.length,
            }
          : state.stats,
      };
    }),
});
