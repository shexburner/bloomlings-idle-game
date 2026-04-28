// =============================================================================
// Upgrade Slice — Tap, Idle, Nectar, Essence upgrades
// =============================================================================
import type { StateCreator } from "zustand";
import type { Upgrade } from "~/types/game";
import type { GameStore } from "../store";
import { GARDEN_SLOT_UPGRADE_IDS } from "~/engine/garden";
import { trackEvent } from "~/services/analyticsService";

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
    const existing = get().upgrades[templateId];
    const currentLevel = existing?.level ?? 0;
    set((state) => ({
      upgrades: {
        ...state.upgrades,
        [templateId]: {
          templateId,
          level: currentLevel + 1,
        },
      },
    }));
    if (currentLevel === 0) {
      trackEvent("upgrade_purchased", { upgrade_id: templateId, new_level: 1, cost: 0 });
    }
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
