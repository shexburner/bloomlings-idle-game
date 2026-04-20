// =============================================================================
// TapFeedback — Floating "+X" numbers that animate upward and fade out
// =============================================================================

import { useCallback, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { formatNumber } from "~/utils/formatNumber";
import { COLORS, FONTS } from "@/constants/theme";

/** Maximum concurrent floating numbers visible at once. */
const POOL_SIZE = 8;

/** A single floating tap feedback entry. */
interface FeedbackEntry {
  id: number;
  amount: number;
  isCritical: boolean;
  opacity: Animated.Value;
  translateY: Animated.Value;
  /** Horizontal offset for visual variety. */
  offsetX: number;
}

/**
 * Hook that manages the floating tap feedback animation pool.
 * Returns a spawn function and the active entries to render.
 */
export function useTapFeedback() {
  const nextId = useRef(0);
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);

  const spawn = useCallback((amount: number, isCritical: boolean) => {
    const id = nextId.current++;
    const opacity = new Animated.Value(1);
    const translateY = new Animated.Value(0);
    // Random horizontal offset between -40 and +40
    const offsetX = (Math.random() - 0.5) * 80;

    const entry: FeedbackEntry = {
      id,
      amount,
      isCritical,
      opacity,
      translateY,
      offsetX,
    };

    setEntries((prev) => {
      // If pool is full, drop the oldest entry
      const trimmed = prev.length >= POOL_SIZE ? prev.slice(1) : prev;
      return [...trimmed, entry];
    });

    // Animate upward and fade out
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: isCritical ? 900 : 700,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: isCritical ? 900 : 700,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Remove from pool when animation completes
      setEntries((prev) => prev.filter((e) => e.id !== id));
    });
  }, []);

  return { entries, spawn };
}

interface TapFeedbackProps {
  entries: FeedbackEntry[];
}

export function TapFeedback({ entries }: TapFeedbackProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      {entries.map((entry) => (
        <Animated.View
          key={entry.id}
          style={[
            styles.floater,
            {
              opacity: entry.opacity,
              transform: [
                { translateY: entry.translateY },
                { translateX: entry.offsetX },
              ],
            },
          ]}
        >
          <Text
            style={[
              styles.text,
              entry.isCritical ? styles.criticalText : styles.normalText,
            ]}
          >
            +{formatNumber(entry.amount)}
          </Text>
          {entry.isCritical && (
            <Text style={styles.critLabel}>CRIT!</Text>
          )}
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  floater: {
    position: "absolute",
    alignItems: "center",
  },
  text: {
    fontFamily: FONTS.bodyBold,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  normalText: {
    fontSize: 20,
    color: COLORS.sunlight,
    textShadowColor: `${COLORS.sunlight}60`,
  },
  criticalText: {
    fontSize: 28,
    color: COLORS.nectar,
    textShadowColor: `${COLORS.nectar}50`,
  },
  critLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.nectar,
    marginTop: -2,
  },
});
