// =============================================================================
// DailyRewardModal — Daily login reward pop-up
// =============================================================================
// Appears once per calendar day when `todayRewardCollected` is false.
// Player taps "Collect" to claim the day's reward. Mounted in app/_layout.tsx.
// =============================================================================

import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useGameStore } from "~/state/store";
import { getDailyReward, describeDailyReward } from "~/engine/dailyRewards";

// ---------------------------------------------------------------------------
// Styling
// ---------------------------------------------------------------------------

const COLORS = {
  overlay: "rgba(0,0,0,0.85)",
  cardBg: "#161b22",
  border: "#2d4a3e",
  text: "#e8f5e9",
  textMuted: "#8a9b8e",
  accent: "#4caf50",
  accentDark: "#2e7d32",
  rewardText: "#ffd700",
  streakText: "#ff9800",
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** How long to show the reward flash before the modal auto-closes (ms). */
const REWARD_FLASH_MS = 1200;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DailyRewardModal() {
  const todayRewardCollected = useGameStore((s) => s.daily.todayRewardCollected);
  const loginCycleDay = useGameStore((s) => s.daily.loginCycleDay);
  const loginCyclesCompleted = useGameStore((s) => s.daily.loginCyclesCompleted);
  const streakDays = useGameStore((s) => s.daily.streakDays);
  const claimDailyReward = useGameStore((s) => s.claimDailyReward);

  const [collected, setCollected] = useState(false);
  const [rewardDescription, setRewardDescription] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset local state when modal re-opens on a new day.
  useEffect(() => {
    if (!todayRewardCollected) {
      setCollected(false);
      setRewardDescription(null);
    }
  }, [todayRewardCollected]);

  // Cleanup timer on unmount.
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, []);

  const reward = getDailyReward(loginCycleDay, loginCyclesCompleted);
  const visible = !todayRewardCollected && !collected;

  const handleCollect = () => {
    if (collected) return;
    const desc = describeDailyReward(reward);
    setRewardDescription(desc);
    setCollected(true);
    claimDailyReward();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      // `todayRewardCollected` is now true in the store; modal hides on next render.
    }, REWARD_FLASH_MS);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {/* intentionally non-dismissible without collecting */}}
    >
      <View testID="daily-reward-modal" style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>☀️</Text>

          <Text style={styles.title}>Daily Reward</Text>
          <Text style={styles.dayLabel}>Day {loginCycleDay} of 7</Text>

          {streakDays > 0 && (
            <Text style={styles.streak}>🔥 {streakDays}-day streak</Text>
          )}

          <View style={styles.rewardBox}>
            <Text style={styles.rewardPreview}>{describeDailyReward(reward)}</Text>
          </View>

          {rewardDescription !== null && (
            <Text style={styles.rewardFlash}>+{rewardDescription}</Text>
          )}

          <Pressable
            testID="daily-reward-collect"
            style={[styles.collectButton, collected && styles.collectButtonDone]}
            onPress={handleCollect}
            disabled={collected}
          >
            <Text style={styles.collectButtonText}>
              {collected ? "Collected!" : "Collect"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    alignItems: "center",
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  dayLabel: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 6,
  },
  streak: {
    color: COLORS.streakText,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 12,
  },
  rewardBox: {
    backgroundColor: "rgba(76,175,80,0.1)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
  },
  rewardPreview: {
    color: COLORS.rewardText,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  rewardFlash: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  collectButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
    marginTop: 4,
  },
  collectButtonDone: {
    backgroundColor: COLORS.accentDark,
    opacity: 0.7,
  },
  collectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
