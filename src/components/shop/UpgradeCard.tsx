// =============================================================================
// UpgradeCard — Parchment card: gilt hairline, icon well, italic desc, buy btn
// =============================================================================

import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import type { UpgradeTemplate } from "~/types/game";
import { useGameStore } from "~/state/store";
import { calculateUpgradeCost } from "~/state/selectors";
import { formatNumber } from "~/utils/formatNumber";
import * as audioService from "~/services/audioService";
import { purchaseHaptic } from "~/utils/haptics";
import { COLORS, FONTS, RADII, SHADOWS } from "@/constants/theme";

interface UpgradeCardProps {
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
  return total;
}

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
  const currentLevel = useGameStore((s) => s.upgrades[template.id]?.level ?? 0);
  const sunlight = useGameStore((s) => s.resources.sunlight);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const spendSunlight = useGameStore((s) => s.spendSunlight);

  const flashAnim = useRef(new Animated.Value(0)).current;

  const effectiveBuyCount =
    buyCount < 0
      ? calculateMaxLevels(template.baseCost, template.costScaling, currentLevel, template.maxLevel, sunlight)
      : Math.min(buyCount, template.maxLevel !== null ? template.maxLevel - currentLevel : buyCount);

  const isMaxed = template.maxLevel !== null && currentLevel >= template.maxLevel;

  const totalCost = isMaxed
    ? Infinity
    : calculateBulkCost(template.baseCost, template.costScaling, currentLevel, effectiveBuyCount, template.maxLevel);

  const canAfford = !isMaxed && sunlight >= totalCost && effectiveBuyCount > 0;

  const handleBuy = () => {
    if (!canAfford) return;
    const success = spendSunlight(totalCost);
    if (!success) return;
    for (let i = 0; i < effectiveBuyCount; i++) {
      buyUpgrade(template.id);
    }
    purchaseHaptic();
    audioService.play("purchase");
    flashAnim.setValue(1);
    Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
  };

  const effectDescription = `+${formatNumber(template.effectPerLevel * 100, 0)}% per level`;
  const cardId = template.id.replace(/_/g, "-");

  return (
    <Animated.View
      testID={`upgrade-card-${cardId}`}
      style={[styles.cardWrap, { backgroundColor: flashAnim.interpolate({ inputRange: [0, 1], outputRange: ["transparent", `${COLORS.sage}30`] }) }]}
    >
      <LinearGradient colors={[COLORS.surface, COLORS.paperDeep]} style={styles.card}>
        {/* Gilt hairline */}
        <View style={styles.hairline} />

        <View style={styles.cardInner}>
          {/* Icon well */}
          <LinearGradient colors={[COLORS.sageSoft, COLORS.moss]} style={styles.iconWell}>
            <Text style={styles.iconEmoji}>🌿</Text>
          </LinearGradient>

          {/* Info */}
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

          {/* Buy button */}
          {canAfford ? (
            <Pressable
              testID={`upgrade-buy-${cardId}`}
              onPress={handleBuy}
              style={styles.buyWrap}
            >
              <LinearGradient
                colors={[COLORS.sage, COLORS.moss, COLORS.mossDeep]}
                style={styles.buyButton}
              >
                <Text style={styles.buyText}>
                  {isMaxed ? "MAX" : `Buy${effectiveBuyCount > 1 ? ` ×${effectiveBuyCount}` : ""}`}
                </Text>
                {!isMaxed && (
                  <Text style={styles.costText}>☀ {formatNumber(totalCost)}</Text>
                )}
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              testID={`upgrade-buy-${cardId}`}
              onPress={handleBuy}
              disabled
              style={styles.buyWrap}
            >
              <View style={styles.buyButtonDisabled}>
                <Text style={styles.buyTextDisabled}>
                  {isMaxed ? "MAX" : `Buy${effectiveBuyCount > 1 ? ` ×${effectiveBuyCount}` : ""}`}
                </Text>
                {!isMaxed && (
                  <Text style={styles.costTextDisabled}>☀ {formatNumber(totalCost)}</Text>
                )}
              </View>
            </Pressable>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: RADII.lg,
    ...SHADOWS.md,
  },
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: `${COLORS.gilt}50`,
    overflow: "hidden",
  },
  hairline: {
    height: 1,
    backgroundColor: `${COLORS.gilt}80`,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  iconWell: {
    width: 42,
    height: 42,
    borderRadius: RADII.md,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: `${COLORS.gilt}70`,
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  name: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.ink,
  },
  level: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.ink3,
  },
  description: {
    fontFamily: FONTS.displayMediumItalic,
    fontSize: 11,
    color: COLORS.ink2,
    marginBottom: 2,
  },
  effect: {
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    color: COLORS.sage,
  },
  buyWrap: {
    flexShrink: 0,
  },
  buyButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADII.pill,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 76,
    ...SHADOWS.sm,
  },
  buyButtonDisabled: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADII.pill,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 76,
    backgroundColor: COLORS.surface2,
  },
  buyText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.surface,
  },
  buyTextDisabled: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13,
    color: COLORS.ink3,
  },
  costText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 10,
    color: COLORS.sunlightHi,
    marginTop: 1,
  },
  costTextDisabled: {
    fontFamily: FONTS.body,
    fontSize: 10,
    color: COLORS.ink3,
    marginTop: 1,
  },
});
