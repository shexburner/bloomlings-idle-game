// =============================================================================
// Lucky Sprout — Reward wheel for the `luckySprout` rewarded-ad touchpoint
// =============================================================================
// Pops every 10-15 minutes of foreground play. After the ad plays, one of
// five rewards is rolled from the weighted table in docs/design/05-ad-economy.md.
// Kept out of the React tree so the probability math is easy to reason about
// and unit-test.
// =============================================================================

/** The five reward outcomes a Lucky Sprout ad can grant. */
export enum LuckySproutReward {
  /** 5 minutes of current idle production, paid as a one-shot Sunlight grant. */
  BonusSunlight = "bonus_sunlight",
  /** 2× tap value for 5 minutes. */
  TapBoost = "tap_boost",
  /** +1 Dewdrop. */
  Dewdrop = "dewdrop",
  /** Free +1 level on a random owned Bloomling under level 100. */
  FreeLevelUp = "free_level_up",
  /** +10% Nectar on the next Rebirth. */
  NextRebirthBoost = "next_rebirth_boost",
}

/** Minimum interval between Lucky Sprout pop-ups (ms). */
export const LUCKY_SPROUT_MIN_INTERVAL_MS = 10 * 60 * 1000;

/** Maximum interval between Lucky Sprout pop-ups (ms). */
export const LUCKY_SPROUT_MAX_INTERVAL_MS = 15 * 60 * 1000;

/** Duration of the Lucky Sprout tap-boost reward (ms). */
export const LUCKY_SPROUT_TAP_BOOST_DURATION_MS = 5 * 60 * 1000;

/** Multiplier for the Lucky Sprout tap-boost reward. */
export const LUCKY_SPROUT_TAP_BOOST_MULTIPLIER = 2;

/** How many seconds of idle production the BonusSunlight reward grants. */
export const LUCKY_SPROUT_BONUS_SUNLIGHT_SECONDS = 5 * 60;

/** Dewdrops granted by the Dewdrop reward outcome. */
export const LUCKY_SPROUT_DEWDROP_AMOUNT = 1;

/** Multiplier applied to next-rebirth Nectar from the NextRebirthBoost reward. */
export const LUCKY_SPROUT_NECTAR_BONUS_MULTIPLIER = 1.1;

interface WheelEntry {
  readonly reward: LuckySproutReward;
  readonly weight: number;
}

/** Reward weights from docs/design/05-ad-economy.md §Lucky Sprout. */
const WHEEL: readonly WheelEntry[] = [
  { reward: LuckySproutReward.BonusSunlight, weight: 0.35 },
  { reward: LuckySproutReward.TapBoost, weight: 0.25 },
  { reward: LuckySproutReward.Dewdrop, weight: 0.2 },
  { reward: LuckySproutReward.FreeLevelUp, weight: 0.15 },
  { reward: LuckySproutReward.NextRebirthBoost, weight: 0.05 },
];

/**
 * Roll a Lucky Sprout reward. Accepts an optional deterministic `randomValue`
 * (0 ≤ x < 1) for tests; falls back to `Math.random()` in production.
 */
export function rollLuckySproutReward(
  randomValue: number = Math.random()
): LuckySproutReward {
  let acc = 0;
  for (const entry of WHEEL) {
    acc += entry.weight;
    if (randomValue < acc) return entry.reward;
  }
  // Floating-point edge case: fall back to the last entry.
  return WHEEL[WHEEL.length - 1]!.reward;
}

/**
 * Pick the next foreground-play interval in ms (uniform random in
 * [10min, 15min]). Accepts a deterministic `randomValue` for tests.
 */
export function nextLuckySproutIntervalMs(
  randomValue: number = Math.random()
): number {
  const span = LUCKY_SPROUT_MAX_INTERVAL_MS - LUCKY_SPROUT_MIN_INTERVAL_MS;
  return LUCKY_SPROUT_MIN_INTERVAL_MS + randomValue * span;
}

/** Human-readable label for a reward, used in the modal flash. */
export function describeLuckySproutReward(
  reward: LuckySproutReward,
  context: { bonusSunlight: number; freeLevelUpBloomlingName: string | null }
): string {
  switch (reward) {
    case LuckySproutReward.BonusSunlight:
      return `+☀ ${Math.floor(context.bonusSunlight).toLocaleString()} Sunlight!`;
    case LuckySproutReward.TapBoost:
      return "2× tap value for 5 minutes!";
    case LuckySproutReward.Dewdrop:
      return `+${LUCKY_SPROUT_DEWDROP_AMOUNT} Dewdrop!`;
    case LuckySproutReward.FreeLevelUp:
      return context.freeLevelUpBloomlingName !== null
        ? `${context.freeLevelUpBloomlingName} leveled up for free!`
        : "Free level-up!";
    case LuckySproutReward.NextRebirthBoost:
      return "+10% Nectar on your next Rebirth!";
  }
}
