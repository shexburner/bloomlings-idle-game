// =============================================================================
// BloomlingCard — Grid card for a single Bloomling in the collection
// =============================================================================
// Shows name, rarity-colored border, level, and evolution stage.
// Undiscovered Bloomlings show as dark silhouettes with "???" text.
// =============================================================================

import { Pressable, StyleSheet, Text, View } from "react-native";

import type { BloomlingTemplate, Bloomling } from "~/types/game";
import { Rarity, EvolutionStage } from "~/types/game";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS = {
  cardBg: "#161b22",
  cardBgUndiscovered: "#0d1117",
  text: "#e8f5e9",
  textMuted: "#8a9b8e",
  textUndiscovered: "#3a3a4a",
  levelText: "#4fc3f7",
  border: "#2d4a3e",
};

/** Rarity border colors matching the design rules. */
const RARITY_COLORS: Record<Rarity, string> = {
  [Rarity.Common]: "#9e9e9e",
  [Rarity.Uncommon]: "#4caf50",
  [Rarity.Rare]: "#2196f3",
  [Rarity.Epic]: "#9c27b0",
  [Rarity.Legendary]: "#ffd700",
  [Rarity.Mythic]: "#f44336",
};

/** Unicode icons representing evolution stages. */
const STAGE_ICONS: Record<EvolutionStage, string> = {
  [EvolutionStage.Sprout]: "\uD83C\uDF31",
  [EvolutionStage.Bloom]: "\uD83C\uDF3C",
  [EvolutionStage.Elder]: "\uD83C\uDF33",
};

/** Rarity display labels. */
const RARITY_LABELS: Record<Rarity, string> = {
  [Rarity.Common]: "Common",
  [Rarity.Uncommon]: "Uncommon",
  [Rarity.Rare]: "Rare",
  [Rarity.Epic]: "Epic",
  [Rarity.Legendary]: "Legendary",
  [Rarity.Mythic]: "Mythic",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface BloomlingCardProps {
  /** Static template data. */
  template: BloomlingTemplate;
  /** Player instance, or null if not yet discovered/owned. */
  instance: Bloomling | null;
  /** Called when a discovered Bloomling card is tapped. */
  onPress: (template: BloomlingTemplate, instance: Bloomling) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BloomlingCard({
  template,
  instance,
  onPress,
}: BloomlingCardProps) {
  const discovered = instance !== null && instance.unlocked;
  const rarityColor = RARITY_COLORS[template.rarity];

  if (!discovered) {
    return (
      <View
        style={[
          styles.card,
          styles.cardUndiscovered,
          { borderColor: COLORS.border },
        ]}
      >
        <View style={styles.silhouetteCircle}>
          <Text style={styles.silhouetteText}>?</Text>
        </View>
        <Text style={styles.undiscoveredName}>???</Text>
        <Text style={[styles.rarityLabel, { color: COLORS.textUndiscovered }]}>
          {RARITY_LABELS[template.rarity]}
        </Text>
      </View>
    );
  }

  const handlePress = () => {
    onPress(template, instance);
  };

  return (
    <Pressable
      style={[styles.card, { borderColor: rarityColor }]}
      onPress={handlePress}
    >
      {/* Sprite placeholder */}
      <View style={[styles.spriteCircle, { borderColor: rarityColor }]}>
        <Text style={styles.spriteEmoji}>
          {STAGE_ICONS[instance.evolutionStage]}
        </Text>
      </View>

      {/* Name */}
      <Text style={styles.name} numberOfLines={1}>
        {template.name}
      </Text>

      {/* Rarity label */}
      <Text style={[styles.rarityLabel, { color: rarityColor }]}>
        {RARITY_LABELS[template.rarity]}
      </Text>

      {/* Level + Stage row */}
      <View style={styles.infoRow}>
        <Text style={styles.level}>Lv. {instance.level}</Text>
        <Text style={styles.stageBadge}>
          {instance.evolutionStage.charAt(0).toUpperCase() +
            instance.evolutionStage.slice(1)}
        </Text>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 2,
    padding: 10,
    margin: 4,
    alignItems: "center",
    minHeight: 140,
    justifyContent: "center",
  },
  cardUndiscovered: {
    backgroundColor: COLORS.cardBgUndiscovered,
    opacity: 0.6,
  },
  spriteCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(45,74,62,0.3)",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  spriteEmoji: {
    fontSize: 24,
  },
  silhouetteCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(30,30,40,0.8)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  silhouetteText: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.textUndiscovered,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 2,
  },
  undiscoveredName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textUndiscovered,
    textAlign: "center",
    marginBottom: 2,
  },
  rarityLabel: {
    fontSize: 10,
    fontWeight: "600",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  level: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.levelText,
  },
  stageBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: COLORS.textMuted,
    backgroundColor: "rgba(45,74,62,0.5)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: "hidden",
  },
});
