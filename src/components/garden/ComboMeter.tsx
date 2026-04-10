// =============================================================================
// ComboMeter — Displays current combo count and multiplier
// =============================================================================

import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useGameStore } from "~/state/store";
import { getComboMultiplier } from "~/state/selectors";

/** Color palette. */
const COLORS = {
  text: "#e8f5e9",
  accent: "#4caf50",
  highCombo: "#ffd700",
  glow: "rgba(255,215,0,0.3)",
};

/** Threshold for "high combo" visual effects. */
const HIGH_COMBO_THRESHOLD = 50;

export function ComboMeter() {
  const comboCount = useGameStore((s) => s.combo.count);
  const comboMultiplier = getComboMultiplier(comboCount);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isHighCombo = comboCount >= HIGH_COMBO_THRESHOLD;

  // Fade in/out based on combo activity
  useEffect(() => {
    if (comboCount > 0) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [comboCount, fadeAnim]);

  // Pulse effect on each combo increment
  useEffect(() => {
    if (comboCount > 0) {
      scaleAnim.setValue(1.15);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [comboCount, scaleAnim]);

  // High-combo pulsing glow
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isHighCombo) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => {
        pulse.stop();
      };
    }

    pulseAnim.setValue(0);
    return undefined;
  }, [isHighCombo, pulseAnim]);

  if (comboCount === 0) {
    return null;
  }

  const glowOpacity = isHighCombo
    ? pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.8],
      })
    : 0;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {isHighCombo && (
        <Animated.View
          style={[styles.glowOverlay, { opacity: glowOpacity }]}
        />
      )}
      <Text style={[styles.comboText, isHighCombo && styles.highComboText]}>
        x{comboCount} Combo
      </Text>
      <Text
        style={[
          styles.multiplierText,
          isHighCombo && styles.highMultiplierText,
        ]}
      >
        ({comboMultiplier.toFixed(2)}x)
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "rgba(26,26,46,0.8)",
    overflow: "hidden",
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.glow,
    borderRadius: 16,
  },
  comboText: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.accent,
  },
  highComboText: {
    color: COLORS.highCombo,
  },
  multiplierText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 2,
  },
  highMultiplierText: {
    color: COLORS.highCombo,
  },
});
