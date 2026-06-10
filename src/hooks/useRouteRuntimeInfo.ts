import { useEffect, useMemo, useState } from "react";
import type { RouteTemplate } from "@/domain/routes";
import {
  formatDistance,
  formatDuration,
  type AmapDrivingRouteInfo
} from "@/services/amapRoutes";
import { createRouteRuntimeCache } from "@/services/routeRuntimeCache";
import { resolveRouteRuntimeInfo } from "@/services/routeRuntimeResolver";

export type RouteRuntimeState = {
  status: "disabled" | "loading" | "ready" | "error";
  infoByRouteId: Record<string, AmapDrivingRouteInfo | undefined>;
  errorByRouteId: Record<string, string | undefined>;
};

export type RuntimeDrivingLabel = {
  distance: string;
  duration: string;
};

const runtimeCache = createRouteRuntimeCache({ ttlMs: 10 * 60 * 1000 });

export function useRouteRuntimeInfo(routes: RouteTemplate[]): RouteRuntimeState {
  const key = process.env.EXPO_PUBLIC_AMAP_WEB_KEY?.trim();
  const routeSignature = useMemo(
    () => routes.map((route) => `${route.id}:${route.libraryVersion}`).join("|"),
    [routes]
  );
  const [state, setState] = useState<RouteRuntimeState>({
    status: key ? "loading" : "disabled",
    infoByRouteId: {},
    errorByRouteId: {}
  });

  useEffect(() => {
    let active = true;

    if (!key) {
      setState((current) =>
        current.status === "disabled" &&
        Object.keys(current.infoByRouteId).length === 0 &&
        Object.keys(current.errorByRouteId).length === 0
          ? current
          : { status: "disabled", infoByRouteId: {}, errorByRouteId: {} }
      );
      return () => {
        active = false;
      };
    }

    setState({ status: "loading", infoByRouteId: {}, errorByRouteId: {} });

    resolveRouteRuntimeInfo({ key, routes, cache: runtimeCache }).then((result) => {
      if (!active) {
        return;
      }

      setState({
        status: Object.keys(result.infoByRouteId).length > 0 ? "ready" : "error",
        infoByRouteId: result.infoByRouteId,
        errorByRouteId: result.errorByRouteId
      });
    });

    return () => {
      active = false;
    };
  }, [key, routeSignature, routes]);

  return state;
}

export function formatRuntimeDriving(info: AmapDrivingRouteInfo | undefined): RuntimeDrivingLabel | undefined {
  if (!info) {
    return undefined;
  }

  return {
    distance: formatDistance(info.distanceMeters),
    duration: formatDuration(info.durationSeconds)
  };
}
