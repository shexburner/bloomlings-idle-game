// =============================================================================
// UpgradeCard — Single upgrade: name, description, level, cost, buy button
// =============================================================================

import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import type { UpgradeTemplate } from "~/types/game";
import { useGameStore } from "~/state/store";
import { calculateUpgradeCost } from "~/state/selectors";
import { formatNumber } from "~/utils/formatNumber";
import * as audioService from "~/services/audioService";
import { purchaseHaptic } from "~/utils/haptics";

const COLORS = {
  cardBg: "#161b22",
  border: "#2d4a3e",
  text: "#e8f5e9",
  textMuted: "#8a9b8e",
  buyAffordable: "#4caf50",
  buyAffordableText: "#0d1117",
  buyUnaffordable: "#3a3a4a",
  buyUnaffordableText: "#6b7b6e",
  costText: "#ffd700",
  levelText: "#4fc3f7",
  flash: "rgba(76,175,80,0.3)",
};

interface UpgradeCardProps {
  template: UpgradeTemplate;
  buyCount: number;
}

/**
 * Calculate the total cost for buying `count` levels starting from `currentLevel`.
 * Uses geometric series: sum of baseCost * scaling^(currentLevel+1) ... baseCost * scaling^(currentLevel+count).
 */
function calculateBulkCost(
  baseCost: number,
  scaling: number,
  currentLevel: number,
  count: number,
  maxLevel: number | null
): number {
  const levelsAvailable =
    maxLevel !== null ? Math.min(count, maxLevel - currentLevel) : count;
  if (levelsAvailable <= 0) return Infinity;

  let total = 0;
  for (let i = 1; i <= levelsAvailable; i++) {
    total += calculateUpgradeCost(baseCost, scaling, currentLevel + i);
  }
  return total;
}

/**
 * Calculate max levels affordable given current sunlight.
 */
function calculateMaxLevels(
  baseCost: number,
  scaling: number,
  currentLevel: number,
  maxLevel: number | null,
  sunlight: number
): number {
  const cap = maxLevel !== null ? maxLevel - currentLevel : 1000;
  let total = 0;
  let count = 0;

  for (let i = 1; i <= cap; i++) {
    const cost = calculateUpgradeCost(baseCost, scaling, currentLevel + i);
    if (total + cost > sunlight) break;
    total += cost;
    count++;
  }
  return count;
}

export function UpgradeCard({ template, buyCount }: UpgradeCardProps) {
  const currentLevel = useGameStore(
    (s) => s.upgrades[template.id]?.level ?? 0
  );
  const sunlight = useGameStore((s) => s.resources.sunlight);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const spendSunlight = useGameStore((s) => s.spendSunlight);

  const flashAnim = useRef(new Animated.Value(0)).current;

  // Calculate effective buy count (-1 = max)
  const effectiveBuyCount =
    buyCount < 0
      ? calculateMaxLevels(
          template.baseCost,
          template.costScaling,
          currentLevel,
          template.maxLevel,
          sunlight
        )
      : Math.min(
          buyCount,
          template.maxLevel !== null
            ? template.maxLevel - currentLevel
            : buyCount
        );

  const isMaxed = template.maxLevel !== null && currentLevel >= template.maxLevel;

  const totalCost = isMaxed
    ? Infinity
    : calculateBulkCost(
        template.baseCost,
        template.costScaling,
        currentLevel,
        effectiveBuyCount,
        template.maxLevel
      );

  const canAfford = !isMaxed && sunlight >= totalCost && effectiveBuyCount > 0;

  const handleBuy = () => {
    if (!canAfford) return;

    // Spend sunlight for the total cost
    const success = spendSunlight(totalCost);
    if (!success) return;

    // Buy upgrades one at a time (store increments level by 1)
    for (let i = 0; i < effectiveBuyCount; i++) {
      buyUpgrade(template.id);
    }

    purchaseHaptic();
    audioService.play("purchase");

    // Flash animation
    flashAnim.setValue(1);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const flashBg = flashAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", COLORS.flash],
  });

  const effectDescription = `+${formatNumber(template.effectPerLevel * 100, 0)}% per level`;

  const cardId = template.id.replace(/_/g, "-");

  return (
    <Animated.View
      testID={`upgrade-card-${cardId}`}
      style={[styles.card, { backgroundColor: flashBg }]}
    >
      <View style={styles.cardInner}>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{template.name}</Text>
            <Text testID={`upgrade-level-${cardId}`} style={styles.level}>
              Lv. {currentLevel}
            </Text>
          </View>
          <Text style={styles.description}>{template.description}</Text>
          <Text style={styles.effect}>{effectDescription}</Text>
        </View>

        <Pressable
          testID={`upgrade-buy-${cardId}`}
          style={[styles.buyButton, canAfford ? styles.buyAffordable : styles.buyUnaffordable]}
          onPress={handleBuy}
          disabled={!canAfford}
        >
          {isMaxed ? (
            <Text style={styles.buyTextDisabled}>MAX</Text>
          ) : (
            <>
              <Text style={canAfford ? styles.buyText : styles.buyTextDisabled}>
                Buy{effectiveBuyCount > 1 ? ` x${effectiveBuyCount}` : ""}
              </Text>
              <Text style={[styles.costText, !canAfford && styles.costTextDisabled]}>
                {"\u2600"} {formatNumber(totalCost)}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: COLORS.cardBg,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  level: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.levelText,
  },
  description: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  effect: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
  buyButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
  },
  buyAffordable: {
    backgroundColor: COLORS.buyAffordable,
  },
  buyUnaffordable: {
    backgroundColor: COLORS.buyUnaffordable,
  },
  buyText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.buyAffordableText,
  },
  buyTextDisabled: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.buyUnaffordableText,
  },
  costText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.costText,
    marginTop: 2,
  },
  costTextDisabled: {
    color: COLORS.buyUnaffordableText,
  },
});
