// =============================================================================
// Prestige Slice — Rebirth and Transcendence
// =============================================================================
import type { StateCreator } from "zustand";
import type { PrestigeState } from "~/types/game";
import { EvolutionStage } from "~/types/game";
import { calculateNectarOnRebirth, calculateEssenceOnTranscendence } from "../selectors";
import { initialResources } from "./resourceSlice";
import { initialCombo } from "./comboSlice";
import { initialUpgrades } from "./upgradeSlice";
import type { GameStore } from "../store";

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
    const nectarEarned = calculateNectarOnRebirth(state);

    set(() => ({
      resources: {
        ...initialResources,
        nectar: state.resources.nectar + nectarEarned,
        dewdrops: state.resources.dewdrops,
        // totalSunlightEarned persists (it's an all-time stat)
        totalSunlightEarned: state.resources.totalSunlightEarned,
      },
      // Reset all bloomling levels to 1 and evolution to Sprout
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
      // Reset tap and idle upgrades, keep Nectar/Essence upgrades
      upgrades: initialUpgrades,
      // Reset zone progress
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
      // Reset combo
      combo: initialCombo,
      // Clear active boosts
      activeBoosts: [],
      prestige: {
        ...state.prestige,
        rebirthCount: state.prestige.rebirthCount + 1,
        currentSeason: state.prestige.currentSeason + 1,
        totalNectarEarned: state.prestige.totalNectarEarned + nectarEarned,
        currentRunHighestZone: 1,
        allTimeHighestZone: Math.max(
          state.prestige.allTimeHighestZone,
          state.prestige.currentRunHighestZone
        ),
      },
      lastTickAt: Date.now(),
    }));
    // Zone reset to 1 removes zone-based slot unlocks; Nectar upgrades persist.
    get().syncGardenCapacity();
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
  },
});
