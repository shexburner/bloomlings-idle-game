// =============================================================================
// ZoneProgress — Zone number, name, and progress bar toward clearing
// =============================================================================

import { StyleSheet, Text, View } from "react-native";

import { useGameStore } from "~/state/store";
import { getZoneThreshold } from "~/state/selectors";

/** Color palette. */
const COLORS = {
  background: "rgba(26,26,46,0.9)",
  barTrack: "#2d4a3e",
  barFill: "#4caf50",
  barFillGold: "#ffd700",
  text: "#e8f5e9",
  textMuted: "#8a9b8e",
  border: "#2d4a3e",
};

/** Map zone ranges to biome display names. */
function getBiomeName(zoneNumber: number): string {
  if (zoneNumber <= 25) return "The Mossy Cradle";
  if (zoneNumber <= 50) return "Sunlit Glade";
  if (zoneNumber <= 75) return "Twilight Hollow";
  if (zoneNumber <= 100) return "Crystal Caverns";
  if (zoneNumber <= 125) return "Scorched Expanse";
  if (zoneNumber <= 150) return "Abyssal Depths";
  if (zoneNumber <= 175) return "Celestial Canopy";
  return "Frozen Thicket";
}

export function ZoneProgress() {
  const currentZone = useGameStore((s) => s.zoneProgress.currentZone);
  const currentProgress = useGameStore(
    (s) => s.zoneProgress.currentZoneProgress
  );

  const threshold = getZoneThreshold(currentZone);
  const progressPercent = Math.min(currentProgress / threshold, 1);
  const biomeName = getBiomeName(currentZone);

  // Use gold fill color when progress is above 75%
  const fillColor =
    progressPercent > 0.75 ? COLORS.barFillGold : COLORS.barFill;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.zoneLabel}>Zone {currentZone}</Text>
        <Text style={styles.biomeName}>{biomeName}</Text>
      </View>
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.round(progressPercent * 100)}%`,
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        {Math.round(progressPercent * 100)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  zoneLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  biomeName: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
  barTrack: {
    height: 10,
    backgroundColor: COLORS.barTrack,
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 5,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: "right",
    marginTop: 4,
  },
});
