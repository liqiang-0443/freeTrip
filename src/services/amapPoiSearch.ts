import type { RouteTemplate } from "@/domain/routes";

export type DiscoveredPoi = {
  id: string;
  name: string;
  type?: string;
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  longitude: number;
  latitude: number;
};

type BuildPoiSearchUrlInput = {
  key: string;
  keyword: string;
  city?: string;
  offset?: number;
  page?: number;
};

type AmapPoiSearchResponse = {
  status?: string;
  info?: string;
  infocode?: string;
  count?: string;
  pois?: Array<{
    id?: string;
    name?: string;
    type?: string;
    address?: string | unknown[];
    location?: string | unknown[];
    pname?: string;
    cityname?: string;
    adname?: string;
  }>;
};

export function buildAmapPoiSearchUrl({
  key,
  keyword,
  city = "610100",
  offset = 10,
  page = 1
}: BuildPoiSearchUrlInput): URL {
  const url = new URL("https://restapi.amap.com/v3/place/text");
  url.searchParams.set("key", key);
  url.searchParams.set("keywords", keyword);
  url.searchParams.set("city", city);
  url.searchParams.set("citylimit", "true");
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("page", String(page));
  url.searchParams.set("extensions", "base");
  url.searchParams.set("output", "JSON");
  return url;
}

export async function fetchAmapPois(
  key: string,
  keyword: string,
  fetcher: typeof fetch = fetch
): Promise<DiscoveredPoi[]> {
  const url = buildAmapPoiSearchUrl({ key, keyword });
  const response = await fetcher(url.toString());

  if (!response.ok) {
    throw new Error(`AMap POI search HTTP ${response.status}`);
  }

  return parseAmapPoiSearchResponse((await response.json()) as AmapPoiSearchResponse);
}

export function parseAmapPoiSearchResponse(response: AmapPoiSearchResponse): DiscoveredPoi[] {
  if (response.status !== "1") {
    throw new Error(`AMap POI search failed: ${response.info ?? "unknown error"}`);
  }

  return (response.pois ?? []).flatMap((poi) => {
    const coordinate = parseLocation(poi.location);
    if (!poi.id || !poi.name || !coordinate) {
      return [];
    }

    return [
      {
        id: poi.id,
        name: poi.name,
        type: poi.type,
        address: Array.isArray(poi.address) ? undefined : poi.address,
        province: poi.pname,
        city: poi.cityname,
        district: poi.adname,
        longitude: coordinate.longitude,
        latitude: coordinate.latitude
      }
    ];
  });
}

export function buildRouteFromDiscoveredPoi(poi: DiscoveredPoi): RouteTemplate {
  const routeId = `discovered-${poi.id}`;
  return {
    id: routeId,
    libraryVersion: 1,
    title: `${poi.name}自驾发现线`,
    originKey: "xian",
    durationType: "one_day",
    distanceBand: "medium",
    tags: ["网上发现", "周边", poi.district ?? "西安"],
    seasonTags: [],
    recommendedStartTime: "09:00",
    summary: `${poi.address ?? poi.district ?? "西安周边"}，来自高德 POI 搜索结果，可先查看实时车程再决定是否出发。`,
    highlights: [poi.type ?? "高德地点搜索结果", poi.address ?? "可打开高德导航确认详情"],
    reminders: ["网上发现路线未人工精选，出发前请确认开放时间、停车和天气。"],
    avoidConditions: [],
    stops: [
      {
        id: `${routeId}-origin`,
        routeId,
        order: 1,
        name: "西安城区",
        role: "origin",
        longitude: 108.93977,
        latitude: 34.341575
      },
      {
        id: `${routeId}-destination`,
        routeId,
        order: 2,
        name: poi.name,
        role: "destination",
        amapPoiId: poi.id,
        poiKeyword: poi.name,
        longitude: poi.longitude,
        latitude: poi.latitude,
        notes: poi.address
      },
      {
        id: `${routeId}-return`,
        routeId,
        order: 3,
        name: "返回西安",
        role: "return",
        longitude: 108.93977,
        latitude: 34.341575
      }
    ],
    status: "active",
    updatedAt: new Date().toISOString().slice(0, 10)
  };
}

function parseLocation(location: string | unknown[] | undefined) {
  if (typeof location !== "string") {
    return undefined;
  }

  const [longitude, latitude] = location.split(",").map(Number);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return undefined;
  }

  return { longitude, latitude };
}
