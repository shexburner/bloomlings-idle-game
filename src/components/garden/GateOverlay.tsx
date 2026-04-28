import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useGameStore } from "~/state/store";
import { getGateThreshold } from "~/engine/zoneGates";
import { getZoneThreshold } from "~/state/selectors";
import { COLORS, FONTS } from "@/constants/theme";

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function GateOverlay() {
  const gateActive = useGameStore((s) => s.zoneProgress.gateActive);
  const timerMs = useGameStore((s) => s.zoneProgress.gateTimerRemainingMs);
  const progress = useGameStore((s) => s.zoneProgress.currentZoneProgress);
  const currentZone = useGameStore((s) => s.zoneProgress.currentZone);
  const gateFailCount = useGameStore((s) => s.zoneProgress.gateFailCount);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!gateActive) return;
    const id = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [gateActive]);

  const threshold = getGateThreshold(getZoneThreshold(currentZone));
  const remaining = timerMs ?? 0;
  const urgent = remaining < 10000;
  const pulseDuration = urgent ? 300 : 800;

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.5, { duration: pulseDuration }),
        withTiming(1, { duration: pulseDuration })
      ),
      -1,
      true
    ),
  }));

  if (!gateActive) return null;

  const ratio = Math.min(progress / threshold, 1);

  return (
    <Animated.View style={[styles.container, pulseStyle]}>
      <Text style={styles.title}>⚔ ZONE GATE</Text>
      <Text style={[styles.timer, urgent && styles.timerUrgent]}>
        {formatCountdown(remaining)}
      </Text>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${ratio * 100}%` }]} />
      </View>
      <Text style={styles.progress}>
        {Math.floor(progress)} / {Math.floor(threshold)}
      </Text>
      {gateFailCount > 0 && (
        <Text style={styles.bonus}>+{gateFailCount * 5}% bonus</Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(244,178,28,0.15)",
    borderWidth: 1,
    borderColor: COLORS.warning,
    alignItems: "center",
  },
  title: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.warning,
    marginBottom: 4,
  },
  timer: {
    fontFamily: FONTS.bodyBold,
    fontSize: 24,
    color: COLORS.sunlight,
  },
  timerUrgent: { color: COLORS.danger },
  barBg: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.3)",
    marginTop: 8,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: COLORS.warning,
  },
  progress: {
    fontFamily: FONTS.body,
    fontSize: 12,
    color: COLORS.paper,
    marginTop: 4,
  },
  bonus: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: COLORS.sunlightHi,
    marginTop: 2,
  },
});
