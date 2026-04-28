// =============================================================================
// BiomeMechanicHUD — Renders the correct biome mechanic UI for current zone
// =============================================================================

import { StyleSheet, Text, View } from "react-native";

import { useGameStore } from "~/state/store";
import { getCurrentBiomeInfo, getBiomeIndex } from "~/engine/biomeMechanics";
import { SunburstOrb } from "./SunburstOrb";
import { GlowMeter } from "./GlowMeter";
import { COLORS, FONTS, RADII } from "@/constants/theme";

export function BiomeMechanicHUD() {
  const currentZone = useGameStore((s) => s.zoneProgress.currentZone);
  const biome = getCurrentBiomeInfo(currentZone);
  const biomeIdx = getBiomeIndex(currentZone);

  // Biome 1: no mechanic
  if (biomeIdx === 1 || !biome.mechanicName) return null;

  // Biome 2: Sunburst orb
  if (biomeIdx === 2) return <SunburstOrb />;

  // Biome 3: Glow meter
  if (biomeIdx === 3) return <GlowMeter />;

  // Biomes 4-8: simple status badge
  return (
    <View testID="biome-mechanic-badge" style={styles.badge}>
      <Text style={styles.badgeText}>
        ✦ {biome.mechanicName}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: 8,
    right: 12,
    backgroundColor: `${COLORS.biomeCavernsGlow}30`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: `${COLORS.biomeCavernsGlow}50`,
    zIndex: 10,
  },
  badgeText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    color: COLORS.biomeCavernsGlow,
  },
});
