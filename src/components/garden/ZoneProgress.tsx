// =============================================================================
// ZoneProgress — Biome name, zone number, golden progress bar
// =============================================================================

import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useGameStore } from "~/state/store";
import { getZoneThreshold } from "~/state/selectors";
import { formatNumber } from "~/utils/formatNumber";
import { COLORS, FONTS, RADII, SHADOWS } from "@/constants/theme";

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
  const currentProgress = useGameStore((s) => s.zoneProgress.currentZoneProgress);

  const threshold = getZoneThreshold(currentZone);
  const progressPercent = Math.min(currentProgress / threshold, 1);
  const biomeName = getBiomeName(currentZone);
  const isGateZone = (currentZone % 5) === 4;

  return (
    <View testID="zone-progress" style={styles.container}>
      <View style={styles.headerRow}>
        <Text testID="zone-biome" style={styles.biomeName}>
          {biomeName}
        </Text>
        <View style={styles.headerRight}>
          {isGateZone && (
            <View style={styles.gatePill}>
              <Text style={styles.gateLabel}>GATE</Text>
            </View>
          )}
          <Text testID="zone-label" style={styles.zoneLabel}>
            Zone {currentZone}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <LinearGradient
          testID="zone-progress-fill"
          colors={[COLORS.sunlightHi, COLORS.sunlight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.barFill, { width: `${Math.round(progressPercent * 100)}%` }]}
        />
      </View>

      {/* Sub-row: progress numbers */}
      <View style={styles.subRow}>
        <Text testID="zone-progress-percent" style={styles.subText}>
          {Math.round(progressPercent * 100)}%
        </Text>
        <Text style={styles.subText}>
          {formatNumber(currentProgress)} / {formatNumber(threshold)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: `${COLORS.surface}E0`,
    borderRadius: RADII.md,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: `${COLORS.gilt}55`,
    ...SHADOWS.sm,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  biomeName: {
    fontFamily: FONTS.displayMediumItalic,
    fontSize: 13,
    color: COLORS.ink2,
  },
  zoneLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.ink,
  },
  gatePill: {
    backgroundColor: COLORS.nectarBg,
    borderRadius: RADII.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: `${COLORS.nectar}40`,
  },
  gateLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 9,
    color: COLORS.nectar,
    letterSpacing: 0.5,
  },
  barTrack: {
    height: 8,
    backgroundColor: "rgba(42,34,24,0.10)",
    borderRadius: RADII.pill,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: RADII.pill,
  },
  subRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  subText: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.ink3,
    fontVariant: ["tabular-nums"],
  },
});
