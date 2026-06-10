import { Link } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { DiscoveredPoi } from "@/services/amapPoiSearch";
import { colors, radius, spacing } from "@/styles/theme";

type NearbyDiscoveryProps = {
  status: "disabled" | "idle" | "loading" | "ready" | "error";
  keyword: string;
  pois: DiscoveredPoi[];
  error?: string;
  onSearch: (keyword: string) => void;
};

const quickKeywords = ["森林公园", "古镇", "博物馆", "温泉", "露营"];

export function NearbyDiscovery({
  status,
  keyword,
  pois,
  error,
  onSearch
}: NearbyDiscoveryProps) {
  const [draftKeyword, setDraftKeyword] = useState(keyword);

  function submitSearch(nextKeyword = draftKeyword) {
    const normalizedKeyword = nextKeyword.trim();
    if (normalizedKeyword) {
      setDraftKeyword(normalizedKeyword);
      onSearch(normalizedKeyword);
    }
  }

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.kicker}>网上发现</Text>
          <Text style={styles.title}>没想法时搜搜西安周边</Text>
        </View>
        <Ionicons name="search" size={22} color={colors.primaryDark} />
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={draftKeyword}
          onChangeText={setDraftKeyword}
          placeholder="森林公园、古镇、温泉..."
          placeholderTextColor={colors.muted}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={() => submitSearch()}
        />
        <Pressable style={styles.searchButton} onPress={() => submitSearch()}>
          <Text style={styles.searchButtonText}>搜索</Text>
        </Pressable>
      </View>

      <View style={styles.quickRow}>
        {quickKeywords.map((item) => (
          <Pressable key={item} style={styles.quickChip} onPress={() => submitSearch(item)}>
            <Text style={styles.quickChipText}>{item}</Text>
          </Pressable>
        ))}
      </View>

      {status === "disabled" ? (
        <Text style={styles.stateText}>配置 EXPO_PUBLIC_AMAP_WEB_KEY 后可搜索高德周边地点。</Text>
      ) : null}
      {status === "idle" ? <Text style={styles.stateText}>选择关键词，发现可临时成线的目的地。</Text> : null}
      {status === "loading" ? <Text style={styles.stateText}>正在搜索高德周边地点...</Text> : null}
      {status === "error" ? <Text style={styles.errorText}>{error ?? "搜索失败"}</Text> : null}

      {pois.length ? (
        <View style={styles.results}>
          {pois.slice(0, 5).map((poi) => (
            <Link
              key={poi.id}
              href={{
                pathname: "/route/[id]",
                params: {
                  id: `discovered-${poi.id}`,
                  poiId: poi.id,
                  poiName: poi.name,
                  poiType: poi.type ?? "",
                  poiAddress: poi.address ?? "",
                  poiDistrict: poi.district ?? "",
                  poiLongitude: String(poi.longitude),
                  poiLatitude: String(poi.latitude)
                }
              }}
              asChild
            >
              <Pressable style={styles.resultCard}>
                <View style={styles.resultText}>
                  <Text style={styles.poiName}>{poi.name}</Text>
                  <Text style={styles.poiMeta} numberOfLines={2}>
                    {[poi.district, poi.address, poi.type].filter(Boolean).join(" · ")}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.primaryDark} />
              </Pressable>
            </Link>
          ))}
        </View>
      ) : null}
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
  titleWrap: {
    flex: 1
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: spacing.xs
  },
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    lineHeight: 25
  },
  searchRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontWeight: "700"
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  searchButtonText: {
    color: "#ffffff",
    fontWeight: "900"
  },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  quickChip: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs
  },
  quickChipText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800"
  },
  stateText: {
    color: colors.muted,
    lineHeight: 20
  },
  errorText: {
    color: colors.warning,
    fontWeight: "800",
    lineHeight: 20
  },
  results: {
    gap: spacing.sm
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.md
  },
  resultText: {
    flex: 1,
    gap: spacing.xs
  },
  poiName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  poiMeta: {
    color: colors.muted,
    lineHeight: 18
  }
});
