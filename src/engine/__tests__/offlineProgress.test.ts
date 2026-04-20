// =============================================================================
// Tests — offlineProgress pure functions
// =============================================================================
// Covers: getOfflineEfficiency, getDeepRootsMultiplier, calculateOfflineProgress
// =============================================================================

import {
  getOfflineEfficiency,
  getDeepRootsMultiplier,
  calculateOfflineProgress,
  BASE_OFFLINE_EFFICIENCY,
  DEEP_ROOTS_BONUS_PER_LEVEL,
  DEEP_ROOTS_MAX_LEVEL,
  COSMIC_ROOTS_MAX_LEVEL,
  MAX_OFFLINE_MS,
  AD_BOOST_MULTIPLIER,
} from "../offlineProgress";
import { PERK_ID } from "~/data/perkTemplates";
import type { Upgrade, Perk, GardenState, Bloomling } from "~/types/game";

// Mock the selector so we can control the idle rate without a real store
jest.mock("~/state/selectors", () => ({
  totalSunlightPerSecondFromRegistry: jest.fn(),
}));

import { totalSunlightPerSecondFromRegistry } from "~/state/selectors";
const mockRate = totalSunlightPerSecondFromRegistry as jest.MockedFunction<
  typeof totalSunlightPerSecondFromRegistry
>;

// Minimal state helpers that satisfy the strict type shapes
const noUpgrades: { upgrades: Record<string, Upgrade> } = { upgrades: {} };
const noPerks: { perks: Record<string, Perk> } = { perks: {} };
const baseState = { ...noUpgrades, ...noPerks };

/** Build a minimal Upgrade record for use in tests. */
function upgrade(templateId: string, level: number): Record<string, Upgrade> {
  return { [templateId]: { templateId, level } };
}

/** Build a minimal Perk record for use in tests. */
function perk(id: string, purchased: boolean): Record<string, Perk> {
  return {
    [id]: { id, purchased, name: "", description: "", cost: 0, permanent: true, quantity: 0 },
  };
}

const emptyGarden: GardenState = {
  maxSlots: 4,
  slots: [],
  activeSynergyIds: [],
  specialMeterProgress: 0,
};

const emptyBloomlings: Record<string, Bloomling> = {};

describe("getOfflineEfficiency", () => {
  it("returns BASE_OFFLINE_EFFICIENCY (0.5) with no upgrades or perks", () => {
    expect(getOfflineEfficiency(baseState)).toBeCloseTo(BASE_OFFLINE_EFFICIENCY);
  });

  it("raises floor to 0.75 with Offline Boost perk", () => {
    const state = { ...noUpgrades, perks: perk(PERK_ID.OfflineBoost, true) };
    expect(getOfflineEfficiency(state)).toBeCloseTo(0.75);
  });

  it("drives efficiency from 0.5 toward 1.0 with Cosmic Roots (no perk)", () => {
    // Level 1: 0.5 + 0.5 * (1/3) ≈ 0.667
    const state1 = { ...noPerks, upgrades: upgrade("cosmic_roots", 1) };
    expect(getOfflineEfficiency(state1)).toBeCloseTo(0.5 + 0.5 * (1 / COSMIC_ROOTS_MAX_LEVEL));

    // Level 3 (max): 0.5 + 0.5 * (3/3) = 1.0
    const state3 = { ...noPerks, upgrades: upgrade("cosmic_roots", 3) };
    expect(getOfflineEfficiency(state3)).toBeCloseTo(1.0);
  });

  it("combines Offline Boost perk with Cosmic Roots (floor 0.75)", () => {
    // Floor 0.75, gap = 0.25, level 3 → 0.75 + 0.25 = 1.0
    const state = {
      upgrades: upgrade("cosmic_roots", 3),
      perks: perk(PERK_ID.OfflineBoost, true),
    };
    expect(getOfflineEfficiency(state)).toBeCloseTo(1.0);
  });

  it("caps Cosmic Roots at COSMIC_ROOTS_MAX_LEVEL", () => {
    const overLevel = { ...noPerks, upgrades: upgrade("cosmic_roots", 99) };
    const atMax = { ...noPerks, upgrades: upgrade("cosmic_roots", COSMIC_ROOTS_MAX_LEVEL) };
    expect(getOfflineEfficiency(overLevel)).toBeCloseTo(getOfflineEfficiency(atMax));
  });
});

describe("getDeepRootsMultiplier", () => {
  it("returns 1.0 at level 0", () => {
    expect(getDeepRootsMultiplier(noUpgrades)).toBe(1.0);
  });

  it("adds DEEP_ROOTS_BONUS_PER_LEVEL per level", () => {
    const state = { upgrades: upgrade("deep_roots", 5) };
    expect(getDeepRootsMultiplier(state)).toBeCloseTo(1 + DEEP_ROOTS_BONUS_PER_LEVEL * 5);
  });

  it("caps at DEEP_ROOTS_MAX_LEVEL", () => {
    const overLevel = { upgrades: upgrade("deep_roots", 99) };
    const atMax = { upgrades: upgrade("deep_roots", DEEP_ROOTS_MAX_LEVEL) };
    expect(getDeepRootsMultiplier(overLevel)).toBeCloseTo(getDeepRootsMultiplier(atMax));
  });
});

describe("calculateOfflineProgress", () => {
  const now = 1_700_000_000_000;
  const emptyState = {
    bloomlings: emptyBloomlings,
    garden: emptyGarden,
    ...baseState,
  };

  beforeEach(() => {
    mockRate.mockReturnValue(10); // 10 sun/sec baseline
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns zero earnings when duration is zero", () => {
    const result = calculateOfflineProgress(emptyState, now, now);
    expect(result.sunlightEarned).toBe(0);
    expect(result.durationMs).toBe(0);
    expect(result.wasCapped).toBe(false);
  });

  it("returns zero earnings when clock went backward", () => {
    const result = calculateOfflineProgress(emptyState, now + 5000, now);
    expect(result.sunlightEarned).toBe(0);
    expect(result.durationMs).toBe(0);
  });

  it("computes sunlight: rate × duration × efficiency (no upgrades)", () => {
    const durationMs = 60_000; // 1 minute
    const result = calculateOfflineProgress(emptyState, now - durationMs, now);
    const expected = 10 * 60 * BASE_OFFLINE_EFFICIENCY;
    expect(result.sunlightEarned).toBeCloseTo(expected);
    expect(result.durationMs).toBe(durationMs);
    expect(result.wasCapped).toBe(false);
  });

  it("applies Deep Roots multiplier on top of base calc", () => {
    const stateWithDeepRoots = {
      ...emptyState,
      upgrades: upgrade("deep_roots", 5),
    };
    const durationMs = 60_000;
    const result = calculateOfflineProgress(stateWithDeepRoots, now - durationMs, now);
    const deepMult = 1 + DEEP_ROOTS_BONUS_PER_LEVEL * 5;
    const expected = 10 * 60 * BASE_OFFLINE_EFFICIENCY * deepMult;
    expect(result.sunlightEarned).toBeCloseTo(expected);
  });

  it("doubles earnings with adBoost option", () => {
    const durationMs = 60_000;
    const base = calculateOfflineProgress(emptyState, now - durationMs, now);
    const boosted = calculateOfflineProgress(emptyState, now - durationMs, now, { adBoost: true });
    expect(boosted.sunlightEarned).toBeCloseTo(base.sunlightEarned * AD_BOOST_MULTIPLIER);
  });

  it("caps duration at MAX_OFFLINE_MS (24 hours)", () => {
    const tooLong = MAX_OFFLINE_MS + 60_000;
    const result = calculateOfflineProgress(emptyState, now - tooLong, now);
    expect(result.wasCapped).toBe(true);
    expect(result.durationMs).toBe(MAX_OFFLINE_MS);
    const expected = 10 * (MAX_OFFLINE_MS / 1000) * BASE_OFFLINE_EFFICIENCY;
    expect(result.sunlightEarned).toBeCloseTo(expected);
  });

  it("exposes efficiency in result", () => {
    const result = calculateOfflineProgress(emptyState, now - 60_000, now);
    expect(result.efficiency).toBeCloseTo(BASE_OFFLINE_EFFICIENCY);
  });
});
