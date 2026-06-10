import { describe, expect, it } from "vitest";
import {
  type RouteTemplate,
  mergeRouteTemplates,
  summarizeRouteStops
} from "./routes";

const baseRoute: RouteTemplate = {
  id: "xian-qinling-taiping-one-day",
  libraryVersion: 1,
  title: "秦岭避暑轻徒步一日线",
  originKey: "xian",
  durationType: "one_day",
  distanceBand: "medium",
  tags: ["自然", "避暑"],
  seasonTags: ["夏季", "秋季"],
  recommendedStartTime: "08:00",
  estimatedDrivingMinutes: 210,
  summary: "从西安出发，去秦岭浅山区避暑。",
  highlights: ["溪流", "森林"],
  reminders: ["雨天谨慎"],
  avoidConditions: ["heavy_rain"],
  status: "active",
  updatedAt: "2026-06-01",
  stops: [
    {
      id: "origin",
      routeId: "xian-qinling-taiping-one-day",
      order: 0,
      name: "西安城区",
      role: "origin"
    },
    {
      id: "main",
      routeId: "xian-qinling-taiping-one-day",
      order: 1,
      name: "太平国家森林公园",
      role: "destination"
    },
    {
      id: "return",
      routeId: "xian-qinling-taiping-one-day",
      order: 2,
      name: "返回西安",
      role: "return"
    }
  ]
};

describe("mergeRouteTemplates", () => {
  it("adds new remote routes after existing local routes", () => {
    const newRoute = {
      ...baseRoute,
      id: "xian-lintong-half-day",
      title: "临潼人文半日线"
    };

    const merged = mergeRouteTemplates([baseRoute], [newRoute]);

    expect(merged.map((route) => route.id)).toEqual([
      "xian-qinling-taiping-one-day",
      "xian-lintong-half-day"
    ]);
  });

  it("updates an existing route when the remote version is newer", () => {
    const updatedRoute = {
      ...baseRoute,
      libraryVersion: 2,
      title: "秦岭避暑轻徒步一日线新版",
      reminders: ["雨天谨慎", "节假日停车紧张"]
    };

    const merged = mergeRouteTemplates([baseRoute], [updatedRoute]);

    expect(merged).toHaveLength(1);
    expect(merged[0].libraryVersion).toBe(2);
    expect(merged[0].title).toBe("秦岭避暑轻徒步一日线新版");
    expect(merged[0].reminders).toContain("节假日停车紧张");
  });

  it("keeps the local route when the remote version is older", () => {
    const localRoute = { ...baseRoute, libraryVersion: 3 };
    const olderRemoteRoute = {
      ...baseRoute,
      libraryVersion: 2,
      title: "旧标题"
    };

    const merged = mergeRouteTemplates([localRoute], [olderRemoteRoute]);

    expect(merged[0].libraryVersion).toBe(3);
    expect(merged[0].title).toBe(baseRoute.title);
  });
});

describe("summarizeRouteStops", () => {
  it("uses ordered stop names as a compact route path", () => {
    expect(summarizeRouteStops(baseRoute)).toBe(
      "西安城区 -> 太平国家森林公园 -> 返回西安"
    );
  });
});
