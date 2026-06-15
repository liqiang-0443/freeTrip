import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { FootprintMapView } from "@/components/FootprintMapView";
import { routeSeed } from "@/data/routes.seed";
import { buildFootprintMapModel } from "@/domain/footprintMap";
import { useRoutePhotoCounts } from "@/hooks/useRoutePhotos";
import { useUserRoutes } from "@/hooks/useUserRoutes";
import { colors, spacing } from "@/styles/theme";

export default function FootprintScreen() {
  const { states } = useUserRoutes();
  const routePhotoCounts = useRoutePhotoCounts();
  const mapModel = buildFootprintMapModel(routeSeed, states, routePhotoCounts);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>足迹地图</Text>
        <Text style={styles.subtitle}>
          这里只看你去过的地点点位，不再铺路线清单；打开地图就能看到从西安点亮过哪些地方。
        </Text>

        <FootprintMapView model={mapModel} />

        {mapModel.markers.length === 0 ? (
          <EmptyState
            title="还没有足迹"
            body="在路线详情里标记“去过”，这里会显示真实地图点位。"
          />
        ) : null}
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
  }
});
