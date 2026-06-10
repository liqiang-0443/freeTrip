import {
  buildAmapPoiSearchUrl,
  buildRouteFromDiscoveredPoi,
  parseAmapPoiSearchResponse
} from "./amapPoiSearch";

describe("buildAmapPoiSearchUrl", () => {
  it("builds a Xi'an keyword search request", () => {
    const url = buildAmapPoiSearchUrl({
      key: "web-key",
      keyword: "森林公园",
      city: "610100"
    });

    expect(url.origin).toBe("https://restapi.amap.com");
    expect(url.pathname).toBe("/v3/place/text");
    expect(url.searchParams.get("key")).toBe("web-key");
    expect(url.searchParams.get("keywords")).toBe("森林公园");
    expect(url.searchParams.get("city")).toBe("610100");
    expect(url.searchParams.get("citylimit")).toBe("true");
    expect(url.searchParams.get("offset")).toBe("10");
    expect(url.searchParams.get("page")).toBe("1");
    expect(url.searchParams.get("extensions")).toBe("base");
    expect(url.searchParams.get("output")).toBe("JSON");
  });
});

describe("parseAmapPoiSearchResponse", () => {
  it("keeps POIs with coordinates and distance-friendly fields", () => {
    const pois = parseAmapPoiSearchResponse({
      status: "1",
      info: "OK",
      count: "2",
      pois: [
        {
          id: "poi-1",
          name: "太平国家森林公园",
          type: "风景名胜;风景名胜相关;旅游景点",
          address: "西安市鄠邑区",
          location: "108.616211,33.956448",
          pname: "陕西省",
          cityname: "西安市",
          adname: "鄠邑区"
        },
        {
          id: "poi-2",
          name: "缺坐标",
          type: "风景名胜",
          address: [],
          location: []
        }
      ]
    });

    expect(pois).toEqual([
      {
        id: "poi-1",
        name: "太平国家森林公园",
        type: "风景名胜;风景名胜相关;旅游景点",
        address: "西安市鄠邑区",
        province: "陕西省",
        city: "西安市",
        district: "鄠邑区",
        longitude: 108.616211,
        latitude: 33.956448
      }
    ]);
  });

  it("throws a readable error for AMap failures", () => {
    expect(() =>
      parseAmapPoiSearchResponse({
        status: "0",
        info: "INVALID_USER_KEY",
        infocode: "10001"
      })
    ).toThrow("AMap POI search failed: INVALID_USER_KEY");
  });
});

describe("buildRouteFromDiscoveredPoi", () => {
  it("creates a temporary out-and-back route from Xi'an to the discovered POI", () => {
    const route = buildRouteFromDiscoveredPoi({
      id: "poi-1",
      name: "太平国家森林公园",
      type: "风景名胜",
      address: "西安市鄠邑区",
      province: "陕西省",
      city: "西安市",
      district: "鄠邑区",
      longitude: 108.616211,
      latitude: 33.956448
    });

    expect(route.id).toBe("discovered-poi-1");
    expect(route.title).toBe("太平国家森林公园自驾发现线");
    expect(route.tags).toContain("网上发现");
    expect(route.stops.map((stop) => stop.name)).toEqual([
      "西安城区",
      "太平国家森林公园",
      "返回西安"
    ]);
    expect(route.stops[1]).toMatchObject({
      role: "destination",
      amapPoiId: "poi-1",
      longitude: 108.616211,
      latitude: 33.956448
    });
  });
});
