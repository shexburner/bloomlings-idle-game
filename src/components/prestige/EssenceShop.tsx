// =============================================================================
// EssenceShop — Essence upgrade shop with all 9 Essence-tier upgrades
// =============================================================================

import { useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { BuyMultiplier, UpgradeCategory } from "~/types/game";
import type { UpgradeTemplate } from "~/types/game";
import { BuyMultiplierToggle } from "~/components/shop/BuyMultiplierToggle";
import { useGameStore } from "~/state/store";
import { calculateUpgradeCost } from "~/state/selectors";
import { formatNumber } from "~/utils/formatNumber";

// =============================================================================
// Essence Upgrade Template Data
// =============================================================================

export const ESSENCE_UPGRADE_TEMPLATES: readonly UpgradeTemplate[] = [
  {
    id: "primordial_vigor",
    name: "Primordial Vigor",
    description:
      "The Essence beneath the garden is older than sunlight. All Sunlight production x2 per level.",
    category: UpgradeCategory.Essence,
    baseCost: 1,
    costScaling: 3.0,
    effectPerLevel: 2,
    maxLevel: 10,
    unlockZone: 1,
    unlockRebirths: 0,
  },
  {
    id: "ancient_wisdom_essence",
    name: "Ancient Wisdom",
    description:
      "The Essence has been listening for millennia. All Nectar earnings x1.5 per level.",
    category: UpgradeCategory.Essence,
    baseCost: 2,
    costScaling: 2.8,
    effectPerLevel: 1.5,
    maxLevel: 10,
    unlockZone: 1,
    unlockRebirths: 0,
  },
  {
    id: "eternal_garden",
    name: "Eternal Garden",
    description:
      "Some gardens exist outside of time. +1 permanent Garden slot.",
    category: UpgradeCategory.Essence,
    baseCost: 5,
    costScaling: 6.0,
    effectPerLevel: 1,
    maxLevel: 2,
    unlockZone: 1,
    unlockRebirths: 0,
  },
  {
    id: "biome_attunement",
    name: "Biome Attunement",
    description:
      "The Essence hums in harmony with every biome, unlocking their magic from Zone 1.",
    category: UpgradeCategory.Essence,
    baseCost: 3,
    costScaling: 2.7,
    effectPerLevel: 1,
    maxLevel: 5,
    unlockZone: 1,
    unlockRebirths: 0,
  },
  {
    id: "accelerated_seasons",
    name: "Accelerated Seasons",
    description:
      "Seasons pass in the blink of an eye. Start Rebirths at higher zones.",
    category: UpgradeCategory.Essence,
    baseCost: 4,
    costScaling: 3.0,
    effectPerLevel: 5,
    maxLevel: 5,
    unlockZone: 1,
    unlockRebirths: 0,
  },
  {
    id: "bloomling_awakening",
    name: "Bloomling Awakening",
    description:
      "Deep in the Essence, something legendary stirs. Unlock Legendary-tier Bloomlings.",
    category: UpgradeCategory.Essence,
    baseCost: 10,
    costScaling: 1.0,
    effectPerLevel: 1,
    maxLevel: 1,
    unlockZone: 1,
    unlockRebirths: 0,
  },
  {
    id: "essence_conduit",
    name: "Essence Conduit",
    description:
      "The roots tap the Essence directly. +15% Essence earned on future Transcendences.",
    category: UpgradeCategory.Essence,
    baseCost: 8,
    costScaling: 2.5,
    effectPerLevel: 0.15,
    maxLevel: 5,
    unlockZone: 1,
    unlockRebirths: 0,
  },
  {
    id: "mythic_seedbed",
    name: "Mythic Seedbed",
    description:
      "Where Essence pools into something older than memory, the Mythic seeds wait. (Also requires Dewdrops)",
    category: UpgradeCategory.Essence,
    baseCost: 25,
    costScaling: 1.0,
    effectPerLevel: 1,
    maxLevel: 1,
    unlockZone: 1,
    unlockRebirths: 0,
  },
  {
    id: "cosmic_roots",
    name: "Cosmic Roots",
    description:
      "Roots drinking starlight from places without names. Offline progress rate toward 100%.",
    category: UpgradeCategory.Essence,
    baseCost: 15,
    costScaling: 2.7,
    effectPerLevel: 0.167,
    maxLevel: 3,
    unlockZone: 1,
    unlockRebirths: 0,
  },
];

// =============================================================================
// Helpers (mirrored from NectarUpgradeCard)
// =============================================================================

function calculateBulkCost(
  baseCost: number,
  scaling: number,
  currentLevel: number,
  count: number,
  maxLevel: number | null,
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
  essence: number,
): number {
  const cap = maxLevel !== null ? maxLevel - currentLevel : 1000;
  let total = 0;
  let count = 0;
  for (let i = 1; i <= cap; i++) {
    const cost = calculateUpgradeCost(baseCost, scaling, currentLevel + i);
    if (total + Math.floor(cost) > essence) break;
    total += Math.floor(cost);
    count++;
  }
  return count;
}

// =============================================================================
// EssenceUpgradeCard
// =============================================================================

const CARD_COLORS = {
  cardBg: "#1a1125",
  border: "#4a2d6e",
  text: "#f3e5f5",
  textMuted: "#9b7fad",
  essenceIcon: "#7c4dff",
  buyAffordable: "#7c4dff",
  buyAffordableText: "#0d0a14",
  buyUnaffordable: "#3a2a4a",
  buyUnaffordableText: "#6b5b7e",
  levelText: "#b388ff",
  flash: "rgba(124,77,255,0.3)",
};

function EssenceUpgradeCard({
  template,
  buyCount,
}: {
  template: UpgradeTemplate;
  buyCount: number;
}) {
  const currentLevel = useGameStore(
    (s) => s.upgrades[template.id]?.level ?? 0,
  );
  const essence = useGameStore((s) => s.resources.essence);
  const buyUpgrade = useGameStore((s) => s.buyUpgrade);
  const spendEssence = useGameStore((s) => s.spendEssence);

  const flashAnim = useRef(new Animated.Value(0)).current;

  const effectiveBuyCount =
    buyCount < 0
      ? calculateMaxLevels(
          template.baseCost,
          template.costScaling,
          currentLevel,
          template.maxLevel,
          essence,
        )
      : Math.min(
          buyCount,
          template.maxLevel !== null
            ? template.maxLevel - currentLevel
            : buyCount,
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
        template.maxLevel,
      );

  const canAfford = !isMaxed && essence >= totalCost && effectiveBuyCount > 0;

  const handleBuy = () => {
    if (!canAfford) return;
    const success = spendEssence(totalCost);
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
    outputRange: ["transparent", CARD_COLORS.flash],
  });

  const effectDescription =
    template.effectPerLevel >= 1
      ? `x${formatNumber(template.effectPerLevel, 0)} per level`
      : `+${formatNumber(template.effectPerLevel * 100, 0)}% per level`;

  return (
    <Animated.View
      testID={`essence-shop-item-${template.id}`}
      style={[cardStyles.card, { backgroundColor: flashBg }]}
    >
      <View style={cardStyles.cardInner}>
        <View style={cardStyles.info}>
          <View style={cardStyles.nameRow}>
            <Text style={cardStyles.name}>{template.name}</Text>
            <Text style={cardStyles.level}>
              Lv. {currentLevel}
              {template.maxLevel !== null ? `/${template.maxLevel}` : ""}
            </Text>
          </View>
          <Text style={cardStyles.description}>{template.description}</Text>
          <Text style={cardStyles.effect}>{effectDescription}</Text>
        </View>

        <Pressable
          testID={`essence-shop-buy-${template.id}`}
          style={[
            cardStyles.buyButton,
            canAfford ? cardStyles.buyAffordable : cardStyles.buyUnaffordable,
          ]}
          onPress={handleBuy}
          disabled={!canAfford}
        >
          {isMaxed ? (
            <Text style={cardStyles.buyTextDisabled}>MAX</Text>
          ) : (
            <>
              <Text
                style={
                  canAfford
                    ? cardStyles.buyText
                    : cardStyles.buyTextDisabled
                }
              >
                Buy{effectiveBuyCount > 1 ? ` x${effectiveBuyCount}` : ""}
              </Text>
              <Text
                style={[
                  cardStyles.costText,
                  !canAfford && cardStyles.costTextDisabled,
                ]}
              >
                {"\u2605"} {formatNumber(totalCost)}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CARD_COLORS.border,
    overflow: "hidden",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: CARD_COLORS.cardBg,
  },
  info: { flex: 1, marginRight: 12 },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  name: { fontSize: 16, fontWeight: "700", color: CARD_COLORS.text },
  level: { fontSize: 13, fontWeight: "600", color: CARD_COLORS.levelText },
  description: { fontSize: 12, color: CARD_COLORS.textMuted, marginBottom: 2 },
  effect: {
    fontSize: 11,
    color: CARD_COLORS.textMuted,
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
  buyAffordable: { backgroundColor: CARD_COLORS.buyAffordable },
  buyUnaffordable: { backgroundColor: CARD_COLORS.buyUnaffordable },
  buyText: {
    fontSize: 14,
    fontWeight: "700",
    color: CARD_COLORS.buyAffordableText,
  },
  buyTextDisabled: {
    fontSize: 14,
    fontWeight: "700",
    color: CARD_COLORS.buyUnaffordableText,
  },
  costText: {
    fontSize: 11,
    fontWeight: "600",
    color: CARD_COLORS.essenceIcon,
    marginTop: 2,
  },
  costTextDisabled: { color: CARD_COLORS.buyUnaffordableText },
});

// =============================================================================
// EssenceShop Component
// =============================================================================

const COLORS = {
  sectionTitle: "#b388ff",
  text: "#f3e5f5",
  essenceIcon: "#7c4dff",
};

export function EssenceShop() {
  const [buyMultiplier, setBuyMultiplier] = useState<BuyMultiplier>(
    BuyMultiplier.X1,
  );

  const buyCount = buyMultiplier as number;

  return (
    <View testID="essence-shop" style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {"\u2605"} Essence Upgrades
        </Text>
        <Text style={styles.sectionSubtitle}>
          Permanent upgrades that persist through Transcendence
        </Text>
      </View>

      <BuyMultiplierToggle
        selected={buyMultiplier}
        onSelect={setBuyMultiplier}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {ESSENCE_UPGRADE_TEMPLATES.map((template) => (
          <EssenceUpgradeCard
            key={template.id}
            template={template}
            buyCount={buyCount}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.sectionTitle,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.text,
    opacity: 0.6,
    marginTop: 2,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingVertical: 8, paddingBottom: 24 },
});
