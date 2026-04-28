// =============================================================================
// TranscendencePanel — Transcendence preview, requirements, and confirmation
// =============================================================================

import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useGameStore } from "~/state/store";
import {
  canTranscend,
  getTranscendencePreview,
  TRANSCENDENCE_MIN_REBIRTHS,
  TRANSCENDENCE_MIN_ZONE,
} from "~/engine/transcendence";
import { formatNumber } from "~/utils/formatNumber";

const COLORS = {
  background: "#1a1125",
  border: "#4a2d6e",
  text: "#f3e5f5",
  textMuted: "#9b7fad",
  essenceIcon: "#7c4dff",
  checkMet: "#81c784",
  checkUnmet: "#6b5b7e",
  transcendButton: "#7c4dff",
  transcendButtonText: "#0d0a14",
  transcendDisabled: "#3a2a4a",
  transcendDisabledText: "#6b5b7e",
  confirmButton: "#ff5722",
  confirmButtonText: "#ffffff",
  cancelButton: "#3a2a4a",
  cancelButtonText: "#f3e5f5",
  keepText: "#81c784",
  cycleBadge: "#b388ff",
};

export function TranscendencePanel() {
  const [confirming, setConfirming] = useState(false);

  const prestige = useGameStore((s) => s.prestige);
  const essence = useGameStore((s) => s.resources.essence);
  const executeTranscendence = useGameStore((s) => s.executeTranscendence);

  const eligible = canTranscend(prestige);
  const preview = getTranscendencePreview(prestige);

  const rebirthsMet = prestige.rebirthCount >= TRANSCENDENCE_MIN_REBIRTHS;
  const zoneMet = prestige.allTimeHighestZone >= TRANSCENDENCE_MIN_ZONE;

  const handleTranscend = () => {
    if (!eligible || preview.essenceEarned <= 0) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    executeTranscendence();
    setConfirming(false);
  };

  const canExecute = eligible && preview.essenceEarned > 0;

  return (
    <View testID="transcendence-panel" style={styles.container}>
      {/* Cycle header */}
      <View style={styles.cycleRow}>
        <Text style={styles.cycleBadge}>
          Transcendence {prestige.transcendenceCount}
        </Text>
        <Text style={styles.essenceBalance}>
          {"\u2605"} {formatNumber(essence)}
        </Text>
      </View>

      {/* Requirements checklist */}
      <View testID="transcendence-requirements" style={styles.requirementsBox}>
        <Text style={styles.requirementsTitle}>Requirements</Text>
        <View style={styles.checkRow}>
          <Text style={rebirthsMet ? styles.checkMet : styles.checkUnmet}>
            {rebirthsMet ? "\u2713" : "\u2717"}
          </Text>
          <Text style={styles.checkLabel}>
            {TRANSCENDENCE_MIN_REBIRTHS} Rebirths ({prestige.rebirthCount}/
            {TRANSCENDENCE_MIN_REBIRTHS})
          </Text>
        </View>
        <View style={styles.checkRow}>
          <Text style={zoneMet ? styles.checkMet : styles.checkUnmet}>
            {zoneMet ? "\u2713" : "\u2717"}
          </Text>
          <Text style={styles.checkLabel}>
            Zone {TRANSCENDENCE_MIN_ZONE} reached (
            {prestige.allTimeHighestZone}/{TRANSCENDENCE_MIN_ZONE})
          </Text>
        </View>
      </View>

      {/* Essence preview */}
      <View testID="transcendence-preview" style={styles.previewBox}>
        <Text style={styles.previewTitle}>Transcendence Preview</Text>
        <View style={styles.previewRow}>
          <Text style={styles.label}>Essence Earned</Text>
          <Text style={styles.essenceValue}>
            {"\u2605"} {formatNumber(preview.essenceEarned)}
          </Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.label}>Total After</Text>
          <Text style={styles.essenceCurrent}>
            {"\u2605"}{" "}
            {formatNumber(essence + preview.essenceEarned)}
          </Text>
        </View>
        <View style={styles.previewRow}>
          <Text style={styles.label}>Rebirths This Cycle</Text>
          <Text style={styles.cycleText}>{preview.rebirthsThisCycle}</Text>
        </View>
      </View>

      {/* Transcend button with two-step confirmation */}
      {confirming ? (
        <View style={styles.confirmRow}>
          <Pressable
            testID="transcendence-cancel"
            style={styles.cancelButton}
            onPress={() => setConfirming(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            testID="transcendence-confirm"
            style={styles.confirmButton}
            onPress={handleTranscend}
          >
            <Text style={styles.confirmButtonText}>Confirm Transcend</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          testID="transcendence-button"
          style={[
            styles.transcendButton,
            !canExecute && styles.transcendDisabled,
          ]}
          onPress={handleTranscend}
          disabled={!canExecute}
        >
          <Text
            style={
              canExecute
                ? styles.transcendButtonText
                : styles.transcendDisabledText
            }
          >
            {canExecute
              ? `Transcend for ${"\u2605"} ${formatNumber(preview.essenceEarned)} Essence`
              : "Transcendence Locked"}
          </Text>
        </Pressable>
      )}

      {/* Reset / keep info */}
      <View testID="transcendence-reset-info" style={styles.resetInfo}>
        <Text style={styles.resetTitle}>What resets?</Text>
        <Text style={styles.resetText}>
          Everything from Rebirth, plus Nectar, all Nectar upgrades, Rebirth
          count, and biome progress
        </Text>
        <Text style={styles.keepTitle}>What stays?</Text>
        <Text style={styles.keepText}>
          Essence, Bloomling unlocks, Dewdrops, Achievements, Essence upgrades,
          all-time highest zone
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  cycleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cycleBadge: { fontSize: 16, fontWeight: "700", color: COLORS.cycleBadge },
  essenceBalance: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.essenceIcon,
  },
  requirementsBox: {
    backgroundColor: "rgba(74,45,110,0.2)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  requirementsTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  checkRow: { flexDirection: "row", alignItems: "center", marginVertical: 2 },
  checkMet: { fontSize: 16, color: COLORS.checkMet, width: 24 },
  checkUnmet: { fontSize: 16, color: COLORS.checkUnmet, width: 24 },
  checkLabel: { fontSize: 13, color: COLORS.textMuted },
  previewBox: {
    backgroundColor: "rgba(74,45,110,0.2)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 2,
  },
  label: { fontSize: 13, color: COLORS.textMuted },
  essenceValue: { fontSize: 20, fontWeight: "700", color: COLORS.essenceIcon },
  essenceCurrent: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  cycleText: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  confirmRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.cancelButton,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.cancelButtonText,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.confirmButton,
    alignItems: "center",
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.confirmButtonText,
  },
  transcendButton: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.transcendButton,
    alignItems: "center",
    marginBottom: 12,
  },
  transcendDisabled: { backgroundColor: COLORS.transcendDisabled },
  transcendButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.transcendButtonText,
  },
  transcendDisabledText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.transcendDisabledText,
  },
  resetInfo: {
    backgroundColor: "rgba(74,45,110,0.15)",
    borderRadius: 8,
    padding: 10,
  },
  resetTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  resetText: { fontSize: 11, color: COLORS.textMuted, marginBottom: 6 },
  keepTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.keepText,
    marginBottom: 2,
  },
  keepText: { fontSize: 11, color: COLORS.keepText, opacity: 0.8 },
});
