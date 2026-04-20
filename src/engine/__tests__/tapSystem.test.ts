// Mock module-level imports that are not under test
jest.mock("react", () => ({
  useCallback: jest.fn((fn: unknown) => fn),
  useRef: jest.fn(() => ({ current: [] })),
}));

jest.mock("~/state/store", () => ({
  useGameStore: jest.fn(),
}));

jest.mock("~/state/selectors", () => ({
  selectEffectiveTapValue: jest.fn(),
  // Real implementation so calculateTapReward works correctly
  getComboMultiplier: (count: number) => 1 + Math.min(count, 100) * 0.05,
}));

import {
  calculateTapReward,
  shouldResetCombo,
  getNextComboCount,
  isValidTap,
} from "../tapSystem";

describe("calculateTapReward", () => {
  const BASE_TAP = 10;
  const TAP_MULT = 1;

  it("returns non-critical reward when roll is above critChance", () => {
    const result = calculateTapReward(BASE_TAP, TAP_MULT, 0, 0.05, 5, 0.99);
    expect(result.isCritical).toBe(false);
    expect(result.sunlight).toBeCloseTo(10 * 1 * 1); // combo 0 → multiplier 1.0
    expect(result.comboCount).toBe(0);
  });

  it("returns critical reward when roll is below critChance", () => {
    const result = calculateTapReward(BASE_TAP, TAP_MULT, 0, 0.05, 5, 0.01);
    expect(result.isCritical).toBe(true);
    expect(result.sunlight).toBeCloseTo(10 * 1 * 1 * 5);
  });

  it("applies combo multiplier: comboCount=10 → mult 1.50", () => {
    const result = calculateTapReward(BASE_TAP, TAP_MULT, 10, 0.05, 5, 0.99);
    expect(result.comboMultiplier).toBeCloseTo(1.5);
    expect(result.sunlight).toBeCloseTo(10 * 1.5);
  });

  it("caps combo at 100 for multiplier calc: comboCount=200 → same as 100", () => {
    const at100 = calculateTapReward(BASE_TAP, TAP_MULT, 100, 0.05, 5, 0.99);
    const at200 = calculateTapReward(BASE_TAP, TAP_MULT, 200, 0.05, 5, 0.99);
    expect(at100.comboMultiplier).toBeCloseTo(at200.comboMultiplier);
    expect(at100.sunlight).toBeCloseTo(at200.sunlight);
  });

  it("uses tapMultiplier in the formula", () => {
    const single = calculateTapReward(BASE_TAP, 1, 0, 0.05, 5, 0.99);
    const doubled = calculateTapReward(BASE_TAP, 2, 0, 0.05, 5, 0.99);
    expect(doubled.sunlight).toBeCloseTo(single.sunlight * 2);
  });

  it("returns comboCount from input unchanged", () => {
    const result = calculateTapReward(1, 1, 42, 0, 1, 0.5);
    expect(result.comboCount).toBe(42);
  });

  it("zero critChance means never critical", () => {
    for (let i = 0; i < 10; i++) {
      const result = calculateTapReward(1, 1, 0, 0, 5, Math.random());
      expect(result.isCritical).toBe(false);
    }
  });

  it("critChance=1 means always critical", () => {
    const result = calculateTapReward(1, 1, 0, 1, 5, 0.99);
    expect(result.isCritical).toBe(true);
  });
});

describe("shouldResetCombo", () => {
  const now = 1_700_000_000_000;

  it("returns false when lastTapTimestamp is 0 (never tapped)", () => {
    expect(shouldResetCombo(0, now)).toBe(false);
  });

  it("returns false when gap is within 1500ms", () => {
    expect(shouldResetCombo(now - 1000, now)).toBe(false);
    expect(shouldResetCombo(now - 1499, now)).toBe(false);
  });

  it("returns true when gap exceeds 1500ms", () => {
    expect(shouldResetCombo(now - 1501, now)).toBe(true);
    expect(shouldResetCombo(now - 5000, now)).toBe(true);
  });

  it("returns false when gap is exactly 1500ms", () => {
    // 1500ms - not strictly greater than
    expect(shouldResetCombo(now - 1500, now)).toBe(false);
  });
});

describe("getNextComboCount", () => {
  const now = 1_700_000_000_000;

  it("increments count when tap is within decay window", () => {
    const result = getNextComboCount(5, now - 500, now, false);
    expect(result).toBe(6);
  });

  it("resets to 1 when gap exceeds decay window and not frozen", () => {
    const result = getNextComboCount(50, now - 2000, now, false);
    expect(result).toBe(1);
  });

  it("caps at MAX_COMBO (100) on increment", () => {
    const result = getNextComboCount(100, now - 500, now, false);
    expect(result).toBe(100);
  });

  it("caps at 100 even above 100", () => {
    const result = getNextComboCount(99, now - 500, now, false);
    expect(result).toBe(100);
  });

  it("does not reset when frozen even if gap exceeds decay window", () => {
    const result = getNextComboCount(50, now - 5000, now, true);
    expect(result).toBe(51);
  });

  it("still caps at 100 when frozen", () => {
    const result = getNextComboCount(100, now - 5000, now, true);
    expect(result).toBe(100);
  });

  it("starts at 1 on first tap (lastTapTimestamp=0) after reset", () => {
    // lastTapTimestamp=0 means shouldResetCombo returns false → increments
    const result = getNextComboCount(0, 0, now, false);
    expect(result).toBe(1);
  });
});

describe("isValidTap", () => {
  const now = 1_700_000_000_000;

  it("returns true when tap history is empty", () => {
    expect(isValidTap([], now)).toBe(true);
  });

  it("returns true when fewer than 20 taps in last 1 second", () => {
    const history = Array.from({ length: 19 }, (_, i) => now - i * 50);
    expect(isValidTap(history, now)).toBe(true);
  });

  it("returns false when exactly 20 taps in last 1 second", () => {
    const history = Array.from({ length: 20 }, (_, i) => now - i * 40);
    expect(isValidTap(history, now)).toBe(false);
  });

  it("ignores taps older than 1 second", () => {
    const old = Array.from({ length: 30 }, (_, i) => now - 2000 - i * 10);
    const recent = Array.from({ length: 5 }, (_, i) => now - i * 50);
    const history = [...old, ...recent];
    expect(isValidTap(history, now)).toBe(true);
  });

  it("returns false when more than 20 taps in window", () => {
    const history = Array.from({ length: 25 }, (_, i) => now - i * 30);
    expect(isValidTap(history, now)).toBe(false);
  });
});
