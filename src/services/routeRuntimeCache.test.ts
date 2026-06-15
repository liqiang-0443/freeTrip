import { createRouteRuntimeCache } from "./routeRuntimeCache";

const info = {
  distanceMeters: 12000,
  durationSeconds: 1800,
  strategy: "速度优先"
};

describe("createRouteRuntimeCache", () => {
  it("returns cached runtime info until the entry expires", () => {
    let now = 1_000;
    const cache = createRouteRuntimeCache({ ttlMs: 10_000, now: () => now });

    cache.set("route-a", info);

    expect(cache.get("route-a")).toEqual(info);

    now = 10_999;
    expect(cache.get("route-a")).toEqual(info);

    now = 11_001;
    expect(cache.get("route-a")).toBeUndefined();
  });
});
