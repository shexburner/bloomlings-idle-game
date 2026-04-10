// =============================================================================
// CollectionGrid — Grid layout showing all Bloomlings in the collection
// =============================================================================
// Discovered Bloomlings: show name, rarity color border, level, evolution stage.
// Undiscovered: dark silhouette card with "???" text.
// Tapping a discovered Bloomling opens the detail view.
// =============================================================================

import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { BloomlingTemplate, Bloomling } from "~/types/game";
import { useGameStore } from "~/state/store";
import { BLOOMLING_TEMPLATES } from "~/data/bloomlingTemplates";
import { BloomlingCard } from "./BloomlingCard";
import { BloomlingDetail } from "./BloomlingDetail";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NUM_COLUMNS = 3;

const COLORS = {
  background: "#0d1117",
  text: "#e8f5e9",
  textMuted: "#8a9b8e",
  accent: "#4caf50",
  border: "#2d4a3e",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CollectionGrid() {
  const insets = useSafeAreaInsets();
  const bloomlings = useGameStore((s) => s.bloomlings);

  // Detail modal state
  const [selectedTemplate, setSelectedTemplate] =
    useState<BloomlingTemplate | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<Bloomling | null>(
    null
  );
  const [detailVisible, setDetailVisible] = useState(false);

  const handleCardPress = useCallback(
    (template: BloomlingTemplate, instance: Bloomling) => {
      setSelectedTemplate(template);
      setSelectedInstance(instance);
      setDetailVisible(true);
    },
    []
  );

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
    // Defer clearing the data to allow modal close animation
    setTimeout(() => {
      setSelectedTemplate(null);
      setSelectedInstance(null);
    }, 300);
  }, []);

  // Count discovered
  const discoveredCount = BLOOMLING_TEMPLATES.filter((t) => {
    const instances = Object.values(bloomlings);
    return instances.some(
      (b) => b.templateId === t.id && b.unlocked
    );
  }).length;

  const renderItem = useCallback(
    ({ item }: { item: BloomlingTemplate }) => {
      // Find the player's instance for this template
      const instance =
        Object.values(bloomlings).find(
          (b) => b.templateId === item.id
        ) ?? null;

      return (
        <BloomlingCard
          template={item}
          instance={instance}
          onPress={handleCardPress}
        />
      );
    },
    [bloomlings, handleCardPress]
  );

  const keyExtractor = useCallback(
    (item: BloomlingTemplate) => item.id,
    []
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <Text style={styles.header}>Bloomling Collection</Text>
      <Text style={styles.subtitle}>
        {discoveredCount} / {BLOOMLING_TEMPLATES.length} Discovered
      </Text>

      {/* Grid */}
      <FlatList
        data={BLOOMLING_TEMPLATES}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
      />

      {/* Detail modal */}
      <BloomlingDetail
        visible={detailVisible}
        template={selectedTemplate}
        instance={selectedInstance}
        onClose={handleCloseDetail}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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
    paddingTop: 12,
    paddingBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.accent,
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "600",
  },
  gridContent: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  row: {
    justifyContent: "flex-start",
  },
});
