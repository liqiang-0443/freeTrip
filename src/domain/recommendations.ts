import type { DurationType, RouteTemplate } from "./routes";

export type RouteUserStateSummary = {
  routeId: string;
  collected?: boolean;
  plannedDate?: string;
  visitedAt?: string;
  notInterested?: boolean;
};

export type RecommendationInput = {
  durationType: DurationType;
  selectedTags: string[];
  userStates: Record<string, RouteUserStateSummary | undefined>;
};

export type RankedRoute = {
  route: RouteTemplate;
  score: number;
  reasons: string[];
};

export function rankRoutes(
  routes: RouteTemplate[],
  input: RecommendationInput
): RankedRoute[] {
  return routes
    .filter((route) => route.status === "active")
    .filter((route) => !input.userStates[route.id]?.notInterested)
    .map((route) => scoreRoute(route, input))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      return (
        (left.route.estimatedDrivingMinutes ?? 0) -
        (right.route.estimatedDrivingMinutes ?? 0)
      );
    });
}

function scoreRoute(route: RouteTemplate, input: RecommendationInput): RankedRoute {
  const state = input.userStates[route.id];
  const reasons: string[] = [];
  let score = 0;

  if (route.durationType === input.durationType) {
    score += 60;
    reasons.push("匹配当前可用时间");
  }

  const matchedTags = input.selectedTags.filter((tag) => route.tags.includes(tag));
  if (matchedTags.length > 0) {
    score += matchedTags.length * 18;
    reasons.push(`匹配偏好：${matchedTags.join("、")}`);
  }

  if (state?.collected) {
    score += 5;
    reasons.push("已收藏");
  }

  if (state?.plannedDate) {
    score += 8;
    reasons.push(`已计划：${state.plannedDate}`);
  }

  if (state?.visitedAt) {
    score -= 35;
    reasons.push("最近已去过");
  }

  const drivingMinutes = route.estimatedDrivingMinutes ?? 0;
  if (input.durationType === "half_day" && drivingMinutes <= 120) {
    score += 10;
    reasons.push("车程适合半日");
  }

  if (input.durationType === "weekend" && drivingMinutes >= 240) {
    score += 10;
    reasons.push("适合周末展开");
  }

  return { route, score, reasons };
}
