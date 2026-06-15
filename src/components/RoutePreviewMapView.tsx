import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RouteTemplate } from "@/domain/routes";
import { colors, radius, spacing } from "@/styles/theme";

type RoutePreviewMapViewProps = {
  route: RouteTemplate;
};

export function RoutePreviewMapView({ route }: RoutePreviewMapViewProps) {
  return (
    <View style={styles.fallback}>
      <Ionicons name="map-outline" size={24} color={colors.primaryDark} />
      <Text style={styles.title}>路线预览</Text>
      <Text style={styles.body}>{route.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    minHeight: 220,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  body: {
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20
  }
});
