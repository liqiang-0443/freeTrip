import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { RouteCard } from "@/components/RouteCard";
import { routeSeed } from "@/data/routes.seed";
import type { RankedRoute } from "@/domain/recommendations";
import type { RouteTemplate } from "@/domain/routes";
import {
  buildScenarioPoiRoutes,
  getScenarioById,
  pickLuckyRoute,
  rankScenarioRoutes,
  travelScenarios,
  type ScenarioId
} from "@/domain/scenarioRecommendations";
import { usePoiDiscovery } from "@/hooks/usePoiDiscovery";
import { formatRuntimeDriving, useRouteRuntimeInfo } from "@/hooks/useRouteRuntimeInfo";
import { useUserRoutes } from "@/hooks/useUserRoutes";
import { colors, radius, spacing } from "@/styles/theme";

export default function RecommendationsScreen() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>("mountain_air");
  const [luckyIndex, setLuckyIndex] = useState(0);
  const scenario = getScenarioById(scenarioId);
  const { states } = useUserRoutes();
  const poiDiscovery = usePoiDiscovery(scenario.poiKeywords[0]);

  useEffect(() => {
    void poiDiscovery.search(scenario.poiKeywords[0]);
  }, [scenario.id]);

  const builtInRoutes = useMemo(
    () => rankScenarioRoutes(routeSeed, scenario, states),
    [scenario, states]
  );
  const discoveredRoutes = useMemo(
    () => buildScenarioPoiRoutes(poiDiscovery.pois, scenario),
    [poiDiscovery.pois, scenario]
  );
  const todayRoutes = useMemo(
    () => [...builtInRoutes.slice(0, 3), ...discoveredRoutes.slice(0, 2)],
    [builtInRoutes, discoveredRoutes]
  );
  const luckyRoute = useMemo(
    () => pickLuckyRoute(todayRoutes.length ? todayRoutes : builtInRoutes, luckyIndex),
    [builtInRoutes, luckyIndex, todayRoutes]
  );
  const runtimeRoutes = useMemo(
    () => todayRoutes.slice(0, 4).map((item) => item.route),
    [todayRoutes]
  );
  const runtime = useRouteRuntimeInfo(runtimeRoutes);

  function chooseScenario(nextScenarioId: ScenarioId) {
    setScenarioId(nextScenarioId);
    setLuckyIndex(0);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>从西安出发</Text>
          <Text style={styles.title}>今天想怎么开？</Text>
          <Text style={styles.subtitle}>
            选一个当下心情，FreeTrip 会用内置路线和高德地点临时拼出今日建议。
          </Text>
        </View>

        <View style={styles.scenarioGrid}>
          {travelScenarios.map((item) => {
            const selected = item.id === scenario.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.scenarioCard, selected ? styles.scenarioCardSelected : null]}
                onPress={() => chooseScenario(item.id)}
              >
                <Text style={[styles.scenarioTitle, selected ? styles.scenarioTitleSelected : null]}>
                  {item.title}
                </Text>
                <Text
                  style={[styles.scenarioSubtitle, selected ? styles.scenarioSubtitleSelected : null]}
                  numberOfLines={2}
                >
                  {item.subtitle}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <LuckyRouteCard
          item={luckyRoute}
          runtimeDriving={formatRuntimeDriving(runtime.infoByRouteId[luckyRoute.route.id])}
          onNext={() => setLuckyIndex((current) => current + 1)}
        />

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionKicker}>今日路线</Text>
            <Text style={styles.sectionTitle}>{scenario.title} · 推荐组合</Text>
          </View>
          <Text style={styles.sectionMeta}>{todayRoutes.length} 条</Text>
        </View>

        <View style={styles.list}>
          {todayRoutes.map((item) => (
            <ScenarioRouteCard
              key={item.route.id}
              item={item}
              runtimeDriving={formatRuntimeDriving(runtime.infoByRouteId[item.route.id])}
            />
          ))}
        </View>

        <View style={styles.discoveryPanel}>
          <View style={styles.discoveryHeader}>
            <View>
              <Text style={styles.sectionKicker}>高德临时发现</Text>
              <Text style={styles.discoveryTitle}>关键词：{scenario.poiKeywords.join(" / ")}</Text>
            </View>
            <Ionicons name="sparkles-outline" size={22} color={colors.primaryDark} />
          </View>
          {poiDiscovery.status === "loading" ? (
            <Text style={styles.stateText}>正在搜索附近可成线的地点...</Text>
          ) : null}
          {poiDiscovery.status === "error" ? (
            <Text style={styles.errorText}>{poiDiscovery.error ?? "高德搜索失败"}</Text>
          ) : null}
          {poiDiscovery.status === "disabled" ? (
            <Text style={styles.stateText}>配置高德 Web Key 后可搜索实时地点。</Text>
          ) : null}
          {poiDiscovery.status === "ready" ? (
            <Text style={styles.stateText}>
              已找到 {poiDiscovery.pois.length} 个地点，前几个已自动加入今日路线。
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LuckyRouteCard({
  item,
  runtimeDriving,
  onNext
}: {
  item: RankedRoute;
  runtimeDriving?: ReturnType<typeof formatRuntimeDriving>;
  onNext: () => void;
}) {
  return (
    <View style={styles.luckyCard}>
      <View style={styles.luckyHeader}>
        <View>
          <Text style={styles.luckyKicker}>路线盲盒</Text>
          <Text style={styles.luckyTitle}>给我一个今天能去的地方</Text>
        </View>
        <Pressable style={styles.shuffleButton} onPress={onNext}>
          <Ionicons name="shuffle" size={18} color="#ffffff" />
          <Text style={styles.shuffleText}>换一个</Text>
        </Pressable>
      </View>
      <ScenarioRouteCard item={item} runtimeDriving={runtimeDriving} compact />
    </View>
  );
}

function ScenarioRouteCard({
  item,
  runtimeDriving,
  compact = false
}: {
  item: RankedRoute;
  runtimeDriving?: ReturnType<typeof formatRuntimeDriving>;
  compact?: boolean;
}) {
  return (
    <View>
      <RouteCard item={item} runtimeDriving={runtimeDriving} href={buildRouteHref(item.route)} />
      {compact ? null : <Text style={styles.tapHint}>点开看路线预览和高德导航</Text>}
    </View>
  );
}

function buildRouteHref(route: RouteTemplate) {
  if (!route.id.startsWith("discovered-")) {
    return `/route/${route.id}` as const;
  }

  const destination = route.stops.find((stop) => stop.role === "destination");
  return {
    pathname: "/route/[id]",
    params: {
      id: route.id,
      poiId: destination?.amapPoiId ?? route.id.replace("discovered-", ""),
      poiName: destination?.name ?? route.title,
      poiType: route.tags[0] ?? "",
      poiAddress: destination?.notes ?? "",
      poiDistrict: route.tags.at(-1) ?? "",
      poiLongitude: String(destination?.longitude ?? ""),
      poiLatitude: String(destination?.latitude ?? "")
    }
  } as const;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.lg
  },
  hero: {
    gap: spacing.sm,
    paddingTop: spacing.md
  },
  eyebrow: {
    color: colors.accent,
    fontWeight: "900"
  },
  title: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22
  },
  scenarioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  scenarioCard: {
    width: "48%",
    minHeight: 92,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs
  },
  scenarioCardSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark
  },
  scenarioTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  scenarioTitleSelected: {
    color: "#ffffff"
  },
  scenarioSubtitle: {
    color: colors.muted,
    lineHeight: 18,
    fontSize: 12
  },
  scenarioSubtitleSelected: {
    color: "#d8efe7"
  },
  luckyCard: {
    backgroundColor: "#163f34",
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md
  },
  luckyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
    alignItems: "center"
  },
  luckyKicker: {
    color: "#9be7c6",
    fontSize: 12,
    fontWeight: "900"
  },
  luckyTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "900",
    marginTop: spacing.xs
  },
  shuffleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  shuffleText: {
    color: "#ffffff",
    fontWeight: "900"
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  sectionKicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: spacing.xs
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900"
  },
  sectionMeta: {
    color: colors.muted,
    fontWeight: "800"
  },
  list: {
    gap: spacing.md
  },
  tapHint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: spacing.sm
  },
  discoveryPanel: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md
  },
  discoveryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  discoveryTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  stateText: {
    color: colors.muted,
    lineHeight: 20
  },
  errorText: {
    color: colors.warning,
    fontWeight: "800",
    lineHeight: 20
  }
});
