// =============================================================================
// CurrencyBar — Top bar: Sunlight (animated), idle rate, Nectar, Dewdrops
// =============================================================================

import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useGameStore } from "~/state/store";
import { totalSunlightPerSecondFromRegistry } from "~/state/selectors";
import { formatNumber, formatRate } from "~/utils/formatNumber";
import { COLORS, FONTS, RADII, SHADOWS } from "@/constants/theme";

export function CurrencyBar() {
  const sunlight = useGameStore((s) => s.resources.sunlight);
  const nectar = useGameStore((s) => s.resources.nectar);
  const dewdrops = useGameStore((s) => s.resources.dewdrops);

  const idleRate = useGameStore((s) =>
    totalSunlightPerSecondFromRegistry({
      bloomlings: s.bloomlings,
      garden: s.garden,
      upgrades: s.upgrades,
    })
  );

  // Animated sunlight counter
  const animatedSunlight = useRef(new Animated.Value(sunlight)).current;
  const displaySunlightRef = useRef(sunlight);
  const [displaySunlight, setDisplaySunlight] = useState(sunlight);

  useEffect(() => {
    Animated.timing(animatedSunlight, {
      toValue: sunlight,
      duration: 200,
      useNativeDriver: false,
    }).start();
    const id = animatedSunlight.addListener(({ value }) => {
      const rounded = Math.floor(value);
      if (formatNumber(rounded) !== formatNumber(displaySunlightRef.current)) {
        displaySunlightRef.current = rounded;
        setDisplaySunlight(rounded);
      }
    });
    return () => animatedSunlight.removeListener(id);
  }, [sunlight, animatedSunlight]);

  return (
    <LinearGradient
      testID="currency-bar"
      colors={[COLORS.surface, COLORS.paperDeep]}
      style={styles.container}
    >
      {/* Sunlight chip */}
      <View style={[styles.chip, styles.chipSun]}>
        <View style={[styles.dot, { backgroundColor: COLORS.sunlight, ...SHADOWS.glowSun }]} />
        <Text testID="currency-sunlight" style={styles.chipValue}>
          {formatNumber(displaySunlight)}
        </Text>
        {idleRate > 0 && (
          <Text testID="currency-sunlight-rate" style={styles.chipRate}>
            {formatRate(idleRate)}/s
          </Text>
        )}
      </View>

      {/* Nectar chip */}
      <View style={[styles.chip, styles.chipNectar]}>
        <View style={[styles.dot, { backgroundColor: COLORS.nectar }]} />
        <Text testID="currency-nectar" style={styles.chipValue}>
          {formatNumber(nectar)}
        </Text>
      </View>

      {/* Dewdrop chip */}
      <View style={[styles.chip, styles.chipDew]}>
        <View style={[styles.dot, { backgroundColor: COLORS.dewdrop }]} />
        <Text testID="currency-dewdrops" style={styles.chipValue}>
          {formatNumber(dewdrops)}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADII.pill,
    paddingVertical: 5,
    paddingHorizontal: 5,
    marginHorizontal: 16,
    marginTop: 10,
    ...SHADOWS.md,
    // gilt border approximation via border
    borderWidth: 1,
    borderColor: `${COLORS.gilt}70`,
  },
  chip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: RADII.pill,
    justifyContent: "center",
  },
  chipSun: {
    backgroundColor: COLORS.sunlightBg,
  },
  chipNectar: {
    backgroundColor: COLORS.nectarBg,
  },
  chipDew: {
    backgroundColor: COLORS.dewdropBg,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  chipValue: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.ink,
    fontVariant: ["tabular-nums"],
  },
  chipRate: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.ink3,
    marginLeft: 1,
  },
});
