import { describe, expect, it } from "vitest";
import {
  addRoutePhoto,
  markNotInterested,
  markVisited,
  planRoute,
  toggleCollected
} from "./userRouteState";

describe("user route state transitions", () => {
  it("toggles collection without removing other state", () => {
    const planned = planRoute({}, "route-a", "2026-06-13");
    const collected = toggleCollected(planned, "route-a");

    expect(collected["route-a"]).toMatchObject({
      routeId: "route-a",
      collected: true,
      plannedDate: "2026-06-13"
    });

    const uncollected = toggleCollected(collected, "route-a");
    expect(uncollected["route-a"].collected).toBe(false);
    expect(uncollected["route-a"].plannedDate).toBe("2026-06-13");
  });

  it("marks a route as visited and clears not-interested", () => {
    const hidden = markNotInterested({}, "route-a");
    const visited = markVisited(hidden, "route-a", "2026-06-10");

    expect(visited["route-a"]).toMatchObject({
      routeId: "route-a",
      visitedAt: "2026-06-10",
      notInterested: false
    });
  });

  it("attaches photo metadata to the route state", () => {
    const withPhoto = addRoutePhoto({}, "route-a", {
      id: "photo-1",
      uri: "file:///photo.jpg",
      addedAt: "2026-06-10T10:00:00.000Z",
      stopId: "main"
    });

    expect(withPhoto["route-a"].photos).toEqual([
      {
        id: "photo-1",
        uri: "file:///photo.jpg",
        addedAt: "2026-06-10T10:00:00.000Z",
        stopId: "main"
      }
    ]);
  });
});
