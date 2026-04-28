import type { ZoneProgressState } from "~/types/game";
import { BOSS_INTERVAL, isBossZone } from "~/engine/bossFight";

export const GATE_INTERVAL = 5;
export const GATE_TIMER_MS = 30_000;
export const GATE_THRESHOLD_MULTIPLIER = 2;
export const GATE_REWARD_MULTIPLIER = 5;
export const GATE_FAIL_BONUS_PER_FAIL = 0.05;
export const GATE_FAIL_BONUS_CAP = 0.50;
export const GATE_ASSIST_TIMER_BONUS_MS = 15_000;
export const GATE_ASSIST_SUNLIGHT_MULTIPLIER = 1.5;

export { BOSS_INTERVAL };

export function isGateZone(zone: number): boolean {
  return zone > 0 && zone % GATE_INTERVAL === 0 && !isBossZone(zone);
}

export function getGateThreshold(normalThreshold: number): number {
  return normalThreshold * GATE_THRESHOLD_MULTIPLIER;
}

export function getGateFailBonus(failCount: number): number {
  return 1 + Math.min(failCount * GATE_FAIL_BONUS_PER_FAIL, GATE_FAIL_BONUS_CAP);
}

export function startGate(normalThreshold: number): Pick<ZoneProgressState, "gateActive" | "gateTimerRemainingMs" | "currentZoneProgress"> {
  return { gateActive: true, gateTimerRemainingMs: GATE_TIMER_MS, currentZoneProgress: 0 };
}

export function tickGate(timerRemainingMs: number, deltaMs: number): { timerRemainingMs: number; failed: boolean } {
  const remaining = timerRemainingMs - deltaMs;
  if (remaining <= 0) return { timerRemainingMs: 0, failed: true };
  return { timerRemainingMs: remaining, failed: false };
}

export function failGate(currentFailCount: number): Pick<ZoneProgressState, "gateActive" | "gateTimerRemainingMs" | "gateFailCount" | "currentZoneProgress"> {
  return { gateActive: false, gateTimerRemainingMs: null, gateFailCount: currentFailCount + 1, currentZoneProgress: 0 };
}

export function clearGate(): Pick<ZoneProgressState, "gateActive" | "gateTimerRemainingMs" | "gateFailCount"> {
  return { gateActive: false, gateTimerRemainingMs: null, gateFailCount: 0 };
}
