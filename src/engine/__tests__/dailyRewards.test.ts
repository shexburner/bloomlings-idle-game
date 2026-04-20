import { getDailyReward, describeDailyReward } from "../dailyRewards";
import type { DailyReward } from "../dailyRewards";

// ---------------------------------------------------------------------------
// getDailyReward
// ---------------------------------------------------------------------------

describe("getDailyReward", () => {
  describe("first cycle (loginCyclesCompleted = 0)", () => {
    it("day 1: 500 sunlight, no dewdrops, no boost", () => {
      const r = getDailyReward(1, 0);
      expect(r.sunlight).toBe(500);
      expect(r.dewdrops).toBe(0);
      expect(r.sunbeamBoostMs).toBe(0);
    });

    it("day 2: 1000 sunlight", () => {
      expect(getDailyReward(2, 0).sunlight).toBe(1000);
    });

    it("day 3: 1 dewdrop, no sunlight", () => {
      const r = getDailyReward(3, 0);
      expect(r.dewdrops).toBe(1);
      expect(r.sunlight).toBe(0);
    });

    it("day 5: 2 dewdrops", () => {
      const r = getDailyReward(5, 0);
      expect(r.dewdrops).toBe(2);
      expect(r.sunlight).toBe(0);
    });

    it("day 6: 5000 sunlight + sunbeam boost", () => {
      const r = getDailyReward(6, 0);
      expect(r.sunlight).toBe(5000);
      expect(r.sunbeamBoostMs).toBe(30 * 60 * 1000);
    });

    it("day 7: 5 dewdrops", () => {
      const r = getDailyReward(7, 0);
      expect(r.dewdrops).toBe(5);
      expect(r.sunlight).toBe(0);
    });
  });

  describe("second cycle (loginCyclesCompleted = 1)", () => {
    it("scales sunlight by 1.5x", () => {
      const r = getDailyReward(1, 1);
      expect(r.sunlight).toBe(Math.floor(500 * 1.5));
    });

    it("scales dewdrops by 2x (1 + 1)", () => {
      const r = getDailyReward(3, 1);
      expect(r.dewdrops).toBe(Math.floor(1 * 2));
    });

    it("preserves sunbeam boost duration unchanged", () => {
      const r = getDailyReward(6, 1);
      expect(r.sunbeamBoostMs).toBe(30 * 60 * 1000);
    });
  });

  describe("third cycle (loginCyclesCompleted = 2)", () => {
    it("scales sunlight by 2x (1 + 2 * 0.5 = 2.0)", () => {
      const r = getDailyReward(1, 2);
      expect(r.sunlight).toBe(Math.floor(500 * 2.0));
    });

    it("scales dewdrops by 3x (1 + 2 = 3)", () => {
      const r = getDailyReward(7, 2);
      expect(r.dewdrops).toBe(Math.floor(5 * 3));
    });
  });

  describe("edge cases", () => {
    it("day 0 (below range): returns day 1 reward", () => {
      const r0 = getDailyReward(0, 0);
      const r1 = getDailyReward(1, 0);
      expect(r0).toEqual(r1);
    });

    it("day 8 (above range): returns day 7 reward", () => {
      const r8 = getDailyReward(8, 0);
      const r7 = getDailyReward(7, 0);
      expect(r8).toEqual(r7);
    });

    it("returns floored integer sunlight", () => {
      // Day 1 with cycle 1 → 500 * 1.5 = 750.0 (exact)
      const r = getDailyReward(1, 1);
      expect(Number.isInteger(r.sunlight)).toBe(true);
    });
  });
});

// ---------------------------------------------------------------------------
// describeDailyReward
// ---------------------------------------------------------------------------

describe("describeDailyReward", () => {
  it("returns 'No reward' for an empty reward", () => {
    const r: DailyReward = { sunlight: 0, dewdrops: 0, sunbeamBoostMs: 0 };
    expect(describeDailyReward(r)).toBe("No reward");
  });

  it("describes sunlight only", () => {
    const r: DailyReward = { sunlight: 500, dewdrops: 0, sunbeamBoostMs: 0 };
    expect(describeDailyReward(r)).toContain("500");
    expect(describeDailyReward(r)).toContain("Sunlight");
  });

  it("uses singular 'Dewdrop' for 1 dewdrop", () => {
    const r: DailyReward = { sunlight: 0, dewdrops: 1, sunbeamBoostMs: 0 };
    const desc = describeDailyReward(r);
    expect(desc).toContain("1 Dewdrop");
    expect(desc).not.toContain("Dewdrops");
  });

  it("uses plural 'Dewdrops' for multiple dewdrops", () => {
    const r: DailyReward = { sunlight: 0, dewdrops: 5, sunbeamBoostMs: 0 };
    expect(describeDailyReward(r)).toContain("5 Dewdrops");
  });

  it("describes sunbeam boost when present", () => {
    const r: DailyReward = { sunlight: 0, dewdrops: 0, sunbeamBoostMs: 1 };
    expect(describeDailyReward(r)).toContain("Sunbeam Boost");
  });

  it("joins multiple reward parts with ' + '", () => {
    const r: DailyReward = { sunlight: 1000, dewdrops: 2, sunbeamBoostMs: 0 };
    const desc = describeDailyReward(r);
    expect(desc).toContain(" + ");
    // toLocaleString output is locale-dependent; match the digits and label
    expect(desc).toMatch(/1[,.]?000 Sunlight/);
    expect(desc).toContain("2 Dewdrops");
  });
});
