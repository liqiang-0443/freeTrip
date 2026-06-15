import type { RouteTemplate } from "@/domain/routes";
import {
  fetchAmapDrivingRoute,
  selectRoutableStops,
  type AmapDrivingRouteInfo
} from "./amapRoutes";
import type { RouteRuntimeCache } from "./routeRuntimeCache";

type ResolveRouteRuntimeInfoInput = {
  key: string;
  routes: RouteTemplate[];
  cache: RouteRuntimeCache;
  fetcher?: typeof fetchAmapDrivingRoute;
};

type RuntimeFetchResult =
  | {
      routeId: string;
      info: AmapDrivingRouteInfo;
    }
  | {
      routeId: string;
      error: string;
    };

export type ResolvedRouteRuntimeInfo = {
  infoByRouteId: Record<string, AmapDrivingRouteInfo | undefined>;
  errorByRouteId: Record<string, string | undefined>;
};

export async function resolveRouteRuntimeInfo({
  key,
  routes,
  cache,
  fetcher = fetchAmapDrivingRoute
}: ResolveRouteRuntimeInfoInput): Promise<ResolvedRouteRuntimeInfo> {
  const infoByRouteId: ResolvedRouteRuntimeInfo["infoByRouteId"] = {};
  const errorByRouteId: ResolvedRouteRuntimeInfo["errorByRouteId"] = {};
  const missingRoutes: RouteTemplate[] = [];

  for (const route of routes) {
    if (selectRoutableStops(route).length < 2) {
      continue;
    }

    const cached = cache.get(route.id);
    if (cached) {
      infoByRouteId[route.id] = cached;
    } else {
      missingRoutes.push(route);
    }
  }

  const results = await Promise.all(
    missingRoutes.map(async (route): Promise<RuntimeFetchResult> => {
      try {
        const info = await fetcher(key, route);
        return { routeId: route.id, info };
      } catch (error) {
        return {
          routeId: route.id,
          error: error instanceof Error ? error.message : "Unknown AMap error"
        };
      }
    })
  );

  for (const result of results) {
    if ("info" in result) {
      cache.set(result.routeId, result.info);
      infoByRouteId[result.routeId] = result.info;
    } else {
      errorByRouteId[result.routeId] = result.error;
    }
  }

  return { infoByRouteId, errorByRouteId };
}
