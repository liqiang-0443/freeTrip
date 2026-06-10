import { useEffect, useMemo, useState } from "react";
import type { RouteTemplate } from "@/domain/routes";
import {
  fetchAmapDrivingRoute,
  formatDistance,
  formatDuration,
  selectRoutableStops,
  type AmapDrivingRouteInfo
} from "@/services/amapRoutes";

export type RouteRuntimeState = {
  status: "disabled" | "loading" | "ready" | "error";
  infoByRouteId: Record<string, AmapDrivingRouteInfo | undefined>;
  errorByRouteId: Record<string, string | undefined>;
};

export type RuntimeDrivingLabel = {
  distance: string;
  duration: string;
};

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

    const routableRoutes = routes.filter((route) => selectRoutableStops(route).length >= 2);
    setState({ status: "loading", infoByRouteId: {}, errorByRouteId: {} });

    Promise.all(
      routableRoutes.map(async (route) => {
        try {
          const info = await fetchAmapDrivingRoute(key, route);
          return { routeId: route.id, info };
        } catch (error) {
          return {
            routeId: route.id,
            error: error instanceof Error ? error.message : "Unknown AMap error"
          };
        }
      })
    ).then((results) => {
      if (!active) {
        return;
      }

      const infoByRouteId: RouteRuntimeState["infoByRouteId"] = {};
      const errorByRouteId: RouteRuntimeState["errorByRouteId"] = {};

      for (const result of results) {
        if ("info" in result) {
          infoByRouteId[result.routeId] = result.info;
        } else {
          errorByRouteId[result.routeId] = result.error;
        }
      }

      setState({
        status: Object.keys(infoByRouteId).length > 0 ? "ready" : "error",
        infoByRouteId,
        errorByRouteId
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
