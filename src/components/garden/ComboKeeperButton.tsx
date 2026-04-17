// =============================================================================
// ComboKeeperButton — Pill shown beside ComboMeter to freeze combo decay
// =============================================================================
// Visible only when combo >= 50, combo is not already frozen, and the 30-min
// cooldown has elapsed. Consumes the comboKeeper rewarded-ad touchpoint.
// Mounted in app/(tabs)/index.tsx next to the ComboMeter.
// =============================================================================

import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

import { useRewardedAd } from "~/services/adManager";
import { useGameStore } from "~/state/store";

/** Must match COMBO_KEEPER_COOLDOWN_MS in store.ts. */
const COMBO_KEEPER_COOLDOWN_MS = 30 * 60 * 1000;

const COMBO_THRESHOLD = 50;

const COLORS = {
  bg: "#003333",
  border: "#00bcd4",
  text: "#00e5ff",
  adBadge: "#80deea",
  disabled: "#3a3a3a",
  disabledText: "#666",
};

export function ComboKeeperButton() {
  const comboCount = useGameStore((s) => s.combo.count);
  const comboFrozen = useGameStore((s) => s.combo.frozen);
  const lastComboKeeperAt = useGameStore((s) => s.lastComboKeeperAt);
  const applyComboKeeper = useGameStore((s) => s.applyComboKeeper);

  const { isLoaded, show } = useRewardedAd("comboKeeper");
  const [isWatching, setIsWatching] = useState(false);

  const cooldownClear =
    lastComboKeeperAt === null ||
    Date.now() - lastComboKeeperAt >= COMBO_KEEPER_COOLDOWN_MS;

  if (comboCount < COMBO_THRESHOLD || comboFrozen || !cooldownClear) {
    return null;
  }

  const handlePress = () => {
    if (isWatching) return;
    setIsWatching(true);
    show({
      onReward: () => {
        const success = applyComboKeeper();
        setIsWatching(false);
        // applyComboKeeper returns false if cooldown was concurrently violated —
        // treat as a no-op (the button will hide itself once state updates).
        void success;
      },
      onUnavailable: () => {
        setIsWatching(false);
      },
    });
  };

  const disabled = isWatching || !isLoaded;

  return (
    <Pressable
      testID="combo-keeper-button"
      style={[styles.pill, disabled && styles.pillDisabled]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {isWatching ? "Loading…" : "Freeze Combo"}
      </Text>
      {!isWatching && (
        <Text style={[styles.adBadge, disabled && styles.labelDisabled]}>
          Ad
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    marginLeft: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  pillDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.text,
  },
  labelDisabled: {
    color: COLORS.disabledText,
  },
  adBadge: {
    fontSize: 9,
    color: COLORS.adBadge,
    marginTop: 1,
    fontWeight: "600",
  },
});
