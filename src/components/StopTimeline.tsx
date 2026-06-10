import { StyleSheet, Text, View } from "react-native";
import type { RouteStop } from "@/domain/routes";
import { colors, radius, spacing } from "@/styles/theme";

type StopTimelineProps = {
  stops: RouteStop[];
};

export function StopTimeline({ stops }: StopTimelineProps) {
  return (
    <View style={styles.container}>
      {[...stops]
        .sort((left, right) => left.order - right.order)
        .map((stop, index) => (
          <View key={stop.id} style={styles.item}>
            <View style={styles.indexWrap}>
              <Text style={styles.index}>{index + 1}</Text>
            </View>
            <View style={styles.stopBody}>
              <Text style={styles.name}>{stop.name}</Text>
              <Text style={styles.role}>{roleLabels[stop.role]}</Text>
              {stop.notes ? <Text style={styles.notes}>{stop.notes}</Text> : null}
              {stop.suggestedStayMinutes ? (
                <Text style={styles.notes}>建议停留 {stop.suggestedStayMinutes} 分钟</Text>
              ) : null}
            </View>
          </View>
        ))}
    </View>
  );
}

const roleLabels: Record<RouteStop["role"], string> = {
  origin: "出发",
  destination: "主目的地",
  food: "吃饭",
  viewpoint: "观景",
  parking: "停车",
  lodging: "住宿",
  fuel: "补给",
  optional: "备选",
  return: "返程"
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md
  },
  item: {
    flexDirection: "row",
    gap: spacing.md
  },
  indexWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  index: {
    color: "#ffffff",
    fontWeight: "900"
  },
  stopBody: {
    flex: 1,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  role: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: spacing.xs
  },
  notes: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18
  }
});
