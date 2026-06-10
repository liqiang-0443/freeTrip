import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RouteTemplate } from "@/domain/routes";
import { buildRouteDiagramStops } from "@/domain/routeDiagram";
import { colors, radius, spacing } from "@/styles/theme";

type RouteDiagramProps = {
  route: RouteTemplate;
};

const roleIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  origin: "flag-outline",
  destination: "location",
  food: "restaurant-outline",
  viewpoint: "camera-outline",
  parking: "car-outline",
  lodging: "bed-outline",
  fuel: "speedometer-outline",
  optional: "add-circle-outline",
  return: "home-outline"
};

export function RouteDiagram({ route }: RouteDiagramProps) {
  const stops = buildRouteDiagramStops(route);

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>路线示意图</Text>
        <Text style={styles.hint}>{stops.length} 个停靠点</Text>
      </View>
      <View style={styles.diagram}>
        {stops.map((stop, index) => (
          <View key={stop.id} style={styles.stopRow}>
            <View style={styles.markerColumn}>
              <View style={styles.marker}>
                <Ionicons name={roleIcons[stop.role]} size={17} color="#ffffff" />
              </View>
              {index < stops.length - 1 ? <View style={styles.connector} /> : null}
            </View>
            <View style={styles.stopBody}>
              <View style={styles.stopHeader}>
                <Text style={styles.order}>{stop.orderLabel}</Text>
                <Text style={styles.stopName}>{stop.name}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.rolePill}>{stop.roleLabel}</Text>
                {stop.detail ? <Text style={styles.detail}>{stop.detail}</Text> : null}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  diagram: {
    gap: spacing.xs
  },
  stopRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  markerColumn: {
    width: 34,
    alignItems: "center"
  },
  marker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  connector: {
    flex: 1,
    width: 2,
    minHeight: 42,
    backgroundColor: colors.border,
    marginVertical: spacing.xs
  },
  stopBody: {
    flex: 1,
    paddingBottom: spacing.lg
  },
  stopHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap"
  },
  order: {
    color: colors.accent,
    fontWeight: "900",
    fontSize: 13
  },
  stopName: {
    flex: 1,
    color: colors.text,
    fontWeight: "900",
    fontSize: 17,
    lineHeight: 23
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  rolePill: {
    color: colors.primaryDark,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: 12,
    fontWeight: "800"
  },
  detail: {
    flexShrink: 1,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  }
});
