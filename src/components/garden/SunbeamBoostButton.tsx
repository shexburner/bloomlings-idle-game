// =============================================================================
// SunbeamBoostButton — Floating action button for the Sunbeam Boost ad touchpoint
// =============================================================================
// Visible once the player has reached Zone 15 (allTimeHighestZone >= 15).
// While a Sunbeam Boost is active the button shows a mm:ss countdown;
// otherwise it offers the rewarded ad. Mounted in app/(tabs)/index.tsx.
// =============================================================================

import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useRewardedAd } from "~/services/adManager";
import { useGameStore } from "~/state/store";
import { AdTouchpoint } from "~/types/game";

const COLORS = {
  bg: "#2b1a00",
  bgActive: "#1a2b00",
  border: "#b37700",
  borderActive: "#2e7d32",
  text: "#ffb300",
  textActive: "#4caf50",
  disabled: "#3a3a3a",
  disabledText: "#666",
};

/** Format milliseconds remaining as mm:ss. */
function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function SunbeamBoostButton() {
  const allTimeHighestZone = useGameStore(
    (s) => s.prestige.allTimeHighestZone
  );
  const activeBoosts = useGameStore((s) => s.activeBoosts);
  const applySunbeamBoost = useGameStore((s) => s.applySunbeamBoost);

  const { isLoaded, show } = useRewardedAd("sunbeamBoost");
  const [isWatching, setIsWatching] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  // Tick state so the countdown re-renders each second.
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (allTimeHighestZone < 15) return null;

  const now = Date.now();
  const sunbeamBoost = activeBoosts.find(
    (b) => b.source === AdTouchpoint.SunbeamBoost
  );
  const isActive = sunbeamBoost !== undefined && sunbeamBoost.expiresAt > now;
  const remainingMs = isActive ? sunbeamBoost.expiresAt - now : 0;

  const handlePress = () => {
    if (isWatching || isActive) return;
    setUnavailable(false);
    setIsWatching(true);
    show({
      onReward: () => {
        applySunbeamBoost();
        setIsWatching(false);
      },
      onUnavailable: () => {
        setIsWatching(false);
        setUnavailable(true);
      },
    });
  };

  const disabled = isWatching || isActive || !isLoaded;

  return (
    <Pressable
      testID="sunbeam-boost-button"
      style={[
        styles.fab,
        isActive && styles.fabActive,
        disabled && !isActive && styles.fabDisabled,
      ]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[styles.icon, isActive && styles.iconActive]}>☀</Text>
      {isActive ? (
        <Text style={styles.countdown}>{formatCountdown(remainingMs)}</Text>
      ) : (
        <View style={styles.labelRow}>
          <Text style={[styles.label, disabled && styles.labelDisabled]}>
            {isWatching ? "Loading…" : "2× Boost"}
          </Text>
          {!isWatching && (
            <Text style={[styles.adBadge, disabled && styles.labelDisabled]}>
              Ad
            </Text>
          )}
        </View>
      )}
      {unavailable && !isActive && (
        <Text style={styles.unavailableNote}>No ad available</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 16,
    bottom: 64,
    width: 72,
    minHeight: 72,
    borderRadius: 36,
    backgroundColor: COLORS.bg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  fabActive: {
    backgroundColor: COLORS.bgActive,
    borderColor: COLORS.borderActive,
  },
  fabDisabled: {
    opacity: 0.5,
  },
  icon: {
    fontSize: 22,
    color: COLORS.text,
  },
  iconActive: {
    color: COLORS.textActive,
  },
  countdown: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textActive,
    marginTop: 2,
  },
  labelRow: {
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 2,
  },
  labelDisabled: {
    color: COLORS.disabledText,
  },
  adBadge: {
    fontSize: 9,
    color: COLORS.text,
    marginTop: 1,
    fontWeight: "600",
  },
  unavailableNote: {
    fontSize: 8,
    color: COLORS.disabledText,
    textAlign: "center",
    marginTop: 2,
  },
});
