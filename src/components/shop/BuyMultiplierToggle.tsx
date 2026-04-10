// =============================================================================
// BuyMultiplierToggle — Row of x1/x10/x25/Max buttons for bulk purchases
// =============================================================================

import { Pressable, StyleSheet, Text, View } from "react-native";

import { BuyMultiplier } from "~/types/game";

const COLORS = {
  background: "#1a1a2e",
  buttonDefault: "#2d4a3e",
  buttonActive: "#ffd700",
  textDefault: "#e8f5e9",
  textActive: "#0d1117",
};

const MULTIPLIER_OPTIONS: readonly { value: BuyMultiplier; label: string }[] = [
  { value: BuyMultiplier.X1, label: "x1" },
  { value: BuyMultiplier.X10, label: "x10" },
  { value: BuyMultiplier.X25, label: "x25" },
  { value: BuyMultiplier.X100, label: "x100" },
  { value: BuyMultiplier.Max, label: "Max" },
];

interface BuyMultiplierToggleProps {
  selected: BuyMultiplier;
  onSelect: (multiplier: BuyMultiplier) => void;
}

export function BuyMultiplierToggle({
  selected,
  onSelect,
}: BuyMultiplierToggleProps) {
  return (
    <View style={styles.container}>
      {MULTIPLIER_OPTIONS.map((option) => {
        const isActive = selected === option.value;
        return (
          <Pressable
            key={option.label}
            style={[styles.button, isActive && styles.buttonActive]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[styles.buttonText, isActive && styles.buttonTextActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.buttonDefault,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonActive: {
    backgroundColor: COLORS.buttonActive,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDefault,
  },
  buttonTextActive: {
    color: COLORS.textActive,
    fontWeight: "700",
  },
});
