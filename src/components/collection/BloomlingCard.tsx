// =============================================================================
// BloomlingCard — Parchment card with heraldic rarity ring
// =============================================================================

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import type { BloomlingTemplate, Bloomling } from "~/types/game";
import { Rarity, EvolutionStage } from "~/types/game";
import { COLORS, FONTS, RADII, SHADOWS } from "@/constants/theme";

const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.Common]:    COLORS.rarityCommon,
  [Rarity.Uncommon]:  COLORS.rarityUncommon,
  [Rarity.Rare]:      COLORS.rarityRare,
  [Rarity.Epic]:      COLORS.rarityEpic,
  [Rarity.Legendary]: COLORS.rarityLegendary,
  [Rarity.Mythic]:    COLORS.rarityMythic,
};

const STAGE_ICONS: Record<EvolutionStage, string> = {
  [EvolutionStage.Sprout]: "\uD83C\uDF31",
  [EvolutionStage.Bloom]:  "\uD83C\uDF3C",
  [EvolutionStage.Elder]:  "\uD83C\uDF33",
};

const RARITY_LABELS: Record<Rarity, string> = {
  [Rarity.Common]:    "Common",
  [Rarity.Uncommon]:  "Uncommon",
  [Rarity.Rare]:      "Rare",
  [Rarity.Epic]:      "Epic",
  [Rarity.Legendary]: "Legendary",
  [Rarity.Mythic]:    "Mythic",
};

interface BloomlingCardProps {
  template: BloomlingTemplate;
  instance: Bloomling | null;
  onPress: (template: BloomlingTemplate, instance: Bloomling) => void;
}

export const BloomlingCard = React.memo(function BloomlingCard({ template, instance, onPress }: BloomlingCardProps) {
  const discovered = instance !== null && instance.unlocked;
  const rarityColor = RARITY_COLORS[template.rarity];

  if (!discovered) {
    return (
      <View
        testID={`bloomling-card-${template.id}-locked`}
        style={[styles.cardWrap, { opacity: 0.55 }]}
      >
        <LinearGradient colors={[COLORS.surface, COLORS.paperDeep]} style={styles.card}>
          <View style={[styles.rarityRing, { borderColor: rarityColor, borderStyle: "dashed" }]}>
            <View style={styles.silhouetteCircle}>
              <Text style={styles.silhouetteQ}>?</Text>
            </View>
          </View>
          <Text style={styles.undiscoveredName}>???</Text>
          <Text style={[styles.rarityLabel, { color: rarityColor }]}>
            {RARITY_LABELS[template.rarity]}
          </Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <Pressable
      testID={`bloomling-card-${template.id}`}
      onPress={() => onPress(template, instance)}
      style={styles.cardWrap}
    >
      <LinearGradient colors={[COLORS.surface, COLORS.paperDeep]} style={styles.card}>
        {/* Rarity ring */}
        <View style={[styles.rarityRing, { borderColor: rarityColor }]}>
          <View style={styles.spriteCircle}>
            <Text style={styles.spriteEmoji}>
              {STAGE_ICONS[instance.evolutionStage]}
            </Text>
          </View>
        </View>

        <Text style={styles.name} numberOfLines={1}>{template.name}</Text>
        <Text style={[styles.rarityLabel, { color: rarityColor }]}>
          {RARITY_LABELS[template.rarity]}
        </Text>
        <View style={styles.infoRow}>
          <Text style={styles.level}>Lv. {instance.level}</Text>
          <View style={styles.stageBadge}>
            <Text style={styles.stageBadgeText}>
              {instance.evolutionStage.charAt(0).toUpperCase() + instance.evolutionStage.slice(1)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  cardWrap: {
    flex: 1,
    margin: 4,
    borderRadius: RADII.lg,
    ...SHADOWS.md,
  },
  card: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: `${COLORS.gilt}50`,
    padding: 10,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
    overflow: "hidden",
  },
  rarityRing: {
    borderRadius: 30,
    borderWidth: 2,
    padding: 3,
    marginBottom: 6,
  },
  spriteCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${COLORS.sageSoft}50`,
    justifyContent: "center",
    alignItems: "center",
  },
  spriteEmoji: {
    fontSize: 24,
  },
  silhouetteCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface2,
    justifyContent: "center",
    alignItems: "center",
  },
  silhouetteQ: {
    fontFamily: FONTS.display,
    fontSize: 22,
    color: COLORS.ink3,
  },
  name: {
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    color: COLORS.ink,
    textAlign: "center",
    marginBottom: 2,
  },
  undiscoveredName: {
    fontFamily: FONTS.bodyBold,
    fontSize: 11,
    color: COLORS.ink3,
    textAlign: "center",
    marginBottom: 2,
  },
  rarityLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  level: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 10,
    color: COLORS.ink2,
  },
  stageBadge: {
    backgroundColor: `${COLORS.sageSoft}60`,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADII.pill,
  },
  stageBadgeText: {
    fontFamily: FONTS.body,
    fontSize: 9,
    color: COLORS.ink3,
  },
});
