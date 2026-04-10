// =============================================================================
// ShopScreen — Tab-based upgrade shop (Tap Upgrades | Idle Upgrades)
// =============================================================================

import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BuyMultiplier, UpgradeCategory } from "~/types/game";
import type { UpgradeTemplate } from "~/types/game";
import { BuyMultiplierToggle } from "./BuyMultiplierToggle";
import { UpgradeCard } from "./UpgradeCard";

// =============================================================================
// Upgrade Template Data
// =============================================================================
// Static data for all available tap and idle upgrades.
// In a production game, this would come from a data registry.
// =============================================================================

const UPGRADE_TEMPLATES: readonly UpgradeTemplate[] = [
  // --- Tap Upgrades ---
  {
    id: "tap_power",
    name: "Tap Power",
    description: "Increases Sunlight earned per tap.",
    category: UpgradeCategory.Tap,
    baseCost: 10,
    costScaling: 1.15,
    effectPerLevel: 0.25,
    maxLevel: null,
    unlockZone: 1,
    unlockRebirths: 0,
  },
  {
    id: "tap_crit_chance",
    name: "Critical Growth",
    description: "Increases critical tap chance.",
    category: UpgradeCategory.Tap,
    baseCost: 50,
    costScaling: 1.20,
    effectPerLevel: 0.02,
    maxLevel: 25,
    unlockZone: 3,
    unlockRebirths: 0,
  },
  {
    id: "tap_crit_damage",
    name: "Critical Bloom",
    description: "Increases critical tap damage multiplier.",
    category: UpgradeCategory.Tap,
    baseCost: 100,
    costScaling: 1.18,
    effectPerLevel: 0.50,
    maxLevel: null,
    unlockZone: 5,
    unlockRebirths: 0,
  },
  {
    id: "tap_combo_decay",
    name: "Combo Roots",
    description: "Slows combo decay timer.",
    category: UpgradeCategory.Tap,
    baseCost: 200,
    costScaling: 1.25,
    effectPerLevel: 0.05,
    maxLevel: 20,
    unlockZone: 8,
    unlockRebirths: 0,
  },
  {
    id: "tap_multi_tap",
    name: "Multi-Petal",
    description: "Chance to generate bonus taps per tap.",
    category: UpgradeCategory.Tap,
    baseCost: 500,
    costScaling: 1.30,
    effectPerLevel: 0.03,
    maxLevel: 15,
    unlockZone: 12,
    unlockRebirths: 0,
  },

  // --- Idle Upgrades ---
  {
    id: "idle_production",
    name: "Photosynthesis",
    description: "Boosts all Bloomling idle production.",
    category: UpgradeCategory.Idle,
    baseCost: 25,
    costScaling: 1.12,
    effectPerLevel: 0.10,
    maxLevel: null,
    unlockZone: 1,
    unlockRebirths: 0,
  },
  {
    id: "idle_garden_slots",
    name: "Garden Expansion",
    description: "Unlocks an additional Garden slot.",
    category: UpgradeCategory.Idle,
    baseCost: 500,
    costScaling: 2.5,
    effectPerLevel: 1.0,
    maxLevel: 5,
    unlockZone: 5,
    unlockRebirths: 0,
  },
  {
    id: "idle_synergy_boost",
    name: "Root Network",
    description: "Strengthens synergy bonuses between Bloomlings.",
    category: UpgradeCategory.Idle,
    baseCost: 300,
    costScaling: 1.20,
    effectPerLevel: 0.15,
    maxLevel: null,
    unlockZone: 10,
    unlockRebirths: 0,
  },
  {
    id: "idle_offline_rate",
    name: "Dream Growth",
    description: "Increases offline Sunlight production rate.",
    category: UpgradeCategory.Idle,
    baseCost: 150,
    costScaling: 1.18,
    effectPerLevel: 0.10,
    maxLevel: 30,
    unlockZone: 7,
    unlockRebirths: 0,
  },
  {
    id: "idle_zone_speed",
    name: "Rapid Bloom",
    description: "Speeds up zone clearing from idle production.",
    category: UpgradeCategory.Idle,
    baseCost: 400,
    costScaling: 1.22,
    effectPerLevel: 0.08,
    maxLevel: null,
    unlockZone: 15,
    unlockRebirths: 0,
  },
];

const TAP_UPGRADES = UPGRADE_TEMPLATES.filter(
  (t) => t.category === UpgradeCategory.Tap
);
const IDLE_UPGRADES = UPGRADE_TEMPLATES.filter(
  (t) => t.category === UpgradeCategory.Idle
);

// =============================================================================
// Component
// =============================================================================

const COLORS = {
  background: "#0d1117",
  tabBar: "#1a1a2e",
  tabActive: "#4caf50",
  tabInactive: "#6b7b6e",
  tabIndicator: "#4caf50",
  text: "#e8f5e9",
  border: "#2d4a3e",
};

type ShopTab = "tap" | "idle";

export function ShopScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ShopTab>("tap");
  const [buyMultiplier, setBuyMultiplier] = useState<BuyMultiplier>(
    BuyMultiplier.X1
  );

  const upgrades = activeTab === "tap" ? TAP_UPGRADES : IDLE_UPGRADES;
  const buyCount = buyMultiplier as number;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Text style={styles.header}>Upgrade Shop</Text>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === "tap" && styles.tabActive]}
          onPress={() => setActiveTab("tap")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "tap" && styles.tabTextActive,
            ]}
          >
            Tap Upgrades
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "idle" && styles.tabActive]}
          onPress={() => setActiveTab("idle")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "idle" && styles.tabTextActive,
            ]}
          >
            Idle Upgrades
          </Text>
        </Pressable>
      </View>

      {/* Buy multiplier */}
      <BuyMultiplierToggle
        selected={buyMultiplier}
        onSelect={setBuyMultiplier}
      />

      {/* Upgrade list */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {upgrades.map((template) => (
          <UpgradeCard
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
    backgroundColor: COLORS.background,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    paddingVertical: 12,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.tabBar,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.tabActive,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.tabInactive,
  },
  tabTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
    paddingBottom: 24,
  },
});
