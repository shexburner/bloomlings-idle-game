// =============================================================================
// SunburstOrb — Tappable golden orb during Sunburst events (Biome 2)
// =============================================================================

import { useEffect, useMemo } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { useGameStore } from "~/state/store";
import { getZoneThreshold } from "~/state/selectors";
import { COLORS, SHADOWS } from "@/constants/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SunburstOrb() {
  const sunburstActiveUntil = useGameStore(
    (s) => ((s as unknown as Record<string, unknown>).biomeMechanic as { sunburstActiveUntil?: number } | undefined)?.sunburstActiveUntil
  );
  const currentZone = useGameStore((s) => s.zoneProgress.currentZone);
  const addSunlight = useGameStore((s) => s.addSunlight);
  const addZoneProgress = useGameStore((s) => s.addZoneProgress);

  const isActive = typeof sunburstActiveUntil === "number" && sunburstActiveUntil > Date.now();

  // Random position, stable per mount
  const position = useMemo(() => ({
    top: 180 + Math.random() * 200,
    left: 40 + Math.random() * 200,
  }), []);

  // Pulse animation
  const scale = useSharedValue(1);
  useEffect(() => {
    if (!isActive) return;
    scale.value = withRepeat(withTiming(1.25, { duration: 600, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [isActive, scale]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (!isActive) return null;

  const handleTap = () => {
    const reward = 2 * getZoneThreshold(currentZone);
    addSunlight(reward);
    addZoneProgress(reward);
  };

  return (
    <AnimatedPressable
      testID="sunburst-orb"
      onPress={handleTap}
      style={[styles.orb, { top: position.top, left: position.left }, animStyle]}
    >
      <Animated.Text style={styles.emoji}>☀️</Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.sunlightBg,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.glowSun,
    zIndex: 10,
  },
  emoji: { fontSize: 28 },
});
