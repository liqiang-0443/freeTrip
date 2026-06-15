import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RankedRoute } from "@/domain/recommendations";
import { summarizeRouteStops } from "@/domain/routes";
import type { UserRouteState } from "@/domain/userRouteState";
import type { RuntimeDrivingLabel } from "@/hooks/useRouteRuntimeInfo";
import { colors, radius, spacing } from "@/styles/theme";

type RouteCardProps = {
  item: RankedRoute;
  state?: UserRouteState;
  runtimeDriving?: RuntimeDrivingLabel;
};

const durationLabel = {
  half_day: "今天半日",
  one_day: "今天一日",
  weekend: "周末两日"
};

export function RouteCard({ item, state, runtimeDriving }: RouteCardProps) {
  const route = item.route;
  const drivingText = runtimeDriving
    ? `${runtimeDriving.duration} / ${runtimeDriving.distance}`
    : `${Math.round((route.estimatedDrivingMinutes ?? 0) / 60)}h 总驾驶`;

  return (
    <Link href={`/route/${route.id}`} asChild>
      <Pressable style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={styles.kicker}>{durationLabel[route.durationType]}</Text>
            <Text style={styles.title}>{route.title}</Text>
          </View>
          <View style={styles.score}>
            <Text style={styles.scoreValue}>{item.score}</Text>
            <Text style={styles.scoreLabel}>匹配</Text>
          </View>
        </View>

        <Text style={styles.path} numberOfLines={2}>
          {summarizeRouteStops(route)}
        </Text>

        <View style={styles.metaRow}>
          <Badge icon="time-outline" text={drivingText} />
          {runtimeDriving ? <Badge icon="flash-outline" text="高德实时" /> : null}
          {route.recommendedStartTime ? (
            <Badge icon="navigate-outline" text={`${route.recommendedStartTime} 出发`} />
          ) : null}
        </View>

        <View style={styles.tags}>
          {route.tags.slice(0, 4).map((tag) => (
            <Text key={tag} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>

        <Text style={styles.summary} numberOfLines={2}>
          {route.summary}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.reason} numberOfLines={1}>
            {item.reasons[0] ?? "精选路线"}
          </Text>
          <View style={styles.stateRow}>
            {state?.collected ? <Ionicons name="bookmark" size={16} color={colors.primary} /> : null}
            {state?.plannedDate ? <Ionicons name="calendar" size={16} color={colors.accent} /> : null}
            {state?.visitedAt ? <Ionicons name="checkmark-circle" size={16} color={colors.primary} /> : null}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

function Badge({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.badge}>
      <Ionicons name={icon} size={14} color={colors.primaryDark} />
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  titleWrap: {
    flex: 1
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26
  },
  score: {
    width: 56,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm
  },
  scoreValue: {
    color: colors.primaryDark,
    fontSize: 18,
    fontWeight: "900"
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: 11
  },
  path: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm
  },
  badgeText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "700"
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  tag: {
    color: colors.primaryDark,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 12
  },
  summary: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  reason: {
    flex: 1,
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700"
  },
  stateRow: {
    flexDirection: "row",
    gap: spacing.xs
  }
});
