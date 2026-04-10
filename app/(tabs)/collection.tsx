// =============================================================================
// Collection Tab — Placeholder screen for Bloomling collection
// =============================================================================

import { StyleSheet, Text, View } from "react-native";

export default function CollectionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bloomling Collection</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
      <Text style={styles.description}>
        View your discovered Bloomlings, their evolutions, and lore.
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
