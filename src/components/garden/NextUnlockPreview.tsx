// =============================================================================
// NextUnlockPreview — Compact single-line showing distance to next unlock
// =============================================================================

import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { useNextUnlock } from "~/hooks/useNextUnlock";
import { COLORS, FONTS, RADII, SHADOWS } from "@/constants/theme";

export function NextUnlockPreview() {
  const unlock = useNextUnlock();
  const pulse = useSharedValue(1);

  const nearTarget = unlock !== null && unlock.progress >= 0.8;

  useEffect(() => {
    if (nearTarget) {
      pulse.value = withRepeat(withTiming(1.05, { duration: 800 }), -1, true);
    } else {
      pulse.value = 1;
    }
  }, [nearTarget, pulse]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  if (!unlock) return null;

  const zonesLeft = unlock.targetZone - unlock.currentZone;
  const icon = unlock.type === "bloomling" ? "🌱" : "⭐";
  const pct = Math.round(unlock.progress * 100);

  return (
    <Animated.View testID="next-unlock-preview" style={[styles.container, animStyle]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.text} numberOfLines={1}>
        {unlock.label} in {zonesLeft} zone{zonesLeft !== 1 ? "s" : ""}
      </Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: `${COLORS.surface}E0`,
    borderRadius: RADII.sm,
    borderWidth: 1,
    borderColor: `${COLORS.gilt}40`,
    gap: 6,
    ...SHADOWS.sm,
  },
  icon: { fontSize: 14 },
  text: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 11,
    color: COLORS.ink2,
    flex: 1,
  },
  barTrack: {
    width: 48,
    height: 5,
    backgroundColor: `${COLORS.ink}10`,
    borderRadius: RADII.pill,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: COLORS.sage,
    borderRadius: RADII.pill,
  },
});
