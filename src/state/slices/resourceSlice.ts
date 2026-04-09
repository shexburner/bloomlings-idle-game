// =============================================================================
// Resource Slice — Sunlight, Nectar, Essence, Dewdrops
// =============================================================================
import type { StateCreator } from "zustand";
import type { Resources } from "~/types/game";
import type { GameStore } from "../store";

export interface ResourceSlice {
  resources: Resources;
  addSunlight: (amount: number) => void;
  spendSunlight: (amount: number) => boolean;
  addNectar: (amount: number) => void;
  spendNectar: (amount: number) => boolean;
  addEssence: (amount: number) => void;
  spendEssence: (amount: number) => boolean;
  addDewdrops: (amount: number) => void;
  spendDewdrops: (amount: number) => boolean;
}

export const initialResources: Resources = {
  sunlight: 0,
  nectar: 0,
  essence: 0,
  dewdrops: 0,
  totalSunlightEarned: 0,
  runSunlightEarned: 0,
};

export const createResourceSlice: StateCreator<
  GameStore,
  [],
  [],
  ResourceSlice
> = (set) => ({
  resources: initialResources,

  addSunlight: (amount: number) =>
    set((state) => ({
      resources: {
        ...state.resources,
        sunlight: state.resources.sunlight + amount,
        totalSunlightEarned: state.resources.totalSunlightEarned + amount,
        runSunlightEarned: state.resources.runSunlightEarned + amount,
      },
    })),

  spendSunlight: (amount: number) => {
    let success = false;
    set((state) => {
      if (state.resources.sunlight < amount) {
        return state;
      }
      success = true;
      return {
        resources: {
          ...state.resources,
          sunlight: state.resources.sunlight - amount,
        },
      };
    });
    return success;
  },

  addNectar: (amount: number) =>
    set((state) => ({
      resources: {
        ...state.resources,
        nectar: state.resources.nectar + amount,
      },
      prestige: {
        ...state.prestige,
        totalNectarEarned: state.prestige.totalNectarEarned + amount,
      },
    })),

  spendNectar: (amount: number) => {
    let success = false;
    set((state) => {
      if (state.resources.nectar < amount) {
        return state;
      }
      success = true;
      return {
        resources: {
          ...state.resources,
          nectar: state.resources.nectar - amount,
        },
        prestige: {
          ...state.prestige,
          totalNectarSpent: state.prestige.totalNectarSpent + amount,
        },
      };
    });
    return success;
  },

  addEssence: (amount: number) =>
    set((state) => ({
      resources: {
        ...state.resources,
        essence: state.resources.essence + amount,
      },
      prestige: {
        ...state.prestige,
        totalEssenceEarned: state.prestige.totalEssenceEarned + amount,
      },
    })),

  spendEssence: (amount: number) => {
    let success = false;
    set((state) => {
      if (state.resources.essence < amount) {
        return state;
      }
      success = true;
      return {
        resources: {
          ...state.resources,
          essence: state.resources.essence - amount,
        },
        prestige: {
          ...state.prestige,
          totalEssenceSpent: state.prestige.totalEssenceSpent + amount,
        },
      };
    });
    return success;
  },

  addDewdrops: (amount: number) =>
    set((state) => ({
      resources: {
        ...state.resources,
        dewdrops: state.resources.dewdrops + amount,
      },
    })),

  spendDewdrops: (amount: number) => {
    let success = false;
    set((state) => {
      if (state.resources.dewdrops < amount) {
        return state;
      }
      success = true;
      return {
        resources: {
          ...state.resources,
          dewdrops: state.resources.dewdrops - amount,
        },
      };
    });
    return success;
  },
});
