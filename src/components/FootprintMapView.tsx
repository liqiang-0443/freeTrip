import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { FootprintMapModel } from "@/domain/footprintMap";
import { colors, radius, spacing } from "@/styles/theme";

type FootprintMapViewProps = {
  model: FootprintMapModel;
  fullScreen?: boolean;
};

export function FootprintMapView({ model, fullScreen = false }: FootprintMapViewProps) {
  return (
    <View style={[styles.wrap, fullScreen ? styles.fullScreen : null]}>
      <Ionicons name="map" size={28} color={colors.primaryDark} />
      <Text style={styles.title}>足迹地图准备中</Text>
      <Text style={styles.body}>
        已记录 {model.visitedRouteCount} 条路线、{model.markers.length} 个地点。
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 430,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg
  },
  fullScreen: {
    flex: 1,
    minHeight: undefined,
    borderRadius: 0,
    borderWidth: 0
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  body: {
    color: colors.muted,
    lineHeight: 20,
    textAlign: "center"
  }
});
