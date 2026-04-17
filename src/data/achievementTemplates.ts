// =============================================================================
// Achievement Templates — Static definitions for all 36 achievements
// =============================================================================
// Source of truth for achievement IDs, names, descriptions, categories,
// targets, and rewards. Sourced from docs/content/04-achievements.md.
// =============================================================================

import { AchievementCategory, type Achievement } from "~/types/game";

/** Build a default (uncompleted) Achievement record from static fields. */
function def(
  id: string,
  name: string,
  description: string,
  category: AchievementCategory,
  hidden: boolean,
  target: number,
  sunlightReward: number,
  dewdropReward: number
): Achievement {
  return {
    id,
    name,
    description,
    category,
    hidden,
    sunlightReward,
    dewdropReward,
    completed: false,
    completedAt: null,
    progress: 0,
    target,
  };
}

// ---------------------------------------------------------------------------
// Growth Achievements
// ---------------------------------------------------------------------------

export const ACHIEVEMENT_FIRST_SPROUT = def(
  "first_sprout",
  "First Sprout",
  "Every garden begins with a single seed.",
  AchievementCategory.Growth,
  false,
  1,
  200,
  0
);

export const ACHIEVEMENT_FULL_BLOOM = def(
  "full_bloom",
  "Full Bloom",
  "Look at you, all grown up and photosynthesizing.",
  AchievementCategory.Growth,
  false,
  1,
  1000,
  0
);

export const ACHIEVEMENT_WISE_BEYOND_YOUR_EARS = def(
  "wise_beyond_your_ears",
  "Wise Beyond Your Ears",
  "Not all Bloomlings have ears, but the Elder ones listen the hardest.",
  AchievementCategory.Growth,
  false,
  1,
  5000,
  3
);

export const ACHIEVEMENT_THE_COLLECTOR = def(
  "the_collector",
  "The Collector",
  "You're not hoarding. You're curating.",
  AchievementCategory.Growth,
  false,
  10,
  2500,
  0
);

export const ACHIEVEMENT_GREENHOUSE_GALA = def(
  "greenhouse_gala",
  "Greenhouse Gala",
  "Everyone's invited. Especially the ones with thorns.",
  AchievementCategory.Growth,
  false,
  25,
  10000,
  5
);

export const ACHIEVEMENT_BEST_FRIENDS = def(
  "best_friends",
  "Best Friends",
  "Some roots just fit together.",
  AchievementCategory.Growth,
  false,
  1,
  500,
  0
);

export const ACHIEVEMENT_DREAM_TEAM = def(
  "dream_team",
  "Dream Team",
  "Four synergies active at once. The garden is practically humming.",
  AchievementCategory.Growth,
  false,
  4,
  5000,
  5
);

export const ACHIEVEMENT_ELDER_COUNCIL = def(
  "elder_council",
  "Elder Council",
  "When the Elders gather, even the weeds pay attention.",
  AchievementCategory.Growth,
  false,
  3,
  8000,
  5
);

// ---------------------------------------------------------------------------
// Power Achievements
// ---------------------------------------------------------------------------

export const ACHIEVEMENT_SUNSHINE = def(
  "sunshine",
  "Sunshine",
  "Ten thousand rays of pure, golden ambition.",
  AchievementCategory.Power,
  false,
  10_000,
  500,
  0
);

export const ACHIEVEMENT_SOLAR_FLARE = def(
  "solar_flare",
  "Solar Flare",
  "A million Sunlight. The Bloomlings are wearing shades.",
  AchievementCategory.Power,
  false,
  1_000_000,
  5000,
  0
);

export const ACHIEVEMENT_SUPERNOVA = def(
  "supernova",
  "Supernova",
  "A billion Sunlight. At this point the garden is visible from space.",
  AchievementCategory.Power,
  false,
  1_000_000_000,
  50000,
  10
);

export const ACHIEVEMENT_TAP_DANCER = def(
  "tap_dancer",
  "Tap Dancer",
  "Your screen called. It would like a day off.",
  AchievementCategory.Power,
  false,
  10_000,
  2000,
  0
);

export const ACHIEVEMENT_ITCHY_FINGERS = def(
  "itchy_fingers",
  "Itchy Fingers",
  "At this rate, you could tap-water a rainforest.",
  AchievementCategory.Power,
  false,
  100_000,
  15000,
  5
);

export const ACHIEVEMENT_COMBO_BREAKER = def(
  "combo_breaker",
  "Combo Breaker",
  "Fifty taps in a row. Your rhythm is undeniable.",
  AchievementCategory.Power,
  false,
  50,
  1500,
  0
);

export const ACHIEVEMENT_COMBO_ROYALE = def(
  "combo_royale",
  "Combo Royale",
  "A hundred hits without missing a beat. Are you a gardener or a drummer?",
  AchievementCategory.Power,
  false,
  100,
  8000,
  5
);

export const ACHIEVEMENT_CRITICAL_MASS = def(
  "critical_mass",
  "Critical Mass",
  "One hundred lucky strikes. That's not luck anymore, that's talent.",
  AchievementCategory.Power,
  false,
  100,
  1000,
  0
);

export const ACHIEVEMENT_CRITICAL_THINKING = def(
  "critical_thinking",
  "Critical Thinking",
  "A thousand crits. The Sunlight practically flinches when it sees you.",
  AchievementCategory.Power,
  false,
  1000,
  10000,
  5
);

// ---------------------------------------------------------------------------
// Journey Achievements
// ---------------------------------------------------------------------------

export const ACHIEVEMENT_FIRST_STEPS = def(
  "first_steps",
  "First Steps",
  "The longest journey begins with a single zone clear.",
  AchievementCategory.Journey,
  false,
  5,
  300,
  0
);

export const ACHIEVEMENT_INTO_THE_WILD = def(
  "into_the_wild",
  "Into the Wild",
  "You left the greenhouse. The Bloomlings are both terrified and thrilled.",
  AchievementCategory.Journey,
  false,
  25,
  2000,
  0
);

export const ACHIEVEMENT_TWILIGHT_EXPLORER = def(
  "twilight_explorer",
  "Twilight Explorer",
  "The Twilight Hollow is dim, damp, and wonderful.",
  AchievementCategory.Journey,
  false,
  51,
  5000,
  3
);

export const ACHIEVEMENT_DEEP_DIVER = def(
  "deep_diver",
  "Deep Diver",
  "Crystals grow in the dark. So do you.",
  AchievementCategory.Journey,
  false,
  76,
  10000,
  5
);

export const ACHIEVEMENT_CENTURY_MARK = def(
  "century_mark",
  "Century Mark",
  "Zone 100. You've officially outgrown the tutorial.",
  AchievementCategory.Journey,
  false,
  100,
  25000,
  10
);

export const ACHIEVEMENT_ZONE_CRUSHER = def(
  "zone_crusher",
  "Zone Crusher",
  "Two hundred zones and your Bloomlings are still asking 'are we there yet?'",
  AchievementCategory.Journey,
  false,
  200,
  50000,
  15
);

export const ACHIEVEMENT_INTO_THE_BEYOND = def(
  "into_the_beyond",
  "Into the Beyond",
  "Zone 500. There's no map for where you're going.",
  AchievementCategory.Journey,
  false,
  500,
  100000,
  25
);

// ---------------------------------------------------------------------------
// Rebirth Achievements
// ---------------------------------------------------------------------------

export const ACHIEVEMENT_NEW_SEASON = def(
  "new_season",
  "New Season",
  "Everything old is new again. Especially the dirt.",
  AchievementCategory.Rebirth,
  false,
  1,
  2000,
  3
);

export const ACHIEVEMENT_SEASONAL_VETERAN = def(
  "seasonal_veteran",
  "Seasonal Veteran",
  "Ten seasons in, and you still remember the smell of the first rain.",
  AchievementCategory.Rebirth,
  false,
  10,
  10000,
  5
);

export const ACHIEVEMENT_PERENNIAL = def(
  "perennial",
  "Perennial",
  "Twenty-five cycles of the garden. You're practically a force of nature.",
  AchievementCategory.Rebirth,
  false,
  25,
  25000,
  10
);

export const ACHIEVEMENT_NECTAR_HOARDER = def(
  "nectar_hoarder",
  "Nectar Hoarder",
  "You have more Nectar than a beehive, and the bees are jealous.",
  AchievementCategory.Rebirth,
  false,
  500,
  15000,
  10
);

export const ACHIEVEMENT_TRANSCENDENT = def(
  "transcendent",
  "Transcendent",
  "You let go of everything and came back stronger. The garden has never been more alive.",
  AchievementCategory.Rebirth,
  false,
  1,
  50000,
  15
);

export const ACHIEVEMENT_BEYOND_MORTAL = def(
  "beyond_mortal",
  "Beyond Mortal",
  "Five Transcendences. The roots remember lifetimes you've already forgotten.",
  AchievementCategory.Rebirth,
  false,
  5,
  100000,
  25
);

// ---------------------------------------------------------------------------
// Hidden Achievements
// ---------------------------------------------------------------------------

export const ACHIEVEMENT_PATIENT_GARDENER = def(
  "patient_gardener",
  "Patient Gardener",
  "Sometimes the best thing a gardener can do is walk away for a while.",
  AchievementCategory.Hidden,
  true,
  1,
  0,
  10
);

export const ACHIEVEMENT_SPEED_DEMON = def(
  "speed_demon",
  "Speed Demon",
  "Ten zones in under a minute. The Bloomlings got whiplash.",
  AchievementCategory.Hidden,
  true,
  1,
  0,
  8
);

export const ACHIEVEMENT_STUBBORN_SPROUT = def(
  "stubborn_sprout",
  "Stubborn Sprout",
  "You failed the gate ten times and then headbutted through it on the eleventh. Respect.",
  AchievementCategory.Hidden,
  true,
  1,
  0,
  5
);

export const ACHIEVEMENT_HAT_TRICK = def(
  "hat_trick",
  "Hat Trick",
  "Five hats and counting. Your Bloomlings are the best-dressed creatures in the greenhouse.",
  AchievementCategory.Hidden,
  true,
  5,
  0,
  5
);

export const ACHIEVEMENT_NIGHT_OWL = def(
  "night_owl",
  "Night Owl",
  "The garden grows in the dark, too. You just have to be awake to see it.",
  AchievementCategory.Hidden,
  true,
  5,
  0,
  8
);

export const ACHIEVEMENT_COMPLETIONIST = def(
  "completionist",
  "Completionist",
  "Every achievement unlocked. You've seen everything the garden has to offer. Or have you?",
  AchievementCategory.Hidden,
  true,
  35,
  0,
  50
);

// ---------------------------------------------------------------------------
// Full catalog — ordered for display
// ---------------------------------------------------------------------------

export const ACHIEVEMENT_TEMPLATES: readonly Achievement[] = [
  // Growth
  ACHIEVEMENT_FIRST_SPROUT,
  ACHIEVEMENT_FULL_BLOOM,
  ACHIEVEMENT_WISE_BEYOND_YOUR_EARS,
  ACHIEVEMENT_THE_COLLECTOR,
  ACHIEVEMENT_GREENHOUSE_GALA,
  ACHIEVEMENT_BEST_FRIENDS,
  ACHIEVEMENT_DREAM_TEAM,
  ACHIEVEMENT_ELDER_COUNCIL,
  // Power
  ACHIEVEMENT_SUNSHINE,
  ACHIEVEMENT_SOLAR_FLARE,
  ACHIEVEMENT_SUPERNOVA,
  ACHIEVEMENT_TAP_DANCER,
  ACHIEVEMENT_ITCHY_FINGERS,
  ACHIEVEMENT_COMBO_BREAKER,
  ACHIEVEMENT_COMBO_ROYALE,
  ACHIEVEMENT_CRITICAL_MASS,
  ACHIEVEMENT_CRITICAL_THINKING,
  // Journey
  ACHIEVEMENT_FIRST_STEPS,
  ACHIEVEMENT_INTO_THE_WILD,
  ACHIEVEMENT_TWILIGHT_EXPLORER,
  ACHIEVEMENT_DEEP_DIVER,
  ACHIEVEMENT_CENTURY_MARK,
  ACHIEVEMENT_ZONE_CRUSHER,
  ACHIEVEMENT_INTO_THE_BEYOND,
  // Rebirth
  ACHIEVEMENT_NEW_SEASON,
  ACHIEVEMENT_SEASONAL_VETERAN,
  ACHIEVEMENT_PERENNIAL,
  ACHIEVEMENT_NECTAR_HOARDER,
  ACHIEVEMENT_TRANSCENDENT,
  ACHIEVEMENT_BEYOND_MORTAL,
  // Hidden
  ACHIEVEMENT_PATIENT_GARDENER,
  ACHIEVEMENT_SPEED_DEMON,
  ACHIEVEMENT_STUBBORN_SPROUT,
  ACHIEVEMENT_HAT_TRICK,
  ACHIEVEMENT_NIGHT_OWL,
  ACHIEVEMENT_COMPLETIONIST,
];

/** Map from achievement ID to template, for O(1) lookup. */
export const ACHIEVEMENT_TEMPLATE_MAP: ReadonlyMap<string, Achievement> =
  new Map(ACHIEVEMENT_TEMPLATES.map((a) => [a.id, a]));

/** Build the initial achievements record for a fresh game state. */
export function buildInitialAchievements(): Record<string, Achievement> {
  const result: Record<string, Achievement> = {};
  for (const template of ACHIEVEMENT_TEMPLATES) {
    result[template.id] = { ...template };
  }
  return result;
}
