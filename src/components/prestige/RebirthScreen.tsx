// =============================================================================
// RebirthScreen — Main prestige screen: Rebirth panel + Nectar shop
// =============================================================================
// Feature-gated at Zone 40 (REBIRTH_UNLOCK_ZONE). Shows a locked state when
// the player hasn't reached the required zone in any run.
// =============================================================================

import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useGameStore } from "~/state/store";
import { REBIRTH_UNLOCK_ZONE } from "~/engine/rebirth";
import { canTranscend } from "~/engine/transcendence";
import { formatNumber } from "~/utils/formatNumber";
import { RebirthPanel } from "./RebirthPanel";
import { NectarShop } from "./NectarShop";
import { TranscendencePanel } from "./TranscendencePanel";
import { EssenceShop } from "./EssenceShop";

const COLORS = {
  background: "#0d0a14",
  text: "#f3e5f5",
  textMuted: "#9b7fad",
  nectarIcon: "#e040fb",
  essenceIcon: "#7c4dff",
  tabBar: "#1a1a2e",
  tabActive: "#e040fb",
  tabInactive: "#6b5b7e",
  lockedBg: "#1a1125",
  lockedBorder: "#4a2d6e",
};

type PrestigeTab = "rebirth" | "shop" | "transcendence" | "essenceShop";

export function RebirthScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<PrestigeTab>("rebirth");

  const currentZone = useGameStore((s) => s.prestige.currentRunHighestZone);
  const allTimeHighest = useGameStore((s) => s.prestige.allTimeHighestZone);
  const nectar = useGameStore((s) => s.resources.nectar);
  const essence = useGameStore((s) => s.resources.essence);
  const prestige = useGameStore((s) => s.prestige);

  const hasReachedUnlock = allTimeHighest >= REBIRTH_UNLOCK_ZONE;
  const showTranscendence =
    canTranscend(prestige) || prestige.transcendenceCount >= 1;
  const showEssenceShop = prestige.transcendenceCount >= 1;

  // Locked state: player hasn't reached Zone 40 in any run
  if (!hasReachedUnlock) {
    return (
      <View testID="rebirth-screen-locked" style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.header}>Rebirth</Text>
        <View style={styles.lockedContainer}>
          <Text style={styles.lockedIcon}>{"\u2727"}</Text>
          <Text style={styles.lockedTitle}>Rebirth Locked</Text>
          <Text style={styles.lockedDescription}>
            Reach Zone {REBIRTH_UNLOCK_ZONE} to unlock the power of Rebirth.
            Your Bloomlings will release their energy as Nectar — a
            permanent currency that makes every future run stronger.
          </Text>
          <View style={styles.lockedProgress}>
            <Text style={styles.lockedProgressText}>
              Current Highest Zone: {allTimeHighest} /{" "}
              {REBIRTH_UNLOCK_ZONE}
            </Text>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min((allTimeHighest / REBIRTH_UNLOCK_ZONE) * 100, 100)}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View testID="rebirth-screen" style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Nectar/Essence balance */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Rebirth</Text>
        <View style={styles.balanceRow}>
          <Text testID="rebirth-nectar-balance" style={styles.nectarBalance}>
            {"\u2727"} {formatNumber(nectar)}
          </Text>
          {showEssenceShop && (
            <Text testID="rebirth-essence-balance" style={styles.essenceBalance}>
              {"\u2605"} {formatNumber(essence)}
            </Text>
          )}
        </View>
      </View>

      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        <Pressable
          testID="rebirth-tab-rebirth"
          style={[styles.tab, activeTab === "rebirth" && styles.tabActive]}
          onPress={() => setActiveTab("rebirth")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "rebirth" && styles.tabTextActive,
            ]}
          >
            Rebirth
          </Text>
        </Pressable>
        <Pressable
          testID="rebirth-tab-shop"
          style={[styles.tab, activeTab === "shop" && styles.tabActive]}
          onPress={() => setActiveTab("shop")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "shop" && styles.tabTextActive,
            ]}
          >
            Nectar Shop
          </Text>
        </Pressable>
        {showTranscendence && (
          <Pressable
            testID="rebirth-tab-transcendence"
            style={[
              styles.tab,
              activeTab === "transcendence" && styles.tabActiveEssence,
            ]}
            onPress={() => setActiveTab("transcendence")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "transcendence" && styles.tabTextActive,
              ]}
            >
              Transcend
            </Text>
          </Pressable>
        )}
        {showEssenceShop && (
          <Pressable
            testID="rebirth-tab-essence-shop"
            style={[
              styles.tab,
              activeTab === "essenceShop" && styles.tabActiveEssence,
            ]}
            onPress={() => setActiveTab("essenceShop")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "essenceShop" && styles.tabTextActive,
              ]}
            >
              Essence Shop
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Content */}
      {activeTab === "rebirth" ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <RebirthPanel />
        </ScrollView>
      ) : activeTab === "shop" ? (
        <NectarShop />
      ) : activeTab === "transcendence" ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <TranscendencePanel />
        </ScrollView>
      ) : (
        <EssenceShop />
      )}
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
    textAlign: "center",
    paddingVertical: 12,
  },
  nectarBalance: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.nectarIcon,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  essenceBalance: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.essenceIcon,
  },
  tabBar: {
    maxHeight: 44,
    marginHorizontal: 16,
    backgroundColor: COLORS.tabBar,
    borderRadius: 12,
  },
  tabBarContent: {
    padding: 4,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: COLORS.tabActive,
  },
  tabActiveEssence: {
    backgroundColor: COLORS.essenceIcon,
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
    paddingBottom: 24,
  },
  // Locked state styles
  lockedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  lockedIcon: {
    fontSize: 48,
    color: COLORS.nectarIcon,
    opacity: 0.4,
    marginBottom: 16,
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
    backgroundColor: "rgba(74,45,110,0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: COLORS.nectarIcon,
    borderRadius: 4,
  },
});
