import type { RouteStop, RouteTemplate } from "@/domain/routes";

export type CoordinateStop = RouteStop & {
  longitude: number;
  latitude: number;
};

export type AmapDrivingRouteInfo = {
  distanceMeters: number;
  durationSeconds: number;
  strategy?: string;
};

type BuildDrivingUrlInput = {
  key: string;
  stops: CoordinateStop[];
};

type AmapDrivingResponse = {
  status?: string;
  info?: string;
  infocode?: string;
  route?: {
    paths?: Array<{
      distance?: string | number;
      duration?: string | number;
      strategy?: string;
    }>;
  };
};

export function selectRoutableStops(route: RouteTemplate): CoordinateStop[] {
  return [...route.stops]
    .sort((left, right) => left.order - right.order)
    .filter((stop): stop is CoordinateStop =>
      typeof stop.longitude === "number" && typeof stop.latitude === "number"
    );
}

export function buildAmapDrivingUrl({ key, stops }: BuildDrivingUrlInput): URL {
  if (stops.length < 2) {
    throw new Error("At least two coordinate stops are required for AMap driving");
  }

  const origin = stops[0];
  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(1, -1);
  const url = new URL("https://restapi.amap.com/v3/direction/driving");

  url.searchParams.set("key", key);
  url.searchParams.set("origin", formatCoordinate(origin));
  url.searchParams.set("destination", formatCoordinate(destination));
  url.searchParams.set("extensions", "base");
  url.searchParams.set("output", "JSON");

  if (waypoints.length > 0) {
    url.searchParams.set("waypoints", waypoints.map(formatCoordinate).join(";"));
  }

  return url;
}

export async function fetchAmapDrivingRoute(
  key: string,
  route: RouteTemplate,
  fetcher: typeof fetch = fetch
): Promise<AmapDrivingRouteInfo> {
  const stops = selectRoutableStops(route);
  const url = buildAmapDrivingUrl({ key, stops });
  const response = await fetcher(url.toString());

  if (!response.ok) {
    throw new Error(`AMap driving route HTTP ${response.status}`);
  }

  return parseAmapDrivingResponse((await response.json()) as AmapDrivingResponse);
}

export function parseAmapDrivingResponse(
  response: AmapDrivingResponse
): AmapDrivingRouteInfo {
  if (response.status !== "1") {
    throw new Error(`AMap driving route failed: ${response.info ?? "unknown error"}`);
  }

  const firstPath = response.route?.paths?.[0];
  const distanceMeters = Number(firstPath?.distance);
  const durationSeconds = Number(firstPath?.duration);

  if (!Number.isFinite(distanceMeters) || !Number.isFinite(durationSeconds)) {
    throw new Error("AMap driving route response is missing distance or duration");
  }

  return {
    distanceMeters,
    durationSeconds,
    strategy: firstPath?.strategy
  };
}

export function buildAmapNavigationUri(route: RouteTemplate): string | null {
  const destination =
    [...route.stops]
      .sort((left, right) => left.order - right.order)
      .find((stop) => stop.role === "destination" && hasCoordinate(stop)) ??
    selectRoutableStops(route).at(-1);

  if (!destination) {
    return null;
  }

  const params = new URLSearchParams({
    sourceApplication: "FreeTrip",
    dlat: String(destination.latitude),
    dlon: String(destination.longitude),
    dname: destination.name,
    dev: "0",
    t: "0"
  });

  return `androidamap://route/plan/?${params.toString()}`;
}

export function buildAmapNavigationUrl(route: RouteTemplate): URL | null {
  const stops = selectRoutableStops(route);

  if (stops.length < 2) {
    return null;
  }

  const origin = stops[0];
  const destination = stops[stops.length - 1];
  const waypoints = stops.slice(1, -1);
  const url = new URL("https://uri.amap.com/navigation");

  url.searchParams.set("from", formatNavigationStop(origin));
  url.searchParams.set("to", formatNavigationStop(destination));
  url.searchParams.set("mode", "car");
  url.searchParams.set("policy", "1");
  url.searchParams.set("src", "FreeTrip");
  url.searchParams.set("coordinate", "gaode");
  url.searchParams.set("callnative", "1");

  if (waypoints.length > 0) {
    url.searchParams.set("via", waypoints.map(formatNavigationStop).join(";"));
  }

  return url;
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${Math.round(meters / 1000)}km`;
  }
  return `${Math.round(meters)}m`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest > 0 ? `${hours}h${rest}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

function formatCoordinate(stop: CoordinateStop): string {
  return `${stop.longitude.toFixed(6)},${stop.latitude.toFixed(6)}`;
}

function formatNavigationStop(stop: CoordinateStop): string {
  return `${formatCoordinate(stop)},${stop.name}`;
}

function hasCoordinate(stop: RouteStop): stop is CoordinateStop {
  return typeof stop.longitude === "number" && typeof stop.latitude === "number";
}
