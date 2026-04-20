// =============================================================================
// BloomlingDisplay — Centered Bloomling with name-plate pill
// =============================================================================

import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useGameStore } from "~/state/store";
import { COLORS, FONTS, RADII, SHADOWS } from "@/constants/theme";

export function BloomlingDisplay() {
  const activeBloomling = useGameStore((s) => {
    for (const slotId of s.garden.slots) {
      if (slotId !== null && s.bloomlings[slotId]) {
        return s.bloomlings[slotId];
      }
    }
    return null;
  });

  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -8, duration: 1400, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [bounceAnim]);

  const displayName = activeBloomling ? activeBloomling.templateId : "Seedling";
  const displayLevel = activeBloomling ? activeBloomling.level : 1;
  const displayStage = activeBloomling ? activeBloomling.evolutionStage : "sprout";
  const stageLabel = displayStage.charAt(0).toUpperCase() + displayStage.slice(1);

  return (
    <View style={styles.container}>
      {/* Halo glow ring */}
      <View style={styles.haloRing}>
        <Animated.View style={[styles.spriteArea, { transform: [{ translateY: bounceAnim }] }]}>
          {/* Bloomling sprite circle */}
          <View style={styles.spriteCircle}>
            <Text style={styles.spriteEmoji}>{"\uD83C\uDF31"}</Text>
          </View>
        </Animated.View>
      </View>

      {/* Name plate pill */}
      <LinearGradient
        colors={[COLORS.surface, COLORS.paperDeep]}
        style={styles.namePlate}
      >
        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.infoRow}>
          <View style={styles.stageDot} />
          <Text style={styles.stageText}>
            Lv. {displayLevel} · {stageLabel}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  haloRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: `${COLORS.sunlight}18`,
    borderWidth: 1,
    borderColor: `${COLORS.sunlight}30`,
    marginBottom: 14,
    ...SHADOWS.glowSun,
  },
  spriteArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  spriteCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${COLORS.sageSoft}60`,
    borderWidth: 2,
    borderColor: `${COLORS.gilt}70`,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.glowMoss,
  },
  spriteEmoji: {
    fontSize: 58,
  },
  namePlate: {
    alignItems: "center",
    borderRadius: RADII.xl,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: `${COLORS.gilt}60`,
    ...SHADOWS.md,
  },
  name: {
    fontFamily: FONTS.display,
    fontSize: 20,
    color: COLORS.ink,
    marginBottom: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  stageDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.sage,
  },
  stageText: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.ink3,
  },
});
