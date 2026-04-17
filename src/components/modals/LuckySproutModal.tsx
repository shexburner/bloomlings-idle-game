// =============================================================================
// LuckySproutModal — Surfaces the Lucky Sprout rewarded-ad pop-up
// =============================================================================
// Appears every 10–15 minutes of foreground play when `luckySproutPending`
// is set by the game-loop scheduler. The player can watch an ad to spin the
// reward wheel, or dismiss without a reward. Mounted in app/_layout.tsx.
// =============================================================================

import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useRewardedAd, type AdUnavailableReason } from "~/services/adManager";
import { useGameStore } from "~/state/store";
import {
  rollLuckySproutReward,
  describeLuckySproutReward,
} from "~/engine/luckySprout";

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
  warn: "#ffb74d",
  adAccent: "#ffb300",
  adAccentDark: "#b37700",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function unavailableMessage(reason: AdUnavailableReason): string {
  switch (reason) {
    case "closed_without_reward":
      return "Ad closed early — no reward this time.";
    case "web_unsupported":
      return "Ads aren't available on web.";
    case "no_fill":
    case "load_error":
    default:
      return "No ad available right now.";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Status = "idle" | "watching" | "rewarded" | "unavailable";

/** How long to flash the reward description before auto-dismissing (ms). */
const REWARD_FLASH_MS = 1200;

export function LuckySproutModal() {
  const luckySproutPending = useGameStore((s) => s.luckySproutPending);
  const clearLuckySprout = useGameStore((s) => s.clearLuckySprout);
  const applyLuckySproutReward = useGameStore((s) => s.applyLuckySproutReward);

  const { isLoaded, show } = useRewardedAd("luckySprout");

  const [status, setStatus] = useState<Status>("idle");
  const [rewardDescription, setRewardDescription] = useState<string | null>(
    null
  );
  const [unavailableReason, setUnavailableReason] =
    useState<AdUnavailableReason | null>(null);
  const rewardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset local UI state whenever the modal opens or closes.
  useEffect(() => {
    if (!luckySproutPending) {
      setStatus("idle");
      setRewardDescription(null);
      setUnavailableReason(null);
      if (rewardTimerRef.current !== null) {
        clearTimeout(rewardTimerRef.current);
        rewardTimerRef.current = null;
      }
    }
  }, [luckySproutPending]);

  // Cleanup timer on unmount.
  useEffect(() => {
    return () => {
      if (rewardTimerRef.current !== null) {
        clearTimeout(rewardTimerRef.current);
      }
    };
  }, []);

  const handleWatchAd = () => {
    if (status === "watching" || status === "rewarded") return;
    setUnavailableReason(null);
    setStatus("watching");
    show({
      onReward: () => {
        const reward = rollLuckySproutReward();
        const context = applyLuckySproutReward(reward);
        const description = describeLuckySproutReward(reward, context);
        setRewardDescription(description);
        setStatus("rewarded");
        rewardTimerRef.current = setTimeout(() => {
          rewardTimerRef.current = null;
          clearLuckySprout();
        }, REWARD_FLASH_MS);
      },
      onUnavailable: (reason) => {
        setUnavailableReason(reason);
        setStatus("unavailable");
      },
    });
  };

  const adButtonLabel = (() => {
    if (status === "watching") return "Loading ad…";
    if (status === "rewarded") return "Reward claimed!";
    if (!isLoaded) return "Loading ad…";
    return "Watch ad for reward";
  })();

  const adButtonDisabled = status === "watching" || status === "rewarded";

  return (
    <Modal
      visible={luckySproutPending}
      transparent
      animationType="fade"
      onRequestClose={clearLuckySprout}
    >
      <View testID="lucky-sprout-modal" style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.emoji}>🌱</Text>
          <Text style={styles.title}>A Lucky Sprout appeared!</Text>
          <Text style={styles.subtitle}>
            Watch a short ad to spin the reward wheel.
          </Text>

          {status === "rewarded" && rewardDescription !== null && (
            <Text style={styles.rewardNote}>{rewardDescription}</Text>
          )}

          {status === "unavailable" && unavailableReason !== null && (
            <Text style={styles.unavailableNote}>
              {unavailableMessage(unavailableReason)}
            </Text>
          )}

          <View style={styles.buttonRow}>
            <Pressable
              testID="lucky-sprout-dismiss"
              style={[styles.button, styles.dismissButton]}
              onPress={clearLuckySprout}
              disabled={status === "rewarded"}
            >
              <Text style={styles.dismissButtonText}>Skip</Text>
            </Pressable>

            <Pressable
              testID="lucky-sprout-watch-ad"
              style={[
                styles.button,
                styles.adButton,
                adButtonDisabled && styles.adButtonDisabled,
              ]}
              onPress={handleWatchAd}
              disabled={adButtonDisabled}
            >
              <Text style={styles.adButtonText}>{adButtonLabel}</Text>
              {!adButtonDisabled && (
                <Text style={styles.adButtonSubtext}>Ad</Text>
              )}
            </Pressable>
          </View>
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
    marginBottom: 6,
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  rewardNote: {
    color: COLORS.rewardText,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  unavailableNote: {
    color: COLORS.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    marginTop: 4,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dismissButton: {
    backgroundColor: "rgba(45,74,62,0.4)",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dismissButtonText: {
    color: COLORS.textMuted,
    fontSize: 15,
    fontWeight: "600",
  },
  adButton: {
    backgroundColor: COLORS.adAccent,
    borderWidth: 1,
    borderColor: COLORS.adAccentDark,
  },
  adButtonDisabled: {
    opacity: 0.6,
  },
  adButtonText: {
    color: "#2b1a00",
    fontSize: 14,
    fontWeight: "700",
  },
  adButtonSubtext: {
    color: "#5a3a00",
    fontSize: 10,
    marginTop: 2,
    fontWeight: "600",
  },
});
