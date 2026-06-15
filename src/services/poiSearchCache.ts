import type { DiscoveredPoi } from "./amapPoiSearch";

type PoiSearchCacheOptions = {
  ttlMs: number;
  now?: () => number;
};

type CacheEntry = {
  value: DiscoveredPoi[];
  expiresAt: number;
};

export type PoiSearchCache = ReturnType<typeof createPoiSearchCache>;

export function createPoiSearchCache({ ttlMs, now = Date.now }: PoiSearchCacheOptions) {
  const entries = new Map<string, CacheEntry>();

  return {
    get(keyword: string): DiscoveredPoi[] | undefined {
      const entry = entries.get(normalizeKeyword(keyword));
      if (!entry) {
        return undefined;
      }

      if (entry.expiresAt < now()) {
        entries.delete(normalizeKeyword(keyword));
        return undefined;
      }

      return entry.value;
    },
    set(keyword: string, value: DiscoveredPoi[]) {
      entries.set(normalizeKeyword(keyword), {
        value,
        expiresAt: now() + ttlMs
      });
    }
  };
}

function normalizeKeyword(keyword: string) {
  return keyword.trim();
}
