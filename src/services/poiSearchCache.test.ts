import type { DiscoveredPoi } from "./amapPoiSearch";
import { createPoiSearchCache } from "./poiSearchCache";

const pois: DiscoveredPoi[] = [
  {
    id: "poi-1",
    name: "太平国家森林公园",
    longitude: 108.616211,
    latitude: 33.956448
  }
];

describe("createPoiSearchCache", () => {
  it("normalizes keywords and expires entries", () => {
    let now = 1_000;
    const cache = createPoiSearchCache({ ttlMs: 10_000, now: () => now });

    cache.set(" 森林公园 ", pois);

    expect(cache.get("森林公园")).toEqual(pois);
    expect(cache.get("  森林公园")).toEqual(pois);

    now = 11_001;
    expect(cache.get("森林公园")).toBeUndefined();
  });
});
