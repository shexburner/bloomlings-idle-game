// =============================================================================
// Collection Tab — Bloomling collection grid + achievements list
// =============================================================================

import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CollectionGrid } from "~/components/collection/CollectionGrid";
import { AchievementsList } from "~/components/achievements/AchievementsList";

const COLORS = {
  background: "#0d1117",
  tabBg: "#161b22",
  tabBorder: "#2d4a3e",
  tabActive: "#4caf50",
  tabActiveBg: "#0d2018",
  tabInactive: "#6b7b6e",
};

type Tab = "bloomlings" | "achievements";

export default function CollectionScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("bloomlings");
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Tab switcher */}
      <View style={styles.tabBar}>
        <Pressable
          testID="collection-tab-bloomlings"
          style={[styles.tab, activeTab === "bloomlings" && styles.tabActive]}
          onPress={() => setActiveTab("bloomlings")}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === "bloomlings" && styles.tabLabelActive,
            ]}
          >
            Bloomlings
          </Text>
        </Pressable>
        <Pressable
          testID="collection-tab-achievements"
          style={[styles.tab, activeTab === "achievements" && styles.tabActive]}
          onPress={() => setActiveTab("achievements")}
        >
          <Text
            style={[
              styles.tabLabel,
              activeTab === "achievements" && styles.tabLabelActive,
            ]}
          >
            Achievements
          </Text>
        </Pressable>
      </View>

      {activeTab === "bloomlings" ? (
        <CollectionGrid />
      ) : (
        <AchievementsList />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: COLORS.tabBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.tabBorder,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: COLORS.tabActiveBg,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.tabActive,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.tabInactive,
  },
  tabLabelActive: {
    color: COLORS.tabActive,
  },
});
