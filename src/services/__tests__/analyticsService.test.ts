// Mock MMKV before any imports
const mockStore: Record<string, string> = {};
jest.mock("react-native-mmkv", () => ({
  createMMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn((key: string) => mockStore[key]),
    set: jest.fn((key: string, value: string) => { mockStore[key] = value; }),
    delete: jest.fn((key: string) => { delete mockStore[key]; }),
  })),
}));

import { trackEvent, flushAnalytics, getAnalyticsSummary } from "../analyticsService";

beforeEach(() => {
  // Clear the mock store between tests
  for (const key of Object.keys(mockStore)) {
    delete mockStore[key];
  }
});

// ---------------------------------------------------------------------------
// trackEvent
// ---------------------------------------------------------------------------

describe("trackEvent", () => {
  it("adds events to buffer", () => {
    trackEvent("test_event", { key: "value" });
    const events = flushAnalytics();
    expect(events).toHaveLength(1);
    expect(events[0]!.name).toBe("test_event");
    expect(events[0]!.properties).toEqual({ key: "value" });
  });

  it("accumulates multiple events", () => {
    trackEvent("event_1");
    trackEvent("event_2");
    trackEvent("event_3");
    const events = flushAnalytics();
    expect(events).toHaveLength(3);
  });

  it("caps buffer at 500 events (circular)", () => {
    for (let i = 0; i < 510; i++) {
      trackEvent(`event_${i}`);
    }
    const events = flushAnalytics();
    expect(events).toHaveLength(500);
    // Oldest events should be dropped; newest kept
    expect(events[0]!.name).toBe("event_10");
    expect(events[499]!.name).toBe("event_509");
  });
});

// ---------------------------------------------------------------------------
// flushAnalytics
// ---------------------------------------------------------------------------

describe("flushAnalytics", () => {
  it("returns and clears buffer", () => {
    trackEvent("a");
    trackEvent("b");
    const first = flushAnalytics();
    expect(first).toHaveLength(2);
    const second = flushAnalytics();
    expect(second).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getAnalyticsSummary
// ---------------------------------------------------------------------------

describe("getAnalyticsSummary", () => {
  it("returns correct counts per event type", () => {
    trackEvent("tap");
    trackEvent("tap");
    trackEvent("zone_advance");
    const summary = getAnalyticsSummary();
    expect(summary["tap"]).toBe(2);
    expect(summary["zone_advance"]).toBe(1);
  });

  it("returns empty object for empty buffer", () => {
    expect(getAnalyticsSummary()).toEqual({});
  });
});
