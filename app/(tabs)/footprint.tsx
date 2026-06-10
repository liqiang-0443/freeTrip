import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { routeSeed } from "@/data/routes.seed";
import { useUserRoutes } from "@/hooks/useUserRoutes";
import { colors, radius, spacing } from "@/styles/theme";

export default function FootprintScreen() {
  const { states } = useUserRoutes();
  const visitedRoutes = routeSeed.filter((route) => states[route.id]?.visitedAt);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>足迹地图</Text>
        <Text style={styles.subtitle}>
          第一版先用路线足迹列表承载记录，后续接入高德地图后会展示真实地图点位。
        </Text>

        <View style={styles.mapPanel}>
          <Text style={styles.mapTitle}>西安周边足迹</Text>
          <Text style={styles.mapCount}>{visitedRoutes.length}</Text>
          <Text style={styles.mapHint}>已去过路线</Text>
        </View>

        {visitedRoutes.length === 0 ? (
          <EmptyState title="还没有足迹" body="在路线详情里点“标记去过”，这里会显示你的自驾记录。" />
        ) : (
          visitedRoutes.map((route) => (
            <View key={route.id} style={styles.route}>
              <Text style={styles.routeTitle}>{route.title}</Text>
              <Text style={styles.visitedAt}>去过：{states[route.id]?.visitedAt}</Text>
              {route.stops.map((stop) => (
                <Text key={stop.id} style={styles.stop}>
                  {stop.order + 1}. {stop.name}
                </Text>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: spacing.lg,
    gap: spacing.md
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    paddingTop: spacing.md
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  mapPanel: {
    minHeight: 180,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  mapTitle: {
    color: colors.primaryDark,
    fontWeight: "800"
  },
  mapCount: {
    color: colors.primary,
    fontSize: 48,
    fontWeight: "900"
  },
  mapHint: {
    color: colors.muted
  },
  route: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm
  },
  routeTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  visitedAt: {
    color: colors.accent,
    fontWeight: "700"
  },
  stop: {
    color: colors.muted,
    lineHeight: 20
  }
});
