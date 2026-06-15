# Web-First PWA Design

## Context

FreeTrip is moving away from native iOS/Android packaging for the first usable version. The current constraint is practical: the user has Windows locally, no Android device, and wants a fully free path that works on iPhone. A PWA gives the shortest route to a usable personal travel journal without Apple Developer Program fees.

The app should be treated as a mobile web app first. Native-specific code may remain temporarily while the project is migrated, but new feature work should target iPhone Safari, desktop browsers, and local Windows development.

## Goals

- Run locally on Windows as a web app and be reachable from an iPhone on the same network.
- Let the user add the app to the iPhone home screen with an app-like launch experience.
- Show a real AMap Web map for footprint viewing.
- Keep route visited state, trip notes, and uploaded photos in browser-local storage.
- Support photo upload from iPhone Safari using the browser file picker.
- Preserve enough existing route/detail/library behavior to keep the app useful during migration.

## Non-Goals

- App Store distribution.
- iOS native signing, TestFlight, or EAS iOS builds.
- Android emulator support.
- Cloud sync between devices.
- Multi-user accounts.
- Server-side photo storage.

## Architecture

The app remains an Expo Router project, but the product target becomes Web/PWA. React Native Web continues to render the existing screen structure. Browser-only features are isolated behind small services and platform-specific components.

The footprint map uses a web-specific component backed by AMap JavaScript API. Native AMap code is not used for the PWA path. Existing domain models continue to build route markers and polylines, so the map rendering layer stays replaceable.

Local persistence is split by data shape:

- AsyncStorage-compatible route state remains for simple JSON state.
- Photo files and richer photo records move to IndexedDB because images are too large for localStorage-style storage.
- PWA install metadata lives in static web assets: manifest, icons, and service worker.

## User Experience

The first screen should remain a usable trip app, not a marketing page. On iPhone Safari, the user opens the local or deployed URL, sees the existing app navigation, and can add it to the home screen.

The footprint tab should be the most map-like experience:

- AMap Web map fills the main area.
- Visited route stops appear as markers.
- Route paths appear as polylines.
- A compact overlay shows route count, place count, and photo count.
- Tapping a marker shows the stop name, route title, visited date, and photo count.

Photo upload should feel local and direct:

- On a route detail page, the user can choose photos from the browser.
- Selected photos are stored in IndexedDB.
- Refreshing the page preserves the photo list.
- Photo count updates wherever the route is displayed.

## Data Flow

1. Route seed data provides default route metadata and stop coordinates.
2. `useUserRoutes` stores visited state and notes.
3. `buildFootprintMapModel` converts route state into map markers, polylines, center, and counts.
4. The web map component loads AMap JS API using `EXPO_PUBLIC_AMAP_WEB_KEY`.
5. Photo upload reads files in the browser and stores records in IndexedDB.
6. UI components subscribe to photo metadata and route state, then re-render counts and previews.

## Error Handling

- If the AMap Web key is missing, the map area shows a clear local setup message.
- If AMap JS fails to load, the footprint page shows the route summary and an actionable retry message instead of a blank map.
- If IndexedDB is unavailable or blocked, photo upload is disabled with a short explanation; route state remains usable.
- If an image file cannot be read, the app skips that file and keeps previously saved photos.

## PWA Behavior

The first PWA pass includes:

- Web app manifest with name, short name, theme color, display mode, and icons.
- Mobile-safe viewport and theme metadata.
- Service worker for app shell/static asset caching.
- A visible app experience that works when launched from the iPhone home screen.

Offline behavior is intentionally modest in the first pass. The app shell and locally stored route/photo data should remain available after first load. AMap tiles and online route recommendations may still require network access.

## Testing

Automated tests should cover:

- Footprint map model behavior remains stable.
- IndexedDB photo repository can add, list, count, and delete photos using a fake IndexedDB-compatible test environment or isolated adapter tests.
- Web map loader handles success, missing key, and script load failure.

Manual verification should cover:

- `npm run web` or equivalent starts the app locally.
- Desktop browser opens the PWA without runtime errors.
- iPhone Safari can open the LAN URL.
- Footprint map displays AMap Web tiles and route markers.
- Photo upload persists after refresh.
- Add to Home Screen launches the app in standalone mode where supported.

## Migration Strategy

Implementation should prioritize the PWA path and avoid spending time repairing native map behavior. Native-only dependencies can be removed or isolated when they block web builds. Existing domain and route recommendation code should be reused where it is platform-neutral.

The first implementation milestone is a working web app with real AMap Web map and local photo persistence. Cleanup of obsolete native code can follow once the PWA path is verified.
