import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StopTimeline } from "@/components/StopTimeline";
import { routeSeed } from "@/data/routes.seed";
import { summarizeRouteStops } from "@/domain/routes";
import { useUserRoutes } from "@/hooks/useUserRoutes";
import { colors, radius, spacing } from "@/styles/theme";

export default function RouteDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const route = routeSeed.find((item) => item.id === params.id);
  const { states, actions } = useUserRoutes();
  const state = route ? states[route.id] : undefined;

  const tomorrow = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  }, []);

  if (!route) {
    return (
      <SafeAreaView style={styles.safe}>
        <Stack.Screen options={{ title: "路线不存在" }} />
        <View style={styles.missing}>
          <Text style={styles.title}>路线不存在</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.back()}>
            <Text style={styles.primaryButtonText}>返回</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const selectedRoute = route;

  async function addPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });

    if (!result.canceled && result.assets[0]) {
      actions.addRoutePhoto(selectedRoute.id, {
        id: `${Date.now()}`,
        uri: result.assets[0].uri,
        addedAt: new Date().toISOString(),
        stopId: selectedRoute.stops.find((stop) => stop.role === "destination")?.id
      });
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.primaryDark} />
          <Text style={styles.backText}>返回</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.kicker}>{durationLabels[route.durationType]}</Text>
          <Text style={styles.title}>{route.title}</Text>
          <Text style={styles.summary}>{route.summary}</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>路线</Text>
          <Text style={styles.path}>{summarizeRouteStops(route)}</Text>
          <View style={styles.metricRow}>
            <Metric label="总驾驶" value={`${Math.round((route.estimatedDrivingMinutes ?? 0) / 60)}h`} />
            <Metric label="建议出发" value={route.recommendedStartTime ?? "灵活"} />
            <Metric label="路线类型" value={durationLabels[route.durationType]} />
          </View>
        </View>

        <View style={styles.actions}>
          <ActionButton
            label={state?.collected ? "已收藏" : "收藏"}
            icon={state?.collected ? "bookmark" : "bookmark-outline"}
            onPress={() => actions.toggleCollected(route.id)}
          />
          <ActionButton
            label={state?.plannedDate ? `计划 ${state.plannedDate}` : "计划明天"}
            icon="calendar-outline"
            onPress={() => actions.planRoute(route.id, tomorrow)}
          />
          <ActionButton
            label={state?.visitedAt ? "已去过" : "标记去过"}
            icon={state?.visitedAt ? "checkmark-circle" : "checkmark-circle-outline"}
            onPress={() => actions.markVisited(route.id, new Date().toISOString().slice(0, 10))}
          />
        </View>

        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapTitle}>地图和实时路线增强</Text>
          <Text style={styles.mapText}>
            第一版先展示路线骨架。下一步接高德后，这里会显示实时车程、停车、餐饮和外部导航入口。
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>行程时间线</Text>
          <StopTimeline stops={route.stops} />
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>亮点</Text>
          {route.highlights.map((item) => (
            <Text key={item} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>提醒</Text>
          {route.reminders.map((item) => (
            <Text key={item} style={styles.warning}>
              • {item}
            </Text>
          ))}
        </View>

        <View style={styles.panel}>
          <View style={styles.photoHeader}>
            <Text style={styles.sectionTitle}>照片</Text>
            <Pressable style={styles.smallButton} onPress={addPhoto}>
              <Text style={styles.smallButtonText}>添加照片</Text>
            </Pressable>
          </View>
          {state?.photos?.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photos}>
              {state.photos.map((photo) => (
                <Image key={photo.id} source={{ uri: photo.uri }} style={styles.photo} />
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>去过之后可以把照片挂到这条路线下面。</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  onPress
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.actionButton} onPress={onPress}>
      <Ionicons name={icon} size={18} color={colors.primaryDark} />
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const durationLabels = {
  half_day: "今天半日",
  one_day: "今天一日",
  weekend: "周末两日"
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: spacing.lg,
    gap: spacing.lg
  },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    paddingVertical: spacing.sm
  },
  backText: {
    color: colors.primaryDark,
    fontWeight: "800"
  },
  header: {
    gap: spacing.sm
  },
  kicker: {
    color: colors.accent,
    fontWeight: "900"
  },
  title: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900"
  },
  summary: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  path: {
    color: colors.text,
    lineHeight: 22
  },
  metricRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  metric: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md,
    alignItems: "center"
  },
  metricValue: {
    color: colors.primaryDark,
    fontWeight: "900",
    fontSize: 16
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    gap: spacing.xs
  },
  actionText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800"
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "900"
  },
  mapPlaceholder: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm
  },
  mapTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900"
  },
  mapText: {
    color: "#e8f0ea",
    lineHeight: 21
  },
  listItem: {
    color: colors.text,
    lineHeight: 22
  },
  warning: {
    color: colors.warning,
    lineHeight: 22,
    fontWeight: "700"
  },
  photoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  smallButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  smallButtonText: {
    color: "#ffffff",
    fontWeight: "800"
  },
  photos: {
    gap: spacing.sm
  },
  photo: {
    width: 112,
    height: 112,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt
  },
  emptyText: {
    color: colors.muted,
    lineHeight: 20
  }
});
