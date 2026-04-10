// =============================================================================
// ZoneInfo — Expandable zone info panel showing current biome and zone details
// =============================================================================
// Shows: current biome name + description, zone number, threshold to clear,
// gate indicator (if gate zone), highest zone reached.
// Can be used on the main garden screen or as a modal.
// =============================================================================

import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ZoneType } from "~/types/game";
import { useGameStore } from "~/state/store";
import { getZoneThreshold } from "~/state/selectors";
import { formatNumber } from "~/utils/formatNumber";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS = {
  background: "#161b22",
  backgroundExpanded: "#1a1a2e",
  text: "#e8f5e9",
  textMuted: "#8a9b8e",
  accent: "#4caf50",
  border: "#2d4a3e",
  sunlight: "#ffd700",
  gate: "#ff9800",
  barTrack: "#2d4a3e",
  barFill: "#4caf50",
  barFillGate: "#ff9800",
};

/** Biome data: display name, zone range, and flavor description. */
interface BiomeInfo {
  readonly name: string;
  readonly startZone: number;
  readonly endZone: number;
  readonly description: string;
}

const BIOMES: readonly BiomeInfo[] = [
  {
    name: "The Mossy Cradle",
    startZone: 1,
    endZone: 25,
    description:
      "An old greenhouse that the world forgot and the rain remembered. Cracked glass lets in pillars of warm light, and every surface is blanketed in soft green moss.",
  },
  {
    name: "Sunlit Glade",
    startZone: 26,
    endZone: 50,
    description:
      "A wide forest clearing where golden light pools like honey and wildflowers grow tall enough to whisper secrets. Butterflies drift between the meadow grasses.",
  },
  {
    name: "Twilight Hollow",
    startZone: 51,
    endZone: 75,
    description:
      "A shadowed grove where bioluminescent fungi light the way and the air hums with quiet magic. The boundary between day and night blurs here.",
  },
  {
    name: "Crystal Caverns",
    startZone: 76,
    endZone: 100,
    description:
      "Deep underground chambers filled with crystalline formations that refract light into prismatic rainbows. The walls themselves seem to breathe.",
  },
  {
    name: "Scorched Expanse",
    startZone: 101,
    endZone: 125,
    description:
      "A vast sunbaked plain where heat shimmers distort the horizon. Life persists stubbornly in the cracks and crevices of ancient stone.",
  },
  {
    name: "Abyssal Depths",
    startZone: 126,
    endZone: 150,
    description:
      "The deep places below the caverns, where pressure shapes diamond from coal and strange creatures glow in the eternal dark.",
  },
  {
    name: "Celestial Canopy",
    startZone: 151,
    endZone: 175,
    description:
      "Far above the clouds, where treetops pierce the sky and starlight mingles with sunlight. The air is thin and sweet.",
  },
  {
    name: "Frozen Thicket",
    startZone: 176,
    endZone: 200,
    description:
      "An enchanted winter forest where ice flowers bloom eternally and frost sprites dance among the crystal branches.",
  },
];

/** Get the biome info for a given zone number. */
function getBiomeForZone(zoneNumber: number): BiomeInfo {
  for (const biome of BIOMES) {
    if (zoneNumber >= biome.startZone && zoneNumber <= biome.endZone) {
      return biome;
    }
  }
  // Fallback for zones beyond defined biomes
  return BIOMES[BIOMES.length - 1]!;
}

/** Determine if a zone is a gate zone (every 5th zone). */
function getZoneType(zoneNumber: number): ZoneType {
  return zoneNumber % 5 === 0 ? ZoneType.Gate : ZoneType.Normal;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ZoneInfo() {
  const [expanded, setExpanded] = useState(false);

  const currentZone = useGameStore((s) => s.zoneProgress.currentZone);
  const currentProgress = useGameStore(
    (s) => s.zoneProgress.currentZoneProgress
  );
  const gateActive = useGameStore((s) => s.zoneProgress.gateActive);
  const highestZone = useGameStore(
    (s) => s.prestige.allTimeHighestZone
  );

  const threshold = getZoneThreshold(currentZone);
  const progressPercent = Math.min(currentProgress / threshold, 1);
  const biome = getBiomeForZone(currentZone);
  const zoneType = getZoneType(currentZone);
  const isGate = zoneType === ZoneType.Gate;
  const biomeProgress = currentZone - biome.startZone + 1;
  const biomeTotal = biome.endZone - biome.startZone + 1;

  return (
    <View style={styles.container}>
      {/* Compact header — always visible */}
      <Pressable
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.zoneLabel}>Zone {currentZone}</Text>
          {isGate && <Text style={styles.gateBadge}>GATE</Text>}
          {gateActive && <Text style={styles.gateActiveBadge}>ACTIVE</Text>}
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.biomeName}>{biome.name}</Text>
          <Text style={styles.expandIcon}>{expanded ? "\u25B2" : "\u25BC"}</Text>
        </View>
      </Pressable>

      {/* Progress bar */}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            {
              width: `${Math.round(progressPercent * 100)}%`,
              backgroundColor: isGate ? COLORS.barFillGate : COLORS.barFill,
            },
          ]}
        />
      </View>
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          {formatNumber(currentProgress)} / {formatNumber(threshold)}
        </Text>
        <Text style={styles.progressPercent}>
          {Math.round(progressPercent * 100)}%
        </Text>
      </View>

      {/* Expanded details */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Biome description */}
          <Text style={styles.biomeDescription}>{biome.description}</Text>

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Biome Progress</Text>
              <Text style={styles.statValue}>
                {biomeProgress} / {biomeTotal}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Zone Threshold</Text>
              <Text style={[styles.statValue, { color: COLORS.sunlight }]}>
                {formatNumber(threshold)}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Zone Type</Text>
              <Text
                style={[
                  styles.statValue,
                  isGate && { color: COLORS.gate },
                ]}
              >
                {isGate ? "Gate Zone (timed)" : "Normal"}
              </Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Highest Zone Reached</Text>
              <Text style={[styles.statValue, { color: COLORS.accent }]}>
                {highestZone}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  zoneLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  gateBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.gate,
    backgroundColor: COLORS.gate + "22",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  gateActiveBadge: {
    fontSize: 10,
    fontWeight: "700",
    color: "#f44336",
    backgroundColor: "#f4433622",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  biomeName: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
  expandIcon: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  barTrack: {
    height: 6,
    backgroundColor: COLORS.barTrack,
    marginHorizontal: 14,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 10,
  },
  progressText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  progressPercent: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 14,
  },
  biomeDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 18,
    fontStyle: "italic",
    marginBottom: 12,
  },
  statsSection: {
    gap: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.text,
  },
});
