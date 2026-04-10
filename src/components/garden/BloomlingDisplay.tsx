// =============================================================================
// BloomlingDisplay — Centered area for the active Bloomling with idle animation
// =============================================================================

import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useGameStore } from "~/state/store";

/** Color palette. */
const COLORS = {
  text: "#e8f5e9",
  textMuted: "#8a9b8e",
  accent: "#4caf50",
  border: "#2d4a3e",
  circleBg: "rgba(45,74,62,0.3)",
};

export function BloomlingDisplay() {
  // Get the first active bloomling in the garden (first non-null slot)
  const activeBloomling = useGameStore((s) => {
    for (const slotId of s.garden.slots) {
      if (slotId !== null && s.bloomlings[slotId]) {
        return s.bloomlings[slotId];
      }
    }
    return null;
  });

  // Gentle idle bounce animation
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [bounceAnim]);

  const displayName = activeBloomling
    ? activeBloomling.templateId
    : "Seedling";

  const displayLevel = activeBloomling ? activeBloomling.level : 1;
  const displayStage = activeBloomling
    ? activeBloomling.evolutionStage
    : "sprout";

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spriteArea,
          { transform: [{ translateY: bounceAnim }] },
        ]}
      >
        {/* Placeholder sprite circle — will be replaced with sprite art */}
        <View style={styles.spriteCircle}>
          <Text style={styles.spriteEmoji}>{"\uD83C\uDF31"}</Text>
        </View>
      </Animated.View>

      <Text style={styles.name}>{displayName}</Text>
      <View style={styles.infoRow}>
        <Text style={styles.level}>Lv. {displayLevel}</Text>
        <Text style={styles.stageBadge}>
          {displayStage.charAt(0).toUpperCase() + displayStage.slice(1)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  spriteArea: {
    marginBottom: 12,
  },
  spriteCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.circleBg,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  spriteEmoji: {
    fontSize: 48,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  level: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.accent,
  },
  stageBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textMuted,
    backgroundColor: "rgba(45,74,62,0.5)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
});
