export type OriginKey = "xian";

export type DurationType = "half_day" | "one_day" | "weekend";

export type DistanceBand = "near" | "medium" | "far";

export type RouteStatus = "active" | "deprecated";

export type RouteStopRole =
  | "origin"
  | "destination"
  | "food"
  | "viewpoint"
  | "parking"
  | "lodging"
  | "fuel"
  | "optional"
  | "return";

export type RouteStop = {
  id: string;
  routeId: string;
  order: number;
  name: string;
  role: RouteStopRole;
  poiKeyword?: string;
  amapPoiId?: string;
  latitude?: number;
  longitude?: number;
  suggestedArrivalTime?: string;
  suggestedStayMinutes?: number;
  notes?: string;
};

export type RouteTemplate = {
  id: string;
  libraryVersion: number;
  title: string;
  originKey: OriginKey;
  durationType: DurationType;
  distanceBand: DistanceBand;
  tags: string[];
  seasonTags: string[];
  recommendedStartTime?: string;
  estimatedDrivingMinutes?: number;
  summary: string;
  highlights: string[];
  reminders: string[];
  avoidConditions: string[];
  stops: RouteStop[];
  status: RouteStatus;
  updatedAt: string;
};

export function mergeRouteTemplates(
  localRoutes: RouteTemplate[],
  remoteRoutes: RouteTemplate[]
): RouteTemplate[] {
  const merged = new Map(localRoutes.map((route) => [route.id, route]));

  for (const remoteRoute of remoteRoutes) {
    const localRoute = merged.get(remoteRoute.id);
    if (!localRoute || remoteRoute.libraryVersion > localRoute.libraryVersion) {
      merged.set(remoteRoute.id, remoteRoute);
    }
  }

  return Array.from(merged.values());
}

export function summarizeRouteStops(route: RouteTemplate): string {
  return [...route.stops]
    .sort((left, right) => left.order - right.order)
    .map((stop) => stop.name)
    .join(" -> ");
}
