import { describe, expect, it } from "vitest";
import type { RouteTemplate } from "./routes";
import { rankRoutes } from "./recommendations";

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
    seasonTags: ["春季", "夏季"],
    recommendedStartTime: "08:00",
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

describe("rankRoutes", () => {
  it("prioritizes matching duration and selected tags", () => {
    const ranked = rankRoutes(
      [
        route("weekend-history", "weekend", ["人文"], 420),
        route("one-day-nature", "one_day", ["自然", "避暑"], 210),
        route("half-day-food", "half_day", ["美食"], 90)
      ],
      {
        durationType: "one_day",
        selectedTags: ["自然"],
        userStates: {}
      }
    );

    expect(ranked[0].route.id).toBe("one-day-nature");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("filters out not-interested routes", () => {
    const ranked = rankRoutes(
      [
        route("one-day-nature", "one_day", ["自然"], 210),
        route("one-day-history", "one_day", ["人文"], 180)
      ],
      {
        durationType: "one_day",
        selectedTags: [],
        userStates: {
          "one-day-nature": { routeId: "one-day-nature", notInterested: true }
        }
      }
    );

    expect(ranked.map((item) => item.route.id)).toEqual(["one-day-history"]);
  });

  it("lowers visited routes below fresh matching routes", () => {
    const ranked = rankRoutes(
      [
        route("visited-nature", "one_day", ["自然"], 200),
        route("fresh-nature", "one_day", ["自然"], 220)
      ],
      {
        durationType: "one_day",
        selectedTags: ["自然"],
        userStates: {
          "visited-nature": { routeId: "visited-nature", visitedAt: "2026-06-02" }
        }
      }
    );

    expect(ranked[0].route.id).toBe("fresh-nature");
    expect(ranked[1].route.id).toBe("visited-nature");
  });

  it("gives collected and planned routes a small boost", () => {
    const ranked = rankRoutes(
      [
        route("plain", "one_day", ["自然"], 200),
        route("planned", "one_day", ["自然"], 200)
      ],
      {
        durationType: "one_day",
        selectedTags: ["自然"],
        userStates: {
          planned: {
            routeId: "planned",
            collected: true,
            plannedDate: "2026-06-13"
          }
        }
      }
    );

    expect(ranked[0].route.id).toBe("planned");
  });
});
