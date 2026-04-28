// =============================================================================
// GlowMeter — Vertical luminescence bar for Biome 3 (Twilight Hollow)
// =============================================================================

import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useGameStore } from "~/state/store";
import { totalSunlightPerSecondFromRegistry } from "~/state/selectors";
import { COLORS, FONTS, RADII } from "@/constants/theme";

const COOLDOWN_SECONDS = 60;

export function GlowMeter() {
  const glowMeterPercent = useGameStore(
    (s) => ((s as unknown as Record<string, unknown>).biomeMechanic as { glowMeterPercent?: number } | undefined)?.glowMeterPercent ?? 0
  );
  const addSunlight = useGameStore((s) => s.addSunlight);
  const addZoneProgress = useGameStore((s) => s.addZoneProgress);
  const storeState = useGameStore((s) => ({
    bloomlings: s.bloomlings,
    garden: s.garden,
    upgrades: s.upgrades,
  }));

  const [cooldownEnd, setCooldownEnd] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(0);

  const onCooldown = cooldownEnd !== null && Date.now() < cooldownEnd;
  const isFull = glowMeterPercent >= 100 && !onCooldown;

  // Countdown tick
  useEffect(() => {
    if (!cooldownEnd) return;
    const id = setInterval(() => {
      const left = Math.max(0, Math.ceil((cooldownEnd - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) setCooldownEnd(null);
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownEnd]);

  const handleTap = () => {
    if (!isFull) return;
    const idleRate = totalSunlightPerSecondFromRegistry(storeState);
    const burst = idleRate * COOLDOWN_SECONDS;
    addSunlight(burst);
    addZoneProgress(burst);
    setCooldownEnd(Date.now() + COOLDOWN_SECONDS * 1000);
    setRemaining(COOLDOWN_SECONDS);
  };

  const fillHeight = onCooldown ? 0 : Math.min(glowMeterPercent, 100);

  return (
    <Pressable
      testID="glow-meter"
      onPress={handleTap}
      disabled={!isFull}
      style={styles.container}
    >
      <View style={styles.track}>
        <View style={[styles.fill, { height: `${fillHeight}%` }]} />
      </View>
      {onCooldown ? (
        <Text style={styles.label}>{remaining}s</Text>
      ) : (
        <Text style={styles.label}>{Math.round(glowMeterPercent)}%</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    top: 120,
    bottom: 120,
    width: 24,
    alignItems: "center",
    justifyContent: "flex-end",
    zIndex: 10,
  },
  track: {
    flex: 1,
    width: 12,
    backgroundColor: `${COLORS.biomeHollowBg}80`,
    borderRadius: RADII.sm,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  fill: {
    width: "100%",
    backgroundColor: COLORS.biomeHollowGlow,
    borderRadius: RADII.sm,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: 9,
    color: COLORS.biomeHollowGlow,
    marginTop: 4,
  },
});
