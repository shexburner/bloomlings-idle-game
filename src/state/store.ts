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
  Achievement,
  DailyState,
  GameStats,
  OfflineSessionSummary,
  Perk,
  Synergy,
  ZoneProgressState,
} from "~/types/game";
import { AdTouchpoint } from "~/types/game";
import { PERK_ID, PERK_TEMPLATE_MAP } from "~/data/perkTemplates";
import { buildInitialAchievements } from "~/data/achievementTemplates";
import { DEWDROP_SLOT_PERK_ID } from "~/engine/garden";
import { getBloomlingTemplate } from "~/data/bloomlingTemplates";
import { totalSunlightPerSecondFromRegistry } from "./selectors";
import { checkAchievements } from "~/engine/achievements";
import {
  LuckySproutReward,
  LUCKY_SPROUT_BONUS_SUNLIGHT_SECONDS,
  LUCKY_SPROUT_DEWDROP_AMOUNT,
  LUCKY_SPROUT_NECTAR_BONUS_MULTIPLIER,
  LUCKY_SPROUT_TAP_BOOST_DURATION_MS,
} from "~/engine/luckySprout";

// -----------------------------------------------------------------------------
// Touchpoint Constants (docs/design/05-ad-economy.md)
// -----------------------------------------------------------------------------

/** Sunbeam Boost: 2× production for 10 minutes. */
const SUNBEAM_BOOST_DURATION_MS = 10 * 60 * 1000;
const SUNBEAM_BOOST_MULTIPLIER = 2;

/** Combo Keeper: freeze combo decay for 5 minutes. */
const COMBO_KEEPER_FREEZE_DURATION_MS = 5 * 60 * 1000;
/** Combo Keeper: 30-minute cooldown between ads. */
const COMBO_KEEPER_COOLDOWN_MS = 30 * 60 * 1000;

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
  /**
   * True when a Lucky Sprout pop-up is waiting for the player. Cleared when
   * the reward is granted or the modal is dismissed. NOT persisted — the
   * game loop re-triggers on its own cadence.
   */
  luckySproutPending: boolean;
  /**
   * ms timestamp of the most recent Lucky Sprout trigger (pending or
   * resolved). Used to schedule the next 10–15 min appearance. Persisted so
   * closing the app doesn't let the player force an immediate pop-up by
   * relaunching.
   */
  lastLuckySproutAt: number | null;
  /**
   * ms timestamp when the Lucky Sprout tap-boost reward expires, or null if
   * no boost is active. Unlike `activeBoosts` (idle-only), this multiplier is
   * applied inside the tap path. Persisted so the boost survives app restart.
   */
  luckySproutTapBoostExpiresAt: number | null;
  /**
   * ms timestamp of the last Combo Keeper ad watch, used to enforce the
   * 30-minute cooldown (docs/design/05-ad-economy.md §Combo Keeper).
   * Persisted so the cooldown survives app restart.
   */
  lastComboKeeperAt: number | null;
  /**
   * Multiplier queued for the next Rebirth's Nectar payout, or null if none
   * pending. Granted by the Lucky Sprout NextRebirthBoost reward. Consumed
   * and cleared inside `executeRebirth`. Persisted.
   */
  pendingNectarBonus: number | null;
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

  // --- Ad touchpoint rewards ---
  /**
   * Apply the Sunbeam Boost ad reward: 2× Sunlight production for 10 minutes.
   * Appends an `ActiveBoost` to `activeBoosts`; multiple consecutive watches
   * stack duration (each adds its own entry) but don't stack multiplier
   * because the idle selector multiplies all active boosts together — kept
   * simple: latest replaces existing.
   */
  applySunbeamBoost: () => void;
  /**
   * Apply the Combo Keeper ad reward: freeze combo decay for 5 minutes and
   * stamp the 30-minute cooldown. Returns true on success, false if the
   * cooldown is still active.
   */
  applyComboKeeper: () => boolean;
  /**
   * Mark a Lucky Sprout appearance as pending. Safe to call even if already
   * pending (idempotent). Records `lastLuckySproutAt` so the next interval
   * is scheduled from this moment.
   */
  triggerLuckySprout: () => void;
  /**
   * Dismiss a pending Lucky Sprout without granting a reward (modal close or
   * ad unavailability). Keeps `lastLuckySproutAt` — the next spawn is still
   * ~10–15 min out, not immediate.
   */
  clearLuckySprout: () => void;
  /**
   * Grant a rolled Lucky Sprout reward. Clears the pending flag as part of
   * the transaction. Returns a description context the modal can render.
   */
  applyLuckySproutReward: (
    reward: LuckySproutReward
  ) => { bonusSunlight: number; freeLevelUpBloomlingName: string | null };

  // --- Achievements ---
  /**
   * Check all passively-computable achievements against current state. Marks
   * newly-completed ones, grants their rewards, and bumps
   * `stats.achievementsCompleted`. Safe to call frequently — no-op when
   * nothing is newly complete.
   */
  checkAndGrantAchievements: () => void;
  /**
   * Directly complete a hidden/event-driven achievement by ID. No-op if
   * already completed or the ID is unknown. Used for achievements that cannot
   * be evaluated from static store state (e.g. "patient_gardener").
   */
  triggerHiddenAchievement: (id: string) => void;
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
  nightOwlOfflineCollections: 0,
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
    achievements: buildInitialAchievements(),
    synergies: {},
    stats: initialStats,
    lastTickAt: Date.now(),
    lastActiveAt: Date.now(),
    engineRunning: false,
    lastOfflineSession: null,
    luckySproutPending: false,
    lastLuckySproutAt: null,
    luckySproutTapBoostExpiresAt: null,
    lastComboKeeperAt: null,
    pendingNectarBonus: null,
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
      // Check zone/growth achievements after each zone advance.
      get().checkAndGrantAchievements();
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

    // --- Ad touchpoint rewards ---

    applySunbeamBoost: () => {
      const now = Date.now();
      const boost: ActiveBoost = {
        source: AdTouchpoint.SunbeamBoost,
        multiplier: SUNBEAM_BOOST_MULTIPLIER,
        expiresAt: now + SUNBEAM_BOOST_DURATION_MS,
      };
      set((state) => {
        // Keep non-Sunbeam boosts untouched, replace any pre-existing Sunbeam
        // boost so duration refreshes cleanly rather than stacking multiplier.
        const others = state.activeBoosts.filter(
          (b) => b.source !== AdTouchpoint.SunbeamBoost
        );
        return {
          activeBoosts: [...others, boost],
          stats: {
            ...state.stats,
            totalAdsWatched: state.stats.totalAdsWatched + 1,
          },
        };
      });
    },

    applyComboKeeper: () => {
      const now = Date.now();
      const { lastComboKeeperAt } = get();
      if (
        lastComboKeeperAt !== null &&
        now - lastComboKeeperAt < COMBO_KEEPER_COOLDOWN_MS
      ) {
        return false;
      }
      get().setComboFrozen(true, now + COMBO_KEEPER_FREEZE_DURATION_MS);
      set((state) => ({
        lastComboKeeperAt: now,
        stats: {
          ...state.stats,
          totalAdsWatched: state.stats.totalAdsWatched + 1,
        },
      }));
      return true;
    },

    triggerLuckySprout: () => {
      set({ luckySproutPending: true, lastLuckySproutAt: Date.now() });
    },

    clearLuckySprout: () => {
      set({ luckySproutPending: false });
    },

    applyLuckySproutReward: (reward: LuckySproutReward) => {
      const now = Date.now();
      let bonusSunlight = 0;
      let freeLevelUpBloomlingName: string | null = null;

      switch (reward) {
        case LuckySproutReward.BonusSunlight: {
          const state = get();
          const idleRate = totalSunlightPerSecondFromRegistry({
            bloomlings: state.bloomlings,
            garden: state.garden,
            upgrades: state.upgrades,
          });
          // Guarantee a small payout if the player has no Garden production yet.
          bonusSunlight = Math.max(
            idleRate * LUCKY_SPROUT_BONUS_SUNLIGHT_SECONDS,
            10
          );
          state.addSunlight(bonusSunlight);
          break;
        }
        case LuckySproutReward.TapBoost: {
          set((s) => ({
            luckySproutTapBoostExpiresAt:
              Math.max(s.luckySproutTapBoostExpiresAt ?? 0, now) +
              LUCKY_SPROUT_TAP_BOOST_DURATION_MS,
          }));
          break;
        }
        case LuckySproutReward.Dewdrop: {
          get().addDewdrops(LUCKY_SPROUT_DEWDROP_AMOUNT);
          break;
        }
        case LuckySproutReward.FreeLevelUp: {
          const state = get();
          // Pick any unlocked Bloomling under level 100. Falls back to zero
          // state (no-op) if the player has no eligible Bloomling.
          const candidates = Object.values(state.bloomlings).filter(
            (b) => b.unlocked && b.level < 100
          );
          if (candidates.length > 0) {
            const picked =
              candidates[Math.floor(Math.random() * candidates.length)]!;
            set((s) => ({
              bloomlings: {
                ...s.bloomlings,
                [picked.instanceId]: {
                  ...picked,
                  level: picked.level + 1,
                },
              },
            }));
            freeLevelUpBloomlingName =
              getBloomlingTemplate(picked.templateId)?.name ??
              picked.templateId;
          }
          break;
        }
        case LuckySproutReward.NextRebirthBoost: {
          // Stack multiplicatively with any pre-existing queued bonus.
          set((s) => ({
            pendingNectarBonus:
              (s.pendingNectarBonus ?? 1) *
              LUCKY_SPROUT_NECTAR_BONUS_MULTIPLIER,
          }));
          break;
        }
      }

      set((state) => ({
        luckySproutPending: false,
        stats: {
          ...state.stats,
          totalAdsWatched: state.stats.totalAdsWatched + 1,
        },
      }));

      return { bonusSunlight, freeLevelUpBloomlingName };
    },

    // --- Achievements ---

    checkAndGrantAchievements: () => {
      const state = get();
      const newlyCompleted = checkAchievements(state);
      if (newlyCompleted.length === 0) return;

      const now = Date.now();
      let totalSunlight = 0;
      let totalDewdrops = 0;

      set((s) => {
        const updated = { ...s.achievements };
        for (const id of newlyCompleted) {
          const achievement = updated[id];
          if (achievement === undefined || achievement.completed) continue;
          updated[id] = {
            ...achievement,
            completed: true,
            completedAt: now,
            progress: achievement.target,
          };
          totalSunlight += achievement.sunlightReward;
          totalDewdrops += achievement.dewdropReward;
        }
        return {
          achievements: updated,
          stats: {
            ...s.stats,
            achievementsCompleted:
              s.stats.achievementsCompleted + newlyCompleted.length,
          },
        };
      });

      if (totalSunlight > 0) get().addSunlight(totalSunlight);
      if (totalDewdrops > 0) get().addDewdrops(totalDewdrops);

      // Check completionist separately: it depends on other achievements.
      const afterState = get();
      const completionist = afterState.achievements["completionist"];
      if (completionist !== undefined && !completionist.completed) {
        const doneCount = Object.values(afterState.achievements).filter(
          (a) => a.id !== "completionist" && a.completed
        ).length;
        if (doneCount >= completionist.target) {
          const now2 = Date.now();
          set((s) => ({
            achievements: {
              ...s.achievements,
              completionist: {
                ...completionist,
                completed: true,
                completedAt: now2,
                progress: completionist.target,
              },
            },
            stats: {
              ...s.stats,
              achievementsCompleted: s.stats.achievementsCompleted + 1,
            },
          }));
          if (completionist.dewdropReward > 0) {
            get().addDewdrops(completionist.dewdropReward);
          }
        }
      }
    },

    triggerHiddenAchievement: (id: string) => {
      const state = get();
      const achievement = state.achievements[id];
      if (achievement === undefined || achievement.completed) return;
      const now = Date.now();
      set((s) => ({
        achievements: {
          ...s.achievements,
          [id]: {
            ...achievement,
            completed: true,
            completedAt: now,
            progress: achievement.target,
          },
        },
        stats: {
          ...s.stats,
          achievementsCompleted: s.stats.achievementsCompleted + 1,
        },
      }));
      if (achievement.sunlightReward > 0) get().addSunlight(achievement.sunlightReward);
      if (achievement.dewdropReward > 0) get().addDewdrops(achievement.dewdropReward);
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
