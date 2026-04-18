// =============================================================================
// Daily Rewards — Reward schedule for the 7-day login cycle
// =============================================================================

/** Reward granted for a single daily login. */
export interface DailyReward {
  sunlight: number;
  dewdrops: number;
  /** Duration of Sunbeam boost in ms (0 = no boost). */
  sunbeamBoostMs: number;
}

/** Base reward table for the 7-day cycle (1-indexed). */
const BASE_REWARDS: readonly DailyReward[] = [
  { sunlight: 500,   dewdrops: 0, sunbeamBoostMs: 0 },
  { sunlight: 1000,  dewdrops: 0, sunbeamBoostMs: 0 },
  { sunlight: 0,     dewdrops: 1, sunbeamBoostMs: 0 },
  { sunlight: 2500,  dewdrops: 0, sunbeamBoostMs: 0 },
  { sunlight: 0,     dewdrops: 2, sunbeamBoostMs: 0 },
  { sunlight: 5000,  dewdrops: 0, sunbeamBoostMs: 30 * 60 * 1000 },
  { sunlight: 0,     dewdrops: 5, sunbeamBoostMs: 0 },
];

/**
 * Compute the reward for a given day in the login cycle.
 *
 * Subsequent cycles scale sunlight by `1 + loginCyclesCompleted * 0.5`
 * and dewdrops by `1 + loginCyclesCompleted` (floor).
 *
 * @param loginCycleDay - Current day in cycle (1–7).
 * @param loginCyclesCompleted - Number of full 7-day cycles already completed.
 */
export function getDailyReward(
  loginCycleDay: number,
  loginCyclesCompleted: number
): DailyReward {
  const idx = Math.max(0, Math.min(6, loginCycleDay - 1));
  const base = BASE_REWARDS[idx]!;

  if (loginCyclesCompleted === 0) return { ...base };

  const sunlightScale = 1 + loginCyclesCompleted * 0.5;
  const dewdropScale = 1 + loginCyclesCompleted;

  return {
    sunlight: Math.floor(base.sunlight * sunlightScale),
    dewdrops: Math.floor(base.dewdrops * dewdropScale),
    sunbeamBoostMs: base.sunbeamBoostMs,
  };
}

/** User-facing description of a daily reward. */
export function describeDailyReward(reward: DailyReward): string {
  const parts: string[] = [];
  if (reward.sunlight > 0) parts.push(`${reward.sunlight.toLocaleString()} Sunlight`);
  if (reward.dewdrops > 0) parts.push(`${reward.dewdrops} Dewdrop${reward.dewdrops > 1 ? "s" : ""}`);
  if (reward.sunbeamBoostMs > 0) parts.push("Sunbeam Boost (30 min)");
  return parts.join(" + ") || "No reward";
}
