import type { RankedRoute, RouteUserStateSummary } from "./recommendations";
import type { DurationType, RouteTemplate } from "./routes";
import { buildRouteFromDiscoveredPoi, type DiscoveredPoi } from "@/services/amapPoiSearch";

export type ScenarioId = "easy_nearby" | "mountain_air" | "food_photo" | "weekend_far";

export type TravelScenario = {
  id: ScenarioId;
  title: string;
  subtitle: string;
  durationType: DurationType;
  tags: string[];
  poiKeywords: string[];
  maxDrivingMinutes?: number;
};

export const travelScenarios: TravelScenario[] = [
  {
    id: "easy_nearby",
    title: "就近放风",
    subtitle: "别太累，今天能出门就很好",
    durationType: "half_day",
    tags: ["近郊", "亲子", "拍照"],
    poiKeywords: ["公园", "观景台", "古镇"],
    maxDrivingMinutes: 150
  },
  {
    id: "mountain_air",
    title: "山里透气",
    subtitle: "想看山、溪流、树荫和凉快空气",
    durationType: "one_day",
    tags: ["自然", "避暑", "轻徒步", "山水"],
    poiKeywords: ["森林公园", "风景区", "观景台"],
    maxDrivingMinutes: 330
  },
  {
    id: "food_photo",
    title: "吃点好的",
    subtitle: "目的地轻松，吃饭拍照都要有",
    durationType: "half_day",
    tags: ["美食", "古镇", "拍照", "近郊"],
    poiKeywords: ["农家乐", "古镇", "特色美食"],
    maxDrivingMinutes: 180
  },
  {
    id: "weekend_far",
    title: "周末走远点",
    subtitle: "两天时间，换个城市或山水节奏",
    durationType: "weekend",
    tags: ["周末", "山水", "历史", "古都"],
    poiKeywords: ["风景区", "博物馆", "古城"],
    maxDrivingMinutes: 720
  }
];

export function getScenarioById(id: ScenarioId): TravelScenario {
  return travelScenarios.find((scenario) => scenario.id === id) ?? travelScenarios[0];
}

export function rankScenarioRoutes(
  routes: RouteTemplate[],
  scenario: TravelScenario,
  userStates: Record<string, RouteUserStateSummary | undefined>
): RankedRoute[] {
  return routes
    .filter((route) => route.status === "active")
    .filter((route) => !userStates[route.id]?.notInterested)
    .map((route) => scoreScenarioRoute(route, scenario, userStates[route.id]))
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return (left.route.estimatedDrivingMinutes ?? 0) - (right.route.estimatedDrivingMinutes ?? 0);
    });
}

export function buildScenarioPoiRoutes(
  pois: DiscoveredPoi[],
  scenario: TravelScenario
): RankedRoute[] {
  return pois.slice(0, 4).map((poi, index) => {
    const route = {
      ...buildRouteFromDiscoveredPoi(poi),
      durationType: scenario.durationType,
      tags: ["高德发现", ...scenario.tags.slice(0, 3), poi.district ?? "西安周边"],
      summary: `${poi.address ?? poi.district ?? "西安周边"}，适合「${scenario.title}」时临时成线，出发前可先看路线预览。`
    } satisfies RouteTemplate;

    return {
      route,
      score: 92 - index * 6,
      reasons: [`${scenario.title}的高德发现地点`, poi.type ?? "来自高德 POI"]
    };
  });
}

export function pickLuckyRoute(routes: RankedRoute[], index: number): RankedRoute {
  if (routes.length === 0) {
    throw new Error("No routes available for lucky pick");
  }

  return routes[index % Math.min(routes.length, 2)];
}

function scoreScenarioRoute(
  route: RouteTemplate,
  scenario: TravelScenario,
  state: RouteUserStateSummary | undefined
): RankedRoute {
  const reasons: string[] = [];
  let score = 0;

  if (route.durationType === scenario.durationType) {
    score += 50;
  }

  const matchedTags = scenario.tags.filter((tag) => route.tags.includes(tag));
  if (matchedTags.length > 0) {
    score += matchedTags.length * 20;
    reasons.push(`匹配${matchedTags.slice(0, 2).join("、")}`);
  }

  const drivingMinutes = route.estimatedDrivingMinutes ?? 0;
  if (scenario.maxDrivingMinutes && drivingMinutes <= scenario.maxDrivingMinutes) {
    score += 12;
  }

  if (state?.visitedAt) {
    score -= 35;
    reasons.push("去过，降低优先级");
  }

  if (state?.collected) {
    score += 8;
    reasons.push("已收藏");
  }

  return {
    route,
    score,
    reasons: score > 0 ? [`适合${scenario.title}`, ...reasons] : ["精选路线"]
  };
}
