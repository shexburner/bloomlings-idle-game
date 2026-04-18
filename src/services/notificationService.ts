// =============================================================================
// Notification Service — Schedule and cancel local push notifications
// =============================================================================
// All public functions are async; callers fire-and-forget with `void`.
// Wired in: gameLoop.ts (background/foreground transitions)
//           app/_layout.tsx (permission request on mount)
// =============================================================================

import * as Notifications from "expo-notifications";
import type { GameState } from "~/types/game";

// ---------------------------------------------------------------------------
// Notification identifiers (fixed strings so re-scheduling replaces old ones)
// ---------------------------------------------------------------------------

const NOTIF_ID = {
  gardenMisses: "bloomlings-garden-misses",
  offlineReady: "bloomlings-offline-ready",
  streakReminder: "bloomlings-streak-reminder",
  boostExpired: "bloomlings-boost-expired",
} as const;

// ---------------------------------------------------------------------------
// Timing constants
// ---------------------------------------------------------------------------

const MS_4H  = 4  * 60 * 60 * 1000;
const MS_12H = 12 * 60 * 60 * 1000;
const MS_20H = 20 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Request local-notification permission. Should be called once on app mount.
 * Returns true if permission is granted or already granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

/**
 * Cancel all Bloomlings-scheduled notifications.
 * Call this when the app returns to the foreground.
 */
export async function cancelGameNotifications(): Promise<void> {
  try {
    await Promise.all(
      Object.values(NOTIF_ID).map((id) =>
        Notifications.cancelScheduledNotificationAsync(id)
      )
    );
  } catch {
    // Silently ignore — cancellation failures are non-critical.
  }
}

/**
 * Schedule notifications appropriate for the current game state.
 * Call this when the app goes to the background.
 * Cancels any previously scheduled notifications first.
 */
export async function scheduleGameNotifications(
  state: GameState
): Promise<void> {
  try {
    // Cancel stale notifications before re-scheduling.
    await cancelGameNotifications();

    // Bail if permission not granted.
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    const now = Date.now();
    const { notifications } = state.settings;

    // --- Offline earnings reminders ---
    if (notifications.offlineEarnings) {
      await scheduleAt(NOTIF_ID.gardenMisses, now + MS_4H, {
        title: "Your garden misses you! 🌸",
        body: "Tap to collect sunlight while your Bloomlings have been busy.",
      });
      await scheduleAt(NOTIF_ID.offlineReady, now + MS_12H, {
        title: "Offline earnings waiting! ☀️",
        body: "Your Bloomlings have been hard at work. Come collect your sunlight!",
      });
    }

    // --- Streak reminder ---
    if (notifications.streakReminder && state.daily.streakDays > 0) {
      const streakDays = state.daily.streakDays;
      await scheduleAt(NOTIF_ID.streakReminder, now + MS_20H, {
        title: `Don't lose your ${streakDays}-day streak! 🔥`,
        body: "Open Bloomlings today to keep your login streak alive.",
      });
    }

    // --- Boost expiry reminder ---
    if (notifications.boostExpired && state.activeBoosts.length > 0) {
      const soonest = state.activeBoosts.reduce((a, b) =>
        a.expiresAt < b.expiresAt ? a : b
      );
      // Only schedule if the boost hasn't already expired.
      if (soonest.expiresAt > now) {
        await scheduleAt(NOTIF_ID.boostExpired, soonest.expiresAt, {
          title: "Your Sunbeam Boost is ending! ⚡",
          body: "Tap now to keep earning bonus sunlight before it runs out.",
        });
      }
    }
  } catch {
    // Silently ignore — notification scheduling failures are non-critical.
  }
}

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

async function scheduleAt(
  identifier: string,
  triggerMs: number,
  content: { title: string; body: string }
): Promise<void> {
  const secondsFromNow = Math.round((triggerMs - Date.now()) / 1000);
  if (secondsFromNow <= 0) return;

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: content.title,
      body: content.body,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: secondsFromNow,
      repeats: false,
    },
  });
}
