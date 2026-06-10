import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NearbyDiscovery } from "@/components/NearbyDiscovery";
import { RouteCard } from "@/components/RouteCard";
import { RouteFilters } from "@/components/RouteFilters";
import { routeSeed } from "@/data/routes.seed";
import { rankRoutes } from "@/domain/recommendations";
import type { DurationType } from "@/domain/routes";
import { usePoiDiscovery } from "@/hooks/usePoiDiscovery";
import { formatRuntimeDriving, useRouteRuntimeInfo } from "@/hooks/useRouteRuntimeInfo";
import { useUserRoutes } from "@/hooks/useUserRoutes";
import { colors, spacing } from "@/styles/theme";

const allTags = Array.from(new Set(routeSeed.flatMap((route) => route.tags))).slice(0, 12);

export default function RecommendationsScreen() {
  const [durationType, setDurationType] = useState<DurationType>("one_day");
  const [selectedTags, setSelectedTags] = useState<string[]>(["自然"]);
  const { states } = useUserRoutes();
  const poiDiscovery = usePoiDiscovery();

  const rankedRoutes = useMemo(
    () =>
      rankRoutes(routeSeed, {
        durationType,
        selectedTags,
        userStates: states
      }),
    [durationType, selectedTags, states]
  );
  const runtimeRoutes = useMemo(
    () => rankedRoutes.slice(0, 3).map((item) => item.route),
    [rankedRoutes]
  );
  const runtime = useRouteRuntimeInfo(runtimeRoutes);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>从西安出发</Text>
          <Text style={styles.title}>今天去哪开车走走？</Text>
          <Text style={styles.subtitle}>
            先看完整路线，再决定收藏、计划或标记去过。
          </Text>
        </View>

        <RouteFilters
          durationType={durationType}
          selectedTags={selectedTags}
          tags={allTags}
          onDurationChange={setDurationType}
          onToggleTag={toggleTag}
        />

        <NearbyDiscovery
          status={poiDiscovery.status}
          keyword={poiDiscovery.keyword}
          pois={poiDiscovery.pois}
          error={poiDiscovery.error}
          onSearch={(keyword) => {
            void poiDiscovery.search(keyword);
          }}
        />

        <View style={styles.list}>
          {rankedRoutes.map((item) => (
            <RouteCard
              key={item.route.id}
              item={item}
              state={states[item.route.id]}
              runtimeDriving={formatRuntimeDriving(runtime.infoByRouteId[item.route.id])}
            />
          ))}
        </View>
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
  list: {
    gap: spacing.md
  }
});
