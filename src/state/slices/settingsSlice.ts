// =============================================================================
// Settings Slice — Player-configurable game settings
// =============================================================================
import type { StateCreator } from "zustand";
import type { GameSettings } from "~/types/game";
import { BuyMultiplier } from "~/types/game";
import type { GameStore } from "../store";

export interface SettingsSlice {
  settings: GameSettings;

  setSfxEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setMasterVolume: (volume: number) => void;
  setBuyMultiplier: (multiplier: BuyMultiplier) => void;
  setAbbreviateNumbers: (enabled: boolean) => void;
  setTutorialCompleted: (completed: boolean) => void;
  setNotificationPreference: (
    key: keyof GameSettings["notifications"],
    enabled: boolean
  ) => void;
}

export const initialSettings: GameSettings = {
  masterVolume: 1.0,
  sfxEnabled: true,
  musicEnabled: true,
  hapticsEnabled: true,
  notifications: {
    offlineEarnings: true,
    streakReminder: true,
    boostExpired: true,
    milestoneClose: true,
    newBloomlingHint: true,
  },
  buyMultiplier: BuyMultiplier.X1,
  abbreviateNumbers: true,
  tutorialCompleted: false,
};

export const createSettingsSlice: StateCreator<
  GameStore,
  [],
  [],
  SettingsSlice
> = (set) => ({
  settings: initialSettings,

  setSfxEnabled: (enabled: boolean) =>
    set((state) => ({
      settings: { ...state.settings, sfxEnabled: enabled },
    })),

  setMusicEnabled: (enabled: boolean) =>
    set((state) => ({
      settings: { ...state.settings, musicEnabled: enabled },
    })),

  setHapticsEnabled: (enabled: boolean) =>
    set((state) => ({
      settings: { ...state.settings, hapticsEnabled: enabled },
    })),

  setMasterVolume: (volume: number) =>
    set((state) => ({
      settings: {
        ...state.settings,
        masterVolume: Math.max(0, Math.min(1, volume)),
      },
    })),

  setBuyMultiplier: (multiplier: BuyMultiplier) =>
    set((state) => ({
      settings: { ...state.settings, buyMultiplier: multiplier },
    })),

  setAbbreviateNumbers: (enabled: boolean) =>
    set((state) => ({
      settings: { ...state.settings, abbreviateNumbers: enabled },
    })),

  setTutorialCompleted: (completed: boolean) =>
    set((state) => ({
      settings: { ...state.settings, tutorialCompleted: completed },
    })),

  setNotificationPreference: (
    key: keyof GameSettings["notifications"],
    enabled: boolean
  ) =>
    set((state) => ({
      settings: {
        ...state.settings,
        notifications: {
          ...state.settings.notifications,
          [key]: enabled,
        },
      },
    })),
});
