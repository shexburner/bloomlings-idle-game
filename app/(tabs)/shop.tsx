// =============================================================================
// Shop Tab — Placeholder screen for upgrade shop
// =============================================================================

import { StyleSheet, Text, View } from "react-native";

export default function ShopScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upgrade Shop</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
      <Text style={styles.description}>
        Purchase tap and idle upgrades to grow your garden faster.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#e8f5e9",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7b6e",
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: "#8a9b8e",
    textAlign: "center",
    lineHeight: 20,
  },
});
