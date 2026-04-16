// =============================================================================
// WelcomeBackModal — Surfaces the most recent offline earnings on foreground
// =============================================================================
// Reads `meta.lastOfflineSession`; clears it on "Collect". Mounts once at
// the root layout so it appears regardless of active tab.
// The "Watch ad for 2x" button is a visual placeholder — AdMob wiring ships
// with Phase 5 task 1.
// =============================================================================

import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function WelcomeBackModal() {
  const session = useGameStore((s) => s.lastOfflineSession);
  const clearLastOfflineSession = useGameStore(
    (s) => s.clearLastOfflineSession
  );

  const visible = session !== null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={clearLastOfflineSession}
    >
      <View testID="welcome-back-modal" style={styles.overlay}>
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

              <View style={styles.buttonRow}>
                <Pressable
                  testID="welcome-back-collect"
                  style={[styles.button, styles.collectButton]}
                  onPress={clearLastOfflineSession}
                >
                  <Text style={styles.collectButtonText}>Collect</Text>
                </Pressable>

                {/* TODO(admob): wire this to the Double-Offline ad touchpoint
                    once src/services/adManager.ts lands (Phase 5 task 1). */}
                <Pressable
                  style={[styles.button, styles.adButton]}
                  disabled
                >
                  <Text style={styles.adButtonText}>Watch ad for 2×</Text>
                  <Text style={styles.adButtonSubtext}>(coming soon)</Text>
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
    backgroundColor: COLORS.disabled,
    opacity: 0.6,
  },
  adButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  adButtonSubtext: {
    color: COLORS.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
});
