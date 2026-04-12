// =============================================================================
// NectarShop — Nectar upgrade shop with all 10 Nectar-tier upgrades
// =============================================================================
// Upgrade costs use baseCost * costScaling^level, tuned to approximate the
// hand-crafted cost sequences from docs/design/04-prestige-systems.md.
// =============================================================================

import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BuyMultiplier, UpgradeCategory } from "~/types/game";
import type { UpgradeTemplate } from "~/types/game";
import { BuyMultiplierToggle } from "~/components/shop/BuyMultiplierToggle";
import { NectarUpgradeCard } from "./NectarUpgradeCard";

// =============================================================================
// Nectar Upgrade Template Data
// =============================================================================
// IDs must match those in src/engine/rebirth.ts NECTAR_UPGRADE_IDS.
// Costs approximate the design doc sequences (§Nectar Upgrades):
//   Enriched Soil: 1, 3, 8, 15...  Stronger Roots: 2, 5, 12, 25...
//   Rapid Growth: 3, 8, 20...       Garden Expansion: 10, 30
//   Seasonal Memory: 5, 15, 40...   Nectar Roots: 8, 25, 60...
//   Bloom Retention: 20             Elder Retention: 100
//   Deep Roots: 15, 40...           Combo Memory: 12
// =============================================================================

export const NECTAR_UPGRADE_TEMPLATES: readonly UpgradeTemplate[] = [
  {
    id: "enriched_soil",
    name: "Enriched Soil",
    description: "Increases all Sunlight production.",
    category: UpgradeCategory.Nectar,
    baseCost: 0.4,
    costScaling: 2.6,
    effectPerLevel: 0.25,
    maxLevel: 20,
    unlockZone: 1,
    unlockRebirths: 0,
  },
  {
    id: "stronger_roots",
    name: "Stronger Roots",
    description: "Increases tap Sunlight value.",
    category: UpgradeCategory.Nectar,
    baseCost: 0.8,
    costScaling: 2.5,
    effectPerLevel: 0.20,
    maxLevel: 20,
    unlockZone: 1,
    unlockRebirths: 0,
  },
  {
    id: "rapid_growth",
    name: "Rapid Growth",
    description: "Bloomlings level up cheaper.",
    category: UpgradeCategory.Nectar,
    baseCost: 1.1,
    costScaling: 2.7,
    effectPerLevel: 0.10,
    maxLevel: 15,
    unlockZone: 1,
    unlockRebirths: 0,
  },
  {
    id: "seasonal_memory",
    name: "Seasonal Memory",
    description: "Start each Rebirth at a higher zone.",
    category: UpgradeCategory.Nectar,
    baseCost: 1.8,
    costScaling: 2.8,
    effectPerLevel: 5,
    maxLevel: 4,
    unlockZone: 1,
    unlockRebirths: 1,
  },
  {
    id: "nectar_roots",
    name: "Nectar Roots",
    description: "Earn more Nectar on future Rebirths.",
    category: UpgradeCategory.Nectar,
    baseCost: 2.9,
    costScaling: 2.8,
    effectPerLevel: 0.10,
    maxLevel: 10,
    unlockZone: 1,
    unlockRebirths: 1,
  },
  {
    id: "nectar_garden_expansion",
    name: "Garden Expansion",
    description: "Unlocks an additional Garden slot.",
    category: UpgradeCategory.Nectar,
    baseCost: 3.8,
    costScaling: 2.6,
    effectPerLevel: 1,
    maxLevel: 2,
    unlockZone: 1,
    unlockRebirths: 1,
  },
  {
    id: "combo_memory",
    name: "Combo Memory",
    description: "Combo meter starts at 10 after Rebirth.",
    category: UpgradeCategory.Nectar,
    baseCost: 12,
    costScaling: 1.0,
    effectPerLevel: 10,
    maxLevel: 1,
    unlockZone: 1,
    unlockRebirths: 1,
  },
  {
    id: "deep_roots",
    name: "Deep Roots",
    description: "Increases offline Sunlight production rate.",
    category: UpgradeCategory.Nectar,
    baseCost: 5.5,
    costScaling: 2.7,
    effectPerLevel: 0.10,
    maxLevel: 10,
    unlockZone: 1,
    unlockRebirths: 1,
  },
  {
    id: "bloom_retention",
    name: "Bloom Retention",
    description: "Bloomlings keep Bloom stage through Rebirth.",
    category: UpgradeCategory.Nectar,
    baseCost: 20,
    costScaling: 1.0,
    effectPerLevel: 1,
    maxLevel: 1,
    unlockZone: 1,
    unlockRebirths: 2,
  },
  {
    id: "elder_retention",
    name: "Elder Retention",
    description: "Bloomlings keep Elder stage through Rebirth.",
    category: UpgradeCategory.Nectar,
    baseCost: 100,
    costScaling: 1.0,
    effectPerLevel: 1,
    maxLevel: 1,
    unlockZone: 1,
    unlockRebirths: 3,
  },
];

// =============================================================================
// Component
// =============================================================================

const COLORS = {
  sectionTitle: "#ce93d8",
  text: "#f3e5f5",
  nectarIcon: "#e040fb",
};

export function NectarShop() {
  const [buyMultiplier, setBuyMultiplier] = useState<BuyMultiplier>(
    BuyMultiplier.X1
  );

  const buyCount = buyMultiplier as number;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {"\u2727"} Nectar Upgrades
        </Text>
        <Text style={styles.sectionSubtitle}>
          Permanent upgrades that persist through Rebirth
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
        {NECTAR_UPGRADE_TEMPLATES.map((template) => (
          <NectarUpgradeCard
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
  container: {
    flex: 1,
  },
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingBottom: 24,
  },
});
