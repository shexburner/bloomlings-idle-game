// =============================================================================
// Achievements Engine — Progress checking and reward granting
// =============================================================================
// Pure functions that read from GameStore state and return newly-completed
// achievement IDs. Side-effect-free; apply results via the store action
// `checkAndGrantAchievements`.
//
// Hidden achievements that depend on events not captured in static state
// (gate-fail-then-clear, zone speed run, cosmetics, night-owl offline) are
// handled by `triggerHiddenAchievement` — called from specific event sites
// rather than the passive check loop.
// =============================================================================

import { EvolutionStage, type Achievement } from "~/types/game";
import type { GameStore } from "~/state/store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A partial GameStore snapshot sufficient for achievement checking. */
export type AchievementState = Pick<
  GameStore,
  | "bloomlings"
  | "garden"
  | "resources"
  | "stats"
  | "prestige"
  | "achievements"
>;

/** Map from achievement ID to its computed current progress. */
export type AchievementProgress = Record<string, number>;

// ---------------------------------------------------------------------------
// Hidden achievement IDs that are event-driven (not passively computable)
// ---------------------------------------------------------------------------

/** These IDs skip the passive progress-check loop. */
const EVENT_DRIVEN_ACHIEVEMENT_IDS = new Set([
  "patient_gardener",
  "speed_demon",
  "stubborn_sprout",
  "hat_trick",
]);

// ---------------------------------------------------------------------------
// Per-achievement progress computers
// ---------------------------------------------------------------------------

/**
 * Returns the current progress value for a given achievement ID.
 * Returns -1 for event-driven achievements (checked separately).
 */
export function computeProgress(
  id: string,
  state: AchievementState
): number {
  const bloomlings = Object.values(state.bloomlings);
  const gardenBloomlings = bloomlings.filter((b) => b.inGarden);

  switch (id) {
    // --- Growth ---
    case "first_sprout":
      return bloomlings.filter((b) => b.unlocked).length;

    case "full_bloom":
      return bloomlings.some(
        (b) =>
          b.evolutionStage === EvolutionStage.Bloom ||
          b.evolutionStage === EvolutionStage.Elder
      )
        ? 1
        : 0;

    case "wise_beyond_your_ears":
      return bloomlings.some(
        (b) => b.evolutionStage === EvolutionStage.Elder
      )
        ? 1
        : 0;

    case "the_collector":
      return bloomlings.filter((b) => b.unlocked).length;

    case "greenhouse_gala":
      return bloomlings.filter((b) => b.unlocked).length;

    case "best_friends":
      return state.stats.synergiesDiscovered >= 1 ? 1 : 0;

    case "dream_team":
      // Count active synergy IDs as a proxy for number of Bloomlings involved
      return state.garden.activeSynergyIds.length;

    case "elder_council":
      return gardenBloomlings.filter(
        (b) => b.evolutionStage === EvolutionStage.Elder
      ).length;

    // --- Power ---
    case "sunshine":
    case "solar_flare":
    case "supernova":
      return state.resources.totalSunlightEarned;

    case "tap_dancer":
    case "itchy_fingers":
      return state.stats.totalTaps;

    case "combo_breaker":
    case "combo_royale":
      return state.stats.highestCombo;

    case "critical_mass":
    case "critical_thinking":
      return state.stats.totalCriticalTaps;

    // --- Journey ---
    case "first_steps":
    case "into_the_wild":
    case "twilight_explorer":
    case "deep_diver":
    case "century_mark":
    case "zone_crusher":
    case "into_the_beyond":
      return state.prestige.allTimeHighestZone;

    // --- Rebirth ---
    case "new_season":
    case "seasonal_veteran":
    case "perennial":
      return state.prestige.rebirthCount;

    case "nectar_hoarder":
      return state.prestige.totalNectarEarned;

    case "transcendent":
    case "beyond_mortal":
      return state.prestige.transcendenceCount;

    case "night_owl":
      return state.stats.nightOwlOfflineCollections;

    // --- Hidden (event-driven, no passively-computable state) ---
    case "patient_gardener":
    case "speed_demon":
    case "stubborn_sprout":
    case "hat_trick":
      return -1;

    case "completionist": {
      // Count completed non-completionist achievements
      const count = Object.values(state.achievements).filter(
        (a) => a.id !== "completionist" && a.completed
      ).length;
      return count;
    }

    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// Batch check
// ---------------------------------------------------------------------------

/**
 * Scan all achievements and return the IDs of any that newly qualify for
 * completion (progress >= target, not yet completed).
 *
 * Does NOT modify state. Call `checkAndGrantAchievements` on the store to
 * apply rewards.
 */
export function checkAchievements(state: AchievementState): string[] {
  const newly: string[] = [];

  for (const achievement of Object.values(state.achievements)) {
    if (achievement.completed) continue;
    if (EVENT_DRIVEN_ACHIEVEMENT_IDS.has(achievement.id)) continue;

    const progress = computeProgress(achievement.id, state);
    if (progress >= achievement.target) {
      newly.push(achievement.id);
    }
  }

  return newly;
}

// ---------------------------------------------------------------------------
// Progress snapshot (for UI display)
// ---------------------------------------------------------------------------

/**
 * Compute current progress values for all non-completed achievements.
 * Used by the UI to render progress bars.
 */
export function computeAllProgress(state: AchievementState): AchievementProgress {
  const result: AchievementProgress = {};
  for (const achievement of Object.values(state.achievements)) {
    if (achievement.completed) {
      result[achievement.id] = achievement.target;
    } else {
      const p = computeProgress(achievement.id, state);
      result[achievement.id] = p >= 0 ? p : achievement.progress;
    }
  }
  return result;
}
