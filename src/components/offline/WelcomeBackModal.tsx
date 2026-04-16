// =============================================================================
// WelcomeBackModal — Surfaces the most recent offline earnings on foreground
// =============================================================================
// Reads `meta.lastOfflineSession`; clears it on "Collect" or after a rewarded
// ad doubles the earnings. Mounts once at the root layout so it appears
// regardless of active tab. The "Watch ad for 2×" button is wired to the
// Double-Offline rewarded-ad touchpoint via `useRewardedAd`.
// =============================================================================

import { useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useRewardedAd, type AdUnavailableReason } from "~/services/adManager";
import { useGameStore } from "~/state/store";
import { formatNumber } from "~/utils/formatNumber";

// ---------------------------------------------------------------------------
// Styling (matches BloomlingDetail dark theme)
// ---------------------------------------------------------------------------

const COLORS = {
  overlay: "rgba(0,0,0,0.85)",
  cardBg: "#161b22",
  border: "#2d4a3e",
  text: "#e8f5e9",
  textMuted: "#8a9b8e",
  accent: "#4caf50",
  accentDark: "#2e7d32",
  sunlight: "#ffd700",
  warn: "#ffb74d",
  disabled: "#3a3a3a",
  adAccent: "#ffb300",
  adAccentDark: "#b37700",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** "3h 24m" / "45m" / "58s" — best-effort human duration. */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

/** User-facing explanation for why an ad didn't play. */
function unavailableMessage(reason: AdUnavailableReason): string {
  switch (reason) {
    case "closed_without_reward":
      return "Ad closed early — 1× earnings kept.";
    case "web_unsupported":
      return "Ads aren't available on web — tap Collect to take the 1×.";
    case "no_fill":
    case "load_error":
    default:
      return "No boost available right now — tap Collect to take the 1×.";
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Status = "idle" | "watching" | "rewarded" | "unavailable";

/** How long to flash the "Earnings doubled!" confirmation before dismissing. */
const REWARD_FLASH_MS = 1200;

export function WelcomeBackModal() {
  const session = useGameStore((s) => s.lastOfflineSession);
  const clearLastOfflineSession = useGameStore(
    (s) => s.clearLastOfflineSession
  );
  const applyAdDoubleOffline = useGameStore((s) => s.applyAdDoubleOffline);

  const { isLoaded, show } = useRewardedAd("doubleOffline");

  const [status, setStatus] = useState<Status>("idle");
  const [unavailableReason, setUnavailableReason] =
    useState<AdUnavailableReason | null>(null);
  const rewardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = session !== null;

  // Reset local UI state whenever a new session appears / disappears.
  useEffect(() => {
    if (!visible) {
      setStatus("idle");
      setUnavailableReason(null);
      if (rewardTimerRef.current !== null) {
        clearTimeout(rewardTimerRef.current);
        rewardTimerRef.current = null;
      }
    }
  }, [visible]);

  // Cleanup any pending flash timer on unmount.
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
        applyAdDoubleOffline();
        setStatus("rewarded");
        rewardTimerRef.current = setTimeout(() => {
          rewardTimerRef.current = null;
          clearLastOfflineSession();
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
    if (status === "rewarded") return "Earnings doubled!";
    if (!isLoaded) return "Loading ad…";
    return "Watch ad for 2×";
  })();

  const adButtonDisabled = status === "watching" || status === "rewarded";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={clearLastOfflineSession}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>

          {session !== null && (
            <>
              <Text style={styles.duration}>
                Away for {formatDuration(session.durationMs)}
              </Text>

              <View style={styles.earningsBlock}>
                <Text style={styles.earningsLabel}>Sunlight earned</Text>
                <Text style={styles.earningsValue}>
                  ☀ {formatNumber(session.sunlightEarned)}
                </Text>
                <Text style={styles.efficiency}>
                  at {Math.round(session.efficiency * 100)}% offline rate
                </Text>
              </View>

              {session.wasCapped && (
                <Text style={styles.cappedNote}>
                  Capped at 24h — come back sooner to earn more
                </Text>
              )}

              {status === "rewarded" && (
                <Text style={styles.rewardedNote}>
                  +☀ {formatNumber(session.sunlightEarned)} bonus from ad
                </Text>
              )}

              {status === "unavailable" && unavailableReason !== null && (
                <Text style={styles.unavailableNote}>
                  {unavailableMessage(unavailableReason)}
                </Text>
              )}

              <View style={styles.buttonRow}>
                <Pressable
                  style={[styles.button, styles.collectButton]}
                  onPress={clearLastOfflineSession}
                  disabled={status === "rewarded"}
                >
                  <Text style={styles.collectButtonText}>Collect</Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.button,
                    styles.adButton,
                    adButtonDisabled && styles.adButtonDisabled,
                  ]}
                  onPress={handleWatchAd}
                  disabled={adButtonDisabled}
                >
                  <Text style={styles.adButtonText}>{adButtonLabel}</Text>
                  <Text style={styles.adButtonSubtext}>Ad</Text>
                </Pressable>
              </View>
            </>
          )}
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
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  duration: {
    color: COLORS.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  earningsBlock: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(45,74,62,0.3)",
    borderRadius: 12,
    marginBottom: 12,
  },
  earningsLabel: {
    color: COLORS.textMuted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  earningsValue: {
    color: COLORS.sunlight,
    fontSize: 32,
    fontWeight: "800",
  },
  efficiency: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  cappedNote: {
    color: COLORS.warn,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
    fontStyle: "italic",
  },
  rewardedNote: {
    color: COLORS.sunlight,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
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
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  collectButton: {
    backgroundColor: COLORS.accent,
  },
  collectButtonText: {
    color: "#0d1117",
    fontSize: 16,
    fontWeight: "700",
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
