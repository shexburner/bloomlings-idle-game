// =============================================================================
// DewdropShop — Main screen for the Dewdrop economy
// =============================================================================
// Feature-gated at Zone 20 (`allTimeHighestZone`). Displays:
//   • Running Dewdrop balance
//   • Watch & Earn card (`DewdropEarnCard`)
//   • Permanent perks and consumables (`PerkCard` × N)
// =============================================================================

import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PERK_TEMPLATES } from "~/data/perkTemplates";
import { useGameStore } from "~/state/store";
import { formatNumber } from "~/utils/formatNumber";
import { DewdropEarnCard } from "./DewdropEarnCard";
import { PerkCard } from "./PerkCard";

/** Zone at which the Dewdrop shop unlocks (see design/01-core-game-loop.md §Meta). */
export const DEWDROP_SHOP_UNLOCK_ZONE = 20;

const COLORS = {
  background: "#06131a",
  text: "#e0f7fa",
  textMuted: "#8ab0b8",
  dewdropIcon: "#4dd0e1",
  sectionTitle: "#80deea",
  lockedBg: "#0b1e28",
  lockedBorder: "#1e4d5a",
  progressBarFill: "#4dd0e1",
};

export function DewdropShop() {
  const insets = useSafeAreaInsets();
  const dewdrops = useGameStore((s) => s.resources.dewdrops);
  const allTimeHighest = useGameStore((s) => s.prestige.allTimeHighestZone);

  const unlocked = allTimeHighest >= DEWDROP_SHOP_UNLOCK_ZONE;

  // ---------- Locked state ----------
  if (!unlocked) {
    const progress = Math.min(
      (allTimeHighest / DEWDROP_SHOP_UNLOCK_ZONE) * 100,
      100
    );
    return (
      <View testID="dewdrop-shop-screen" style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.header}>Dewdrops</Text>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedIcon}>💧</Text>
          <Text style={styles.lockedTitle}>Dewdrop Shop Locked</Text>
          <Text style={styles.lockedDescription}>
            Reach Zone {DEWDROP_SHOP_UNLOCK_ZONE} to unlock the Dewdrop shop.
            Dewdrops are a premium currency earned by watching short rewarded
            ads. Spend them on permanent quality-of-life perks and consumables
            that smooth the mid-to-late game grind.
          </Text>
          <View style={styles.lockedProgress}>
            <Text style={styles.lockedProgressText}>
              Highest Zone: {allTimeHighest} / {DEWDROP_SHOP_UNLOCK_ZONE}
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[styles.progressBarFill, { width: `${progress}%` }]}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // ---------- Unlocked state ----------
  const permanent = PERK_TEMPLATES.filter((t) => t.category === "permanent");
  const consumables = PERK_TEMPLATES.filter((t) => t.category === "consumable");

  return (
    <View testID="dewdrop-shop-screen" style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Dewdrops</Text>
        <Text style={styles.balance}>💧 {formatNumber(dewdrops)}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <DewdropEarnCard />

        <Text style={styles.sectionTitle}>Permanent Perks</Text>
        {permanent.map((template) => (
          <PerkCard key={template.id} template={template} />
        ))}

        <Text style={styles.sectionTitle}>Consumables</Text>
        {consumables.map((template) => (
          <PerkCard key={template.id} template={template} />
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  balance: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.dewdropIcon,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.sectionTitle,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  // ---------- Locked state ----------
  lockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  lockedIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.6,
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  lockedDescription: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  lockedProgress: {
    width: "100%",
    backgroundColor: COLORS.lockedBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lockedBorder,
    padding: 16,
  },
  lockedProgressText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(30,77,90,0.4)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.progressBarFill,
    borderRadius: 4,
  },
});
