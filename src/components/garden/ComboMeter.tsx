// =============================================================================
// ComboMeter — Gilt pill: bolt badge, combo count, fill bar
// =============================================================================

import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useGameStore } from "~/state/store";
import { getComboMultiplier } from "~/state/selectors";
import { COLORS, FONTS, RADII, SHADOWS } from "@/constants/theme";

const HIGH_COMBO_THRESHOLD = 50;
const BAR_MAX = 100;

export function ComboMeter() {
  const comboCount = useGameStore((s) => s.combo.count);
  const comboMultiplier = getComboMultiplier(comboCount);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isHighCombo = comboCount >= HIGH_COMBO_THRESHOLD;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: comboCount > 0 ? 1 : 0,
      duration: comboCount > 0 ? 150 : 300,
      useNativeDriver: true,
    }).start();
  }, [comboCount, fadeAnim]);

  useEffect(() => {
    if (comboCount > 0) {
      scaleAnim.setValue(1.12);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [comboCount, scaleAnim]);

  const fillWidth = Math.min(comboCount / BAR_MAX, 1) * 70;

  if (comboCount === 0) return null;

  return (
    <Animated.View
      testID="combo-meter"
      style={[styles.wrapper, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
    >
      <LinearGradient colors={[COLORS.surface, COLORS.paperDeep]} style={styles.container}>
        {/* Bolt badge */}
        <LinearGradient
          colors={[COLORS.sunlightHi, COLORS.sunlight]}
          style={styles.boltBadge}
        >
          <Text style={styles.boltEmoji}>⚡</Text>
        </LinearGradient>

        {/* Center: count + multiplier */}
        <View style={styles.center}>
          <View style={styles.countRow}>
            <Text testID="combo-count" style={[styles.comboCount, isHighCombo && styles.highComboCount]}>
              {comboCount}
            </Text>
            <Text testID="combo-multiplier" style={[styles.multText, isHighCombo && styles.highMultText]}>
              {" "}×{comboMultiplier.toFixed(2)}
            </Text>
          </View>
          <Text style={styles.comboLabel}>COMBO</Text>
        </View>

        {/* Fill bar */}
        <View style={styles.barTrack}>
          <LinearGradient
            colors={isHighCombo ? [COLORS.nectarHi, COLORS.nectar] : [COLORS.sunlightHi, COLORS.sunlight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.barFill, { width: fillWidth }]}
          />
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: RADII.pill,
    ...SHADOWS.md,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: RADII.pill,
    borderWidth: 1,
    borderColor: `${COLORS.gilt}60`,
  },
  boltBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${COLORS.gilt}80`,
  },
  boltEmoji: {
    fontSize: 14,
  },
  center: {
    alignItems: "center",
    minWidth: 70,
  },
  countRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  comboCount: {
    fontFamily: FONTS.bodyBlack,
    fontSize: 20,
    color: COLORS.ink,
    fontVariant: ["tabular-nums"],
  },
  highComboCount: {
    color: COLORS.nectar,
  },
  multText: {
    fontFamily: FONTS.displayMediumItalic,
    fontSize: 14,
    color: COLORS.sunlight,
  },
  highMultText: {
    color: COLORS.nectar,
  },
  comboLabel: {
    fontFamily: FONTS.body,
    fontSize: 9,
    color: COLORS.ink3,
    letterSpacing: 0.8,
  },
  barTrack: {
    width: 70,
    height: 5,
    backgroundColor: "rgba(42,34,24,0.12)",
    borderRadius: RADII.pill,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: RADII.pill,
  },
});
