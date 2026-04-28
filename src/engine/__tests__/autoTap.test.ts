import type { Perk } from '~/types/game';
import { getAutoTapRate, AUTO_TAP_SLOW_ID, AUTO_TAP_FAST_ID } from '../autoTap';

function makePerk(id: string, purchased: boolean): Perk {
  return { id, name: id, description: '', cost: 0, permanent: true, purchased, quantity: 0 };
}

describe('getAutoTapRate', () => {
  it('returns 0 with no perks', () => {
    expect(getAutoTapRate({})).toBe(0);
  });

  it('returns 2 with slow perk', () => {
    const perks: Record<string, Perk> = {
      [AUTO_TAP_SLOW_ID]: makePerk(AUTO_TAP_SLOW_ID, true),
    };
    expect(getAutoTapRate(perks)).toBe(2);
  });

  it('returns 5 with fast perk', () => {
    const perks: Record<string, Perk> = {
      [AUTO_TAP_FAST_ID]: makePerk(AUTO_TAP_FAST_ID, true),
    };
    expect(getAutoTapRate(perks)).toBe(5);
  });

  it('returns 5 when both owned', () => {
    const perks: Record<string, Perk> = {
      [AUTO_TAP_SLOW_ID]: makePerk(AUTO_TAP_SLOW_ID, true),
      [AUTO_TAP_FAST_ID]: makePerk(AUTO_TAP_FAST_ID, true),
    };
    expect(getAutoTapRate(perks)).toBe(5);
  });
});
