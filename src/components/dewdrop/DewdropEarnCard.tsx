// =============================================================================
// DewdropEarnCard — Watch & Earn rewarded-ad card for the Dewdrop shop
// =============================================================================
// Consumes the `dewdropGarden` ad unit via `useRewardedAd` and grants Dewdrops
// through `recordDewdropAdReward`. Surfaces:
//   • a running 3-minute cooldown between ads (based on `daily.lastDewdropAdAt`)
//   • daily cap progress (`adsWatchedToday` / `dailyAdCap`)
//   • current consecutive-day streak bonus
//   • the next reward amount (base + 3rd-of-day + streak)
// =============================================================================

import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useRewardedAd, type AdUnavailableReason } from "~/services/adManager";
import { useGameStore } from "~/state/store";

/** 3-minute cooldown between Watch-&-Earn ads. */
const EARN_COOLDOWN_MS = 3 * 60 * 1000;

const COLORS = {
  cardBg: "#0e1a20",
  border: "#1e4d5a",
  text: "#e0f7fa",
  textMuted: "#8ab0b8",
  dewdrop: "#4dd0e1",
  dewdropDark: "#006978",
  buttonActive: "#4dd0e1",
  buttonActiveText: "#00363a",
  buttonDisabled: "#1a2f36",
  buttonDisabledText: "#5a7b82",
  highlight: "#80deea",
  rewardedNote: "#ffd740",
  warn: "#ff8a65",
};

type Status = "idle" | "watching" | "rewarded" | "unavailable";

function unavailableMessage(reason: AdUnavailableReason): string {
  switch (reason) {
    case "closed_without_reward":
      return "Ad closed early — no Dewdrops earned.";
    case "web_unsupported":
      return "Ads aren't available on web in this build.";
    case "no_fill":
    case "load_error":
    default:
      return "No ad available right now — try again in a moment.";
  }
}

/** "mm:ss" countdown for short durations. */
function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function DewdropEarnCard() {
  const daily = useGameStore((s) => s.daily);
  const recordDewdropAdReward = useGameStore((s) => s.recordDewdropAdReward);

  const { isLoaded, show } = useRewardedAd("dewdropGarden");

  const [status, setStatus] = useState<Status>("idle");
  const [unavailableReason, setUnavailableReason] =
    useState<AdUnavailableReason | null>(null);
  const [lastReward, setLastReward] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const rewardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tick once per second so the cooldown countdown refreshes.
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Clear the reward flash on unmount.
  useEffect(() => {
    return () => {
      if (rewardTimerRef.current !== null) {
        clearTimeout(rewardTimerRef.current);
      }
    };
  }, []);

  const capReached = daily.adsWatchedToday >= daily.dailyAdCap;
  const cooldownRemainingMs =
    daily.lastDewdropAdAt === null
      ? 0
      : Math.max(0, EARN_COOLDOWN_MS - (now - daily.lastDewdropAdAt));
  const cooldownActive = cooldownRemainingMs > 0;

  // Predict the next payout so the button can show "Earn +N".
  const nextCount = daily.adsWatchedToday + 1;
  const everyThirdBonus = nextCount % 3 === 0 ? 1 : 0;
  const streakBonus = Math.min(daily.adStreakDays, 5);
  const predictedReward = 1 + everyThirdBonus + streakBonus;

  const disabled =
    status === "watching" ||
    status === "rewarded" ||
    capReached ||
    cooldownActive;

  const handleWatch = () => {
    if (disabled) return;
    setUnavailableReason(null);
    setLastReward(null);
    setStatus("watching");
    show({
      onReward: () => {
        const granted = recordDewdropAdReward();
        setLastReward(granted);
        setStatus("rewarded");
        rewardTimerRef.current = setTimeout(() => {
          rewardTimerRef.current = null;
          setStatus("idle");
        }, 1500);
      },
      onUnavailable: (reason) => {
        setUnavailableReason(reason);
        setStatus("unavailable");
      },
    });
  };

  const buttonLabel = (() => {
    if (status === "watching") return "Loading ad…";
    if (status === "rewarded") return `+${lastReward ?? 0} Dewdrops!`;
    if (capReached) return "Daily cap reached";
    if (cooldownActive) return `Next in ${formatCountdown(cooldownRemainingMs)}`;
    if (!isLoaded) return "Preparing ad…";
    return `Watch ad · +${predictedReward} 💧`;
  })();

  return (
    <View testID="dewdrop-earn-card" style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Watch &amp; Earn</Text>
        <Text style={styles.capText}>
          {daily.adsWatchedToday} / {daily.dailyAdCap} today
        </Text>
      </View>

      <Text style={styles.description}>
        Watch a short ad to earn Dewdrops. Every 3rd ad grants a bonus, and
        keeping a daily ad streak adds up to +5 per ad.
      </Text>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Text style={styles.metaLabel}>Base</Text>
          <Text style={styles.metaValue}>+1</Text>
        </View>
        <View style={styles.metaPill}>
          <Text style={styles.metaLabel}>Every 3rd</Text>
          <Text style={styles.metaValue}>+1</Text>
        </View>
        <View style={styles.metaPill}>
          <Text style={styles.metaLabel}>Streak</Text>
          <Text style={styles.metaValue}>+{streakBonus}</Text>
        </View>
      </View>

      <Pressable
        testID="dewdrop-earn-watch"
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={handleWatch}
        disabled={disabled}
      >
        <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
          {buttonLabel}
        </Text>
      </Pressable>

      {status === "rewarded" && lastReward !== null && (
        <Text style={styles.rewardedNote}>
          +{lastReward} Dewdrop{lastReward === 1 ? "" : "s"} added to your
          balance.
        </Text>
      )}

      {status === "unavailable" && unavailableReason !== null && (
        <Text style={styles.unavailableNote}>
          {unavailableMessage(unavailableReason)}
        </Text>
      )}

      {capReached && status !== "unavailable" && (
        <Text style={styles.unavailableNote}>
          Daily Dewdrop ad cap reached — come back tomorrow for more.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },
  capText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  description: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  metaPill: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(77,208,225,0.08)",
    borderWidth: 1,
    borderColor: "rgba(77,208,225,0.25)",
    alignItems: "center",
  },
  metaLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.highlight,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: COLORS.buttonActive,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    backgroundColor: COLORS.buttonDisabled,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.buttonActiveText,
  },
  buttonTextDisabled: {
    color: COLORS.buttonDisabledText,
  },
  rewardedNote: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.rewardedNote,
    fontWeight: "600",
    textAlign: "center",
  },
  unavailableNote: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.warn,
    fontStyle: "italic",
    textAlign: "center",
  },
});
