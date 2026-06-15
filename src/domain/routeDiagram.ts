import type { RouteStop, RouteTemplate } from "./routes";

export type RouteDiagramStop = {
  id: string;
  name: string;
  role: RouteStop["role"];
  roleLabel: string;
  orderLabel: string;
  detail?: string;
};

const roleLabels: Record<RouteStop["role"], string> = {
  origin: "出发",
  destination: "主目的地",
  food: "餐饮",
  viewpoint: "观景",
  parking: "停车",
  lodging: "住宿",
  fuel: "加油",
  optional: "可选",
  return: "返回"
};

export function buildRouteDiagramStops(route: RouteTemplate): RouteDiagramStop[] {
  return [...route.stops]
    .sort((left, right) => left.order - right.order)
    .map((stop, index) => ({
      id: stop.id,
      name: stop.name,
      role: stop.role,
      roleLabel: roleLabels[stop.role],
      orderLabel: String(index + 1),
      detail: buildStopDetail(stop)
    }));
}

function buildStopDetail(stop: RouteStop): string | undefined {
  const parts = [
    stop.suggestedArrivalTime,
    stop.suggestedStayMinutes ? `停留 ${formatStay(stop.suggestedStayMinutes)}` : undefined,
    hasCoordinate(stop) ? "可导航" : undefined
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : undefined;
}

function formatStay(minutes: number): string {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest > 0 ? `${hours}h${rest}m` : `${hours}h`;
  }

  return `${minutes}m`;
}

function hasCoordinate(stop: RouteStop) {
  return typeof stop.longitude === "number" && typeof stop.latitude === "number";
}
