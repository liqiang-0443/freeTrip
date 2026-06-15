import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { FootprintMapView } from "@/components/FootprintMapView";
import { routeSeed } from "@/data/routes.seed";
import { buildFootprintMapModel } from "@/domain/footprintMap";
import { groupRoutePhotosByStop } from "@/domain/travelJournal";
import { useUserRoutes } from "@/hooks/useUserRoutes";
import { colors, radius, spacing } from "@/styles/theme";

export default function FootprintScreen() {
  const { states } = useUserRoutes();
  const visitedRoutes = routeSeed.filter((route) => states[route.id]?.visitedAt);
  const mapModel = buildFootprintMapModel(routeSeed, states);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>足迹地图</Text>
        <Text style={styles.subtitle}>
          把去过的路线落到高德地图上，点亮你从西安开出去的地方。
        </Text>

        <FootprintMapView model={mapModel} />

        {visitedRoutes.length === 0 ? (
          <EmptyState title="还没有足迹" body="在路线详情里点“标记去过”，这里会显示真实地图点位。" />
        ) : (
          visitedRoutes.map((route) => {
            const groups = groupRoutePhotosByStop(route, states[route.id]);
            return (
              <View key={route.id} style={styles.route}>
                <Text style={styles.routeTitle}>{route.title}</Text>
                <Text style={styles.visitedAt}>去过：{states[route.id]?.visitedAt}</Text>
                {groups.map((group, index) => (
                  <View key={group.stop?.id ?? "unassigned"} style={styles.stopRow}>
                    <Text style={styles.stop}>
                      {group.stop ? `${index + 1}. ${group.stop.name}` : "未归类照片"}
                    </Text>
                    <Text style={styles.photoCount}>{group.photos.length} 张</Text>
                  </View>
                ))}
              </View>
            );
          })
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
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  stop: {
    flex: 1,
    color: colors.muted,
    lineHeight: 20
  },
  photoCount: {
    color: colors.primaryDark,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 12,
    fontWeight: "800"
  }
});
