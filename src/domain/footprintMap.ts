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
  coordinate: FootprintCoordinate;
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

const XIAN_CENTER: FootprintCoordinate = {
  latitude: 34.341575,
  longitude: 108.93977
};

export function buildFootprintMapModel(
  routes: RouteTemplate[],
  states: UserRouteStateMap,
  photoCountByRoute: Record<string, number> = {}
): FootprintMapModel {
  const visitedRoutes = routes.filter((route) => states[route.id]?.visitedAt);
  const markers = visitedRoutes.flatMap((route) => {
    const state = states[route.id];
    const visitedAt = state?.visitedAt;
    if (!visitedAt) {
      return [];
    }

    return route.stops.flatMap((stop) => {
      if (!isFiniteCoordinate(stop)) {
        return [];
      }

      return [
        {
          id: `${route.id}-${stop.id}`,
          routeId: route.id,
          routeTitle: route.title,
          stopId: stop.id,
          stopName: stop.name,
          visitedAt,
          photoCount: (state.photos ?? []).filter((photo) => photo.stopId === stop.id).length,
          coordinate: {
            latitude: stop.latitude,
            longitude: stop.longitude
          }
        }
      ];
    });
  });

  const polylines = visitedRoutes.flatMap((route) => {
    const points = [...route.stops]
      .sort((left, right) => left.order - right.order)
      .flatMap((stop) =>
        isFiniteCoordinate(stop)
          ? [
              {
                latitude: stop.latitude,
                longitude: stop.longitude
              }
            ]
          : []
      );

    if (points.length < 2) {
      return [];
    }

    return [
      {
        id: route.id,
        routeId: route.id,
        routeTitle: route.title,
        points
      }
    ];
  });

  const center = markers.length ? averageCoordinate(markers.map((marker) => marker.coordinate)) : XIAN_CENTER;

  return {
    markers,
    polylines,
    center,
    initialCamera: {
      target: center,
      zoom: markers.length ? 8 : 9
    },
    visitedRouteCount: visitedRoutes.length,
    photoCount: visitedRoutes.reduce(
      (sum, route) =>
        sum + (states[route.id]?.photos?.length ?? 0) + (photoCountByRoute[route.id] ?? 0),
      0
    )
  };
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
