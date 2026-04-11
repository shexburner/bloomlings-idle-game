// =============================================================================
// Upgrade Slice — Tap, Idle, Nectar, Essence upgrades
// =============================================================================
import type { StateCreator } from "zustand";
import type { Upgrade } from "~/types/game";
import type { GameStore } from "../store";
import { GARDEN_SLOT_UPGRADE_IDS } from "~/engine/garden";

export interface UpgradeSlice {
  upgrades: Record<string, Upgrade>;

  buyUpgrade: (templateId: string) => void;
  setUpgradeLevel: (templateId: string, level: number) => void;
}

export const initialUpgrades: Record<string, Upgrade> = {};

const SLOT_UPGRADE_ID_SET = new Set<string>(GARDEN_SLOT_UPGRADE_IDS);

export const createUpgradeSlice: StateCreator<
  GameStore,
  [],
  [],
  UpgradeSlice
> = (set, get) => ({
  upgrades: initialUpgrades,

  buyUpgrade: (templateId: string) => {
    set((state) => {
      const existing = state.upgrades[templateId];
      const currentLevel = existing?.level ?? 0;
      return {
        upgrades: {
          ...state.upgrades,
          [templateId]: {
            templateId,
            level: currentLevel + 1,
          },
        },
      };
    });
    // Slot-granting upgrades expand garden capacity on purchase.
    if (SLOT_UPGRADE_ID_SET.has(templateId)) {
      get().syncGardenCapacity();
    }
  },

  setUpgradeLevel: (templateId: string, level: number) => {
    set((state) => ({
      upgrades: {
        ...state.upgrades,
        [templateId]: {
          templateId,
          level,
        },
      },
    }));
    if (SLOT_UPGRADE_ID_SET.has(templateId)) {
      get().syncGardenCapacity();
    }
  },
});
