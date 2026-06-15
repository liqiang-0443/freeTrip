import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FootprintMapView } from "@/components/FootprintMapView";
import { routeSeed } from "@/data/routes.seed";
import { buildFootprintMapModel } from "@/domain/footprintMap";
import { useAllRoutePhotos } from "@/hooks/useRoutePhotos";
import { useUserRoutes } from "@/hooks/useUserRoutes";
import { colors } from "@/styles/theme";

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
  }
});
