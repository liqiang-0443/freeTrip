import type { AmapDrivingRouteInfo } from "./amapRoutes";

type RouteRuntimeCacheOptions = {
  ttlMs: number;
  now?: () => number;
};

type CacheEntry = {
  value: AmapDrivingRouteInfo;
  expiresAt: number;
};

export type RouteRuntimeCache = ReturnType<typeof createRouteRuntimeCache>;

export function createRouteRuntimeCache({
  ttlMs,
  now = Date.now
}: RouteRuntimeCacheOptions) {
  const entries = new Map<string, CacheEntry>();

  return {
    get(routeId: string): AmapDrivingRouteInfo | undefined {
      const entry = entries.get(routeId);
      if (!entry) {
        return undefined;
      }

      if (entry.expiresAt < now()) {
        entries.delete(routeId);
        return undefined;
      }

      return entry.value;
    },
    set(routeId: string, value: AmapDrivingRouteInfo) {
      entries.set(routeId, {
        value,
        expiresAt: now() + ttlMs
      });
    }
  };
}
