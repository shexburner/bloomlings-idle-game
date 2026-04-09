// =============================================================================
// Upgrade Slice — Tap, Idle, Nectar, Essence upgrades
// =============================================================================
import type { StateCreator } from "zustand";
import type { Upgrade } from "~/types/game";
import type { GameStore } from "../store";

export interface UpgradeSlice {
  upgrades: Record<string, Upgrade>;

  buyUpgrade: (templateId: string) => void;
  setUpgradeLevel: (templateId: string, level: number) => void;
}

export const initialUpgrades: Record<string, Upgrade> = {};

export const createUpgradeSlice: StateCreator<
  GameStore,
  [],
  [],
  UpgradeSlice
> = (set) => ({
  upgrades: initialUpgrades,

  buyUpgrade: (templateId: string) =>
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
    }),

  setUpgradeLevel: (templateId: string, level: number) =>
    set((state) => ({
      upgrades: {
        ...state.upgrades,
        [templateId]: {
          templateId,
          level,
        },
      },
    })),
});
