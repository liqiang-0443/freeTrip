# Web-First PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert FreeTrip's first usable target to a free Web-first PWA with AMap Web footprint map and browser-local photo storage.

**Architecture:** Keep Expo Router and React Native Web for the app shell, but isolate browser-only behavior in web-specific files and small services. Use AMap JavaScript API for the footprint map and IndexedDB for photo blobs/metadata. Remove or isolate native-only map imports so web builds do not load native modules.

**Tech Stack:** Expo Router, React Native Web, AMap JS API, IndexedDB, TypeScript, Vitest, browser manual verification.

---

## File Structure

- `app.config.js`: add web/PWA metadata and remove native-only map plugin from the PWA path.
- `package.json`: add web start/export scripts if needed and remove native-only dependency when web builds require it.
- `public/manifest.json`: PWA manifest.
- `public/sw.js`: small app-shell service worker.
- `public/icons/*.svg`: simple install icons.
- `app/+html.tsx`: web document metadata, viewport, manifest, theme color, and service worker registration script.
- `src/components/FootprintMapView.tsx`: platform-neutral export surface.
- `src/components/FootprintMapView.web.tsx`: AMap Web implementation.
- `src/components/FootprintMapView.native.tsx`: native fallback or non-priority placeholder.
- `src/services/amapWebLoader.ts`: load AMap JS API once and report status.
- `src/services/amapWebLoader.test.ts`: loader tests for missing key and already-loaded behavior.
- `src/services/photoLibrary.ts`: browser/local photo repository interface and IndexedDB-backed implementation.
- `src/services/photoLibrary.test.ts`: repository tests against an in-memory IndexedDB shim.
- `src/hooks/useRoutePhotos.ts`: subscribe UI to photo records stored outside `UserRouteState`.
- `app/route/[id].tsx`: use browser upload path on web and display persisted photos.
- `app/(tabs)/footprint.tsx`: count IndexedDB photos in the footprint summary when running on web.

## Task 1: Make Web Build Independent From Native AMap

**Files:**
- Modify: `src/components/FootprintMapView.tsx`
- Create: `src/components/FootprintMapView.native.tsx`
- Create: `src/components/FootprintMapView.web.tsx`
- Modify: `app/_layout.tsx`

- [ ] Move the current native `expo-gaode-map` implementation from `src/components/FootprintMapView.tsx` to `src/components/FootprintMapView.native.tsx`.
- [ ] Replace `src/components/FootprintMapView.tsx` with a platform-neutral placeholder that exports the native-compatible component for non-web fallback.
- [ ] Create `src/components/FootprintMapView.web.tsx` with a temporary styled placeholder that does not import `expo-gaode-map`.
- [ ] Remove top-level native AMap privacy configuration from `app/_layout.tsx` so web never imports `expo-gaode-map`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test -- --run`.
- [ ] Commit with message `隔离原生高德地图依赖`.

## Task 2: Add AMap Web Loader

**Files:**
- Create: `src/services/amapWebLoader.ts`
- Create: `src/services/amapWebLoader.test.ts`
- Modify: `src/components/FootprintMapView.web.tsx`

- [ ] Add `getAmapWebKey()` that reads `process.env.EXPO_PUBLIC_AMAP_WEB_KEY`.
- [ ] Add `loadAmapWebSdk(key)` that injects `https://webapi.amap.com/maps?v=2.0&key=<key>` once and resolves `window.AMap`.
- [ ] Add tests that missing key returns a clear error state and repeated loads reuse the existing promise.
- [ ] Update the web map component to show missing-key, loading, loaded, and failed states.
- [ ] Run `npm test -- --run src/services/amapWebLoader.test.ts`.
- [ ] Run `npm run typecheck`.
- [ ] Commit with message `添加高德 Web 地图加载器`.

## Task 3: Render AMap Web Footprint Map

**Files:**
- Modify: `src/components/FootprintMapView.web.tsx`
- Modify: `src/domain/footprintMap.test.ts`

- [ ] Use `buildFootprintMapModel` output to initialize an AMap map centered on `model.center`.
- [ ] Draw one marker per `model.markers`.
- [ ] Draw one polyline per `model.polylines`.
- [ ] Keep the existing overlay counts and selected marker card.
- [ ] Dispose the map instance on unmount.
- [ ] Run `npm test -- --run src/domain/footprintMap.test.ts`.
- [ ] Run `npm run typecheck`.
- [ ] Commit with message `渲染 Web 足迹地图`.

## Task 4: Add IndexedDB Photo Library

**Files:**
- Create: `src/services/photoLibrary.ts`
- Create: `src/services/photoLibrary.test.ts`
- Create: `src/hooks/useRoutePhotos.ts`
- Modify: `src/domain/travelJournal.ts`

- [ ] Define `LocalRoutePhoto` with `id`, `routeId`, `stopId`, `name`, `type`, `size`, `addedAt`, and `dataUrl`.
- [ ] Implement `addRoutePhotos(routeId, stopId, files)` using IndexedDB on web and a graceful unsupported result elsewhere.
- [ ] Implement `listRoutePhotos(routeId)`, `countPhotosByRoute()`, and `deleteRoutePhoto(id)`.
- [ ] Add an in-memory fake repository path for tests so Vitest does not require a real browser database.
- [ ] Add `useRoutePhotos(routeId)` using `useSyncExternalStore` or local state plus repository notifications.
- [ ] Run `npm test -- --run src/services/photoLibrary.test.ts`.
- [ ] Run `npm run typecheck`.
- [ ] Commit with message `添加浏览器本地照片库`.

## Task 5: Wire Photo Upload To Route Detail

**Files:**
- Modify: `app/route/[id].tsx`
- Modify: `app/(tabs)/footprint.tsx`
- Modify: `src/hooks/useUserRoutes.ts` only if photo count compatibility requires it.

- [ ] On web, render a hidden `<input type="file" accept="image/*" multiple>` behind the existing add-photo button.
- [ ] Store selected browser files with `addRoutePhotos`.
- [ ] Display IndexedDB photos together with existing state photos.
- [ ] Update footprint photo counts to include IndexedDB route photos.
- [ ] Keep native photo behavior as non-priority fallback if it still typechecks.
- [ ] Run `npm test -- --run`.
- [ ] Run `npm run typecheck`.
- [ ] Commit with message `接入 Web 图片上传`.

## Task 6: Add PWA Install Shell

**Files:**
- Modify: `app.config.js`
- Create: `app/+html.tsx`
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Create: `public/icons/icon.svg`
- Create: `public/icons/maskable-icon.svg`

- [ ] Add manifest link, theme color, apple mobile web app metadata, and viewport metadata.
- [ ] Register `sw.js` only in production-like browser contexts.
- [ ] Cache the app shell and static assets in the service worker.
- [ ] Confirm the app still works when service worker registration fails.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test -- --run`.
- [ ] Commit with message `添加 PWA 安装壳`.

## Task 7: Browser Verification

**Files:**
- Modify docs only if verification uncovers setup notes worth keeping.

- [ ] Run `npm run web`.
- [ ] Open the local web URL in the browser.
- [ ] Confirm there are no runtime red screens.
- [ ] Confirm the footprint tab loads and shows either AMap tiles or the configured key error.
- [ ] Mark a route visited and confirm marker/count changes.
- [ ] Upload a photo and refresh the page; confirm the photo remains.
- [ ] Use the browser devtools Application panel or Lighthouse installability signal to confirm manifest/service worker basics.
- [ ] Run final `npm test -- --run`, `npm run typecheck`, and `git diff --check`.
- [ ] Push branch `codex/web-first-pwa`.
