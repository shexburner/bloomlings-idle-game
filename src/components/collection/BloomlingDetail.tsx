// =============================================================================
// BloomlingDetail — Full-screen overlay showing a single Bloomling's details
// =============================================================================
// Sections: Name + Rarity, Backstory/lore, Stats, Evolution progress,
// Synergy tags, and "Add to Garden" / "Remove from Garden" button.
// =============================================================================

import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { BloomlingTemplate, Bloomling } from "~/types/game";
import { EvolutionStage, Rarity } from "~/types/game";
import { useGameStore } from "~/state/store";
import {
  calculateBloomlingProduction,
  calculateLevelUpCost,
} from "~/state/selectors";
import {
  canEvolve,
  getEvolutionCost,
  getNextEvolutionStage,
} from "~/engine/evolution";
import { formatNumber } from "~/utils/formatNumber";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS = {
  overlay: "rgba(0,0,0,0.85)",
  background: "#0d1117",
  cardBg: "#161b22",
  text: "#e8f5e9",
  textMuted: "#8a9b8e",
  border: "#2d4a3e",
  accent: "#4caf50",
  accentDark: "#2e7d32",
  danger: "#f44336",
  sunlight: "#ffd700",
  nectar: "#e91e63",
  elderPurple: "#9c27b0",
  levelText: "#4fc3f7",
  tagBg: "rgba(45,74,62,0.5)",
};

const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.Common]: "#9e9e9e",
  [Rarity.Uncommon]: "#4caf50",
  [Rarity.Rare]: "#2196f3",
  [Rarity.Epic]: "#9c27b0",
  [Rarity.Legendary]: "#ffd700",
  [Rarity.Mythic]: "#f44336",
};

const RARITY_LABELS: Record<Rarity, string> = {
  [Rarity.Common]: "Common",
  [Rarity.Uncommon]: "Uncommon",
  [Rarity.Rare]: "Rare",
  [Rarity.Epic]: "Epic",
  [Rarity.Legendary]: "Legendary",
  [Rarity.Mythic]: "Mythic",
};

const STAGE_ICONS: Record<EvolutionStage, string> = {
  [EvolutionStage.Sprout]: "\uD83C\uDF31",
  [EvolutionStage.Bloom]: "\uD83C\uDF3C",
  [EvolutionStage.Elder]: "\uD83C\uDF33",
};

const STAGE_LABELS: Record<EvolutionStage, string> = {
  [EvolutionStage.Sprout]: "Sprout",
  [EvolutionStage.Bloom]: "Bloom",
  [EvolutionStage.Elder]: "Elder",
};

const EVOLUTION_ORDER: readonly EvolutionStage[] = [
  EvolutionStage.Sprout,
  EvolutionStage.Bloom,
  EvolutionStage.Elder,
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BloomlingDetailProps {
  /** Whether the modal is visible. */
  visible: boolean;
  /** Static template data for the Bloomling. */
  template: BloomlingTemplate | null;
  /** Player instance data for the Bloomling. */
  instance: Bloomling | null;
  /** Called when the user closes the detail view. */
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BloomlingDetail({
  visible,
  template,
  instance,
  onClose,
}: BloomlingDetailProps) {
  const addToGarden = useGameStore((s) => s.addToGarden);
  const removeFromGarden = useGameStore((s) => s.removeFromGarden);
  const levelUpBloomling = useGameStore((s) => s.levelUpBloomling);
  const evolveBloomlingAction = useGameStore((s) => s.evolveBloomling);
  const sunlight = useGameStore((s) => s.resources.sunlight);
  const nectar = useGameStore((s) => s.resources.nectar);
  const rapidGrowthLevel = useGameStore(
    (s) => s.upgrades["rapid_growth"]?.level ?? 0
  );
  const gardenSlots = useGameStore((s) => s.garden.slots);
  const gardenMaxSlots = useGameStore((s) => s.garden.maxSlots);

  const rarityColor = template ? RARITY_COLORS[template.rarity] : "#2d4a3e";
  const production = template && instance ? calculateBloomlingProduction(
    template.baseProduction, instance.level, instance.evolutionStage
  ) : 0;
  const nextLevelProduction = template && instance ? calculateBloomlingProduction(
    template.baseProduction, instance.level + 1, instance.evolutionStage
  ) : 0;
  const productionDelta = nextLevelProduction - production;
  const levelUpCost = template && instance ? calculateLevelUpCost(
    template.baseLevelCost, instance.level, rapidGrowthLevel
  ) : 0;
  const isMaxLevel = (instance?.level ?? 0) >= 100;
  const canAffordLevelUp = !isMaxLevel && sunlight >= levelUpCost;

  const evolutionCost = instance ? getEvolutionCost(instance) : { sunlight: 0, nectar: 0 };
  const nextStage = instance ? getNextEvolutionStage(instance.evolutionStage) : null;
  const canEvolveNow = instance ? canEvolve(instance, { sunlight, nectar }) : false;
  const isAtMaxLevelForEvolution = (instance?.level ?? 0) >= 100;

  const handleGardenToggle = () => {
    if (!instance) return;
    if (instance.inGarden) {
      removeFromGarden(instance.instanceId);
    } else {
      const emptySlotIndex = gardenSlots.indexOf(null);
      if (emptySlotIndex !== -1) {
        addToGarden(instance.instanceId, emptySlotIndex);
      }
    }
  };

  const hasEmptySlot = gardenSlots.indexOf(null) !== -1;
  const canAddToGarden = !instance?.inGarden && hasEmptySlot;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          testID="bloomling-detail"
          style={[styles.container, { borderColor: rarityColor }]}
        >
        {(!template || !instance) ? null : (<>
          {/* Close button */}
          <Pressable
            testID="bloomling-detail-close"
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeText}>{"\u2715"}</Text>
          </Pressable>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header: Name + Rarity */}
            <View style={styles.header}>
              <View style={[styles.headerSpriteCircle, { borderColor: rarityColor }]}>
                <Text style={styles.headerSpriteEmoji}>
                  {STAGE_ICONS[instance.evolutionStage]}
                </Text>
              </View>
              <Text style={styles.headerName}>{template.name}</Text>
              <Text style={[styles.headerRarity, { color: rarityColor }]}>
                {RARITY_LABELS[template.rarity]}
              </Text>
              <Text style={styles.headerPersonality}>{template.personality}</Text>
            </View>

            {/* Lore section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Backstory</Text>
              <Text style={styles.loreText}>{template.lore}</Text>
            </View>

            {/* Stats section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Stats</Text>
              <View style={styles.statsGrid}>
                <StatRow label="Level" value={`${instance.level}`} />
                <StatRow label="Stage" value={STAGE_LABELS[instance.evolutionStage]} />
                <StatRow
                  label="Production"
                  value={`${formatNumber(production)}/s`}
                  valueColor={COLORS.sunlight}
                />
                <StatRow
                  label="Total Produced"
                  value={formatNumber(instance.totalProduced)}
                  valueColor={COLORS.sunlight}
                />
                <StatRow
                  label="Garden"
                  value={instance.inGarden ? `Slot ${(instance.gardenSlot ?? 0) + 1}` : "Not placed"}
                  valueColor={instance.inGarden ? COLORS.accent : COLORS.textMuted}
                />
              </View>
            </View>

            {/* Level Up section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Level Up</Text>
              <View style={styles.statsGrid}>
                <StatRow
                  label="Current"
                  value={`${formatNumber(production)}/s`}
                  valueColor={COLORS.sunlight}
                />
                <StatRow
                  label="Next Level"
                  value={
                    isMaxLevel
                      ? "—"
                      : `${formatNumber(nextLevelProduction)}/s (+${formatNumber(productionDelta)}/s)`
                  }
                  valueColor={isMaxLevel ? COLORS.textMuted : COLORS.accent}
                />
              </View>
              {isMaxLevel ? (
                <View style={styles.levelUpMaxIndicator}>
                  <Text style={styles.levelUpMaxText}>
                    MAX LEVEL — Ready to Evolve
                  </Text>
                </View>
              ) : (
                <Pressable
                  testID="bloomling-detail-level-up"
                  style={[
                    styles.actionButton,
                    canAffordLevelUp
                      ? styles.actionButtonAffordable
                      : styles.actionButtonDisabled,
                  ]}
                  onPress={() => levelUpBloomling(instance.instanceId)}
                  disabled={!canAffordLevelUp}
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      !canAffordLevelUp && styles.actionButtonTextDisabled,
                    ]}
                  >
                    {`Level Up  \u2600 ${formatNumber(levelUpCost)}`}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Ability section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ability</Text>
              <Text style={styles.abilityText}>
                {template.abilityDescription}
              </Text>
              <Text style={styles.abilityUnlock}>
                {instance.evolutionStage === EvolutionStage.Sprout
                  ? "Unlocks at Bloom stage"
                  : instance.evolutionStage === EvolutionStage.Elder
                    ? "Enhanced (2x power)"
                    : "Active"}
              </Text>
            </View>

            {/* Evolution progress */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Evolution</Text>
              <View style={styles.evolutionRow}>
                {EVOLUTION_ORDER.map((stage, index) => {
                  const isCurrent = stage === instance.evolutionStage;
                  const isPast =
                    EVOLUTION_ORDER.indexOf(instance.evolutionStage) > index;
                  return (
                    <View key={stage} style={styles.evolutionStep}>
                      {index > 0 && (
                        <View
                          style={[
                            styles.evolutionConnector,
                            (isPast || isCurrent) && styles.evolutionConnectorActive,
                          ]}
                        />
                      )}
                      <View
                        style={[
                          styles.evolutionCircle,
                          isCurrent && { borderColor: rarityColor, backgroundColor: rarityColor + "22" },
                          isPast && styles.evolutionCirclePast,
                        ]}
                      >
                        <Text style={styles.evolutionIcon}>
                          {STAGE_ICONS[stage]}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.evolutionLabel,
                          isCurrent && { color: rarityColor, fontWeight: "700" },
                        ]}
                      >
                        {STAGE_LABELS[stage]}
                      </Text>
                    </View>
                  );
                })}
              </View>
              {/* Evolve button */}
              {nextStage === null ? (
                <Text style={styles.evolveCompleteText}>Fully evolved.</Text>
              ) : !isAtMaxLevelForEvolution ? (
                <View>
                  <Pressable
                    style={[styles.actionButton, styles.actionButtonDisabled]}
                    disabled
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        styles.actionButtonTextDisabled,
                      ]}
                    >
                      {`Level 100 Required (${instance.level}/100)`}
                    </Text>
                  </Pressable>
                  <View style={styles.evolveProgressTrack}>
                    <View
                      style={[
                        styles.evolveProgressFill,
                        {
                          width: `${Math.min(100, instance.level)}%`,
                          backgroundColor: rarityColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              ) : canEvolveNow ? (
                <Pressable
                  testID="bloomling-detail-evolve"
                  style={[
                    styles.actionButton,
                    {
                      backgroundColor:
                        nextStage === EvolutionStage.Elder
                          ? COLORS.elderPurple
                          : COLORS.accent,
                    },
                  ]}
                  onPress={() => evolveBloomlingAction(instance.instanceId)}
                >
                  <Text style={styles.actionButtonText}>
                    {`Evolve to ${STAGE_LABELS[nextStage]}  \u2600 ${formatNumber(evolutionCost.sunlight)}`}
                    {evolutionCost.nectar > 0
                      ? `  +  ${evolutionCost.nectar} \u2728`
                      : ""}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.actionButton, styles.actionButtonDisabled]}
                  disabled
                >
                  <Text
                    style={[
                      styles.actionButtonText,
                      styles.actionButtonTextDisabled,
                    ]}
                  >
                    {`Evolve  \u2600 `}
                    <Text
                      style={{
                        color:
                          sunlight < evolutionCost.sunlight
                            ? COLORS.danger
                            : COLORS.textMuted,
                      }}
                    >
                      {formatNumber(evolutionCost.sunlight)}
                    </Text>
                    {evolutionCost.nectar > 0 ? (
                      <>
                        <Text style={{ color: COLORS.textMuted }}>{"  +  "}</Text>
                        <Text
                          style={{
                            color:
                              nectar < evolutionCost.nectar
                                ? COLORS.danger
                                : COLORS.nectar,
                          }}
                        >
                          {`${evolutionCost.nectar} \u2728`}
                        </Text>
                      </>
                    ) : null}
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Synergy tags */}
            {template.synergyTags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Synergy Tags</Text>
                <View style={styles.tagRow}>
                  {template.synergyTags.map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.synergyHint}>
                  Synergies activate when Elder-stage Bloomlings with matching tags share the Garden.
                </Text>
              </View>
            )}

            {/* Garden action */}
            <View style={styles.actionSection}>
              <Pressable
                testID="bloomling-detail-garden-toggle"
                style={[
                  styles.gardenButton,
                  instance.inGarden
                    ? styles.gardenButtonRemove
                    : canAddToGarden
                      ? styles.gardenButtonAdd
                      : styles.gardenButtonDisabled,
                ]}
                onPress={handleGardenToggle}
                disabled={!instance.inGarden && !canAddToGarden}
              >
                <Text
                  style={[
                    styles.gardenButtonText,
                    !instance.inGarden && !canAddToGarden && styles.gardenButtonTextDisabled,
                  ]}
                >
                  {instance.inGarden
                    ? "Remove from Garden"
                    : canAddToGarden
                      ? "Add to Garden"
                      : `Garden Full (${gardenMaxSlots}/${gardenMaxSlots})`}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </>)}
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Stat Row Sub-Component
// ---------------------------------------------------------------------------

function StatRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : undefined]}>
        {value}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: "center",
    padding: 16,
  },
  container: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 2,
    maxHeight: "90%",
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(45,74,62,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 8,
  },
  headerSpriteCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(45,74,62,0.3)",
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  headerSpriteEmoji: {
    fontSize: 36,
  },
  headerName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  headerRarity: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  headerPersonality: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
  section: {
    marginBottom: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  loreText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 20,
    fontStyle: "italic",
  },
  statsGrid: {
    gap: 6,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  abilityText: {
    fontSize: 13,
    color: COLORS.text,
    marginBottom: 4,
  },
  abilityUnlock: {
    fontSize: 11,
    color: COLORS.accent,
    fontStyle: "italic",
  },
  evolutionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    paddingVertical: 8,
  },
  evolutionStep: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  evolutionConnector: {
    width: 24,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 2,
  },
  evolutionConnectorActive: {
    backgroundColor: COLORS.accent,
  },
  evolutionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: "rgba(30,30,40,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  evolutionCirclePast: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accent + "22",
  },
  evolutionIcon: {
    fontSize: 18,
  },
  evolutionLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    position: "absolute",
    bottom: -16,
    textAlign: "center",
    width: 40,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: COLORS.tagBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.accent,
  },
  synergyHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: "italic",
  },
  actionSection: {
    marginTop: 8,
    paddingTop: 12,
  },
  gardenButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  gardenButtonAdd: {
    backgroundColor: COLORS.accent,
  },
  gardenButtonRemove: {
    backgroundColor: COLORS.danger,
  },
  gardenButtonDisabled: {
    backgroundColor: "#3a3a4a",
  },
  gardenButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.background,
  },
  gardenButtonTextDisabled: {
    color: "#6b7b6e",
  },
  actionButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  actionButtonAffordable: {
    backgroundColor: "#4caf50",
  },
  actionButtonDisabled: {
    backgroundColor: "#3a3a4a",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0d1117",
  },
  actionButtonTextDisabled: {
    color: "#6b7b6e",
  },
  levelUpMaxIndicator: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#8a9b8e",
  },
  levelUpMaxText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8a9b8e",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  evolveCompleteText: {
    marginTop: 10,
    fontSize: 12,
    color: "#8a9b8e",
    fontStyle: "italic",
    textAlign: "center",
  },
  evolveProgressTrack: {
    marginTop: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2d4a3e",
    overflow: "hidden",
  },
  evolveProgressFill: {
    height: "100%",
  },
});
