import { routeSeed } from "@/data/routes.seed";
import { buildFootprintMapModel } from "./footprintMap";
import type { UserRouteStateMap } from "./userRouteState";

describe("buildFootprintMapModel", () => {
  it("builds markers and route lines for visited routes with coordinates", () => {
    const route = routeSeed.find((item) => item.id === "xian-taiping-forest-one-day");
    expect(route).toBeDefined();

    const states: UserRouteStateMap = {
      "xian-taiping-forest-one-day": {
        routeId: "xian-taiping-forest-one-day",
        collected: true,
        visitedAt: "2026-06-01",
        photos: [
          {
            id: "photo-1",
            uri: "file://photo.jpg",
            addedAt: "2026-06-02T08:00:00.000Z",
            stopId: "main"
          }
        ]
      }
    };

    const model = buildFootprintMapModel(routeSeed, states);

    expect(model.visitedRouteCount).toBe(1);
    expect(model.photoCount).toBe(1);
    expect(model.markers.map((marker) => marker.stopName)).toContain("太平国家森林公园");
    expect(model.markers.find((marker) => marker.stopId === "main")).toMatchObject({
      routeId: "xian-taiping-forest-one-day",
      visitedAt: "2026-06-01",
      photoCount: 1,
      coordinate: {
        longitude: expect.any(Number),
        latitude: expect.any(Number)
      }
    });
    expect(model.polylines[0].points.length).toBeGreaterThanOrEqual(2);
    expect(model.initialCamera.target).toEqual(model.center);
  });

  it("falls back to Xi'an when no visited coordinate exists", () => {
    const model = buildFootprintMapModel(routeSeed, {});

    expect(model.markers).toEqual([]);
    expect(model.polylines).toEqual([]);
    expect(model.center).toEqual({ latitude: 34.341575, longitude: 108.93977 });
    expect(model.initialCamera.zoom).toBe(9);
  });

  it("includes browser-local photo counts in the footprint total", () => {
    const model = buildFootprintMapModel(
      routeSeed,
      {
        "xian-taiping-forest-one-day": {
          routeId: "xian-taiping-forest-one-day",
          visitedAt: "2026-06-01"
        }
      },
      {
        "xian-taiping-forest-one-day": 2
      }
    );

    expect(model.photoCount).toBe(2);
  });
});
