import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useGameStore } from "~/state/store";
import { getBossHpPhase } from "~/engine/bossFight";
import { COLORS, FONTS } from "@/constants/theme";

const PHASE_COLORS: Record<string, string> = {
  full: COLORS.success,
  damaged: COLORS.warning,
  wounded: "#E07020",
  critical: COLORS.danger,
  defeated: "#666",
};

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function BossOverlay() {
  const bossActive = useGameStore((s) => s.zoneProgress.bossActive);
  const hpRemaining = useGameStore((s) => s.zoneProgress.bossHpRemaining);
  const hpMax = useGameStore((s) => s.zoneProgress.bossHpMax);
  const timerMs = useGameStore((s) => s.zoneProgress.bossTimerRemainingMs);
  const currentZone = useGameStore((s) => s.zoneProgress.currentZone);
  const bossFailCount = useGameStore((s) => s.zoneProgress.bossFailCount);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!bossActive) return;
    const id = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [bossActive]);

  if (!bossActive || hpMax === null || hpRemaining === null) return null;

  const phase = getBossHpPhase(hpRemaining, hpMax);
  const phaseColor = PHASE_COLORS[phase] ?? COLORS.danger;
  const hpRatio = Math.max(0, Math.min(hpRemaining / hpMax, 1));
  const remaining = timerMs ?? 0;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>🐉 BOSS — Zone {currentZone}</Text>
        <Text style={styles.timer}>{formatCountdown(remaining)}</Text>

        {/* HP bar */}
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              { width: `${hpRatio * 100}%`, backgroundColor: phaseColor },
            ]}
          />
        </View>
        <Text style={[styles.hpText, { color: phaseColor }]}>
          {Math.ceil(hpRemaining)} / {Math.ceil(hpMax)}
        </Text>

        <Text style={styles.tapPower}>2× TAP POWER</Text>

        {bossFailCount > 0 && (
          <Text style={styles.bonus}>+{bossFailCount * 5}% bonus</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  card: {
    width: "85%",
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#1a0a0a",
    borderWidth: 2,
    borderColor: COLORS.danger,
    alignItems: "center",
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 20,
    color: COLORS.danger,
    marginBottom: 4,
  },
  timer: {
    fontFamily: FONTS.bodyBold,
    fontSize: 28,
    color: COLORS.paper,
    marginBottom: 12,
  },
  barBg: {
    width: "100%",
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 6 },
  hpText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 13,
    marginTop: 4,
  },
  tapPower: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: COLORS.sunlightHi,
    marginTop: 12,
  },
  bonus: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: COLORS.sunlightHi,
    marginTop: 4,
  },
});
