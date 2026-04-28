// =============================================================================
// Analytics Service — Lightweight, offline-first event tracking
// =============================================================================
// Stores events in a circular buffer (MMKV) for future SDK integration.
// No network calls. Pure local buffering.
// =============================================================================

import { createMMKV } from "react-native-mmkv";
import type { MMKV } from "react-native-mmkv";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  timestamp: number;
}

// -----------------------------------------------------------------------------
// Storage
// -----------------------------------------------------------------------------

const BUFFER_KEY = "analytics_buffer";
const FIRST_INSTALL_KEY = "first_install_ts";
const SESSION_COUNT_KEY = "session_count";
const MAX_EVENTS = 500;

let _storage: MMKV | null = null;
function getStorage(): MMKV {
  if (_storage === null) {
    _storage = createMMKV({ id: "bloomlings-analytics" });
  }
  return _storage;
}

function readBuffer(): AnalyticsEvent[] {
  const raw = getStorage().getString(BUFFER_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AnalyticsEvent[];
  } catch {
    return [];
  }
}

function writeBuffer(events: AnalyticsEvent[]): void {
  getStorage().set(BUFFER_KEY, JSON.stringify(events));
}

// -----------------------------------------------------------------------------
// Public API — Core Buffer
// -----------------------------------------------------------------------------

/** Track an analytics event. Appends to a circular buffer in MMKV. */
export function trackEvent(
  name: string,
  properties?: Record<string, string | number | boolean>,
): void {
  const buffer = readBuffer();
  buffer.push({ name, properties, timestamp: Date.now() });
  // Circular: drop oldest when over capacity.
  writeBuffer(buffer.length > MAX_EVENTS ? buffer.slice(-MAX_EVENTS) : buffer);
}

/** Return and clear the entire event buffer. For future SDK batch-send. */
export function flushAnalytics(): AnalyticsEvent[] {
  const events = readBuffer();
  writeBuffer([]);
  return events;
}

/** Aggregate counts per event type from the current buffer. */
export function getAnalyticsSummary(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const e of readBuffer()) {
    counts[e.name] = (counts[e.name] ?? 0) + 1;
  }
  return counts;
}

// -----------------------------------------------------------------------------
// Public API — Session Tracking
// -----------------------------------------------------------------------------

/** Record a session start, increment persisted session count. */
export function trackSessionStart(): void {
  const storage = getStorage();
  const count = (storage.getNumber(SESSION_COUNT_KEY) ?? 0) + 1;
  storage.set(SESSION_COUNT_KEY, count);
  trackEvent("session_start", { session_count: count, started_at: Date.now() });
}

/** Record session end with duration. */
export function trackSessionEnd(durationMs: number): void {
  trackEvent("session_end", { duration_ms: durationMs });
}

// -----------------------------------------------------------------------------
// Public API — Retention
// -----------------------------------------------------------------------------

/** Track D1/D3/D7/D30 retention markers. */
export function trackRetentionEvent(day: number): void {
  trackEvent("retention", { day });
}

// -----------------------------------------------------------------------------
// Public API — Ad Revenue
// -----------------------------------------------------------------------------

/** Track ad engagement per touchpoint. */
export function trackAdRevenue(
  unit: string,
  result: "completed" | "closed" | "failed",
): void {
  trackEvent("ad_revenue", { unit, result });
}

// -----------------------------------------------------------------------------
// Public API — Progression
// -----------------------------------------------------------------------------

/** Track progression milestones (zone, rebirth, transcendence). */
export function trackProgression(event: string, value: number): void {
  trackEvent("progression", { event, value });
}

// -----------------------------------------------------------------------------
// Public API — Economy
// -----------------------------------------------------------------------------

/** Track currency flow (earn/spend). */
export function trackEconomy(
  currency: string,
  amount: number,
  source: string,
): void {
  trackEvent("economy", { currency, amount, source });
}

// -----------------------------------------------------------------------------
// Public API — Initialization
// -----------------------------------------------------------------------------

const RETENTION_DAYS = [1, 3, 7, 30];

/**
 * Call on app start. Seeds first-install timestamp if missing, computes
 * retention day, and auto-fires the appropriate retention event.
 */
export function initAnalytics(): void {
  const storage = getStorage();
  let installTs = storage.getNumber(FIRST_INSTALL_KEY);
  if (installTs === undefined) {
    installTs = Date.now();
    storage.set(FIRST_INSTALL_KEY, installTs);
  }
  const daysSinceInstall = Math.floor(
    (Date.now() - installTs) / (24 * 60 * 60 * 1000),
  );
  for (const d of RETENTION_DAYS) {
    if (daysSinceInstall >= d) {
      trackRetentionEvent(d);
    }
  }
}
