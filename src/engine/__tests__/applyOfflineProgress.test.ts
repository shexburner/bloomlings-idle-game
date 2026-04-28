// =============================================================================
// Tests — applyOfflineProgress (gameLoop.ts)
// =============================================================================
// Verifies the helper correctly applies offline results to the store,
// surfaces the Welcome Back modal for long windows, and triggers achievements.
// =============================================================================

// ---------------------------------------------------------------------------
// Mock all gameLoop.ts dependencies that are not under test
// ---------------------------------------------------------------------------

jest.mock("react", () => ({
  useEffect: jest.fn(),
  useRef: jest.fn(() => ({ current: null })),
  useCallback: jest.fn((fn: unknown) => fn),
}));

jest.mock("react-native", () => ({
  AppState: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock("~/services/audioService", () => ({
  play: jest.fn(),
  init: jest.fn(),
  syncMusic: jest.fn(),
}));

jest.mock("react-native-mmkv", () => ({
  createMMKV: jest.fn(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

jest.mock("~/utils/haptics", () => ({
  zoneAdvanceHaptic: jest.fn(),
  achievementHaptic: jest.fn(),
}));

jest.mock("~/services/notificationService", () => ({
  cancelGameNotifications: jest.fn(),
  scheduleGameNotifications: jest.fn(),
}));

jest.mock("~/engine/luckySprout", () => ({
  nextLuckySproutIntervalMs: jest.fn(() => 600_000),
}));

// Mock calculateOfflineProgress so we can control what it returns
jest.mock("~/engine/offlineProgress", () => ({
  calculateOfflineProgress: jest.fn(),
}));

// Mock the selectors used by gameTick
jest.mock("~/state/selectors", () => ({
  totalSunlightPerSecondFromRegistry: jest.fn(() => 0),
  getActiveBoosts: jest.fn(() => []),
  getBoostMultiplier: jest.fn(() => 1),
  hasReachedZoneThreshold: jest.fn(() => false),
}));

// ---------------------------------------------------------------------------
// Store mock — set up a realistic mock with Jest functions for each action
// ---------------------------------------------------------------------------

const mockAddSunlight = jest.fn();
const mockAddZoneProgress = jest.fn();
const mockSetLastOfflineSession = jest.fn();
const mockSetLastActiveAt = jest.fn();
const mockSetLastTickAt = jest.fn();
const mockTriggerHiddenAchievement = jest.fn();
const mockCheckAndGrantAchievements = jest.fn();
const mockSetEngineRunning = jest.fn();

let mockStoreState: Record<string, unknown> = {};

const mockGetState = jest.fn(() => ({
  ...mockStoreState,
  addSunlight: mockAddSunlight,
  addZoneProgress: mockAddZoneProgress,
  setLastOfflineSession: mockSetLastOfflineSession,
  setLastActiveAt: mockSetLastActiveAt,
  setLastTickAt: mockSetLastTickAt,
  triggerHiddenAchievement: mockTriggerHiddenAchievement,
  checkAndGrantAchievements: mockCheckAndGrantAchievements,
  setEngineRunning: mockSetEngineRunning,
}));

const mockSetState = jest.fn((updater: (s: unknown) => unknown) => {
  if (typeof updater === "function") updater(mockStoreState);
});

jest.mock("~/state/store", () => ({
  useGameStore: {
    getState: mockGetState,
    setState: mockSetState,
    subscribe: jest.fn(() => jest.fn()),
  },
}));

// ---------------------------------------------------------------------------
// Import the function under test AFTER all mocks are set
// ---------------------------------------------------------------------------

import { applyOfflineProgress } from "../gameLoop";
import { calculateOfflineProgress } from "~/engine/offlineProgress";

const mockCalc = calculateOfflineProgress as jest.MockedFunction<
  typeof calculateOfflineProgress
>;

// ---------------------------------------------------------------------------
// Constants mirrored from gameLoop.ts (not exported, so kept in sync here)
// ---------------------------------------------------------------------------

const OFFLINE_MODAL_MIN_MS = 30 * 1000;
const PATIENT_GARDENER_THRESHOLD_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setLastTickAt(value: number) {
  mockStoreState = { ...mockStoreState, lastTickAt: value };
}

function makeOfflineResult(overrides: Partial<ReturnType<typeof calculateOfflineProgress>>) {
  return {
    sunlightEarned: 0,
    durationMs: 0,
    wasCapped: false,
    efficiency: 0.5,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  mockStoreState = { lastTickAt: 1_000_000, stats: { nightOwlOfflineCollections: 0 } };
});

describe("applyOfflineProgress — brand-new save guard", () => {
  it("returns null and calls nothing when lastTickAt is 0", () => {
    setLastTickAt(0);
    const result = applyOfflineProgress(Date.now());

    expect(result).toBeNull();
    expect(mockCalc).not.toHaveBeenCalled();
    expect(mockAddSunlight).not.toHaveBeenCalled();
  });

  it("returns null when lastTickAt is negative", () => {
    setLastTickAt(-1);
    expect(applyOfflineProgress(Date.now())).toBeNull();
  });
});

describe("applyOfflineProgress — zero earnings (short gap)", () => {
  it("does not credit sunlight when sunlightEarned is 0", () => {
    mockCalc.mockReturnValue(makeOfflineResult({ sunlightEarned: 0, durationMs: 5_000 }));

    applyOfflineProgress(Date.now());

    expect(mockAddSunlight).not.toHaveBeenCalled();
    expect(mockAddZoneProgress).not.toHaveBeenCalled();
    expect(mockSetLastOfflineSession).not.toHaveBeenCalled();
  });

  it("still updates lastActiveAt and lastTickAt even with zero earnings", () => {
    mockCalc.mockReturnValue(makeOfflineResult({ sunlightEarned: 0, durationMs: 5_000 }));
    const now = Date.now();

    applyOfflineProgress(now);

    expect(mockSetLastActiveAt).toHaveBeenCalledWith(now);
    expect(mockSetLastTickAt).toHaveBeenCalledWith(now);
  });
});

describe("applyOfflineProgress — sunlight crediting", () => {
  it("credits sunlight and zone progress when earned > 0", () => {
    mockCalc.mockReturnValue(makeOfflineResult({ sunlightEarned: 500, durationMs: 10_000 }));

    applyOfflineProgress(Date.now());

    expect(mockAddSunlight).toHaveBeenCalledWith(500);
    expect(mockAddZoneProgress).toHaveBeenCalledWith(500);
  });

  it("does NOT show Welcome Back modal when duration < OFFLINE_MODAL_MIN_MS", () => {
    mockCalc.mockReturnValue(
      makeOfflineResult({ sunlightEarned: 10, durationMs: OFFLINE_MODAL_MIN_MS - 1 })
    );

    applyOfflineProgress(Date.now());

    expect(mockAddSunlight).toHaveBeenCalledWith(10);
    expect(mockSetLastOfflineSession).not.toHaveBeenCalled();
  });

  it("shows Welcome Back modal when duration >= OFFLINE_MODAL_MIN_MS", () => {
    const session = makeOfflineResult({
      sunlightEarned: 250,
      durationMs: OFFLINE_MODAL_MIN_MS,
      wasCapped: false,
      efficiency: 0.5,
    });
    mockCalc.mockReturnValue(session);

    applyOfflineProgress(Date.now());

    expect(mockSetLastOfflineSession).toHaveBeenCalledWith({
      sunlightEarned: 250,
      durationMs: OFFLINE_MODAL_MIN_MS,
      wasCapped: false,
      efficiency: 0.5,
    });
  });
});

describe("applyOfflineProgress — timestamps", () => {
  it("stamps lastActiveAt and lastTickAt with now", () => {
    mockCalc.mockReturnValue(makeOfflineResult({ sunlightEarned: 100, durationMs: 60_000 }));
    const now = 1_700_000_999_000;

    applyOfflineProgress(now);

    expect(mockSetLastActiveAt).toHaveBeenCalledWith(now);
    expect(mockSetLastTickAt).toHaveBeenCalledWith(now);
  });

  it("returns the OfflineProgressResult from calculateOfflineProgress", () => {
    const fakeResult = makeOfflineResult({ sunlightEarned: 999, durationMs: 120_000 });
    mockCalc.mockReturnValue(fakeResult);

    const result = applyOfflineProgress(Date.now());

    expect(result).toEqual(fakeResult);
  });
});

describe("applyOfflineProgress — Patient Gardener achievement", () => {
  it("triggers patient_gardener when duration reaches the 24h cap", () => {
    mockCalc.mockReturnValue(
      makeOfflineResult({
        sunlightEarned: 1000,
        durationMs: PATIENT_GARDENER_THRESHOLD_MS,
      })
    );

    applyOfflineProgress(Date.now());

    expect(mockTriggerHiddenAchievement).toHaveBeenCalledWith("patient_gardener");
  });

  it("does not trigger patient_gardener for short sessions", () => {
    mockCalc.mockReturnValue(
      makeOfflineResult({ sunlightEarned: 100, durationMs: 60_000 })
    );

    applyOfflineProgress(Date.now());

    expect(mockTriggerHiddenAchievement).not.toHaveBeenCalled();
  });
});

describe("applyOfflineProgress — Night Owl achievement", () => {
  it("increments nightOwlOfflineCollections when collecting between midnight and 5 AM", () => {
    mockCalc.mockReturnValue(
      makeOfflineResult({ sunlightEarned: 50, durationMs: 60_000 })
    );

    // Construct a timestamp that falls at 2 AM local time
    const midnight = new Date();
    midnight.setHours(2, 0, 0, 0);
    const nightNow = midnight.getTime();

    mockStoreState = {
      ...mockStoreState,
      stats: { nightOwlOfflineCollections: 3 },
    };

    applyOfflineProgress(nightNow);

    expect(mockSetState).toHaveBeenCalled();
    expect(mockCheckAndGrantAchievements).toHaveBeenCalled();
  });

  it("does not trigger Night Owl during daytime hours", () => {
    mockCalc.mockReturnValue(
      makeOfflineResult({ sunlightEarned: 50, durationMs: 60_000 })
    );

    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    const noonNow = noon.getTime();

    applyOfflineProgress(noonNow);

    expect(mockCheckAndGrantAchievements).not.toHaveBeenCalled();
  });
});
