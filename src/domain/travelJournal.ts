import type { RouteStop, RouteTemplate } from "./routes";
import type { RoutePhoto, UserRouteState, UserRouteStateMap } from "./userRouteState";

export type StopPhotoGroup = {
  stop?: RouteStop;
  photos: RoutePhoto[];
};

export type FootprintSummary = {
  visitedRouteCount: number;
  photoCount: number;
  visitedStopCount: number;
  unassignedPhotoCount: number;
};

export function groupRoutePhotosByStop(
  route: RouteTemplate,
  state: UserRouteState | undefined
): StopPhotoGroup[] {
  const photos = state?.photos ?? [];
  const sortedStops = [...route.stops].sort((left, right) => left.order - right.order);
  const knownStopIds = new Set(sortedStops.map((stop) => stop.id));

  const stopGroups = sortedStops.map((stop) => ({
    stop,
    photos: photos.filter((photo) => photo.stopId === stop.id)
  }));
  const unassignedPhotos = photos.filter((photo) => !photo.stopId || !knownStopIds.has(photo.stopId));

  return unassignedPhotos.length > 0
    ? [...stopGroups, { stop: undefined, photos: unassignedPhotos }]
    : stopGroups;
}

export function buildFootprintSummary(
  routes: RouteTemplate[],
  states: UserRouteStateMap
): FootprintSummary {
  const visitedRoutes = routes.filter((route) => states[route.id]?.visitedAt);
  const photos = visitedRoutes.flatMap((route) => states[route.id]?.photos ?? []);

  return {
    visitedRouteCount: visitedRoutes.length,
    photoCount: photos.length,
    visitedStopCount: visitedRoutes.reduce((sum, route) => sum + route.stops.length, 0),
    unassignedPhotoCount: photos.filter((photo) => !photo.stopId).length
  };
}
