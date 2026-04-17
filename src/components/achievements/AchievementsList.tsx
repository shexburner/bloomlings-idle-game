// =============================================================================
// AchievementsList — Scrollable list of all achievements grouped by category
// =============================================================================

import { useCallback, useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { AchievementCategory, type Achievement } from "~/types/game";
import { useGameStore } from "~/state/store";
import { computeAllProgress } from "~/engine/achievements";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const COLORS = {
  background: "#0d1117",
  cardBg: "#161b22",
  border: "#2d4a3e",
  text: "#e8f5e9",
  textMuted: "#8a9b8e",
  accent: "#4caf50",
  accentDark: "#2e7d32",
  gold: "#ffd700",
  progressBg: "#1a2b1e",
  progressFill: "#4caf50",
  completedBg: "#0d2018",
  completedBorder: "#2e7d32",
  hidden: "#2a2a3a",
  hiddenText: "#555",
  rewardText: "#ffb300",
  categoryText: "#a5d6a7",
};

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  [AchievementCategory.Growth]: "Growth",
  [AchievementCategory.Power]: "Power",
  [AchievementCategory.Journey]: "Journey",
  [AchievementCategory.Rebirth]: "Rebirth",
  [AchievementCategory.Hidden]: "Hidden",
};

const CATEGORY_ORDER: AchievementCategory[] = [
  AchievementCategory.Growth,
  AchievementCategory.Power,
  AchievementCategory.Journey,
  AchievementCategory.Rebirth,
  AchievementCategory.Hidden,
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function rewardLabel(achievement: Achievement): string | null {
  const parts: string[] = [];
  if (achievement.sunlightReward > 0)
    parts.push(`☀ ${formatNumber(achievement.sunlightReward)}`);
  if (achievement.dewdropReward > 0)
    parts.push(`💧 ${achievement.dewdropReward}`);
  return parts.length > 0 ? parts.join("  ") : null;
}

// ---------------------------------------------------------------------------
// List item types
// ---------------------------------------------------------------------------

type ListItem =
  | { type: "header"; category: AchievementCategory }
  | { type: "achievement"; achievement: Achievement; progress: number };

// ---------------------------------------------------------------------------
// AchievementCard
// ---------------------------------------------------------------------------

function AchievementCard({
  achievement,
  progress,
}: {
  achievement: Achievement;
  progress: number;
}) {
  const isHiddenUndiscovered = achievement.hidden && !achievement.completed;
  const pct = Math.min(progress / achievement.target, 1);

  if (isHiddenUndiscovered) {
    return (
      <View testID={`achievement-card-${achievement.id}`} style={[styles.card, styles.hiddenCard]}>
        <Text style={styles.hiddenTitle}>???</Text>
        <Text style={styles.hiddenDesc}>Hidden Achievement</Text>
      </View>
    );
  }

  const reward = rewardLabel(achievement);

  return (
    <View
      testID={`achievement-card-${achievement.id}`}
      style={[
        styles.card,
        achievement.completed && styles.completedCard,
      ]}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardTitleRow}>
          {achievement.completed && (
            <Text style={styles.checkmark}>✓ </Text>
          )}
          <Text
            style={[styles.cardTitle, achievement.completed && styles.completedTitle]}
            numberOfLines={1}
          >
            {achievement.name}
          </Text>
        </View>
        {reward !== null && (
          <Text style={styles.rewardText}>{reward}</Text>
        )}
      </View>

      <Text style={styles.cardDesc} numberOfLines={2}>
        {achievement.description}
      </Text>

      {!achievement.completed && (
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${pct * 100}%` }]} />
          </View>
          <Text style={styles.progressLabel}>
            {formatNumber(Math.min(progress, achievement.target))} /{" "}
            {formatNumber(achievement.target)}
          </Text>
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// AchievementsList
// ---------------------------------------------------------------------------

export function AchievementsList() {
  const achievements = useGameStore((s) => s.achievements);
  const achievementsState = useGameStore((s) => ({
    bloomlings: s.bloomlings,
    garden: s.garden,
    resources: s.resources,
    stats: s.stats,
    prestige: s.prestige,
    achievements: s.achievements,
  }));

  const progressMap = useMemo(
    () => computeAllProgress(achievementsState),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [achievementsState]
  );

  const completedCount = useMemo(
    () => Object.values(achievements).filter((a) => a.completed).length,
    [achievements]
  );

  const totalCount = Object.keys(achievements).length;

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    for (const category of CATEGORY_ORDER) {
      const inCategory = Object.values(achievements).filter(
        (a) => a.category === category
      );
      if (inCategory.length === 0) continue;
      items.push({ type: "header", category });
      for (const achievement of inCategory) {
        items.push({
          type: "achievement",
          achievement,
          progress: progressMap[achievement.id] ?? 0,
        });
      }
    }
    return items;
  }, [achievements, progressMap]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === "header") {
      return (
        <Text style={styles.categoryHeader}>
          {CATEGORY_LABELS[item.category]}
        </Text>
      );
    }
    return (
      <AchievementCard
        achievement={item.achievement}
        progress={item.progress}
      />
    );
  }, []);

  const keyExtractor = useCallback((item: ListItem, index: number) => {
    if (item.type === "header") return `header-${item.category}`;
    return `achievement-${item.achievement.id}-${index}`;
  }, []);

  return (
    <View
      testID="achievements-list"
      style={styles.container}
    >
      <Text style={styles.header}>Achievements</Text>
      <Text style={styles.subtitle}>
        {completedCount} / {totalCount} Completed
      </Text>
      <FlatList
        data={listData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  categoryHeader: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.categoryText,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 8,
  },
  completedCard: {
    backgroundColor: COLORS.completedBg,
    borderColor: COLORS.completedBorder,
  },
  hiddenCard: {
    backgroundColor: COLORS.hidden,
    borderColor: "#333",
    alignItems: "center",
    paddingVertical: 14,
  },
  hiddenTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.hiddenText,
  },
  hiddenDesc: {
    fontSize: 12,
    color: COLORS.hiddenText,
    marginTop: 2,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  checkmark: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },
  completedTitle: {
    color: COLORS.accent,
  },
  rewardText: {
    fontSize: 11,
    color: COLORS.rewardText,
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: 6,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.progressBg,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.progressFill,
    borderRadius: 2,
  },
  progressLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    minWidth: 60,
    textAlign: "right",
  },
});
