import type { RouteTemplate } from "./routes";
import type { UserRouteStateMap } from "./userRouteState";
import { buildFootprintSummary, groupRoutePhotosByStop } from "./travelJournal";

const route: RouteTemplate = {
  id: "route-a",
  libraryVersion: 1,
  title: "Route A",
  originKey: "xian",
  durationType: "one_day",
  distanceBand: "medium",
  tags: [],
  seasonTags: [],
  estimatedDrivingMinutes: 120,
  summary: "",
  highlights: [],
  reminders: [],
  avoidConditions: [],
  status: "active",
  updatedAt: "2026-06-10",
  stops: [
    { id: "origin", routeId: "route-a", order: 1, name: "Xi'an", role: "origin" },
    { id: "main", routeId: "route-a", order: 2, name: "Mountain Park", role: "destination" },
    { id: "food", routeId: "route-a", order: 3, name: "Lunch", role: "food" }
  ]
};

const states: UserRouteStateMap = {
  "route-a": {
    routeId: "route-a",
    visitedAt: "2026-06-10",
    photos: [
      {
        id: "photo-1",
        uri: "file:///main.jpg",
        addedAt: "2026-06-10T10:00:00.000Z",
        stopId: "main"
      },
      {
        id: "photo-2",
        uri: "file:///old.jpg",
        addedAt: "2026-06-10T11:00:00.000Z"
      }
    ]
  }
};

describe("groupRoutePhotosByStop", () => {
  it("groups photos by stop and keeps old photos unassigned", () => {
    expect(groupRoutePhotosByStop(route, states["route-a"])).toEqual([
      {
        stop: route.stops[0],
        photos: []
      },
      {
        stop: route.stops[1],
        photos: [states["route-a"].photos?.[0]]
      },
      {
        stop: route.stops[2],
        photos: []
      },
      {
        stop: undefined,
        photos: [states["route-a"].photos?.[1]]
      }
    ]);
  });
});

describe("buildFootprintSummary", () => {
  it("counts visited routes, photos, and visited stops", () => {
    expect(buildFootprintSummary([route], states)).toEqual({
      visitedRouteCount: 1,
      photoCount: 2,
      visitedStopCount: 3,
      unassignedPhotoCount: 1
    });
  });
});
