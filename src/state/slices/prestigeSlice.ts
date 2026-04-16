// =============================================================================
// Prestige Slice — Rebirth and Transcendence
// =============================================================================
import type { StateCreator } from "zustand";
import type { PrestigeState } from "~/types/game";
import { EvolutionStage } from "~/types/game";
import { calculateEssenceOnTranscendence } from "../selectors";
import { initialResources } from "./resourceSlice";
import { initialCombo } from "./comboSlice";
import { initialUpgrades } from "./upgradeSlice";
import type { GameStore } from "../store";
import {
  calculateNectarEarned,
  resetBloomlingsForRebirth,
  filterUpgradesForRebirth,
  getStartingZone,
  getStartingComboCount,
  getUpgradeLevel,
  BLOOM_RETENTION_ID,
  ELDER_RETENTION_ID,
  SEASONAL_MEMORY_ID,
  COMBO_MEMORY_ID,
  NECTAR_ROOTS_ID,
} from "~/engine/rebirth";
import {
  PERK_ID,
  REBIRTH_BOOST_MULTIPLIER,
} from "~/data/perkTemplates";

export interface PrestigeSlice {
  prestige: PrestigeState;

  executeRebirth: () => void;
  executeTranscendence: () => void;
}

export const initialPrestige: PrestigeState = {
  rebirthCount: 0,
  currentSeason: 1,
  totalNectarEarned: 0,
  totalNectarSpent: 0,
  currentRunHighestZone: 1,
  allTimeHighestZone: 1,
  rebirthUnlocked: false,
  transcendenceCount: 0,
  totalEssenceEarned: 0,
  totalEssenceSpent: 0,
  transcendenceUnlocked: false,
};

export const createPrestigeSlice: StateCreator<
  GameStore,
  [],
  [],
  PrestigeSlice
> = (set, get) => ({
  prestige: initialPrestige,

  executeRebirth: () => {
    const state = get();

    // Read Nectar upgrade levels that affect the reset.
    const nectarRootsLevel = getUpgradeLevel(state.upgrades, NECTAR_ROOTS_ID);
    const bloomRetLevel = getUpgradeLevel(state.upgrades, BLOOM_RETENTION_ID);
    const elderRetLevel = getUpgradeLevel(state.upgrades, ELDER_RETENTION_ID);
    const seasonalLevel = getUpgradeLevel(state.upgrades, SEASONAL_MEMORY_ID);
    const comboMemLevel = getUpgradeLevel(state.upgrades, COMBO_MEMORY_ID);

    // Instant Rebirth Boost (Dewdrop consumable): +50% Nectar once, consumed here.
    const boostPerk = state.perks[PERK_ID.RebirthBoost];
    const boostAvailable =
      boostPerk !== undefined && boostPerk.quantity > 0;
    const rebirthBoostMultiplier = boostAvailable
      ? REBIRTH_BOOST_MULTIPLIER
      : 1;

    const highestZone = state.prestige.currentRunHighestZone;
    const nectarEarned = calculateNectarEarned(
      highestZone,
      nectarRootsLevel,
      rebirthBoostMultiplier,
    );
    const startingZone = getStartingZone(seasonalLevel);
    const startingCombo = getStartingComboCount(comboMemLevel);

    // Build the updated perks object — only changes if we consumed the boost.
    const newPerks = boostAvailable
      ? {
          ...state.perks,
          [PERK_ID.RebirthBoost]: {
            ...boostPerk,
            quantity: boostPerk.quantity - 1,
          },
        }
      : state.perks;

    set(() => ({
      resources: {
        ...initialResources,
        nectar: state.resources.nectar + nectarEarned,
        dewdrops: state.resources.dewdrops,
        essence: state.resources.essence,
        // totalSunlightEarned persists (it's an all-time stat)
        totalSunlightEarned: state.resources.totalSunlightEarned,
      },
      perks: newPerks,
      // Reset Bloomling levels/evolution, respecting retention upgrades.
      bloomlings: resetBloomlingsForRebirth(
        state.bloomlings,
        bloomRetLevel,
        elderRetLevel,
      ),
      garden: {
        ...state.garden,
        slots: state.garden.slots.map(() => null),
        activeSynergyIds: [],
        specialMeterProgress: 0,
      },
      // Keep Nectar + Essence upgrades; discard Tap + Idle.
      upgrades: filterUpgradesForRebirth(state.upgrades),
      // Reset zone progress (Seasonal Memory may set a higher starting zone).
      zoneProgress: {
        currentZone: startingZone,
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
      // Reset combo (Combo Memory may set a starting count).
      combo: {
        ...initialCombo,
        count: startingCombo,
      },
      // Clear active boosts
      activeBoosts: [],
      prestige: {
        ...state.prestige,
        rebirthCount: state.prestige.rebirthCount + 1,
        currentSeason: state.prestige.currentSeason + 1,
        totalNectarEarned: state.prestige.totalNectarEarned + nectarEarned,
        currentRunHighestZone: startingZone,
        allTimeHighestZone: Math.max(
          state.prestige.allTimeHighestZone,
          state.prestige.currentRunHighestZone,
        ),
      },
      lastTickAt: Date.now(),
    }));
    // Zone/upgrade changes affect garden capacity; Nectar upgrades persist.
    get().syncGardenCapacity();
    // Seasonal Memory can start a rebirth at zone > 1, which may have
    // unlocked additional species the player's save doesn't yet reflect.
    get().discoverBloomlingsForZone(startingZone);
  },

  executeTranscendence: () => {
    const state = get();
    const essenceEarned = calculateEssenceOnTranscendence(state);

    set(() => ({
      resources: {
        ...initialResources,
        essence: state.resources.essence + essenceEarned,
        dewdrops: state.resources.dewdrops,
        totalSunlightEarned: state.resources.totalSunlightEarned,
      },
      // Reset all bloomling levels to 1, Sprout stage
      bloomlings: Object.fromEntries(
        Object.entries(state.bloomlings).map(([id, b]) => [
          id,
          {
            ...b,
            level: 1,
            evolutionStage: EvolutionStage.Sprout,
            inGarden: false,
            gardenSlot: null,
          },
        ])
      ),
      garden: {
        ...state.garden,
        slots: state.garden.slots.map(() => null),
        activeSynergyIds: [],
        specialMeterProgress: 0,
      },
      // Reset ALL upgrades (including Nectar upgrades)
      upgrades: initialUpgrades,
      zoneProgress: {
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
      },
      combo: initialCombo,
      activeBoosts: [],
      prestige: {
        ...state.prestige,
        rebirthCount: 0,
        currentSeason: 1,
        totalNectarEarned: state.prestige.totalNectarEarned,
        totalNectarSpent: state.prestige.totalNectarSpent,
        currentRunHighestZone: 1,
        allTimeHighestZone: Math.max(
          state.prestige.allTimeHighestZone,
          state.prestige.currentRunHighestZone
        ),
        transcendenceCount: state.prestige.transcendenceCount + 1,
        totalEssenceEarned: state.prestige.totalEssenceEarned + essenceEarned,
        transcendenceUnlocked: true,
      },
      lastTickAt: Date.now(),
    }));
    // Full upgrade wipe removes slot-granting upgrades too; recompute capacity.
    get().syncGardenCapacity();
    // Transcendence resets to zone 1. Re-run discovery so the player is
    // guaranteed a Fernley auto-placed in the garden for the new run.
    get().discoverBloomlingsForZone(1);
  },
});
