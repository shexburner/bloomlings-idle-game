// =============================================================================
// NectarUpgradeCard — Upgrade card that costs Nectar instead of Sunlight
// =============================================================================

import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

import type { UpgradeTemplate } from "~/types/game";
import { useGameStore } from "~/state/store";
import { calculateUpgradeCost } from "~/state/selectors";
import { formatNumber } from "~/utils/formatNumber";

const COLORS = {
  cardBg: "#1a1125",
  border: "#4a2d6e",
  text: "#f3e5f5",
  textMuted: "#9b7fad",
  buyAffordable: "#e040fb",
  buyAffordableText: "#1a1125",
  buyUnaffordable: "#3a2a4a",
  buyUnaffordableText: "#6b5b7e",
  costText: "#e040fb",
  levelText: "#ce93d8",
  flash: "rgba(224,64,251,0.3)",
};

interface NectarUpgradeCardProps {
  template: UpgradeTemplate;
  buyCount: number;
}

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
  return Math.floor(total);
}

function calculateMaxLevels(
  baseCost: number,
  scaling: number,
  currentLevel: number,
  maxLevel: number | null,
  nectar: number
): number {
  const cap = maxLevel !== null ? maxLevel - currentLevel : 1000;
  let total = 0;
  let count = 0;

  for (let i = 1; i <= cap; i++) {
    const cost = calculateUpgradeCost(baseCost, scaling, currentLevel + i);
    if (total + Math.floor(cost) > nectar) break;
    total += Math.floor(cost);
    count++;
  }
  return count;
}

export function NectarUpgradeCard({
  template,
  buyCount,
}: NectarUpgradeCardProps) {
  const currentLevel = useGameStore(
    (s) => s.upgrades[template.id]?.level ?? 0
  );
  const nectar = useGameStore((s) => s.resources.nectar);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const spendNectar = useGameStore((s) => s.spendNectar);

  const flashAnim = useRef(new Animated.Value(0)).current;

  const effectiveBuyCount =
    buyCount < 0
      ? calculateMaxLevels(
          template.baseCost,
          template.costScaling,
          currentLevel,
          template.maxLevel,
          nectar
        )
      : Math.min(
          buyCount,
          template.maxLevel !== null
            ? template.maxLevel - currentLevel
            : buyCount
        );

  const isMaxed =
    template.maxLevel !== null && currentLevel >= template.maxLevel;

  const totalCost = isMaxed
    ? Infinity
    : calculateBulkCost(
        template.baseCost,
        template.costScaling,
        currentLevel,
        effectiveBuyCount,
        template.maxLevel
      );

  const canAfford = !isMaxed && nectar >= totalCost && effectiveBuyCount > 0;

  const handleBuy = () => {
    if (!canAfford) return;

    const success = spendNectar(totalCost);
    if (!success) return;

    for (let i = 0; i < effectiveBuyCount; i++) {
      buyUpgrade(template.id);
    }

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

  const effectDescription = template.effectPerLevel >= 1
    ? `+${formatNumber(template.effectPerLevel, 0)} per level`
    : `+${formatNumber(template.effectPerLevel * 100, 0)}% per level`;

  return (
    <Animated.View style={[styles.card, { backgroundColor: flashBg }]}>
      <View style={styles.cardInner}>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{template.name}</Text>
            <Text style={styles.level}>
              Lv. {currentLevel}
              {template.maxLevel !== null ? `/${template.maxLevel}` : ""}
            </Text>
          </View>
          <Text style={styles.description}>{template.description}</Text>
          <Text style={styles.effect}>{effectDescription}</Text>
        </View>

        <Pressable
          style={[
            styles.buyButton,
            canAfford ? styles.buyAffordable : styles.buyUnaffordable,
          ]}
          onPress={handleBuy}
          disabled={!canAfford}
        >
          {isMaxed ? (
            <Text style={styles.buyTextDisabled}>MAX</Text>
          ) : (
            <>
              <Text
                style={canAfford ? styles.buyText : styles.buyTextDisabled}
              >
                Buy{effectiveBuyCount > 1 ? ` x${effectiveBuyCount}` : ""}
              </Text>
              <Text
                style={[styles.costText, !canAfford && styles.costTextDisabled]}
              >
                {"\u2727"} {formatNumber(totalCost)}
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
