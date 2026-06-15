import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { FootprintMapView } from "@/components/FootprintMapView";
import { routeSeed } from "@/data/routes.seed";
import { buildFootprintMapModel } from "@/domain/footprintMap";
import { useAllRoutePhotos } from "@/hooks/useRoutePhotos";
import { useUserRoutes } from "@/hooks/useUserRoutes";
import { colors, radius, spacing } from "@/styles/theme";

export default function FootprintScreen() {
  const { states } = useUserRoutes();
  const routePhotos = useAllRoutePhotos();
  const mapModel = buildFootprintMapModel(routeSeed, states, {
    routePhotos: routePhotos.map((photo) => ({
      id: photo.id,
      routeId: photo.routeId,
      stopId: photo.stopId,
      uri: photo.dataUrl,
      addedAt: photo.addedAt
    }))
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.mapShell}>
        <FootprintMapView model={mapModel} fullScreen />

        <View style={styles.header}>
          <Text style={styles.eyebrow}>FreeTrip</Text>
          <Text style={styles.title}>足迹地图</Text>
          <Text style={styles.subtitle}>只看去过的地点，地图铺满整个页签。</Text>
        </View>

        {mapModel.markers.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIcon}>
              <Ionicons name="map" size={20} color="#ffffff" />
            </View>
            <View style={styles.emptyTextWrap}>
              <Text style={styles.emptyTitle}>还没有足迹</Text>
              <Text style={styles.emptyBody}>去路线详情里标记“去过”，这里就会点亮地点。</Text>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  mapShell: {
    flex: 1,
    position: "relative",
    backgroundColor: colors.surfaceAlt
  },
  header: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: "rgba(15, 63, 50, 0.92)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    boxShadow: "0 14px 34px rgba(15, 63, 50, 0.22)"
  },
  eyebrow: {
    color: "#9be7c6",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0
  },
  title: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
    marginTop: spacing.xs
  },
  subtitle: {
    color: "#d8efe7",
    marginTop: spacing.xs,
    lineHeight: 19
  },
  emptyCard: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: radius.md,
    padding: spacing.lg
  },
  emptyIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  emptyTextWrap: {
    flex: 1,
    gap: spacing.xs
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  emptyBody: {
    color: colors.muted,
    lineHeight: 19
  }
});
