// =============================================================================
// PerkCard — Single Dewdrop-shop entry (permanent unlock or consumable)
// =============================================================================
// Permanent perks show "Owned" once purchased. Consumables can be purchased
// repeatedly; the Zone Skip consumable also exposes a "Use" button that
// invokes `store.useZoneSkip()`. All other consumables are consumed by their
// respective engine flows (Rebirth, Evolution) automatically.
// =============================================================================

import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { PERK_ID, type PerkTemplate } from "~/data/perkTemplates";
import { useGameStore } from "~/state/store";

const COLORS = {
  cardBg: "#0e1a20",
  border: "#1e4d5a",
  borderOwned: "#00acc1",
  text: "#e0f7fa",
  textMuted: "#8ab0b8",
  badgePerm: "#006978",
  badgeConsumable: "#4a3b6e",
  badgeText: "#e0f7fa",
  buyAffordable: "#4dd0e1",
  buyAffordableText: "#00363a",
  buyUnaffordable: "#1a2f36",
  buyUnaffordableText: "#5a7b82",
  use: "#26c6da",
  useText: "#00363a",
  owned: "#80cbc4",
  quantity: "#ffd740",
  costText: "#4dd0e1",
};

interface PerkCardProps {
  template: PerkTemplate;
}

export const PerkCard = React.memo(function PerkCard({ template }: PerkCardProps) {
  const dewdrops = useGameStore((s) => s.resources.dewdrops);
  const perk = useGameStore((s) => s.perks[template.id]);
  const buyPerk = useGameStore((s) => s.buyPerk);
  const consumeZoneSkip = useGameStore((s) => s.useZoneSkip);

  const isPermanent = template.category === "permanent";
  const owned = isPermanent && perk?.purchased === true;
  const quantity = !isPermanent ? (perk?.quantity ?? 0) : 0;
  const canAfford = dewdrops >= template.cost;

  const handleBuy = () => {
    if (owned) return;
    buyPerk(template.id);
  };

  const handleUse = () => {
    if (template.id !== PERK_ID.ZoneSkip) return;
    if (quantity <= 0) return;
    consumeZoneSkip();
  };

  const showUseButton =
    !isPermanent && template.id === PERK_ID.ZoneSkip && quantity > 0;

  return (
    <View style={[styles.card, owned && styles.cardOwned]}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{template.name}</Text>
        <View
          style={[
            styles.badge,
            isPermanent ? styles.badgePerm : styles.badgeConsumable,
          ]}
        >
          <Text style={styles.badgeText}>{template.badge}</Text>
        </View>
      </View>

      <Text style={styles.description}>{template.description}</Text>

      <View style={styles.footerRow}>
        {owned ? (
          <Text style={styles.ownedText}>Owned</Text>
        ) : (
          <>
            {!isPermanent && quantity > 0 && (
              <Text style={styles.quantityText}>Owned: {quantity}</Text>
            )}
            <View style={styles.buttonRow}>
              {showUseButton && (
                <Pressable style={styles.useButton} onPress={handleUse}>
                  <Text style={styles.useButtonText}>Use</Text>
                </Pressable>
              )}
              <Pressable
                testID={`perk-buy-${template.id}`}
                style={[
                  styles.buyButton,
                  canAfford ? styles.buyAffordable : styles.buyUnaffordable,
                ]}
                onPress={handleBuy}
                disabled={!canAfford}
              >
                <Text
                  style={
                    canAfford ? styles.buyButtonText : styles.buyButtonTextDisabled
                  }
                >
                  Buy
                </Text>
                <Text
                  style={[
                    styles.costText,
                    !canAfford && styles.costTextDisabled,
                  ]}
                >
                  💧 {template.cost}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardOwned: {
    borderColor: COLORS.borderOwned,
    backgroundColor: "rgba(0,172,193,0.08)",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgePerm: {
    backgroundColor: COLORS.badgePerm,
  },
  badgeConsumable: {
    backgroundColor: COLORS.badgeConsumable,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.badgeText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 36,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginLeft: "auto",
  },
  quantityText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.quantity,
  },
  ownedText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.owned,
    letterSpacing: 1,
  },
  buyButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 84,
  },
  buyAffordable: {
    backgroundColor: COLORS.buyAffordable,
  },
  buyUnaffordable: {
    backgroundColor: COLORS.buyUnaffordable,
  },
  buyButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.buyAffordableText,
  },
  buyButtonTextDisabled: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.buyUnaffordableText,
  },
  costText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.costText,
    marginTop: 1,
  },
  costTextDisabled: {
    color: COLORS.buyUnaffordableText,
  },
  useButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.use,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 64,
  },
  useButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.useText,
  },
});
