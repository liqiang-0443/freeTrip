import { describe, expect, it } from "vitest";
import type { RouteTemplate } from "./routes";
import {
  buildScenarioPoiRoutes,
  getScenarioById,
  pickLuckyRoute,
  rankScenarioRoutes
} from "./scenarioRecommendations";
import type { DiscoveredPoi } from "@/services/amapPoiSearch";

function route(
  id: string,
  durationType: RouteTemplate["durationType"],
  tags: string[],
  estimatedDrivingMinutes: number
): RouteTemplate {
  return {
    id,
    libraryVersion: 1,
    title: id,
    originKey: "xian",
    durationType,
    distanceBand: estimatedDrivingMinutes < 150 ? "near" : "medium",
    tags,
    seasonTags: [],
    recommendedStartTime: "09:00",
    estimatedDrivingMinutes,
    summary: id,
    highlights: [],
    reminders: [],
    avoidConditions: [],
    status: "active",
    updatedAt: "2026-06-01",
    stops: []
  };
}

const pois: DiscoveredPoi[] = [
  {
    id: "poi-1",
    name: "秦岭观景台",
    type: "风景名胜",
    address: "西安市长安区",
    district: "长安区",
    longitude: 108.8,
    latitude: 34.0
  },
  {
    id: "poi-2",
    name: "山脚农家乐",
    type: "餐饮服务",
    address: "西安市鄠邑区",
    district: "鄠邑区",
    longitude: 108.7,
    latitude: 34.1
  }
];

describe("scenarioRecommendations", () => {
  it("ranks built-in routes by selected scenario intent", () => {
    const scenario = getScenarioById("mountain_air");
    const ranked = rankScenarioRoutes(
      [
        route("food", "half_day", ["美食"], 80),
        route("nature", "half_day", ["自然", "避暑"], 100)
      ],
      scenario,
      {}
    );

    expect(ranked[0].route.id).toBe("nature");
    expect(ranked[0].reasons[0]).toContain("山里透气");
  });

  it("builds temporary POI routes from discovered places", () => {
    const scenario = getScenarioById("easy_nearby");
    const routes = buildScenarioPoiRoutes(pois, scenario);

    expect(routes).toHaveLength(2);
    expect(routes[0].route.id).toBe("discovered-poi-1");
    expect(routes[0].route.title).toContain("秦岭观景台");
    expect(routes[0].reasons[0]).toContain("就近放风");
  });

  it("picks a deterministic lucky route from scenario results", () => {
    const scenario = getScenarioById("food_photo");
    const ranked = rankScenarioRoutes(
      [
        route("a", "half_day", ["美食"], 80),
        route("b", "half_day", ["拍照"], 90),
        route("c", "weekend", ["历史"], 400)
      ],
      scenario,
      {}
    );

    expect(pickLuckyRoute(ranked, 0).route.id).toBe("a");
    expect(pickLuckyRoute(ranked, 1).route.id).toBe("b");
    expect(pickLuckyRoute(ranked, 2).route.id).toBe("a");
  });
});
