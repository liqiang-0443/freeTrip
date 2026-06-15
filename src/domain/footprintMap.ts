import type { RouteTemplate } from "./routes";
import type { UserRouteStateMap } from "./userRouteState";

export type FootprintCoordinate = {
  latitude: number;
  longitude: number;
};

export type FootprintMarker = {
  id: string;
  routeId: string;
  routeTitle: string;
  stopId: string;
  stopName: string;
  visitedAt: string;
  photoCount: number;
  photoPreviewUri?: string;
  photos: FootprintRoutePhoto[];
  coordinate: FootprintCoordinate;
};

export type FootprintRoutePhoto = {
  id: string;
  routeId: string;
  stopId?: string;
  uri: string;
  addedAt?: string;
};

export type FootprintPolyline = {
  id: string;
  routeId: string;
  routeTitle: string;
  points: FootprintCoordinate[];
};

export type FootprintMapModel = {
  markers: FootprintMarker[];
  polylines: FootprintPolyline[];
  center: FootprintCoordinate;
  initialCamera: {
    target: FootprintCoordinate;
    zoom: number;
  };
  visitedRouteCount: number;
  photoCount: number;
};

const SHAANXI_CENTER: FootprintCoordinate = {
  latitude: 35.191653,
  longitude: 108.870143
};

type FootprintMapOptions = {
  photoCountByRoute?: Record<string, number>;
  routePhotos?: FootprintRoutePhoto[];
};

export function buildFootprintMapModel(
  routes: RouteTemplate[],
  states: UserRouteStateMap,
  optionsOrPhotoCounts: Record<string, number> | FootprintMapOptions = {}
): FootprintMapModel {
  const options = normalizeOptions(optionsOrPhotoCounts);
  const routePhotos = options.routePhotos ?? [];
  const routePhotoCounts = routePhotos.reduce<Record<string, number>>((counts, photo) => {
    counts[photo.routeId] = (counts[photo.routeId] ?? 0) + 1;
    return counts;
  }, {});
  const visitedRoutes = routes.filter((route) => states[route.id]?.visitedAt);
  const markers = visitedRoutes.flatMap((route) => {
    const state = states[route.id];
    const visitedAt = state?.visitedAt;
    if (!visitedAt) {
      return [];
    }

    return route.stops.flatMap((stop) => {
      if (!isFootprintStop(stop) || !isFiniteCoordinate(stop)) {
        return [];
      }

      const photos = [
        ...(state.photos ?? [])
          .filter((photo) => photo.stopId === stop.id)
          .map((photo) => ({
            id: photo.id,
            routeId: route.id,
            stopId: photo.stopId,
            uri: photo.uri,
            addedAt: photo.addedAt
          })),
        ...routePhotos.filter((photo) => photo.routeId === route.id && photo.stopId === stop.id)
      ];

      return [
        {
          id: `${route.id}-${stop.id}`,
          routeId: route.id,
          routeTitle: route.title,
          stopId: stop.id,
          stopName: stop.name,
          visitedAt,
          photoCount: photos.length,
          photoPreviewUri: photos[0]?.uri,
          photos,
          coordinate: {
            latitude: stop.latitude,
            longitude: stop.longitude
          }
        }
      ];
    });
  });

  const polylines: FootprintPolyline[] = [];
  const center = markers.length ? averageCoordinate(markers.map((marker) => marker.coordinate)) : SHAANXI_CENTER;

  return {
    markers,
    polylines,
    center,
    initialCamera: {
      target: center,
      zoom: 7
    },
    visitedRouteCount: visitedRoutes.length,
    photoCount: visitedRoutes.reduce(
      (sum, route) =>
        sum +
        (states[route.id]?.photos?.length ?? 0) +
        (routePhotoCounts[route.id] ?? options.photoCountByRoute?.[route.id] ?? 0),
      0
    )
  };
}

function normalizeOptions(
  optionsOrPhotoCounts: Record<string, number> | FootprintMapOptions
): FootprintMapOptions {
  if ("routePhotos" in optionsOrPhotoCounts || "photoCountByRoute" in optionsOrPhotoCounts) {
    return optionsOrPhotoCounts as FootprintMapOptions;
  }

  return {
    photoCountByRoute: optionsOrPhotoCounts as Record<string, number>
  };
}

function isFootprintStop(stop: { role?: string }) {
  return stop.role !== "origin" && stop.role !== "return";
}

function isFiniteCoordinate(stop: { latitude?: number; longitude?: number }): stop is {
  latitude: number;
  longitude: number;
} {
  return Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude);
}

function averageCoordinate(coordinates: FootprintCoordinate[]): FootprintCoordinate {
  const total = coordinates.reduce(
    (sum, coordinate) => ({
      latitude: sum.latitude + coordinate.latitude,
      longitude: sum.longitude + coordinate.longitude
    }),
    { latitude: 0, longitude: 0 }
  );

  return {
    latitude: total.latitude / coordinates.length,
    longitude: total.longitude / coordinates.length
  };
}
