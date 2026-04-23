// =============================================================================
// Bloomling Slice — Bloomling collection, leveling, evolution, garden management
// =============================================================================
import type { StateCreator } from "zustand";
import type { Bloomling } from "~/types/game";
import type { GameStore } from "../store";
import {
  canEvolve,
  getEvolutionCost,
  evolveBloomling as evolveBloomlingPure,
} from "~/engine/evolution";
import {
  applyCapacityChange,
  placeBloomlingInSlot,
  removeBloomlingFromGarden,
} from "~/engine/garden";
import {
  calculateActiveSynergies,
  reconcileSynergyDiscovery,
} from "~/engine/synergies";
import {
  EVOLUTION_SHARD_DISCOUNT,
  PERK_ID,
} from "~/data/perkTemplates";
import {
  createBloomlingInstance,
  getZoneUnlockTemplates,
} from "~/engine/discovery";
import { getUpgradeLevel } from "~/engine/rebirth";
import { calculateLevelUpCost } from "../selectors";
import { getBloomlingTemplate } from "~/data/bloomlingTemplates";
import { trackEvent } from "~/services/analyticsService";

const EVOLUTION_SHARD_PERK_ID = PERK_ID.EvolutionShard;

export interface BloomlingSlice {
  bloomlings: Record<string, Bloomling>;
  garden: {
    maxSlots: number;
    slots: (string | null)[];
    activeSynergyIds: string[];
    specialMeterProgress: number;
  };

  addBloomling: (bloomling: Bloomling) => void;
  removeBloomling: (instanceId: string) => void;
  levelUpBloomling: (instanceId: string) => void;
  evolveBloomling: (instanceId: string) => void;
  addToGarden: (instanceId: string, slotIndex: number) => void;
  removeFromGarden: (instanceId: string) => void;
  /**
   * Grant any zone-milestone Bloomlings whose threshold has been met and
   * that are not already owned. The very first Bloomling ever discovered is
   * auto-placed into garden slot 0 so idle production starts immediately.
   * Safe to call repeatedly — idempotent when nothing new qualifies.
   */
  discoverBloomlingsForZone: (zone: number) => void;
  /**
   * Run `discoverBloomlingsForZone` for the current zone. Call once after
   * the save is loaded so fresh installs receive Fernley (zone 1) and
   * returning players retroactively receive everything their save earned
   * before this feature existed.
   */
  ensureInitialDiscoveries: () => void;
  /**
   * Recompute the garden's max slots from progression, upgrades, and perks,
   * and resize the slot array accordingly. Call this after any change to
   * zoneProgress, upgrades, or perks that could alter capacity.
   */
  syncGardenCapacity: () => void;
  /**
   * Recompute which synergies are active from the current Garden roster and
   * write them to `garden.activeSynergyIds`. Also folds any newly activated
   * synergies into `stats.discoveredSynergyIds` so Phase 5 can fire Dewdrop
   * rewards on first discovery. Safe to call repeatedly — no-op if nothing
   * changed.
   */
  recomputeActiveSynergies: () => void;
}

export const initialBloomlings: Record<string, Bloomling> = {};

export const initialGarden = {
  maxSlots: 1,
  slots: [null] as (string | null)[],
  activeSynergyIds: [] as string[],
  specialMeterProgress: 0,
};

export const createBloomlingSlice: StateCreator<
  GameStore,
  [],
  [],
  BloomlingSlice
> = (set, get) => ({
  bloomlings: initialBloomlings,
  garden: initialGarden,

  addBloomling: (bloomling: Bloomling) =>
    set((state) => ({
      bloomlings: {
        ...state.bloomlings,
        [bloomling.instanceId]: bloomling,
      },
    })),

  removeBloomling: (instanceId: string) => {
    set((state) => {
      const { [instanceId]: _removed, ...remaining } = state.bloomlings;
      // Also remove from garden if placed
      const newSlots = state.garden.slots.map((slotId) =>
        slotId === instanceId ? null : slotId
      );
      return {
        bloomlings: remaining,
        garden: { ...state.garden, slots: newSlots },
      };
    });
    get().recomputeActiveSynergies();
  },

  levelUpBloomling: (instanceId: string) =>
    set((state) => {
      const bloomling = state.bloomlings[instanceId];
      if (!bloomling || bloomling.level >= 100) {
        return state;
      }
      const template = getBloomlingTemplate(bloomling.templateId);
      if (!template) {
        return state;
      }

      const rapidGrowthLevel = getUpgradeLevel(state.upgrades, "rapid_growth");
      const cost = calculateLevelUpCost(
        template.baseLevelCost,
        bloomling.level,
        rapidGrowthLevel
      );
      if (state.resources.sunlight < cost) {
        return state;
      }

      return {
        bloomlings: {
          ...state.bloomlings,
          [instanceId]: {
            ...bloomling,
            level: bloomling.level + 1,
          },
        },
        resources: {
          ...state.resources,
          sunlight: state.resources.sunlight - cost,
        },
      };
    }),

  evolveBloomling: (instanceId: string) => {
    set((state) => {
      const bloomling = state.bloomlings[instanceId];
      if (!bloomling) {
        return state;
      }

      // Evolution Shard (Dewdrop perk): consumes one charge to halve cost.
      const shardPerk = state.perks[EVOLUTION_SHARD_PERK_ID];
      const shardAvailable =
        shardPerk !== undefined && shardPerk.quantity > 0;
      const discountFactor = shardAvailable ? EVOLUTION_SHARD_DISCOUNT : 1;

      // Check eligibility using the evolution engine
      if (!canEvolve(bloomling, state.resources, discountFactor)) {
        return state;
      }

      // Calculate and deduct costs
      const cost = getEvolutionCost(bloomling, discountFactor);
      const newSunlight = state.resources.sunlight - cost.sunlight;
      const newNectar = state.resources.nectar - cost.nectar;

      // Apply evolution transformation
      const evolved = evolveBloomlingPure(bloomling);

      // Consume the shard (if any) so it applies to at most one evolution.
      const newPerks = shardAvailable
        ? {
            ...state.perks,
            [EVOLUTION_SHARD_PERK_ID]: {
              ...shardPerk,
              quantity: shardPerk.quantity - 1,
            },
          }
        : state.perks;

      return {
        bloomlings: {
          ...state.bloomlings,
          [instanceId]: evolved,
        },
        resources: {
          ...state.resources,
          sunlight: newSunlight,
          nectar: newNectar,
        },
        perks: newPerks,
      };
    });
    trackEvent("bloomling_evolved", { bloomling_id: instanceId, new_stage: get().bloomlings[instanceId]?.evolutionStage ?? "" });
    // Reaching Elder stage can unlock new tag synergies.
    get().recomputeActiveSynergies();
    // Evolution may complete growth achievements (Bloom/Elder stage).
    get().checkAndGrantAchievements();
  },

  addToGarden: (instanceId: string, slotIndex: number) => {
    set((state) => {
      const result = placeBloomlingInSlot(state, instanceId, slotIndex);
      if (result === null) return state;
      return {
        bloomlings: result.bloomlings,
        garden: result.garden,
      };
    });
    get().recomputeActiveSynergies();
  },

  removeFromGarden: (instanceId: string) => {
    set((state) => {
      const result = removeBloomlingFromGarden(state, instanceId);
      if (result === null) return state;
      return {
        bloomlings: result.bloomlings,
        garden: result.garden,
      };
    });
    get().recomputeActiveSynergies();
  },

  discoverBloomlingsForZone: (zone: number) => {
    set((state) => {
      const newTemplates = getZoneUnlockTemplates(zone, state.bloomlings);
      if (newTemplates.length === 0) {
        return state;
      }

      const wasEmpty = Object.keys(state.bloomlings).length === 0;

      // Merge new instances into the bloomlings record.
      const newInstances = newTemplates.map(createBloomlingInstance);
      const mergedBloomlings: Record<string, Bloomling> = {
        ...state.bloomlings,
      };
      for (const instance of newInstances) {
        mergedBloomlings[instance.instanceId] = instance;
      }

      // Auto-place the very first Bloomling into slot 0 so idle production
      // starts immediately on fresh installs. Later discoveries go to the
      // collection and require manual placement by the player.
      let nextGarden = state.garden;
      let finalBloomlings = mergedBloomlings;
      const firstInstance = wasEmpty ? newInstances[0] : undefined;
      if (firstInstance) {
        const result = placeBloomlingInSlot(
          {
            bloomlings: mergedBloomlings,
            garden: state.garden,
            zoneProgress: state.zoneProgress,
            upgrades: state.upgrades,
            perks: state.perks,
          },
          firstInstance.instanceId,
          0
        );
        if (result !== null) {
          finalBloomlings = result.bloomlings;
          nextGarden = result.garden;
        }
      }

      return {
        bloomlings: finalBloomlings,
        garden: nextGarden,
        stats: {
          ...state.stats,
          bloomlingsDiscovered: Object.keys(finalBloomlings).length,
        },
      };
    });
    // Newly-placed Bloomlings may activate synergies.
    get().recomputeActiveSynergies();
    // Discovery may complete collector/growth achievements.
    get().checkAndGrantAchievements();
  },

  ensureInitialDiscoveries: () => {
    get().discoverBloomlingsForZone(get().zoneProgress.currentZone);
  },

  syncGardenCapacity: () => {
    set((state) => {
      const result = applyCapacityChange(state);
      if (
        result.maxSlots === state.garden.maxSlots &&
        result.slots === state.garden.slots &&
        result.bloomlings === state.bloomlings
      ) {
        return state;
      }
      return {
        bloomlings: result.bloomlings,
        garden: {
          ...state.garden,
          maxSlots: result.maxSlots,
          slots: result.slots,
        },
      };
    });
    // Capacity changes can evict Bloomlings, which changes synergies.
    get().recomputeActiveSynergies();
  },

  recomputeActiveSynergies: () =>
    set((state) => {
      // Collect the Bloomlings currently in the Garden.
      const gardenBloomlings: Bloomling[] = [];
      for (const slotId of state.garden.slots) {
        if (slotId === null) continue;
        const b = state.bloomlings[slotId];
        if (b) gardenBloomlings.push(b);
      }

      const active = calculateActiveSynergies(
        gardenBloomlings,
        getBloomlingTemplate
      );

      // Update active IDs if they changed.
      const prevIds = state.garden.activeSynergyIds;
      const nextIds = active.activeSynergyIds;
      const idsChanged =
        prevIds.length !== nextIds.length ||
        prevIds.some((id, i) => id !== nextIds[i]);

      // Fold any newly active synergies into the lifetime discovery list.
      const discovery = reconcileSynergyDiscovery(
        state.stats.discoveredSynergyIds,
        nextIds
      );
      const discoveryChanged = discovery.newlyDiscovered.length > 0;

      if (!idsChanged && !discoveryChanged) {
        return state;
      }

      return {
        garden: idsChanged
          ? { ...state.garden, activeSynergyIds: [...nextIds] }
          : state.garden,
        stats: discoveryChanged
          ? {
              ...state.stats,
              discoveredSynergyIds: [...discovery.discoveredSynergyIds],
              synergiesDiscovered: discovery.discoveredSynergyIds.length,
            }
          : state.stats,
      };
    }),
});
