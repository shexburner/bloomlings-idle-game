import {
  BOSS_INTERVAL,
  BOSS_TIMER_MS,
  BOSS_HP_MULTIPLIER,
  BOSS_FAIL_BONUS_PER_FAIL,
  BOSS_FAIL_BONUS_CAP,
  BOSS_AD_DAMAGE_FRACTION,
  isBossZone,
  getBossHp,
  getBossFailBonus,
  getBossAdDamage,
  startBoss,
  tickBoss,
  failBoss,
  defeatBoss,
  getBossHpPhase,
} from "~/engine/bossFight";

describe("bossFight", () => {
  describe("isBossZone", () => {
    it("zone 25 is a boss zone", () => expect(isBossZone(25)).toBe(true));
    it("zone 50 is a boss zone", () => expect(isBossZone(50)).toBe(true));
    it("zone 5 is not a boss zone", () => expect(isBossZone(5)).toBe(false));
    it("zone 10 is not a boss zone", () => expect(isBossZone(10)).toBe(false));
    it("zone 0 is not a boss zone", () => expect(isBossZone(0)).toBe(false));
    it("negative zone is not a boss zone", () => expect(isBossZone(-25)).toBe(false));
  });

  describe("getBossHp", () => {
    it("returns 50x normal threshold", () => {
      expect(getBossHp(100)).toBe(100 * BOSS_HP_MULTIPLIER);
    });
    it("returns 50x for large thresholds", () => {
      expect(getBossHp(10_000)).toBe(500_000);
    });
  });

  describe("getBossFailBonus", () => {
    it("returns 1.0 with 0 fails", () => expect(getBossFailBonus(0)).toBe(1));
    it("returns 1.05 with 1 fail", () => expect(getBossFailBonus(1)).toBeCloseTo(1.05));
    it("caps at 1.50", () => expect(getBossFailBonus(10)).toBeCloseTo(1.50));
    it("caps at 1.50 even with 100 fails", () => expect(getBossFailBonus(100)).toBeCloseTo(1.50));
  });

  describe("getBossAdDamage", () => {
    it("returns 25% of max HP", () => {
      expect(getBossAdDamage(1000)).toBe(1000 * BOSS_AD_DAMAGE_FRACTION);
    });
  });

  describe("startBoss", () => {
    it("initializes boss fight state", () => {
      const result = startBoss(200);
      expect(result.bossActive).toBe(true);
      expect(result.bossHpMax).toBe(200 * BOSS_HP_MULTIPLIER);
      expect(result.bossHpRemaining).toBe(200 * BOSS_HP_MULTIPLIER);
      expect(result.bossTimerRemainingMs).toBe(BOSS_TIMER_MS);
    });
  });

  describe("tickBoss", () => {
    it("reduces HP by sunlight * failBonus", () => {
      const result = tickBoss(1000, 60_000, 1_000, 100, 1.0);
      expect(result.hpRemaining).toBe(900);
      expect(result.timerRemainingMs).toBe(59_000);
      expect(result.defeated).toBe(false);
      expect(result.failed).toBe(false);
    });

    it("detects defeat when HP reaches 0", () => {
      const result = tickBoss(50, 60_000, 1_000, 100, 1.0);
      expect(result.hpRemaining).toBe(0);
      expect(result.defeated).toBe(true);
      expect(result.failed).toBe(false);
    });

    it("detects failure when timer expires", () => {
      const result = tickBoss(1000, 500, 1_000, 10, 1.0);
      expect(result.failed).toBe(true);
      expect(result.defeated).toBe(false);
    });

    it("applies fail bonus to damage", () => {
      const result = tickBoss(1000, 60_000, 1_000, 100, 1.5);
      expect(result.hpRemaining).toBe(850);
    });

    it("defeat takes priority over timer expiry", () => {
      const result = tickBoss(50, 500, 1_000, 100, 1.0);
      expect(result.defeated).toBe(true);
      expect(result.failed).toBe(false);
    });
  });

  describe("failBoss", () => {
    it("increments fail count and deactivates", () => {
      const result = failBoss(1, 5000);
      expect(result.bossActive).toBe(false);
      expect(result.bossFailCount).toBe(2);
      expect(result.bossHpMax).toBe(5000);
      expect(result.bossHpRemaining).toBeNull();
      expect(result.bossTimerRemainingMs).toBeNull();
    });
  });

  describe("defeatBoss", () => {
    it("clears all boss state", () => {
      const result = defeatBoss();
      expect(result.bossActive).toBe(false);
      expect(result.bossHpMax).toBeNull();
      expect(result.bossHpRemaining).toBeNull();
      expect(result.bossTimerRemainingMs).toBeNull();
      expect(result.bossFailCount).toBe(0);
    });
  });

  describe("getBossHpPhase", () => {
    it("returns full above 75%", () => expect(getBossHpPhase(800, 1000)).toBe("full"));
    it("returns damaged between 50-75%", () => expect(getBossHpPhase(600, 1000)).toBe("damaged"));
    it("returns wounded between 25-50%", () => expect(getBossHpPhase(400, 1000)).toBe("wounded"));
    it("returns critical below 25%", () => expect(getBossHpPhase(200, 1000)).toBe("critical"));
    it("returns defeated at 0", () => expect(getBossHpPhase(0, 1000)).toBe("defeated"));
    it("returns full at exactly 100%", () => expect(getBossHpPhase(1000, 1000)).toBe("full"));
    it("returns damaged at exactly 75%", () => expect(getBossHpPhase(750, 1000)).toBe("damaged"));
    it("returns wounded at exactly 50%", () => expect(getBossHpPhase(500, 1000)).toBe("wounded"));
    it("returns critical at exactly 25%", () => expect(getBossHpPhase(250, 1000)).toBe("critical"));
  });
});
