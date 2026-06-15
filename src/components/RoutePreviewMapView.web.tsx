import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { RouteTemplate } from "@/domain/routes";
import { selectRoutableStops } from "@/services/amapRoutes";
import { getAmapWebKey, loadAmapWebSdk, type AmapWebApi, type AmapWebOverlay } from "@/services/amapWebLoader";
import { colors, radius, spacing } from "@/styles/theme";

type RoutePreviewMapViewProps = {
  route: RouteTemplate;
};

export function RoutePreviewMapView({ route }: RoutePreviewMapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"missing-key" | "loading" | "loaded" | "failed">(
    getAmapWebKey() ? "loading" : "missing-key"
  );
  const [message, setMessage] = useState<string | undefined>();

  useEffect(() => {
    const stops = selectRoutableStops(route);
    if (!getAmapWebKey()) {
      setStatus("missing-key");
      setMessage("配置高德 Web Key 后可查看真实路线预览。");
      return;
    }

    if (stops.length < 2) {
      setStatus("failed");
      setMessage("这条路线缺少可绘制的坐标。");
      return;
    }

    let cancelled = false;
    let cleanUp: (() => void) | undefined;
    setStatus("loading");
    setMessage("正在加载路线预览...");

    loadAmapWebSdk()
      .then((amap) => {
        if (cancelled || !containerRef.current) {
          return;
        }
        cleanUp = renderRoutePreview(amap, containerRef.current, route);
        setStatus("loaded");
        setMessage(undefined);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setStatus("failed");
          setMessage(error instanceof Error ? error.message : "路线预览加载失败。");
        }
      });

    return () => {
      cancelled = true;
      cleanUp?.();
    };
  }, [route]);

  return (
    <View style={styles.wrap}>
      <div ref={containerRef} style={mapElementStyle} />
      {status === "loaded" ? null : (
        <View style={styles.statusPanel}>
          <Ionicons
            name={status === "failed" || status === "missing-key" ? "warning" : "map-outline"}
            size={24}
            color={status === "failed" || status === "missing-key" ? colors.warning : colors.primaryDark}
          />
          <Text style={styles.statusTitle}>{statusLabels[status]}</Text>
          {message ? <Text style={styles.statusText}>{message}</Text> : null}
        </View>
      )}
    </View>
  );
}

function renderRoutePreview(amap: AmapWebApi, container: HTMLElement, route: RouteTemplate) {
  const stops = selectRoutableStops(route);
  const map = new amap.Map(container, {
    center: [stops[0].longitude, stops[0].latitude],
    zoom: 9,
    resizeEnable: true,
    viewMode: "2D",
    features: ["bg", "road"],
    mapStyle: "amap://styles/whitesmoke"
  });
  map.setMapStyle?.("amap://styles/whitesmoke");

  const markers = stops.map((stop, index) => {
    const marker = new amap.Marker({
      position: [stop.longitude, stop.latitude],
      title: stop.name,
      content: buildStopMarker(index + 1, stop.role === "origin" || stop.role === "return"),
      anchor: "center"
    });
    marker.setMap(map);
    return marker;
  });

  let fallbackLine: AmapWebOverlay | undefined;
  let driving: { clear?: () => void } | undefined;

  const drawFallbackLine = () => {
    fallbackLine = new amap.Polyline({
      path: stops.map((stop) => [stop.longitude, stop.latitude]),
      strokeColor: "#2f7d55",
      strokeWeight: 5,
      strokeOpacity: 0.72,
      zIndex: 8
    });
    fallbackLine.setMap(map);
    map.setFitView(markers);
  };

  if (amap.plugin && !amap.Driving) {
    amap.plugin("AMap.Driving", () => {
      if (amap.Driving) {
        driving = createDrivingPreview(amap, map, stops, drawFallbackLine);
      } else {
        drawFallbackLine();
      }
    });
  } else if (amap.Driving) {
    driving = createDrivingPreview(amap, map, stops, drawFallbackLine);
  } else {
    drawFallbackLine();
  }

  return () => {
    driving?.clear?.();
    fallbackLine?.setMap(null);
    markers.forEach((marker) => marker.setMap(null));
    map.destroy();
  };
}

function createDrivingPreview(
  amap: AmapWebApi,
  map: unknown,
  stops: ReturnType<typeof selectRoutableStops>,
  drawFallbackLine: () => void
) {
  const Driving = amap.Driving;
  if (!Driving) {
    drawFallbackLine();
    return undefined;
  }

  const driving = new Driving({
    map,
    hideMarkers: true,
    showTraffic: false,
    policy: 0
  });
  const origin = new amap.LngLat(stops[0].longitude, stops[0].latitude);
  const destinationStop = stops[stops.length - 1];
  const destination = new amap.LngLat(destinationStop.longitude, destinationStop.latitude);
  const waypoints = stops
    .slice(1, -1)
    .map((stop) => new amap.LngLat(stop.longitude, stop.latitude));

  driving.search(origin, destination, { waypoints }, (status) => {
    if (status !== "complete") {
      drawFallbackLine();
    }
  });

  return driving;
}

function buildStopMarker(index: number, muted: boolean) {
  const color = muted ? "#789186" : "#2f7d55";
  return `
    <div style="min-width:28px;height:28px;border-radius:14px;background:${color};color:#fff;border:2px solid #fff;box-shadow:0 7px 16px rgba(15,63,50,.22);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;">
      ${index}
    </div>
  `;
}

const statusLabels = {
  "missing-key": "缺少高德 Web Key",
  loading: "正在加载路线预览",
  loaded: "路线预览已加载",
  failed: "路线预览不可用"
};

const mapElementStyle = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%"
} satisfies React.CSSProperties;

const styles = StyleSheet.create({
  wrap: {
    minHeight: 260,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    position: "relative"
  },
  statusPanel: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surfaceAlt
  },
  statusTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  statusText: {
    color: colors.muted,
    lineHeight: 20,
    textAlign: "center"
  }
});
