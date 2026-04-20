import { EvolutionStage, AchievementCategory } from "~/types/game";
import type { Bloomling, Achievement, GardenState, Resources, GameStats, PrestigeState } from "~/types/game";
import {
  computeProgress,
  checkAchievements,
  computeAllProgress,
} from "../achievements";
import type { AchievementState } from "../achievements";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBloomling(id: string, overrides: Partial<Bloomling> = {}): Bloomling {
  return {
    templateId: "fernley",
    instanceId: id,
    level: 1,
    evolutionStage: EvolutionStage.Sprout,
    inGarden: false,
    gardenSlot: null,
    unlocked: true,
    totalProduced: 0,
    ...overrides,
  };
}

function makeAchievement(id: string, target: number, completed = false): Achievement {
  return {
    id,
    name: id,
    description: "",
    category: AchievementCategory.Power,
    hidden: false,
    sunlightReward: 0,
    dewdropReward: 0,
    completed,
    completedAt: completed ? 1000 : null,
    progress: 0,
    target,
  };
}

const emptyGarden: GardenState = {
  maxSlots: 4,
  slots: [],
  activeSynergyIds: [],
  specialMeterProgress: 0,
};

const emptyResources: Resources = {
  sunlight: 0,
  nectar: 0,
  essence: 0,
  dewdrops: 0,
  totalSunlightEarned: 0,
  runSunlightEarned: 0,
};

const emptyStats: GameStats = {
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

const emptyPrestige: PrestigeState = {
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

function buildState(overrides: Partial<AchievementState> = {}): AchievementState {
  return {
    bloomlings: {},
    garden: emptyGarden,
    resources: emptyResources,
    stats: emptyStats,
    prestige: emptyPrestige,
    achievements: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// computeProgress
// ---------------------------------------------------------------------------

describe("computeProgress", () => {
  describe("Growth achievements", () => {
    it("'first_sprout': counts unlocked bloomlings", () => {
      const state = buildState({
        bloomlings: {
          a: makeBloomling("a"),
          b: makeBloomling("b"),
        },
      });
      expect(computeProgress("first_sprout", state)).toBe(2);
    });

    it("'full_bloom': returns 1 when any Bloom-stage bloomling exists", () => {
      const state = buildState({
        bloomlings: {
          a: makeBloomling("a", { evolutionStage: EvolutionStage.Bloom }),
        },
      });
      expect(computeProgress("full_bloom", state)).toBe(1);
    });

    it("'full_bloom': returns 0 when no Bloom/Elder bloomling exists", () => {
      const state = buildState({ bloomlings: { a: makeBloomling("a") } });
      expect(computeProgress("full_bloom", state)).toBe(0);
    });

    it("'wise_beyond_your_ears': returns 1 when any Elder exists", () => {
      const state = buildState({
        bloomlings: { a: makeBloomling("a", { evolutionStage: EvolutionStage.Elder }) },
      });
      expect(computeProgress("wise_beyond_your_ears", state)).toBe(1);
    });

    it("'wise_beyond_your_ears': returns 0 when no Elder", () => {
      const state = buildState({ bloomlings: { a: makeBloomling("a") } });
      expect(computeProgress("wise_beyond_your_ears", state)).toBe(0);
    });

    it("'best_friends': returns 1 when synergiesDiscovered >= 1", () => {
      const state = buildState({ stats: { ...emptyStats, synergiesDiscovered: 1 } });
      expect(computeProgress("best_friends", state)).toBe(1);
    });

    it("'best_friends': returns 0 when synergiesDiscovered = 0", () => {
      expect(computeProgress("best_friends", buildState())).toBe(0);
    });

    it("'elder_council': counts garden bloomlings at Elder stage", () => {
      const state = buildState({
        bloomlings: {
          a: makeBloomling("a", { inGarden: true, evolutionStage: EvolutionStage.Elder }),
          b: makeBloomling("b", { inGarden: true, evolutionStage: EvolutionStage.Bloom }),
          c: makeBloomling("c", { inGarden: true, evolutionStage: EvolutionStage.Elder }),
        },
        garden: { ...emptyGarden, slots: ["a", "b", "c"] },
      });
      expect(computeProgress("elder_council", state)).toBe(2);
    });

    it("'dream_team': returns length of activeSynergyIds", () => {
      const state = buildState({
        garden: { ...emptyGarden, activeSynergyIds: ["syn1", "syn2"] },
      });
      expect(computeProgress("dream_team", state)).toBe(2);
    });
  });

  describe("Power achievements", () => {
    it("'sunshine' / 'solar_flare' / 'supernova': returns totalSunlightEarned", () => {
      const state = buildState({
        resources: { ...emptyResources, totalSunlightEarned: 9999 },
      });
      expect(computeProgress("sunshine", state)).toBe(9999);
      expect(computeProgress("solar_flare", state)).toBe(9999);
      expect(computeProgress("supernova", state)).toBe(9999);
    });

    it("'tap_dancer' / 'itchy_fingers': returns totalTaps", () => {
      const state = buildState({ stats: { ...emptyStats, totalTaps: 1234 } });
      expect(computeProgress("tap_dancer", state)).toBe(1234);
    });

    it("'combo_breaker' / 'combo_royale': returns highestCombo", () => {
      const state = buildState({ stats: { ...emptyStats, highestCombo: 77 } });
      expect(computeProgress("combo_breaker", state)).toBe(77);
    });

    it("'critical_mass' / 'critical_thinking': returns totalCriticalTaps", () => {
      const state = buildState({ stats: { ...emptyStats, totalCriticalTaps: 500 } });
      expect(computeProgress("critical_mass", state)).toBe(500);
    });
  });

  describe("Journey achievements", () => {
    it("zone achievements return allTimeHighestZone", () => {
      const state = buildState({
        prestige: { ...emptyPrestige, allTimeHighestZone: 42 },
      });
      const zoneAchievements = [
        "first_steps",
        "into_the_wild",
        "twilight_explorer",
        "deep_diver",
        "century_mark",
        "zone_crusher",
        "into_the_beyond",
      ];
      for (const id of zoneAchievements) {
        expect(computeProgress(id, state)).toBe(42);
      }
    });
  });

  describe("Rebirth achievements", () => {
    it("'new_season' / 'seasonal_veteran' / 'perennial': returns rebirthCount", () => {
      const state = buildState({ prestige: { ...emptyPrestige, rebirthCount: 5 } });
      expect(computeProgress("new_season", state)).toBe(5);
      expect(computeProgress("seasonal_veteran", state)).toBe(5);
      expect(computeProgress("perennial", state)).toBe(5);
    });

    it("'nectar_hoarder': returns totalNectarEarned", () => {
      const state = buildState({ prestige: { ...emptyPrestige, totalNectarEarned: 300 } });
      expect(computeProgress("nectar_hoarder", state)).toBe(300);
    });

    it("'transcendent' / 'beyond_mortal': returns transcendenceCount", () => {
      const state = buildState({ prestige: { ...emptyPrestige, transcendenceCount: 2 } });
      expect(computeProgress("transcendent", state)).toBe(2);
    });

    it("'night_owl': returns nightOwlOfflineCollections", () => {
      const state = buildState({ stats: { ...emptyStats, nightOwlOfflineCollections: 3 } });
      expect(computeProgress("night_owl", state)).toBe(3);
    });
  });

  describe("Hidden / event-driven achievements", () => {
    it("returns -1 for event-driven achievements", () => {
      const state = buildState();
      expect(computeProgress("patient_gardener", state)).toBe(-1);
      expect(computeProgress("speed_demon", state)).toBe(-1);
      expect(computeProgress("stubborn_sprout", state)).toBe(-1);
      expect(computeProgress("hat_trick", state)).toBe(-1);
    });
  });

  describe("'completionist'", () => {
    it("counts non-completionist achievements that are completed", () => {
      const state = buildState({
        achievements: {
          sunshine: { ...makeAchievement("sunshine", 1), completed: true, completedAt: 1 },
          tap_dancer: { ...makeAchievement("tap_dancer", 1), completed: true, completedAt: 1 },
          completionist: makeAchievement("completionist", 10),
        },
      });
      expect(computeProgress("completionist", state)).toBe(2);
    });
  });

  describe("unknown achievement ID", () => {
    it("returns 0 for unknown IDs", () => {
      expect(computeProgress("totally_unknown_id", buildState())).toBe(0);
    });
  });
});

// ---------------------------------------------------------------------------
// checkAchievements
// ---------------------------------------------------------------------------

describe("checkAchievements", () => {
  it("returns IDs of achievements that qualify for completion", () => {
    const state = buildState({
      stats: { ...emptyStats, totalTaps: 1 },
      achievements: {
        tap_dancer: makeAchievement("tap_dancer", 1), // target=1, progress will be 1
      },
    });
    const result = checkAchievements(state);
    expect(result).toContain("tap_dancer");
  });

  it("does not return already-completed achievements", () => {
    const state = buildState({
      stats: { ...emptyStats, totalTaps: 1000 },
      achievements: {
        tap_dancer: {
          ...makeAchievement("tap_dancer", 1),
          completed: true,
          completedAt: 1,
        },
      },
    });
    expect(checkAchievements(state)).not.toContain("tap_dancer");
  });

  it("does not return event-driven achievements", () => {
    const state = buildState({
      achievements: {
        patient_gardener: makeAchievement("patient_gardener", 1),
        hat_trick: makeAchievement("hat_trick", 1),
      },
    });
    const result = checkAchievements(state);
    expect(result).not.toContain("patient_gardener");
    expect(result).not.toContain("hat_trick");
  });

  it("does not return achievements with progress below target", () => {
    const state = buildState({
      stats: { ...emptyStats, totalTaps: 5 },
      achievements: {
        itchy_fingers: makeAchievement("itchy_fingers", 10000),
      },
    });
    expect(checkAchievements(state)).not.toContain("itchy_fingers");
  });

  it("returns empty array when no achievements qualify", () => {
    const state = buildState({ achievements: {} });
    expect(checkAchievements(state)).toEqual([]);
  });

  it("can return multiple qualifying achievements at once", () => {
    const state = buildState({
      stats: { ...emptyStats, totalTaps: 100 },
      achievements: {
        tap_dancer: makeAchievement("tap_dancer", 1),
        itchy_fingers: makeAchievement("itchy_fingers", 50),
      },
    });
    const result = checkAchievements(state);
    expect(result).toContain("tap_dancer");
    expect(result).toContain("itchy_fingers");
  });
});

// ---------------------------------------------------------------------------
// computeAllProgress
// ---------------------------------------------------------------------------

describe("computeAllProgress", () => {
  it("returns target value for completed achievements", () => {
    const state = buildState({
      achievements: {
        tap_dancer: {
          ...makeAchievement("tap_dancer", 1000),
          completed: true,
          completedAt: 1,
        },
      },
    });
    const all = computeAllProgress(state);
    expect(all["tap_dancer"]).toBe(1000);
  });

  it("returns computed progress for incomplete achievements", () => {
    const state = buildState({
      stats: { ...emptyStats, totalTaps: 42 },
      achievements: {
        tap_dancer: makeAchievement("tap_dancer", 1000),
      },
    });
    const all = computeAllProgress(state);
    expect(all["tap_dancer"]).toBe(42);
  });

  it("returns achievement.progress for event-driven incomplete achievements", () => {
    const ach = makeAchievement("hat_trick", 1);
    ach.progress = 3;
    const state = buildState({
      achievements: { hat_trick: ach },
    });
    const all = computeAllProgress(state);
    expect(all["hat_trick"]).toBe(3);
  });

  it("returns an entry for every achievement in the map", () => {
    const state = buildState({
      stats: { ...emptyStats, totalTaps: 100 },
      achievements: {
        tap_dancer: makeAchievement("tap_dancer", 1000),
        sunshine: makeAchievement("sunshine", 1000),
      },
    });
    const all = computeAllProgress(state);
    expect(Object.keys(all)).toHaveLength(2);
  });
});
