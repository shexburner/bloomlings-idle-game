import type { ZoneProgressState } from "~/types/game";

export const BOSS_INTERVAL = 25;
export const BOSS_TIMER_MS = 120_000;
export const BOSS_HP_MULTIPLIER = 50;
export const BOSS_TAP_MULTIPLIER = 2;
export const BOSS_FAIL_BONUS_PER_FAIL = 0.05;
export const BOSS_FAIL_BONUS_CAP = 0.50;
export const BOSS_AD_DAMAGE_FRACTION = 0.25;
export const BOSS_REWARD_MULTIPLIER = 10;

export function isBossZone(zone: number): boolean {
  return zone > 0 && zone % BOSS_INTERVAL === 0;
}

export function getBossHp(normalThreshold: number): number {
  return normalThreshold * BOSS_HP_MULTIPLIER;
}

export function getBossFailBonus(failCount: number): number {
  return 1 + Math.min(failCount * BOSS_FAIL_BONUS_PER_FAIL, BOSS_FAIL_BONUS_CAP);
}

export function getBossAdDamage(bossHpMax: number): number {
  return bossHpMax * BOSS_AD_DAMAGE_FRACTION;
}

export function startBoss(normalThreshold: number): Pick<ZoneProgressState, "bossActive" | "bossHpMax" | "bossHpRemaining" | "bossTimerRemainingMs"> {
  const hp = getBossHp(normalThreshold);
  return { bossActive: true, bossHpMax: hp, bossHpRemaining: hp, bossTimerRemainingMs: BOSS_TIMER_MS };
}

export function tickBoss(
  hpRemaining: number,
  timerRemainingMs: number,
  deltaMs: number,
  sunlightGenerated: number,
  failBonus: number,
): { hpRemaining: number; timerRemainingMs: number; defeated: boolean; failed: boolean } {
  const newHp = Math.max(0, hpRemaining - sunlightGenerated * failBonus);
  const newTimer = timerRemainingMs - deltaMs;
  if (newHp <= 0) return { hpRemaining: 0, timerRemainingMs: Math.max(0, newTimer), defeated: true, failed: false };
  if (newTimer <= 0) return { hpRemaining: newHp, timerRemainingMs: 0, defeated: false, failed: true };
  return { hpRemaining: newHp, timerRemainingMs: newTimer, defeated: false, failed: false };
}

export function failBoss(currentFailCount: number, bossHpMax: number): Pick<ZoneProgressState, "bossActive" | "bossHpMax" | "bossHpRemaining" | "bossTimerRemainingMs" | "bossFailCount"> {
  return { bossActive: false, bossHpMax, bossHpRemaining: null, bossTimerRemainingMs: null, bossFailCount: currentFailCount + 1 };
}

export function defeatBoss(): Pick<ZoneProgressState, "bossActive" | "bossHpMax" | "bossHpRemaining" | "bossTimerRemainingMs" | "bossFailCount"> {
  return { bossActive: false, bossHpMax: null, bossHpRemaining: null, bossTimerRemainingMs: null, bossFailCount: 0 };
}

export function getBossHpPhase(hpRemaining: number, hpMax: number): "full" | "damaged" | "wounded" | "critical" | "defeated" {
  if (hpRemaining <= 0) return "defeated";
  const ratio = hpRemaining / hpMax;
  if (ratio > 0.75) return "full";
  if (ratio > 0.50) return "damaged";
  if (ratio > 0.25) return "wounded";
  return "critical";
}
