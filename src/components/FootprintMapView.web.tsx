import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { FootprintMapModel } from "@/domain/footprintMap";
import { getAmapWebKey, loadAmapWebSdk } from "@/services/amapWebLoader";
import { colors, radius, spacing } from "@/styles/theme";

type FootprintMapViewProps = {
  model: FootprintMapModel;
};

export function FootprintMapView({ model }: FootprintMapViewProps) {
  const [status, setStatus] = useState<"missing-key" | "loading" | "loaded" | "failed">(
    getAmapWebKey() ? "loading" : "missing-key"
  );
  const [message, setMessage] = useState<string | undefined>();

  useEffect(() => {
    if (!getAmapWebKey()) {
      setStatus("missing-key");
      setMessage("请在 .env 中配置 EXPO_PUBLIC_AMAP_WEB_KEY 后重启 Web 服务。");
      return;
    }

    let mounted = true;
    setStatus("loading");
    setMessage("正在加载高德 Web 地图...");

    loadAmapWebSdk()
      .then(() => {
        if (mounted) {
          setStatus("loaded");
          setMessage("高德 Web 地图已加载，下一步会渲染真实点位。");
        }
      })
      .catch((error: unknown) => {
        if (mounted) {
          setStatus("failed");
          setMessage(error instanceof Error ? error.message : "高德 Web 地图加载失败。");
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <View style={styles.wrap}>
      <Ionicons
        name={status === "failed" || status === "missing-key" ? "warning" : "map"}
        size={28}
        color={status === "failed" || status === "missing-key" ? colors.warning : colors.primaryDark}
      />
      <Text style={styles.title}>{statusLabels[status]}</Text>
      <Text style={styles.body}>
        已记录 {model.visitedRouteCount} 条路线、{model.markers.length} 个地点。
      </Text>
      {message ? <Text style={styles.hint}>{message}</Text> : null}
    </View>
  );
}

const statusLabels = {
  "missing-key": "缺少高德 Web Key",
  loading: "正在加载高德地图",
  loaded: "Web 足迹地图准备就绪",
  failed: "高德地图加载失败"
};

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
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  body: {
    color: colors.muted,
    lineHeight: 20,
    textAlign: "center"
  },
  hint: {
    color: colors.muted,
    lineHeight: 20,
    textAlign: "center"
  }
});
