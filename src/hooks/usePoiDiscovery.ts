import { useCallback, useState } from "react";
import { fetchAmapPois, type DiscoveredPoi } from "@/services/amapPoiSearch";
import { createPoiSearchCache } from "@/services/poiSearchCache";

type PoiDiscoveryState = {
  status: "disabled" | "idle" | "loading" | "ready" | "error";
  keyword: string;
  pois: DiscoveredPoi[];
  error?: string;
  search: (nextKeyword: string) => Promise<void>;
};

const poiSearchCache = createPoiSearchCache({ ttlMs: 10 * 60 * 1000 });

export function usePoiDiscovery(initialKeyword = "森林公园"): PoiDiscoveryState {
  const key = process.env.EXPO_PUBLIC_AMAP_WEB_KEY?.trim();
  const [keyword, setKeyword] = useState(initialKeyword);
  const [status, setStatus] = useState<PoiDiscoveryState["status"]>(key ? "idle" : "disabled");
  const [pois, setPois] = useState<DiscoveredPoi[]>([]);
  const [error, setError] = useState<string | undefined>();

  const search = useCallback(
    async (nextKeyword: string) => {
      const normalizedKeyword = nextKeyword.trim();
      setKeyword(normalizedKeyword);

      if (!key || !normalizedKeyword) {
        setPois([]);
        setStatus(key ? "idle" : "disabled");
        return;
      }

      const cached = poiSearchCache.get(normalizedKeyword);
      if (cached) {
        setPois(cached);
        setStatus("ready");
        setError(undefined);
        return;
      }

      setStatus("loading");
      setError(undefined);

      try {
        const nextPois = await fetchAmapPois(key, normalizedKeyword);
        poiSearchCache.set(normalizedKeyword, nextPois);
        setPois(nextPois);
        setStatus("ready");
      } catch (caught) {
        setPois([]);
        setStatus("error");
        setError(caught instanceof Error ? caught.message : "Unknown AMap POI search error");
      }
    },
    [key]
  );

  return { status, keyword, pois, error, search };
}
