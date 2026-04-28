import type { Perk } from '~/types/game';

export const AUTO_TAP_SLOW_ID = 'auto_tap_slow';
export const AUTO_TAP_FAST_ID = 'auto_tap_fast';
export const AUTO_TAP_SLOW_RATE = 2; // taps per second
export const AUTO_TAP_FAST_RATE = 5;

export function getAutoTapRate(perks: Record<string, Perk>): number {
  if (perks[AUTO_TAP_FAST_ID]?.purchased) return AUTO_TAP_FAST_RATE;
  if (perks[AUTO_TAP_SLOW_ID]?.purchased) return AUTO_TAP_SLOW_RATE;
  return 0;
}
