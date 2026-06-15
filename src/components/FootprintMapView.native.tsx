import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MapView, Marker, Polyline } from "expo-gaode-map";
import { Ionicons } from "@expo/vector-icons";
import type { FootprintMapModel, FootprintMarker } from "@/domain/footprintMap";
import { configureAmapNativePrivacy } from "@/services/amapNativePrivacy";
import { colors, radius, spacing } from "@/styles/theme";

type FootprintMapViewProps = {
  model: FootprintMapModel;
  fullScreen?: boolean;
};

export function FootprintMapView({ model, fullScreen = false }: FootprintMapViewProps) {
  const privacyReady = configureAmapNativePrivacy();
  const [selectedMarker, setSelectedMarker] = useState<FootprintMarker | undefined>(
    model.markers[0]
  );

  if (!privacyReady) {
    return (
      <View style={[styles.wrap, styles.unavailable]}>
        <Ionicons name="map" size={28} color={colors.primaryDark} />
        <Text style={styles.stopName}>高德地图初始化中</Text>
        <Text style={styles.stopMeta}>正在完成地图 SDK 隐私确认，请稍后返回足迹页重试。</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrap, fullScreen ? styles.fullScreen : null]}>
      <MapView
        style={styles.map}
        initialCameraPosition={model.initialCamera}
        myLocationEnabled
        zoomControlsEnabled={false}
        scaleControlsEnabled
        compassEnabled
        trafficEnabled={false}
      >
        {model.polylines.map((polyline) => (
          <Polyline
            key={polyline.id}
            points={polyline.points}
            strokeColor="#2f7d55"
            strokeWidth={8}
            zIndex={1}
          />
        ))}
        {model.markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.coordinate}
            title={marker.stopName}
            snippet={`${marker.routeTitle} · ${marker.visitedAt}`}
            pinColor="green"
            zIndex={3}
            onMarkerPress={() => setSelectedMarker(marker)}
          />
        ))}
      </MapView>

      <View style={styles.summary}>
        <Metric value={model.visitedRouteCount} label="路线" />
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
          </View>
        </View>
      ) : model.markers.length === 0 ? (
        <View style={styles.callout}>
          <View style={styles.calloutIcon}>
            <Ionicons name="map" size={18} color="#ffffff" />
          </View>
          <View style={styles.calloutText}>
            <Text style={styles.stopName}>先点亮第一处足迹</Text>
            <Text style={styles.stopMeta}>在路线详情里标记“去过”，这里会显示真实地图点位。</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 430,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border
  },
  fullScreen: {
    flex: 1,
    minHeight: undefined,
    borderRadius: 0,
    borderWidth: 0
  },
  unavailable: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.lg
  },
  map: {
    height: 430
  },
  summary: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    gap: spacing.sm
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
    alignItems: "center",
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
  }
});
