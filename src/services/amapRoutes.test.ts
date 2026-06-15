import { describe, expect, it } from "vitest";
import {
  buildAmapDrivingUrl,
  buildAmapNavigationUrl,
  buildAmapNavigationUri,
  parseAmapDrivingResponse,
  selectRoutableStops
} from "./amapRoutes";
import type { RouteTemplate } from "@/domain/routes";

const route: RouteTemplate = {
  id: "xian-taiping-forest-one-day",
  libraryVersion: 1,
  title: "秦岭太平森林一日线",
  originKey: "xian",
  durationType: "one_day",
  distanceBand: "medium",
  tags: ["自然"],
  seasonTags: ["夏季"],
  recommendedStartTime: "08:00",
  estimatedDrivingMinutes: 220,
  summary: "test",
  highlights: [],
  reminders: [],
  avoidConditions: [],
  status: "active",
  updatedAt: "2026-06-10",
  stops: [
    {
      id: "origin",
      routeId: "xian-taiping-forest-one-day",
      order: 0,
      name: "西安城区",
      role: "origin",
      longitude: 108.940174,
      latitude: 34.341568
    },
    {
      id: "main",
      routeId: "xian-taiping-forest-one-day",
      order: 1,
      name: "太平国家森林公园",
      role: "destination",
      longitude: 108.552515,
      latitude: 34.003542
    },
    {
      id: "food",
      routeId: "xian-taiping-forest-one-day",
      order: 2,
      name: "环山路农家乐",
      role: "food",
      longitude: 108.629877,
      latitude: 34.049331
    },
    {
      id: "return",
      routeId: "xian-taiping-forest-one-day",
      order: 3,
      name: "返回西安",
      role: "return",
      longitude: 108.940174,
      latitude: 34.341568
    }
  ]
};

describe("selectRoutableStops", () => {
  it("returns ordered stops that have coordinates", () => {
    expect(selectRoutableStops(route).map((stop) => stop.id)).toEqual([
      "origin",
      "main",
      "food",
      "return"
    ]);
  });
});

describe("buildAmapDrivingUrl", () => {
  it("builds a driving route URL with origin, destination, and waypoints", () => {
    const url = buildAmapDrivingUrl({
      key: "test-key",
      stops: selectRoutableStops(route)
    });

    expect(url.origin).toBe("https://restapi.amap.com");
    expect(url.pathname).toBe("/v3/direction/driving");
    expect(url.searchParams.get("key")).toBe("test-key");
    expect(url.searchParams.get("origin")).toBe("108.940174,34.341568");
    expect(url.searchParams.get("destination")).toBe("108.940174,34.341568");
    expect(url.searchParams.get("waypoints")).toBe(
      "108.552515,34.003542;108.629877,34.049331"
    );
    expect(url.searchParams.get("extensions")).toBe("base");
    expect(url.searchParams.get("output")).toBe("JSON");
  });
});

describe("parseAmapDrivingResponse", () => {
  it("parses distance and duration from the first path", () => {
    const parsed = parseAmapDrivingResponse({
      status: "1",
      info: "OK",
      route: {
        paths: [
          {
            distance: "185432",
            duration: "12600",
            strategy: "速度优先"
          }
        ]
      }
    });

    expect(parsed).toEqual({
      distanceMeters: 185432,
      durationSeconds: 12600,
      strategy: "速度优先"
    });
  });

  it("throws a readable error when AMap returns failure status", () => {
    expect(() =>
      parseAmapDrivingResponse({
        status: "0",
        info: "INVALID_USER_KEY",
        infocode: "10001"
      })
    ).toThrow("AMap driving route failed: INVALID_USER_KEY");
  });
});

describe("buildAmapNavigationUri", () => {
  it("builds an AMap app URI to navigate to the destination", () => {
    const uri = buildAmapNavigationUri(route);

    expect(uri).toContain("androidamap://route/plan/");
    expect(uri).toContain("dlat=34.003542");
    expect(uri).toContain("dlon=108.552515");
    expect(uri).toContain("dname=%E5%A4%AA%E5%B9%B3%E5%9B%BD%E5%AE%B6%E6%A3%AE%E6%9E%97%E5%85%AC%E5%9B%AD");
  });
});

describe("buildAmapNavigationUrl", () => {
  it("builds a web URI that works from PWA browsers", () => {
    const url = buildAmapNavigationUrl(route);

    expect(url?.origin).toBe("https://uri.amap.com");
    expect(url?.pathname).toBe("/navigation");
    expect(url?.searchParams.get("from")).toBe("108.940174,34.341568,西安城区");
    expect(url?.searchParams.get("to")).toBe("108.940174,34.341568,返回西安");
    expect(url?.searchParams.get("via")).toBe(
      "108.552515,34.003542,太平国家森林公园;108.629877,34.049331,环山路农家乐"
    );
    expect(url?.searchParams.get("mode")).toBe("car");
    expect(url?.searchParams.get("callnative")).toBe("1");
  });
});
