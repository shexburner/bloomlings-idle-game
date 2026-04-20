import {
  rollLuckySproutReward,
  nextLuckySproutIntervalMs,
  describeLuckySproutReward,
  LuckySproutReward,
  LUCKY_SPROUT_MIN_INTERVAL_MS,
  LUCKY_SPROUT_MAX_INTERVAL_MS,
  LUCKY_SPROUT_DEWDROP_AMOUNT,
} from "../luckySprout";

// ---------------------------------------------------------------------------
// rollLuckySproutReward
// ---------------------------------------------------------------------------

describe("rollLuckySproutReward", () => {
  it("returns BonusSunlight for roll in [0, 0.35)", () => {
    expect(rollLuckySproutReward(0)).toBe(LuckySproutReward.BonusSunlight);
    expect(rollLuckySproutReward(0.34)).toBe(LuckySproutReward.BonusSunlight);
  });

  it("returns TapBoost for roll in [0.35, 0.60)", () => {
    expect(rollLuckySproutReward(0.35)).toBe(LuckySproutReward.TapBoost);
    expect(rollLuckySproutReward(0.59)).toBe(LuckySproutReward.TapBoost);
  });

  it("returns Dewdrop for roll in [0.60, 0.80)", () => {
    expect(rollLuckySproutReward(0.60)).toBe(LuckySproutReward.Dewdrop);
    expect(rollLuckySproutReward(0.79)).toBe(LuckySproutReward.Dewdrop);
  });

  it("returns FreeLevelUp for roll in [0.80, 0.95)", () => {
    expect(rollLuckySproutReward(0.80)).toBe(LuckySproutReward.FreeLevelUp);
    expect(rollLuckySproutReward(0.94)).toBe(LuckySproutReward.FreeLevelUp);
  });

  it("returns NextRebirthBoost for roll in [0.95, 1.00)", () => {
    expect(rollLuckySproutReward(0.95)).toBe(LuckySproutReward.NextRebirthBoost);
    expect(rollLuckySproutReward(0.999)).toBe(LuckySproutReward.NextRebirthBoost);
  });

  it("falls back to the last entry for roll >= 1.0 (edge case)", () => {
    // Floating point edge: roll >= sum of all weights
    expect(rollLuckySproutReward(1.0)).toBe(LuckySproutReward.NextRebirthBoost);
  });
});

// ---------------------------------------------------------------------------
// nextLuckySproutIntervalMs
// ---------------------------------------------------------------------------

describe("nextLuckySproutIntervalMs", () => {
  it("returns LUCKY_SPROUT_MIN_INTERVAL_MS for randomValue=0", () => {
    expect(nextLuckySproutIntervalMs(0)).toBe(LUCKY_SPROUT_MIN_INTERVAL_MS);
  });

  it("returns LUCKY_SPROUT_MAX_INTERVAL_MS for randomValue=1", () => {
    expect(nextLuckySproutIntervalMs(1)).toBe(LUCKY_SPROUT_MAX_INTERVAL_MS);
  });

  it("returns a value within [MIN, MAX] for randomValue=0.5", () => {
    const result = nextLuckySproutIntervalMs(0.5);
    expect(result).toBeGreaterThanOrEqual(LUCKY_SPROUT_MIN_INTERVAL_MS);
    expect(result).toBeLessThanOrEqual(LUCKY_SPROUT_MAX_INTERVAL_MS);
  });

  it("scales linearly between min and max", () => {
    const range = LUCKY_SPROUT_MAX_INTERVAL_MS - LUCKY_SPROUT_MIN_INTERVAL_MS;
    const expected = LUCKY_SPROUT_MIN_INTERVAL_MS + 0.25 * range;
    expect(nextLuckySproutIntervalMs(0.25)).toBeCloseTo(expected);
  });
});

// ---------------------------------------------------------------------------
// describeLuckySproutReward
// ---------------------------------------------------------------------------

describe("describeLuckySproutReward", () => {
  const ctx = (bonusSunlight: number, name: string | null = null) => ({
    bonusSunlight,
    freeLevelUpBloomlingName: name,
  });

  it("describes BonusSunlight with the formatted amount", () => {
    const desc = describeLuckySproutReward(LuckySproutReward.BonusSunlight, ctx(1234));
    expect(desc).toContain("1,234");
    expect(desc).toContain("Sunlight");
  });

  it("describes TapBoost as 2× for 5 minutes", () => {
    const desc = describeLuckySproutReward(LuckySproutReward.TapBoost, ctx(0));
    expect(desc).toContain("2×");
    expect(desc).toContain("5 minutes");
  });

  it("describes Dewdrop with the constant amount", () => {
    const desc = describeLuckySproutReward(LuckySproutReward.Dewdrop, ctx(0));
    expect(desc).toContain(`${LUCKY_SPROUT_DEWDROP_AMOUNT}`);
    expect(desc).toContain("Dewdrop");
  });

  it("describes FreeLevelUp with bloomling name when available", () => {
    const desc = describeLuckySproutReward(
      LuckySproutReward.FreeLevelUp,
      ctx(0, "Fernley")
    );
    expect(desc).toContain("Fernley");
    expect(desc).toContain("leveled up");
  });

  it("describes FreeLevelUp generically when no bloomling name", () => {
    const desc = describeLuckySproutReward(LuckySproutReward.FreeLevelUp, ctx(0, null));
    expect(desc).toContain("level-up");
  });

  it("describes NextRebirthBoost with +10% Nectar", () => {
    const desc = describeLuckySproutReward(LuckySproutReward.NextRebirthBoost, ctx(0));
    expect(desc).toContain("10%");
    expect(desc).toContain("Nectar");
    expect(desc).toContain("Rebirth");
  });
});
