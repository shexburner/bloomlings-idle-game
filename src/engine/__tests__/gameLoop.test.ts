// Mock react-native before any imports
jest.mock("react-native", () => ({
  AppState: { addEventListener: jest.fn() },
}));

jest.mock("~/state/store", () => ({
  useGameStore: { getState: jest.fn(), setState: jest.fn() },
}));

jest.mock("~/services/audioService", () => ({
  play: jest.fn(),
}));

jest.mock("~/utils/haptics", () => ({
  zoneAdvanceHaptic: jest.fn(),
  achievementHaptic: jest.fn(),
}));

jest.mock("~/services/notificationService", () => ({
  cancelGameNotifications: jest.fn(),
  scheduleGameNotifications: jest.fn(),
}));

jest.mock("~/services/analyticsService", () => ({
  trackEvent: jest.fn(),
}));

import { EvolutionStage, AdTouchpoint } from "~/types/game";
import type { Bloomling, ActiveBoost } from "~/types/game";
import { gameTick, applyTick, type TickResult } from "../gameLoop";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBloomling(
  id: string,
  overrides: Partial<Bloomling> = {}
): Bloomling {
  return {
    templateId: "fernley",
    instanceId: id,
    level: 1,
    evolutionStage: EvolutionStage.Sprout,
    inGarden: true,
    gardenSlot: 0,
    unlocked: true,
    totalProduced: 0,
    ...overrides,
  };
}

function baseTickState() {
  return {
    resources: {
      sunlight: 0,
      nectar: 0,
      essence: 0,
      dewdrops: 0,
      totalSunlightEarned: 0,
      runSunlightEarned: 0,
    },
    bloomlings: {} as Record<string, Bloomling>,
    garden: {
      maxSlots: 1,
      slots: [] as (string | null)[],
      activeSynergyIds: [] as string[],
      specialMeterProgress: 0,
    },
    combo: {
      count: 0,
      lastTapAt: 0,
      frozen: false,
      freezeExpiresAt: null as number | null,
      sessionMaxCombo: 0,
    },
    activeBoosts: [] as ActiveBoost[],
    zoneProgress: {
      currentZone: 1,
      currentZoneProgress: 0,
      gateActive: false,
      gateTimerRemainingMs: null as number | null,
      gateFailCount: 0,
      bossActive: false,
      bossHpRemaining: null as number | null,
      bossHpMax: null as number | null,
      bossTimerRemainingMs: null as number | null,
      bossFailCount: 0,
    },
    upgrades: {} as Record<string, { templateId: string; level: number }>,
  };
}

function makeComboState(overrides: Partial<ReturnType<typeof baseTickState>["combo"]> = {}) {
  return {
    combo: { count: 0, lastTapAt: 0, frozen: false, freezeExpiresAt: null as number | null, sessionMaxCombo: 0, ...overrides },
    activeBoosts: [] as ActiveBoost[],
  };
}

// ---------------------------------------------------------------------------
// gameTick
// ---------------------------------------------------------------------------

describe("gameTick", () => {
  it("returns zero sunlightEarned when deltaMs is 0", () => {
    const result = gameTick(baseTickState(), Date.now(), 0);
    expect(result.sunlightEarned).toBe(0);
  });

  it("returns zero sunlightEarned when garden is empty", () => {
    const result = gameTick(baseTickState(), Date.now(), 1000);
    expect(result.sunlightEarned).toBe(0);
  });

  it("earns sunlight based on idle rate and deltaMs", () => {
    const state = {
      ...baseTickState(),
      bloomlings: { a: makeBloomling("a") },
      garden: { maxSlots: 1, slots: ["a"], activeSynergyIds: [] as string[], specialMeterProgress: 0 },
    };
    // fernley baseProduction=1, level=1, Sprout=1x → 1 sun/sec → 1s = 1 sunlight
    const result = gameTick(state, Date.now(), 1000);
    expect(result.sunlightEarned).toBeCloseTo(1, 1);
  });

  it("scales sunlight with large deltaMs", () => {
    const state = {
      ...baseTickState(),
      bloomlings: { a: makeBloomling("a") },
      garden: { maxSlots: 1, slots: ["a"], activeSynergyIds: [] as string[], specialMeterProgress: 0 },
    };
    const result = gameTick(state, Date.now(), 10_000);
    expect(result.sunlightEarned).toBeCloseTo(10, 1);
  });

  it("resets combo when decay window exceeded", () => {
    const now = 10_000;
    const state = {
      ...baseTickState(),
      combo: { count: 5, lastTapAt: now - 2000, frozen: false, freezeExpiresAt: null as number | null, sessionMaxCombo: 5 },
    };
    const result = gameTick(state, now, 100);
    expect(result.comboReset).toBe(true);
  });

  it("does not reset combo within decay window", () => {
    const now = 10_000;
    const state = {
      ...baseTickState(),
      combo: { count: 5, lastTapAt: now - 500, frozen: false, freezeExpiresAt: null as number | null, sessionMaxCombo: 5 },
    };
    const result = gameTick(state, now, 100);
    expect(result.comboReset).toBe(false);
  });

  it("detects zone threshold reached", () => {
    const state = {
      ...baseTickState(),
      zoneProgress: {
        ...baseTickState().zoneProgress,
        currentZone: 1,
        currentZoneProgress: 100,
      },
    };
    const result = gameTick(state, Date.now(), 100);
    expect(result.zoneThresholdReached).toBe(true);
  });

  it("counts expired boosts", () => {
    const now = 10_000;
    const state = {
      ...baseTickState(),
      activeBoosts: [
        { source: AdTouchpoint.SunbeamBoost, multiplier: 2, expiresAt: now - 1 },
        { source: AdTouchpoint.SunbeamBoost, multiplier: 3, expiresAt: now + 5000 },
      ],
    };
    const result = gameTick(state, now, 100);
    expect(result.expiredBoostCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// applyTick
// ---------------------------------------------------------------------------

describe("applyTick", () => {
  function makeMockStore() {
    return {
      addSunlight: jest.fn(),
      resetCombo: jest.fn(),
      setComboFrozen: jest.fn(),
      advanceZone: jest.fn(),
      setLastTickAt: jest.fn(),
      setActiveBoosts: jest.fn(),
      addZoneProgress: jest.fn(),
    };
  }

  it("calls addSunlight and addZoneProgress when sunlightEarned > 0", () => {
    const store = makeMockStore();
    const result: TickResult = { sunlightEarned: 42, comboReset: false, zoneThresholdReached: false, expiredBoostCount: 0 };
    applyTick(store, makeComboState(), result, 1000);
    expect(store.addSunlight).toHaveBeenCalledWith(42);
    expect(store.addZoneProgress).toHaveBeenCalledWith(42);
  });

  it("does not call addSunlight when sunlightEarned is 0", () => {
    const store = makeMockStore();
    const result: TickResult = { sunlightEarned: 0, comboReset: false, zoneThresholdReached: false, expiredBoostCount: 0 };
    applyTick(store, makeComboState(), result, 1000);
    expect(store.addSunlight).not.toHaveBeenCalled();
  });

  it("calls resetCombo when comboReset is true", () => {
    const store = makeMockStore();
    const result: TickResult = { sunlightEarned: 0, comboReset: true, zoneThresholdReached: false, expiredBoostCount: 0 };
    applyTick(store, makeComboState(), result, 1000);
    expect(store.resetCombo).toHaveBeenCalled();
  });

  it("calls advanceZone when zoneThresholdReached is true", () => {
    const store = makeMockStore();
    const result: TickResult = { sunlightEarned: 0, comboReset: false, zoneThresholdReached: true, expiredBoostCount: 0 };
    applyTick(store, makeComboState(), result, 1000);
    expect(store.advanceZone).toHaveBeenCalled();
  });

  it("filters expired boosts when expiredBoostCount > 0", () => {
    const store = makeMockStore();
    const now = 10_000;
    const activeBoost = { source: AdTouchpoint.SunbeamBoost as const, multiplier: 2, expiresAt: now + 5000 };
    const state = {
      combo: { count: 0, lastTapAt: 0, frozen: false, freezeExpiresAt: null as number | null, sessionMaxCombo: 0 },
      activeBoosts: [
        activeBoost,
        { source: AdTouchpoint.SunbeamBoost as const, multiplier: 3, expiresAt: now - 1 },
      ],
    };
    const result: TickResult = { sunlightEarned: 0, comboReset: false, zoneThresholdReached: false, expiredBoostCount: 1 };
    applyTick(store, state, result, now);
    expect(store.setActiveBoosts).toHaveBeenCalledWith([activeBoost]);
  });

  it("always calls setLastTickAt", () => {
    const store = makeMockStore();
    const result: TickResult = { sunlightEarned: 0, comboReset: false, zoneThresholdReached: false, expiredBoostCount: 0 };
    applyTick(store, makeComboState(), result, 9999);
    expect(store.setLastTickAt).toHaveBeenCalledWith(9999);
  });

  it("unfreezes combo when freeze has expired", () => {
    const store = makeMockStore();
    const now = 10_000;
    const state = makeComboState({ count: 5, lastTapAt: 8000, frozen: true, freezeExpiresAt: now - 1 });
    const result: TickResult = { sunlightEarned: 0, comboReset: false, zoneThresholdReached: false, expiredBoostCount: 0 };
    applyTick(store, state, result, now);
    expect(store.setComboFrozen).toHaveBeenCalledWith(false, null);
  });
});
