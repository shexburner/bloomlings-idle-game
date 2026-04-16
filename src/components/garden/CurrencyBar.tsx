// =============================================================================
// CurrencyBar — Top bar showing Sunlight, Sunlight/sec, Nectar, Dewdrops
// =============================================================================

import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useGameStore } from "~/state/store";
import { totalSunlightPerSecondFromRegistry } from "~/state/selectors";
import { formatNumber, formatRate } from "~/utils/formatNumber";

/** Color palette for the currency bar. */
const COLORS = {
  background: "#1a1a2e",
  glow: "#2d4a3e",
  sunlight: "#ffd700",
  nectar: "#e040fb",
  dewdrop: "#4fc3f7",
  text: "#e8f5e9",
  textMuted: "#8a9b8e",
};

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

  // Animated sunlight counter for smooth counting effect
  const animatedSunlight = useRef(new Animated.Value(sunlight)).current;
  const displaySunlightRef = useRef(sunlight);
  const [displaySunlight, setDisplaySunlight] = useState(sunlight);

  useEffect(() => {
    Animated.timing(animatedSunlight, {
      toValue: sunlight,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Update displayed value periodically during animation
    const id = animatedSunlight.addListener(({ value }) => {
      const rounded = Math.floor(value);
      if (formatNumber(rounded) !== formatNumber(displaySunlightRef.current)) {
        displaySunlightRef.current = rounded;
        setDisplaySunlight(rounded);
      }
    });

    return () => {
      animatedSunlight.removeListener(id);
    };
  }, [sunlight, animatedSunlight]);

  return (
    <View testID="currency-bar" style={styles.container}>
      {/* Sunlight - primary currency, takes full width on top */}
      <View style={styles.primaryRow}>
        <Text style={styles.sunlightIcon}>{"\u2600"}</Text>
        <Text testID="currency-sunlight" style={styles.sunlightValue}>
          {formatNumber(displaySunlight)}
        </Text>
        <Text testID="currency-sunlight-rate" style={styles.rateText}>
          {formatRate(idleRate)}
        </Text>
      </View>

      {/* Secondary currencies */}
      <View style={styles.secondaryRow}>
        <View style={styles.currencyChip}>
          <Text style={styles.nectarIcon}>{"\u2727"}</Text>
          <Text testID="currency-nectar" style={styles.nectarValue}>
            {formatNumber(nectar)}
          </Text>
        </View>
        <View style={styles.currencyChip}>
          <Text style={styles.dewdropIcon}>{"\u25C6"}</Text>
          <Text testID="currency-dewdrops" style={styles.dewdropValue}>
            {formatNumber(dewdrops)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glow,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  primaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sunlightIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  sunlightValue: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.sunlight,
    flex: 1,
  },
  rateText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  secondaryRow: {
    flexDirection: "row",
    gap: 16,
  },
  currencyChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  nectarIcon: {
    fontSize: 14,
    color: COLORS.nectar,
  },
  nectarValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.nectar,
  },
  dewdropIcon: {
    fontSize: 12,
    color: COLORS.dewdrop,
  },
  dewdropValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.dewdrop,
  },
});
