import { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { FootprintMapModel, FootprintMarker } from "@/domain/footprintMap";
import { getAmapWebKey, loadAmapWebSdk, type AmapWebApi } from "@/services/amapWebLoader";
import { colors, radius, spacing } from "@/styles/theme";

type FootprintMapViewProps = {
  model: FootprintMapModel;
  fullScreen?: boolean;
};

export function FootprintMapView({ model, fullScreen = false }: FootprintMapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [amap, setAmap] = useState<AmapWebApi | undefined>();
  const [status, setStatus] = useState<"missing-key" | "loading" | "loaded" | "failed">(
    getAmapWebKey() ? "loading" : "missing-key"
  );
  const [message, setMessage] = useState<string | undefined>();
  const [selectedMarker, setSelectedMarker] = useState<FootprintMarker | undefined>(
    model.markers[0]
  );

  useEffect(() => {
    setSelectedMarker((current) => {
      if (!current) {
        return model.markers[0];
      }

      return model.markers.find((marker) => marker.id === current.id) ?? model.markers[0];
    });
  }, [model.markers]);

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
      .then((loadedAmap) => {
        if (mounted) {
          setAmap(loadedAmap);
          setStatus("loaded");
          setMessage(undefined);
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

  useEffect(() => {
    if (!amap || !containerRef.current) {
      return;
    }

    const map = new amap.Map(containerRef.current, {
      center: [model.center.longitude, model.center.latitude],
      zoom: model.initialCamera.zoom,
      resizeEnable: true,
      viewMode: "2D"
    });
    const overlays = model.markers.map((marker) => {
      const overlay = new amap.Marker({
        position: [marker.coordinate.longitude, marker.coordinate.latitude],
        title: marker.stopName,
        anchor: "bottom-center",
        offset: new amap.Pixel(0, 0),
        content: buildMarkerContent(marker)
      });
      overlay.on?.("click", () => setSelectedMarker(marker));
      overlay.setMap(map);
      return overlay;
    });

    return () => {
      overlays.forEach((overlay) => overlay.setMap(null));
      map.destroy();
    };
  }, [amap, model]);

  return (
    <View style={[styles.wrap, fullScreen ? styles.fullScreen : null]}>
      <div ref={containerRef} style={mapElementStyle} />

      {status === "loaded" ? null : (
        <View style={styles.statusPanel}>
          <Ionicons
            name={status === "failed" || status === "missing-key" ? "warning" : "map"}
            size={28}
            color={status === "failed" || status === "missing-key" ? colors.warning : colors.primaryDark}
          />
          <Text style={styles.title}>{statusLabels[status]}</Text>
          <Text style={styles.body}>
            已记录 {model.visitedRouteCount} 条路线，{model.markers.length} 个地点。
          </Text>
          {message ? <Text style={styles.hint}>{message}</Text> : null}
        </View>
      )}

      <View style={[styles.summary, fullScreen ? styles.summaryFullScreen : null]}>
        <Metric value={model.markers.length} label="地点" />
        <Metric value={model.photoCount} label="照片" />
      </View>

      {selectedMarker ? (
        <View style={styles.callout}>
          <View style={styles.calloutIcon}>
            <Ionicons name="location" size={18} color="#ffffff" />
          </View>
          <View style={styles.calloutText}>
            <Text style={styles.stopName}>{selectedMarker.stopName}</Text>
            <Text style={styles.stopMeta} numberOfLines={2}>
              {selectedMarker.routeTitle} · 去过 {selectedMarker.visitedAt} ·{" "}
              {selectedMarker.photoCount} 张照片
            </Text>
            {selectedMarker.photos.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoStrip}
              >
                {selectedMarker.photos.map((photo) => (
                  <img
                    key={photo.id}
                    src={photo.uri}
                    alt={selectedMarker.stopName}
                    style={calloutPhotoStyle}
                  />
                ))}
              </ScrollView>
            ) : null}
          </View>
        </View>
      ) : model.markers.length === 0 ? (
        <View style={styles.callout}>
          <View style={styles.calloutIcon}>
            <Ionicons name="map" size={18} color="#ffffff" />
          </View>
          <View style={styles.calloutText}>
            <Text style={styles.stopName}>先点亮第一处足迹</Text>
            <Text style={styles.stopMeta}>
              在路线详情里标记“去过”，这里会显示真实地图点位。
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const statusLabels = {
  "missing-key": "缺少高德 Web Key",
  loading: "正在加载高德地图",
  loaded: "Web 足迹地图准备就绪",
  failed: "高德地图加载失败"
};

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function buildMarkerContent(marker: FootprintMarker) {
  if (marker.photoPreviewUri) {
    return `
      <div style="width:48px;height:48px;border-radius:24px;overflow:hidden;border:3px solid #fff;box-shadow:0 10px 22px rgba(15,63,50,.28);background:#fff;position:relative;">
        <img src="${escapeHtmlAttribute(marker.photoPreviewUri)}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" />
        <span style="position:absolute;right:2px;bottom:2px;width:13px;height:13px;border-radius:50%;background:#2f7d55;border:2px solid #fff;"></span>
      </div>
    `;
  }

  return `
    <div style="width:28px;height:28px;border-radius:50%;background:#2f7d55;border:4px solid #fff;box-shadow:0 9px 18px rgba(15,63,50,.25);"></div>
  `;
}

function escapeHtmlAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

const mapElementStyle = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%"
} satisfies React.CSSProperties;

const calloutPhotoStyle = {
  width: 78,
  height: 78,
  borderRadius: 10,
  objectFit: "cover",
  background: "#eef5ef",
  display: "block"
} satisfies React.CSSProperties;

const styles = StyleSheet.create({
  wrap: {
    minHeight: 430,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    overflow: "hidden",
    position: "relative"
  },
  fullScreen: {
    flex: 1,
    minHeight: undefined,
    borderRadius: 0,
    borderWidth: 0
  },
  statusPanel: {
    position: "absolute",
    inset: 0,
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
  },
  summary: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    gap: spacing.sm
  },
  summaryFullScreen: {
    top: 126
  },
  metric: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    alignItems: "center"
  },
  metricValue: {
    color: colors.primaryDark,
    fontSize: 20,
    fontWeight: "900"
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  callout: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: radius.md,
    padding: spacing.md
  },
  calloutIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  calloutText: {
    flex: 1,
    gap: spacing.xs
  },
  stopName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  stopMeta: {
    color: colors.muted,
    lineHeight: 18
  },
  photoStrip: {
    gap: spacing.sm,
    paddingTop: spacing.xs
  }
});
