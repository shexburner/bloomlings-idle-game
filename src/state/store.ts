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
  OfflineSessionSummary,
  Perk,
  Synergy,
  ZoneProgressState,
} from "~/types/game";
import { PERK_ID, PERK_TEMPLATE_MAP } from "~/data/perkTemplates";
import { DEWDROP_SLOT_PERK_ID } from "~/engine/garden";

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
  /**
   * Transient summary of the last offline session, written by the game loop
   * on foreground and cleared by the Welcome Back modal. NOT persisted.
   */
  lastOfflineSession: OfflineSessionSummary | null;
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
  setLastOfflineSession: (summary: OfflineSessionSummary | null) => void;
  clearLastOfflineSession: () => void;
  /**
   * Retroactively grant the "2× offline earnings" ad reward. Adds another
   * copy of `lastOfflineSession.sunlightEarned` to the player's balance and
   * bumps `stats.totalAdsWatched`. Called by `WelcomeBackModal` after a
   * successful rewarded ad. No-op if no session is pending.
   */
  applyAdDoubleOffline: () => void;
  addZoneProgress: (amount: number) => void;
  advanceZone: () => void;
  setActiveBoosts: (boosts: ActiveBoost[]) => void;

  // --- Dewdrop shop ---
  /**
   * Purchase a perk with Dewdrops. For permanent perks, sets `purchased: true`
   * (no-op if already owned). For consumables, increments `quantity`. Returns
   * true on success, false if Dewdrops are insufficient or template unknown.
   */
  buyPerk: (perkId: string) => boolean;
  /**
   * Grant a Dewdrop reward from the "Watch & Earn" touchpoint. Computes the
   * payout (base + 3rd-of-day bonus + consecutive-day bonus), increments
   * `daily.adsWatchedToday`, stamps `lastDewdropAdAt`, and bumps
   * `stats.totalAdsWatched`. Returns the amount credited. No-op (returns 0)
   * if the daily cap is reached.
   */
  recordDewdropAdReward: () => number;
  /**
   * Ensure daily counters match the current calendar day. Resets
   * `adsWatchedToday` on day change and updates the consecutive-day streak.
   * Safe to call on every foreground; idempotent within a day.
   */
  rolloverDailyState: () => void;
  /**
   * Consume one Zone Skip perk (if quantity > 0) and advance to the next
   * zone. Returns true on success, false if the perk is unavailable.
   */
  useZoneSkip: () => boolean;
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
  discoveredSynergyIds: [],
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
  lastDewdropAdAt: null,
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
    lastOfflineSession: null,
    unlockedFeatures: initialUnlockedFeatures,

    // --- Meta actions ---
    setLastTickAt: (timestamp: number) => set({ lastTickAt: timestamp }),
    setEngineRunning: (running: boolean) => set({ engineRunning: running }),
    setLastActiveAt: (timestamp: number) => set({ lastActiveAt: timestamp }),
    setLastOfflineSession: (summary) => set({ lastOfflineSession: summary }),
    clearLastOfflineSession: () => set({ lastOfflineSession: null }),

    applyAdDoubleOffline: () => {
      const session = get().lastOfflineSession;
      if (session === null || session.sunlightEarned <= 0) return;
      const bonus = session.sunlightEarned;
      // Grant exactly what the modal showed — re-running offline progress
      // with adBoost:true could drift if baseline rates have changed while
      // the ad was playing. The engine's `adBoost` option remains for
      // future callers / tests.
      get().addSunlight(bonus);
      get().addZoneProgress(bonus);
      set((state) => ({
        stats: {
          ...state.stats,
          totalAdsWatched: state.stats.totalAdsWatched + 1,
        },
      }));
    },

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
      // ...and may unlock a new Bloomling species. Run discovery after the
      // slot array is sized so auto-placement (for the first-ever species)
      // lands in a valid slot.
      get().discoverBloomlingsForZone(get().zoneProgress.currentZone);
    },

    setActiveBoosts: (boosts: ActiveBoost[]) =>
      set({ activeBoosts: boosts }),

    // --- Dewdrop shop ---

    buyPerk: (perkId: string) => {
      const template = PERK_TEMPLATE_MAP[perkId];
      if (template === undefined) return false;
      const current = get().perks[perkId];
      // Permanent perks can only be bought once.
      if (template.category === "permanent" && current?.purchased === true) {
        return false;
      }
      const spent = get().spendDewdrops(template.cost);
      if (!spent) return false;
      set((state) => {
        const existing = state.perks[perkId];
        const nextPerk: Perk =
          template.category === "permanent"
            ? {
                id: template.id,
                name: template.name,
                description: template.description,
                cost: template.cost,
                permanent: true,
                purchased: true,
                quantity: 1,
              }
            : {
                id: template.id,
                name: template.name,
                description: template.description,
                cost: template.cost,
                permanent: false,
                purchased: true,
                quantity: (existing?.quantity ?? 0) + 1,
              };
        return {
          perks: {
            ...state.perks,
            [perkId]: nextPerk,
          },
        };
      });
      // Purchasing the Extra Garden Slot perk immediately expands capacity.
      if (perkId === DEWDROP_SLOT_PERK_ID) {
        get().syncGardenCapacity();
      }
      return true;
    },

    recordDewdropAdReward: () => {
      // Ensure day rollover has run so caps/streaks are accurate.
      get().rolloverDailyState();
      const { daily } = get();
      if (daily.adsWatchedToday >= daily.dailyAdCap) {
        return 0;
      }
      // Earn rate (docs/design/05-ad-economy.md §Dewdrop Earn Rate):
      //   • 1 base Dewdrop per ad
      //   • +1 bonus on every 3rd ad of the day
      //   • +1 for each consecutive ad-streak day (cap 5)
      const nextCount = daily.adsWatchedToday + 1;
      const everyThirdBonus = nextCount % 3 === 0 ? 1 : 0;
      const streakBonus = Math.min(daily.adStreakDays, 5);
      const total = 1 + everyThirdBonus + streakBonus;
      get().addDewdrops(total);
      const now = Date.now();
      set((state) => ({
        daily: {
          ...state.daily,
          adsWatchedToday: nextCount,
          lastDewdropAdAt: now,
        },
        stats: {
          ...state.stats,
          totalAdsWatched: state.stats.totalAdsWatched + 1,
        },
      }));
      return total;
    },

    rolloverDailyState: () => {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const { daily } = get();
      if (daily.lastOpenDate === today) return;

      // Day advanced. If the previous day had at least one ad watched,
      // extend the streak; otherwise reset it. A fresh save (empty
      // lastOpenDate) starts a new streak at 0.
      const streakContinues =
        daily.lastOpenDate !== "" && daily.adsWatchedToday > 0;
      const nextStreak = streakContinues
        ? Math.min(daily.adStreakDays + 1, 5)
        : 0;
      set((state) => ({
        daily: {
          ...state.daily,
          lastOpenDate: today,
          adsWatchedToday: 0,
          adStreakDays: nextStreak,
          todayRewardCollected: false,
        },
      }));
    },

    useZoneSkip: () => {
      const perk = get().perks[PERK_ID.ZoneSkip];
      if (perk === undefined || perk.quantity <= 0) return false;
      set((state) => ({
        perks: {
          ...state.perks,
          [PERK_ID.ZoneSkip]: {
            ...perk,
            quantity: perk.quantity - 1,
          },
        },
      }));
      get().advanceZone();
      return true;
    },
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
