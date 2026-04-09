// =============================================================================
// Combo Slice — Combo state, increment, reset
// =============================================================================
import type { StateCreator } from "zustand";
import type { ComboState } from "~/types/game";
import type { GameStore } from "../store";

/** Maximum combo hit count. */
const MAX_COMBO = 100;

export interface ComboSlice {
  combo: ComboState;

  incrementCombo: (tapTimestamp: number) => void;
  resetCombo: () => void;
  setComboFrozen: (frozen: boolean, expiresAt: number | null) => void;
}

export const initialCombo: ComboState = {
  count: 0,
  lastTapAt: 0,
  frozen: false,
  freezeExpiresAt: null,
  sessionMaxCombo: 0,
};

export const createComboSlice: StateCreator<
  GameStore,
  [],
  [],
  ComboSlice
> = (set) => ({
  combo: initialCombo,

  incrementCombo: (tapTimestamp: number) =>
    set((state) => {
      const newCount = Math.min(state.combo.count + 1, MAX_COMBO);
      return {
        combo: {
          ...state.combo,
          count: newCount,
          lastTapAt: tapTimestamp,
          sessionMaxCombo: Math.max(state.combo.sessionMaxCombo, newCount),
        },
      };
    }),

  resetCombo: () =>
    set((state) => ({
      combo: {
        ...state.combo,
        count: 0,
        // Preserve lastTapAt and sessionMaxCombo
      },
    })),

  setComboFrozen: (frozen: boolean, expiresAt: number | null) =>
    set((state) => ({
      combo: {
        ...state.combo,
        frozen,
        freezeExpiresAt: expiresAt,
      },
    })),
});
