// =============================================================================
// Haptics — Thin wrappers around expo-haptics that respect the hapticsEnabled
// setting. Plain functions (not a hook) — safe to call from anywhere.
// =============================================================================

import * as Haptics from "expo-haptics";
import { useGameStore } from "~/state/store";

function enabled(): boolean {
  return useGameStore.getState().settings.hapticsEnabled;
}

export function tapHaptic(): void {
  if (!enabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function critHaptic(): void {
  if (!enabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function purchaseHaptic(): void {
  if (!enabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

export function comboMilestoneHaptic(): void {
  if (!enabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export function zoneAdvanceHaptic(): void {
  if (!enabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
}

export function achievementHaptic(): void {
  if (!enabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function boostHaptic(): void {
  if (!enabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
