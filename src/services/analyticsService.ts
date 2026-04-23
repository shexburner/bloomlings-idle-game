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
// Public API
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
