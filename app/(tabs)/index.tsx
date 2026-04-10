// =============================================================================
// Garden Screen — Main game tab (placeholder with currency display)
// =============================================================================

import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGameStore } from "~/state/store";
import { formatNumber } from "~/utils/formatNumber";

export default function GardenScreen() {
  const insets = useSafeAreaInsets();
  const sunlight = useGameStore((s) => s.resources.sunlight);
  const nectar = useGameStore((s) => s.resources.nectar);
  const dewdrops = useGameStore((s) => s.resources.dewdrops);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.currencyRow}>
        <Text style={styles.sunlightLabel}>
          {"\u2600"} {formatNumber(sunlight)}
        </Text>
        <Text style={styles.nectarLabel}>
          {"\u2727"} {formatNumber(nectar)}
        </Text>
        <Text style={styles.dewdropLabel}>
          {"\u25C6"} {formatNumber(dewdrops)}
        </Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>Garden</Text>
        <Text style={styles.subtitle}>Tap to earn Sunlight</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
  },
  currencyRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#1a1a2e",
    borderBottomWidth: 1,
    borderBottomColor: "#2d4a3e",
  },
  sunlightLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffd700",
  },
  nectarLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e040fb",
  },
  dewdropLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4fc3f7",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#e8f5e9",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#8a9b8e",
  },
});
