import type { RouteTemplate } from "./routes";
import { buildRouteDiagramStops } from "./routeDiagram";

const route: RouteTemplate = {
  id: "sample",
  libraryVersion: 1,
  title: "Sample Route",
  originKey: "xian",
  durationType: "one_day",
  distanceBand: "medium",
  tags: [],
  seasonTags: [],
  estimatedDrivingMinutes: 240,
  summary: "",
  highlights: [],
  reminders: [],
  avoidConditions: [],
  status: "active",
  updatedAt: "2026-06-10",
  stops: [
    {
      id: "return",
      routeId: "sample",
      order: 4,
      name: "Back to Xi'an",
      role: "return"
    },
    {
      id: "origin",
      routeId: "sample",
      order: 1,
      name: "Xi'an",
      role: "origin",
      longitude: 108.93977,
      latitude: 34.341575
    },
    {
      id: "food",
      routeId: "sample",
      order: 3,
      name: "Lunch",
      role: "food",
      suggestedStayMinutes: 60
    },
    {
      id: "destination",
      routeId: "sample",
      order: 2,
      name: "Mountain Park",
      role: "destination",
      longitude: 109.01874,
      latitude: 34.04604,
      suggestedArrivalTime: "10:00",
      suggestedStayMinutes: 180
    }
  ]
};

describe("buildRouteDiagramStops", () => {
  it("sorts stops and adds compact display metadata", () => {
    expect(buildRouteDiagramStops(route)).toEqual([
      {
        id: "origin",
        name: "Xi'an",
        role: "origin",
        roleLabel: "出发",
        orderLabel: "1",
        detail: "可导航"
      },
      {
        id: "destination",
        name: "Mountain Park",
        role: "destination",
        roleLabel: "主目的地",
        orderLabel: "2",
        detail: "10:00 · 停留 3h · 可导航"
      },
      {
        id: "food",
        name: "Lunch",
        role: "food",
        roleLabel: "餐饮",
        orderLabel: "3",
        detail: "停留 1h"
      },
      {
        id: "return",
        name: "Back to Xi'an",
        role: "return",
        roleLabel: "返回",
        orderLabel: "4",
        detail: undefined
      }
    ]);
  });
});
