# FreeTrip First Version Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable Expo/React Native first version that shows Xi'an route recommendations, route details, local route states, trip photos, and a footprint view on Android, while keeping an iOS EAS build path.

**Architecture:** Use an Expo TypeScript app with pure domain modules for route templates, route updates, recommendations, and user state. UI screens consume those domain modules through small data hooks so core behavior can be unit-tested without the mobile runtime.

**Tech Stack:** Expo, React Native, TypeScript, expo-router, expo-sqlite-compatible local persistence where practical, AsyncStorage fallback for MVP state, Vitest, React Native Testing Library where useful.

---

### File Structure

- Create `package.json`, `app.json`, `tsconfig.json`, `babel.config.js`, `vitest.config.ts`, and Expo app entry files.
- Create `app/(tabs)/index.tsx` for recommendations.
- Create `app/route/[id].tsx` for route detail.
- Create `app/(tabs)/footprint.tsx` for visited route footprint.
- Create `app/(tabs)/library.tsx` for saved, planned, and visited route lists.
- Create `src/data/routes.seed.ts` for curated Xi'an route seed data.
- Create `src/domain/routes.ts` for route types and route merge behavior.
- Create `src/domain/recommendations.ts` for route ranking and filtering.
- Create `src/domain/userRouteState.ts` for user state helpers.
- Create `src/storage/userRouteStore.ts` for local state persistence.
- Create `src/components/*` for reusable cards, filters, stop timelines, and empty states.
- Create `src/styles/theme.ts` for shared colors and spacing.
- Create `src/domain/*.test.ts` for unit tests.

### Task 1: Project Skeleton

**Files:**
- Create: `package.json`
- Create: `app.json`
- Create: `tsconfig.json`
- Create: `babel.config.js`
- Create: `vitest.config.ts`
- Create: `app/_layout.tsx`

- [ ] **Step 1: Scaffold Expo project files**

Use Expo with TypeScript and expo-router. Keep dependencies minimal: route UI, local state, image picking, and tests.

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: dependencies installed and `package-lock.json` created.

- [ ] **Step 3: Verify base scripts**

Run: `npm run typecheck`
Expected: TypeScript runs and reports only missing app code if the next files are not created yet.

### Task 2: Route Domain And Seed Data

**Files:**
- Create: `src/domain/routes.ts`
- Create: `src/data/routes.seed.ts`
- Test: `src/domain/routes.test.ts`

- [ ] **Step 1: Write failing route merge tests**

Test that remote route templates can add, update, and deprecate routes while preserving stable IDs.

- [ ] **Step 2: Run route tests and verify failure**

Run: `npm test -- src/domain/routes.test.ts`
Expected: fail because `mergeRouteTemplates` is not implemented.

- [ ] **Step 3: Implement route types and merge behavior**

Create route types from the design and implement deterministic merging by route ID.

- [ ] **Step 4: Run route tests and verify pass**

Run: `npm test -- src/domain/routes.test.ts`
Expected: pass.

### Task 3: Recommendation Rules

**Files:**
- Create: `src/domain/recommendations.ts`
- Test: `src/domain/recommendations.test.ts`

- [ ] **Step 1: Write failing recommendation tests**

Test duration matching, tag matching, not-interested penalty, and visited route lowering.

- [ ] **Step 2: Run recommendation tests and verify failure**

Run: `npm test -- src/domain/recommendations.test.ts`
Expected: fail because `rankRoutes` is not implemented.

- [ ] **Step 3: Implement recommendation scoring**

Use deterministic scoring that matches the design: duration, tags, collection, planned state, visited lowering, and not-interested filtering.

- [ ] **Step 4: Run recommendation tests and verify pass**

Run: `npm test -- src/domain/recommendations.test.ts`
Expected: pass.

### Task 4: User Route State And Local Persistence

**Files:**
- Create: `src/domain/userRouteState.ts`
- Create: `src/storage/userRouteStore.ts`
- Test: `src/domain/userRouteState.test.ts`

- [ ] **Step 1: Write failing user state tests**

Test collect, plan, mark visited, attach photo metadata, and not-interested transitions.

- [ ] **Step 2: Run user state tests and verify failure**

Run: `npm test -- src/domain/userRouteState.test.ts`
Expected: fail because helpers are missing.

- [ ] **Step 3: Implement state helpers**

Use pure immutable helpers for route state transitions.

- [ ] **Step 4: Add AsyncStorage-backed MVP persistence**

Persist a single JSON state object under a versioned key. This keeps the first version simple while preserving a later SQLite migration path.

- [ ] **Step 5: Run tests and typecheck**

Run: `npm test -- src/domain/userRouteState.test.ts`
Run: `npm run typecheck`
Expected: pass.

### Task 5: Mobile UI First Version

**Files:**
- Create: `src/styles/theme.ts`
- Create: `src/components/RouteCard.tsx`
- Create: `src/components/RouteFilters.tsx`
- Create: `src/components/StopTimeline.tsx`
- Create: `src/components/EmptyState.tsx`
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/index.tsx`
- Create: `app/(tabs)/library.tsx`
- Create: `app/(tabs)/footprint.tsx`
- Create: `app/route/[id].tsx`

- [ ] **Step 1: Build tab navigation**

Create three tabs: Recommend, Library, Footprint.

- [ ] **Step 2: Build recommendation feed**

Show filters for half day, one day, weekend, plus tag filters. Render route cards from ranked seed data.

- [ ] **Step 3: Build route detail**

Show route summary, timeline, reminders, actions, and placeholder map panel. The map panel should make it clear that AMap live enrichment is the next integration step.

- [ ] **Step 4: Build library and footprint views**

Show collected, planned, visited, and photo counts from local user state. Footprint shows visited routes and stop names.

- [ ] **Step 5: Run typecheck**

Run: `npm run typecheck`
Expected: pass.

### Task 6: Android Runtime Verification

**Files:**
- Modify: no source files unless runtime issues appear.

- [ ] **Step 1: Run tests**

Run: `npm test -- --run`
Expected: all tests pass.

- [ ] **Step 2: Run TypeScript**

Run: `npm run typecheck`
Expected: pass.

- [ ] **Step 3: Start Expo**

Run: `npm run start -- --android`
Expected: Expo starts and attempts to open Android emulator. If no emulator is running, provide the Expo URL and exact command for the user to open it.

- [ ] **Step 4: Record limitations**

Document whether Android emulator launch succeeded, and list any remaining iOS/EAS validation gaps.
