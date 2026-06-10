# AMap Route Enhancement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enrich curated self-driving routes with AMap Web Service driving distance, driving time, and external navigation links while preserving offline route usability.

**Architecture:** Keep AMap integration behind pure request/response helpers and a small runtime hook. UI receives optional runtime enrichment and falls back to seed estimates when no key, no coordinates, or network/API errors occur.

**Tech Stack:** Expo React Native, TypeScript, Vitest, AMap Web Service `/v3/direction/driving`, Expo Linking.

---

### Task 1: AMap Service

- [ ] Add route coordinate fields to seed stops that can be enhanced.
- [ ] Add `src/services/amapRoutes.ts` with request building, response parsing, and navigation URI creation.
- [ ] Add tests for driving URL, response parsing, missing key, and failed API status.

### Task 2: Runtime Enrichment Hook

- [ ] Add `src/hooks/useRouteRuntimeInfo.ts`.
- [ ] Load runtime info only when `EXPO_PUBLIC_AMAP_WEB_KEY` is present and enough route stops have coordinates.
- [ ] Expose loading, data, and error state without blocking static route display.

### Task 3: UI Integration

- [ ] Show live distance/time badges on recommendation cards when available.
- [ ] Show live distance/time, refresh state, and “打开高德导航” on route detail.
- [ ] Keep existing static values visible when runtime enrichment is unavailable.

### Task 4: Verification

- [ ] Run `npm test -- --run`.
- [ ] Run `npm run typecheck`.
- [ ] Build Android debug APK.
- [ ] Open emulator and verify route detail still renders without an AMap key.
