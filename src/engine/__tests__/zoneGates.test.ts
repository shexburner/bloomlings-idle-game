import {
  GATE_INTERVAL,
  GATE_TIMER_MS,
  GATE_THRESHOLD_MULTIPLIER,
  GATE_FAIL_BONUS_PER_FAIL,
  GATE_FAIL_BONUS_CAP,
  isGateZone,
  getGateThreshold,
  getGateFailBonus,
  startGate,
  tickGate,
  failGate,
  clearGate,
} from "~/engine/zoneGates";
import { isBossZone } from "~/engine/bossFight";

describe("zoneGates", () => {
  describe("isGateZone", () => {
    it("zone 5 is a gate", () => expect(isGateZone(5)).toBe(true));
    it("zone 10 is a gate", () => expect(isGateZone(10)).toBe(true));
    it("zone 15 is a gate", () => expect(isGateZone(15)).toBe(true));
    it("zone 25 is a boss, not a gate", () => expect(isGateZone(25)).toBe(false));
    it("zone 50 is a boss, not a gate", () => expect(isGateZone(50)).toBe(false));
    it("zone 0 is neither", () => expect(isGateZone(0)).toBe(false));
    it("zone 1 is not a gate", () => expect(isGateZone(1)).toBe(false));
    it("negative zone is not a gate", () => expect(isGateZone(-5)).toBe(false));
  });

  describe("getGateThreshold", () => {
    it("returns 2x normal threshold", () => {
      expect(getGateThreshold(100)).toBe(100 * GATE_THRESHOLD_MULTIPLIER);
    });
  });

  describe("getGateFailBonus", () => {
    it("returns 1.0 with 0 fails", () => expect(getGateFailBonus(0)).toBe(1));
    it("returns 1.05 with 1 fail", () => expect(getGateFailBonus(1)).toBeCloseTo(1.05));
    it("returns 1.25 with 5 fails", () => expect(getGateFailBonus(5)).toBeCloseTo(1.25));
    it("caps at 1.50", () => expect(getGateFailBonus(10)).toBeCloseTo(1.50));
    it("caps at 1.50 even with 100 fails", () => expect(getGateFailBonus(100)).toBeCloseTo(1.50));
  });

  describe("startGate", () => {
    it("returns active gate with timer and reset progress", () => {
      const result = startGate(500);
      expect(result.gateActive).toBe(true);
      expect(result.gateTimerRemainingMs).toBe(GATE_TIMER_MS);
      expect(result.currentZoneProgress).toBe(0);
    });
  });

  describe("tickGate", () => {
    it("decrements timer", () => {
      const result = tickGate(10_000, 1_000);
      expect(result.timerRemainingMs).toBe(9_000);
      expect(result.failed).toBe(false);
    });

    it("fails when timer reaches 0", () => {
      const result = tickGate(1_000, 1_000);
      expect(result.timerRemainingMs).toBe(0);
      expect(result.failed).toBe(true);
    });

    it("fails when timer goes negative", () => {
      const result = tickGate(500, 1_000);
      expect(result.timerRemainingMs).toBe(0);
      expect(result.failed).toBe(true);
    });
  });

  describe("failGate", () => {
    it("increments fail count and deactivates gate", () => {
      const result = failGate(2);
      expect(result.gateActive).toBe(false);
      expect(result.gateTimerRemainingMs).toBeNull();
      expect(result.gateFailCount).toBe(3);
      expect(result.currentZoneProgress).toBe(0);
    });
  });

  describe("clearGate", () => {
    it("resets gate state", () => {
      const result = clearGate();
      expect(result.gateActive).toBe(false);
      expect(result.gateTimerRemainingMs).toBeNull();
      expect(result.gateFailCount).toBe(0);
    });
  });
});
