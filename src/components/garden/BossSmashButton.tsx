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

export function BossSmashButton() {
  const bossActive = useGameStore((s) => s.zoneProgress.bossActive);
  const bossFailCount = useGameStore((s) => s.zoneProgress.bossFailCount);
  const timerMs = useGameStore((s) => s.zoneProgress.bossTimerRemainingMs);
  const bossSmashUsed = useGameStore((s) => s.zoneProgress.bossSmashUsed);
  const applyBossSmash = useGameStore((s) => s.applyBossSmash);

  const { isLoaded, show } = useRewardedAd("bossSmash");
  const [isWatching, setIsWatching] = useState(false);

  const visible =
    bossActive &&
    !bossSmashUsed &&
    (bossFailCount >= 1 || (timerMs ?? Infinity) < 30000);

  if (!visible) return null;

  const handlePress = () => {
    if (isWatching) return;
    setIsWatching(true);
    show({
      onReward: () => {
        applyBossSmash();
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
      testID="boss-smash-button"
      style={[styles.btn, disabled && styles.btnDisabled]}
      onPress={handlePress}
      disabled={disabled}
    >
      <Text style={styles.icon}>💥</Text>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {isWatching ? "Loading…" : "SMASH 25%"}
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
  btn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: C.bg,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  icon: { fontSize: 22 },
  label: { fontSize: 15, fontWeight: "800", color: C.text, marginTop: 2 },
  labelDisabled: { color: C.disabledText },
  adBadge: { fontSize: 9, color: C.text, marginTop: 1, fontWeight: "600" },
});
