// =============================================================================
// RebirthPanel — Rebirth preview, projections, and confirmation button
// =============================================================================
// Shows Nectar earned, percentage increase, push-further projections, and a
// "Recommended" badge when conditions are met. Gated at Zone 40.
// =============================================================================

import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useGameStore } from "~/state/store";
import {
  canRebirth,
  getRebirthPreview,
  getUpgradeLevel,
  NECTAR_ROOTS_ID,
  REBIRTH_UNLOCK_ZONE,
} from "~/engine/rebirth";
import { formatNumber } from "~/utils/formatNumber";

const COLORS = {
  background: "#1a1125",
  border: "#4a2d6e",
  text: "#f3e5f5",
  textMuted: "#9b7fad",
  nectarGold: "#e040fb",
  recommended: "#4caf50",
  recommendedText: "#0d1117",
  rebirthButton: "#e040fb",
  rebirthButtonText: "#1a1125",
  rebirthDisabled: "#3a2a4a",
  rebirthDisabledText: "#6b5b7e",
  confirmButton: "#ff5722",
  confirmButtonText: "#ffffff",
  cancelButton: "#3a2a4a",
  cancelButtonText: "#f3e5f5",
  projectionBetter: "#81c784",
  seasonBadge: "#ce93d8",
};

export function RebirthPanel() {
  const [confirming, setConfirming] = useState(false);

  const highestZone = useGameStore(
    (s) => s.prestige.currentRunHighestZone
  );
  const currentNectar = useGameStore((s) => s.resources.nectar);
  const rebirthCount = useGameStore((s) => s.prestige.rebirthCount);
  const currentSeason = useGameStore((s) => s.prestige.currentSeason);
  const nectarRootsLevel = useGameStore((s) =>
    getUpgradeLevel(s.upgrades, NECTAR_ROOTS_ID)
  );
  const executeRebirth = useGameStore((s) => s.executeRebirth);

  const eligible = canRebirth(highestZone, nectarRootsLevel);
  const preview = getRebirthPreview(highestZone, currentNectar, nectarRootsLevel);
  const zoneShort = highestZone < REBIRTH_UNLOCK_ZONE
    ? REBIRTH_UNLOCK_ZONE - highestZone
    : 0;

  const handleRebirth = () => {
    if (!eligible) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    executeRebirth();
    setConfirming(false);
  };

  return (
    <View style={styles.container}>
      {/* Season header */}
      <View style={styles.seasonRow}>
        <Text style={styles.seasonBadge}>Season {currentSeason}</Text>
        {rebirthCount > 0 && (
          <Text style={styles.rebirthCount}>
            {rebirthCount} Rebirth{rebirthCount !== 1 ? "s" : ""} completed
          </Text>
        )}
      </View>

      {/* Zone status */}
      <View style={styles.zoneRow}>
        <Text style={styles.label}>Current Run Highest Zone</Text>
        <Text style={styles.zoneValue}>{highestZone}</Text>
      </View>

      {/* Not eligible yet */}
      {!eligible && (
        <View style={styles.infoBox}>
          {zoneShort > 0 ? (
            <Text style={styles.infoText}>
              Reach Zone {REBIRTH_UNLOCK_ZONE} to unlock Rebirth
              {" "}({zoneShort} more zone{zoneShort !== 1 ? "s" : ""} to go)
            </Text>
          ) : (
            <Text style={styles.infoText}>
              Push further to earn at least 1 Nectar
            </Text>
          )}
        </View>
      )}

      {/* Nectar preview (always show if past unlock zone) */}
      {highestZone >= REBIRTH_UNLOCK_ZONE && (
        <View style={styles.previewBox}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Rebirth Preview</Text>
            {preview.recommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            )}
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.label}>Nectar Earned</Text>
            <Text style={styles.nectarValue}>
              {"\u2727"} {formatNumber(preview.nectarEarned)}
            </Text>
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.label}>Current Nectar</Text>
            <Text style={styles.nectarCurrent}>
              {"\u2727"} {formatNumber(currentNectar)}
            </Text>
          </View>

          {currentNectar > 0 &&
            preview.percentageIncrease !== Infinity && (
              <View style={styles.previewRow}>
                <Text style={styles.label}>Increase</Text>
                <Text style={styles.percentageText}>
                  +{formatNumber(preview.percentageIncrease, 0)}%
                </Text>
              </View>
            )}

          {/* Push-further projections */}
          {preview.projections.length > 0 && (
            <View style={styles.projections}>
              <Text style={styles.projectionLabel}>Push further?</Text>
              {preview.projections.map((proj) => (
                <View key={proj.additionalZones} style={styles.projectionRow}>
                  <Text style={styles.projectionZone}>
                    Zone {highestZone + proj.additionalZones}
                  </Text>
                  <Text style={styles.projectionNectar}>
                    {"\u2727"} {formatNumber(proj.nectarEarned)}
                    {proj.nectarEarned > preview.nectarEarned && (
                      <Text style={styles.projectionDiff}>
                        {" "}(+{formatNumber(proj.nectarEarned - preview.nectarEarned)})
                      </Text>
                    )}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Rebirth button */}
      {confirming ? (
        <View style={styles.confirmRow}>
          <Pressable
            style={styles.cancelButton}
            onPress={() => setConfirming(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable style={styles.confirmButton} onPress={handleRebirth}>
            <Text style={styles.confirmButtonText}>
              Confirm Rebirth
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[
            styles.rebirthButton,
            !eligible && styles.rebirthDisabled,
          ]}
          onPress={handleRebirth}
          disabled={!eligible}
        >
          <Text
            style={
              eligible
                ? styles.rebirthButtonText
                : styles.rebirthDisabledText
            }
          >
            {eligible
              ? `Rebirth for ${"\u2727"} ${formatNumber(preview.nectarEarned)} Nectar`
              : "Rebirth Locked"}
          </Text>
        </Pressable>
      )}

      {/* What resets info */}
      <View style={styles.resetInfo}>
        <Text style={styles.resetTitle}>What resets?</Text>
        <Text style={styles.resetText}>
          Sunlight, zone progress, Bloomling levels, tap & idle upgrades
        </Text>
        <Text style={styles.keepTitle}>What stays?</Text>
        <Text style={styles.keepText}>
          Nectar, Bloomling unlocks, Nectar & Essence upgrades, Dewdrops
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
  seasonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  seasonBadge: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.seasonBadge,
  },
  rebirthCount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  zoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  zoneValue: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  infoBox: {
    backgroundColor: "rgba(74,45,110,0.3)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  previewBox: {
    backgroundColor: "rgba(74,45,110,0.2)",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  previewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
  },
  recommendedBadge: {
    backgroundColor: COLORS.recommended,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.recommendedText,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 2,
  },
  nectarValue: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.nectarGold,
  },
  nectarCurrent: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.projectionBetter,
  },
  projections: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(74,45,110,0.4)",
  },
  projectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  projectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 1,
  },
  projectionZone: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  projectionNectar: {
    fontSize: 12,
    color: COLORS.nectarGold,
  },
  projectionDiff: {
    color: COLORS.projectionBetter,
  },
  confirmRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
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
  rebirthButton: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.rebirthButton,
    alignItems: "center",
    marginBottom: 12,
  },
  rebirthDisabled: {
    backgroundColor: COLORS.rebirthDisabled,
  },
  rebirthButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.rebirthButtonText,
  },
  rebirthDisabledText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.rebirthDisabledText,
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
  resetText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  keepTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.projectionBetter,
    marginBottom: 2,
  },
  keepText: {
    fontSize: 11,
    color: COLORS.projectionBetter,
    opacity: 0.8,
  },
});
