import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { useRewardedAd } from "~/services/adManager";
import { useGameStore } from "~/state/store";
import * as audioService from "~/services/audioService";
import { boostHaptic } from "~/utils/haptics";

const C = {
  bg: "#2b1a00",
  border: "#b37700",
  text: "#ffb300",
  disabled: "#3a3a3a",
  disabledText: "#666",
};

export function GateAssistButton() {
  const gateActive = useGameStore((s) => s.zoneProgress.gateActive);
  const gateFailCount = useGameStore((s) => s.zoneProgress.gateFailCount);
  const timerMs = useGameStore((s) => s.zoneProgress.gateTimerRemainingMs);
  const gateAssistUsed = useGameStore((s) => s.zoneProgress.gateAssistUsed);
  const applyGateAssist = useGameStore((s) => s.applyGateAssist);

  const { isLoaded, show } = useRewardedAd("gateAssist");
  const [isWatching, setIsWatching] = useState(false);

  const visible =
    gateActive &&
    !gateAssistUsed &&
    (gateFailCount >= 1 || (timerMs ?? Infinity) < 10000);

  if (!visible) return null;

  const handlePress = () => {
    if (isWatching) return;
    setIsWatching(true);
    show({
      onReward: () => {
        applyGateAssist();
        setIsWatching(false);
        boostHaptic();
        audioService.play("boost");
      },
      onUnavailable: () => setIsWatching(false),
    });
  };

  const disabled = isWatching || !isLoaded;

  return (
    <Pressable
      testID="gate-assist-button"
      style={[styles.pill, disabled && styles.pillDisabled]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {isWatching ? "Loading…" : "+15s Assist"}
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
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: C.bg,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: "center",
  },
  pillDisabled: { opacity: 0.5 },
  label: { fontSize: 13, fontWeight: "700", color: C.text },
  labelDisabled: { color: C.disabledText },
  adBadge: { fontSize: 9, color: C.text, marginTop: 1, fontWeight: "600" },
});
