import type { RouteTemplate } from "@/domain/routes";
import type { AmapDrivingRouteInfo } from "./amapRoutes";
import { createRouteRuntimeCache } from "./routeRuntimeCache";
import { resolveRouteRuntimeInfo } from "./routeRuntimeResolver";

function makeRoute(id: string): RouteTemplate {
  return {
    id,
    libraryVersion: 1,
    title: id,
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
      {
        id: `${id}-origin`,
        routeId: id,
        order: 1,
        name: "Xi'an",
        role: "origin",
        longitude: 108.93977,
        latitude: 34.341575
      },
      {
        id: `${id}-destination`,
        routeId: id,
        order: 2,
        name: "Destination",
        role: "destination",
        longitude: 109,
        latitude: 34
      }
    ]
  };
}

describe("resolveRouteRuntimeInfo", () => {
  it("uses cached route info and only fetches missing routes", async () => {
    const cached: AmapDrivingRouteInfo = {
      distanceMeters: 1000,
      durationSeconds: 600
    };
    const fetched: AmapDrivingRouteInfo = {
      distanceMeters: 2000,
      durationSeconds: 1200
    };
    const cache = createRouteRuntimeCache({ ttlMs: 60_000, now: () => 1_000 });
    cache.set("cached", cached);
    const fetcher = vi.fn(async () => fetched);

    const result = await resolveRouteRuntimeInfo({
      key: "web-key",
      routes: [makeRoute("cached"), makeRoute("missing")],
      cache,
      fetcher
    });

    expect(result.infoByRouteId).toEqual({
      cached,
      missing: fetched
    });
    expect(result.errorByRouteId).toEqual({});
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher).toHaveBeenCalledWith("web-key", expect.objectContaining({ id: "missing" }));
    expect(cache.get("missing")).toEqual(fetched);
  });
});
