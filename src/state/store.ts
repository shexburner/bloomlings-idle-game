// =============================================================================
// Bloomlings Game Store — Main Zustand store combining all slices
// =============================================================================
import { create } from "zustand";

import type { ResourceSlice } from "./slices/resourceSlice";
import type { BloomlingSlice } from "./slices/bloomlingSlice";
import type { UpgradeSlice } from "./slices/upgradeSlice";
import type { ComboSlice } from "./slices/comboSlice";
import type { PrestigeSlice } from "./slices/prestigeSlice";
import type { SettingsSlice } from "./slices/settingsSlice";

import { createResourceSlice, initialResources } from "./slices/resourceSlice";
import {
  createBloomlingSlice,
  initialBloomlings,
  initialGarden,
} from "./slices/bloomlingSlice";
import { createUpgradeSlice, initialUpgrades } from "./slices/upgradeSlice";
import { createComboSlice, initialCombo } from "./slices/comboSlice";
import { createPrestigeSlice, initialPrestige } from "./slices/prestigeSlice";
import { createSettingsSlice, initialSettings } from "./slices/settingsSlice";

import type {
  ActiveBoost,
  AdRewardConfig,
  AdTouchpoint,
  Achievement,
  DailyState,
  GameStats,
  Perk,
  Synergy,
  ZoneProgressState,
} from "~/types/game";

// -----------------------------------------------------------------------------
// Combined Store Type
// -----------------------------------------------------------------------------

/** Meta/transient fields not covered by any slice. */
export interface MetaSlice {
  // --- Perks ---
  perks: Record<string, Perk>;
  // --- Zone Progression ---
  zoneProgress: ZoneProgressState;
  // --- Active Boosts ---
  activeBoosts: ActiveBoost[];
  // --- Ad States ---
  adStates: Record<AdTouchpoint, AdRewardConfig>;
  // --- Daily / Retention ---
  daily: DailyState;
  // --- Achievements ---
  achievements: Record<string, Achievement>;
  // --- Synergies ---
  synergies: Record<string, Synergy>;
  // --- Stats ---
  stats: GameStats;
  // --- Meta timing ---
  lastTickAt: number;
  lastActiveAt: number;
  engineRunning: boolean;
  unlockedFeatures: {
    tapUpgradeShop: boolean;
    idleUpgradeShop: boolean;
    bloomlingEvolution: boolean;
    adRewards: boolean;
    dewdropShop: boolean;
    synergies: boolean;
    rebirth: boolean;
    elderEvolution: boolean;
    transcendence: boolean;
  };

  // --- Meta actions ---
  setLastTickAt: (timestamp: number) => void;
  setEngineRunning: (running: boolean) => void;
  setLastActiveAt: (timestamp: number) => void;
  addZoneProgress: (amount: number) => void;
  advanceZone: () => void;
  setActiveBoosts: (boosts: ActiveBoost[]) => void;
}

/**
 * The full game store type: union of all slices + meta fields.
 */
export type GameStore = ResourceSlice &
  BloomlingSlice &
  UpgradeSlice &
  ComboSlice &
  PrestigeSlice &
  SettingsSlice &
  MetaSlice;

// -----------------------------------------------------------------------------
// Initial State Values for Meta Fields
// -----------------------------------------------------------------------------

const initialZoneProgress: ZoneProgressState = {
  currentZone: 1,
  currentZoneProgress: 0,
  gateActive: false,
  gateTimerRemainingMs: null,
  gateFailCount: 0,
  bossActive: false,
  bossHpRemaining: null,
  bossHpMax: null,
  bossTimerRemainingMs: null,
  bossFailCount: 0,
};

const initialStats: GameStats = {
  totalTaps: 0,
  totalCriticalTaps: 0,
  highestCombo: 0,
  totalPlayTimeMs: 0,
  totalAdsWatched: 0,
  bloomlingsDiscovered: 0,
  synergiesDiscovered: 0,
  achievementsCompleted: 0,
  totalZonesCleared: 0,
  totalGatesCleared: 0,
  totalBossesDefeated: 0,
};

const initialDaily: DailyState = {
  loginCycleDay: 1,
  loginCyclesCompleted: 0,
  todayRewardCollected: false,
  streakDays: 0,
  lastOpenDate: "",
  adsWatchedToday: 0,
  dailyAdCap: 15,
  adStreakDays: 0,
  streakShieldUsedThisWeek: false,
};

const initialUnlockedFeatures: MetaSlice["unlockedFeatures"] = {
  tapUpgradeShop: false,
  idleUpgradeShop: false,
  bloomlingEvolution: false,
  adRewards: false,
  dewdropShop: false,
  synergies: false,
  rebirth: false,
  elderEvolution: false,
  transcendence: false,
};

// -----------------------------------------------------------------------------
// Store Creation
// -----------------------------------------------------------------------------

export const useGameStore = create<GameStore>()((...args) => {
  const [set, get] = args;
  return {
    // Spread all slice creators
    ...createResourceSlice(...args),
    ...createBloomlingSlice(...args),
    ...createUpgradeSlice(...args),
    ...createComboSlice(...args),
    ...createPrestigeSlice(...args),
    ...createSettingsSlice(...args),

    // --- Meta / transient state ---
    perks: {},
    zoneProgress: initialZoneProgress,
    activeBoosts: [],
    adStates: {} as Record<AdTouchpoint, AdRewardConfig>,
    daily: initialDaily,
    achievements: {},
    synergies: {},
    stats: initialStats,
    lastTickAt: Date.now(),
    lastActiveAt: Date.now(),
    engineRunning: false,
    unlockedFeatures: initialUnlockedFeatures,

    // --- Meta actions ---
    setLastTickAt: (timestamp: number) => set({ lastTickAt: timestamp }),
    setEngineRunning: (running: boolean) => set({ engineRunning: running }),
    setLastActiveAt: (timestamp: number) => set({ lastActiveAt: timestamp }),

    addZoneProgress: (amount: number) =>
      set((state) => ({
        zoneProgress: {
          ...state.zoneProgress,
          currentZoneProgress: state.zoneProgress.currentZoneProgress + amount,
        },
      })),

    advanceZone: () => {
      set((state) => {
        const nextZone = state.zoneProgress.currentZone + 1;
        return {
          zoneProgress: {
            ...state.zoneProgress,
            currentZone: nextZone,
            currentZoneProgress: 0,
            gateActive: false,
            gateTimerRemainingMs: null,
            gateFailCount: 0,
            bossActive: false,
            bossHpRemaining: null,
            bossHpMax: null,
            bossTimerRemainingMs: null,
            bossFailCount: 0,
          },
          prestige: {
            ...state.prestige,
            currentRunHighestZone: Math.max(
              state.prestige.currentRunHighestZone,
              nextZone
            ),
            allTimeHighestZone: Math.max(
              state.prestige.allTimeHighestZone,
              nextZone
            ),
          },
          stats: {
            ...state.stats,
            totalZonesCleared: state.stats.totalZonesCleared + 1,
          },
        };
      });
      // Crossing a zone threshold may unlock a new garden slot.
      get().syncGardenCapacity();
    },

    setActiveBoosts: (boosts: ActiveBoost[]) =>
      set({ activeBoosts: boosts }),
  };
});

// Re-export initial values for use in other modules
export {
  initialResources,
  initialBloomlings,
  initialGarden,
  initialUpgrades,
  initialCombo,
  initialPrestige,
  initialSettings,
  initialZoneProgress,
  initialStats,
  initialDaily,
  initialUnlockedFeatures,
};
