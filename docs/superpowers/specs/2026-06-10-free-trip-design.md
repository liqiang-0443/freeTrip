# FreeTrip Design

Date: 2026-06-10
Status: Approved direction, ready for implementation planning

## Product Positioning

FreeTrip is a personal self-driving route recommendation app centered on Xi'an. Its primary job is to answer: "Where can I drive today or this weekend?" After a route is planned or completed, the app turns that activity into a private travel record with visited places and photos.

The app is not a public travel community, social feed, or generic scenic spot bookmarker. It is a practical personal tool for route decisions, route planning, and later footprint review.

## Target User

The initial user is a driver based in Xi'an who wants:

- Complete self-driving route suggestions rather than isolated destination names.
- Fast filtering by available time: half day, one day, or weekend.
- Practical route judgment: driving time, recommended start time, route rhythm, seasonal fit, and risk reminders.
- A private record of routes already visited, including photos attached to places or stops.
- Windows-based development with Android debugging and final iOS packaging.

## Core Experience

The first screen is a recommendation feed organized by time availability:

- Today half day: short routes that are realistic for a spontaneous nearby trip.
- Today one day: early-start, same-day return routes.
- Weekend two days: longer routes that may include lodging or a more complete itinerary.

Each route card should show enough information to make a go/no-go decision:

- Route title.
- Stop sequence, such as "Xi'an -> main destination -> meal stop -> return".
- Duration type.
- Estimated one-way and total driving time.
- Tags such as nature, history, family, light hiking, photography, or summer escape.
- Recommended start time.
- Highlights.
- Risk reminders, such as rain, snow, mountain roads, parking pressure, or holiday crowding.
- Actions: collect, plan, mark as visited, open route.

## First Version Scope

The first version includes:

- Home recommendation feed.
- Filters for half day, one day, weekend, tags, and distance bands.
- Route detail page with route summary, timeline, stop list, reminders, and map.
- Route collection, plan date, not interested, and visited states.
- Built-in curated route library.
- Remote route library refresh.
- Local SQLite storage.
- Photo attachment for visited routes and stops.
- Footprint map for visited routes and places.
- AMap-based route, POI, and navigation-link enrichment.
- iOS package generation through EAS Build.

The first version does not include:

- Public social features.
- Account system.
- Multi-device cloud sync.
- AI-generated routes as the source of truth.
- Full article-style travel guides.
- Offline map downloads.
- Payment, merchant, or booking features.

## Technical Direction

Use Expo, React Native, and TypeScript.

Reasons:

- Windows can be the primary development machine.
- Android emulator or Android phone can cover most local development.
- iOS builds can be produced through Expo EAS Build without a local Mac.
- Expo supports an incremental path: start with managed Expo where possible, then move to development builds when native map, location, or photo capabilities require it.

Expected stack:

- Expo + React Native + TypeScript for the app.
- Expo Router or React Navigation for navigation.
- SQLite for structured local data.
- Expo FileSystem and ImagePicker or their equivalents for photo storage and import.
- A map component suitable for both Android and iOS.
- AMap Web Service APIs for POI search, driving route calculation, geocoding, and navigation-related data.
- EAS Build for iOS packaging.

## Data Strategy

The route library uses a hybrid model: built-in seed data plus remote updates.

The app ships with a `routes.seed.json` file. On first launch, the app imports this seed into SQLite so the user can browse recommendations even without network access.

The app can also fetch a remote `routes.latest.json` file. This may be hosted by a static file service such as GitHub raw, GitCode raw, Gitee raw, or a simple custom endpoint. The remote file updates curated official routes without requiring a new app release.

Remote route updates must not overwrite user-owned state:

- Collected routes remain collected.
- Planned dates remain.
- Visited records remain.
- Attached photos remain.
- User notes remain.
- User-hidden or not-interested states remain.

Routes must use stable IDs so local state can survive remote updates.

## Route Template Model

Route templates represent curated route ideas.

```ts
type RouteTemplate = {
  id: string;
  libraryVersion: number;
  title: string;
  originKey: "xian";
  durationType: "half_day" | "one_day" | "weekend";
  distanceBand: "near" | "medium" | "far";
  tags: string[];
  seasonTags: string[];
  recommendedStartTime?: string;
  estimatedDrivingMinutes?: number;
  summary: string;
  highlights: string[];
  reminders: string[];
  avoidConditions: string[];
  stops: RouteStop[];
  status: "active" | "deprecated";
  updatedAt: string;
};

type RouteStop = {
  id: string;
  routeId: string;
  order: number;
  name: string;
  role: "origin" | "destination" | "food" | "viewpoint" | "parking" | "lodging" | "fuel" | "optional" | "return";
  poiKeyword?: string;
  amapPoiId?: string;
  latitude?: number;
  longitude?: number;
  suggestedArrivalTime?: string;
  suggestedStayMinutes?: number;
  notes?: string;
};
```

## Runtime Enrichment Model

Runtime enrichment adds data that may change over time.

```ts
type RouteRuntimeInfo = {
  routeId: string;
  refreshedAt: string;
  liveDrivingMinutes?: number;
  oneWayDrivingMinutes?: number;
  routeDistanceMeters?: number;
  weatherSummary?: string;
  poiStatus?: "matched" | "partial" | "missing";
  navigationLinks: NavigationLink[];
  nearbyFoodPoiIds: string[];
  nearbyParkingPoiIds: string[];
};
```

Runtime enrichment should be cached locally with a refresh timestamp. The app should still show the curated template when online enrichment fails.

## User Data Model

User data is private and local in the first version.

Main tables:

- `route_templates`: imported built-in and remote curated routes.
- `route_stops`: stops belonging to route templates.
- `route_runtime_cache`: cached online enrichment.
- `user_route_states`: collected, planned, visited, and not-interested state.
- `trip_records`: actual trips created from planned or visited routes.
- `trip_stops`: actual visited stops, allowing the user to modify the original template.
- `photos`: local photo path, thumbnail path, capture time, optional GPS, and linked trip or stop.
- `settings`: origin city, AMap key presence, refresh preferences, and basic app preferences.

## Recommendation Rules

The first version should use deterministic rules rather than a black-box recommender.

Inputs:

- Selected time availability: half day, one day, weekend.
- Tags and interests.
- Distance band.
- Current date and season.
- Current or configured origin, initially Xi'an.
- Route user state, such as collected, visited, and not interested.
- Runtime driving time when available.

Ranking:

- Prefer routes matching the selected duration type.
- Prefer routes matching selected tags.
- Penalize routes with avoid conditions that match current weather or season.
- Penalize routes recently dismissed as not interested.
- Allow previously collected routes to appear in a separate section.
- Keep visited routes visible in history but lower priority in recommendation feeds unless the user asks to revisit.

## External Data

AMap is the preferred first data provider for China-focused driving recommendations.

Use it for:

- POI matching for curated stops.
- Nearby food, parking, fuel, charging, and optional stops.
- Driving route estimation.
- Geocoding and reverse geocoding.
- Opening external navigation.

The app should keep provider access behind a small service boundary so another provider can be added later.

The app should not scrape long-form travel guide pages in the first version. Curated route descriptions should be maintained by the route library, while online services provide structured and refreshable data.

## iOS Build And Windows Development

Development flow:

- Develop on Windows.
- Use Android emulator or Android device for day-to-day testing.
- Use Expo Go only while the app uses supported managed APIs.
- Switch to Expo development builds if native map, location, or photo modules require custom native configuration.
- Use EAS Build for iOS packaging.

iOS constraints:

- A paid Apple Developer account may be needed for device distribution, TestFlight, or App Store-style signing.
- Some iOS-specific behavior still needs final validation on a real iPhone.
- Map SDK behavior, photo permissions, location permission prompts, and deep links should be verified on iOS before treating the build as complete.

## Error Handling

The app should remain useful when the network is unavailable.

Expected behavior:

- If remote route refresh fails, keep the local route library.
- If AMap enrichment fails, show curated route data and mark live data as unavailable.
- If POI matching is partial, show the curated stop name and avoid blocking route display.
- If photo import fails, keep the trip record and show a retryable error.
- If SQLite migration fails, stop startup with a clear recovery message rather than risking data corruption.

## Testing And Validation

Implementation should include:

- Unit tests for route library import and merge behavior.
- Unit tests for recommendation ranking rules.
- Unit tests for preserving user state during remote route updates.
- Integration tests for SQLite migrations.
- Manual Android validation for home feed, route detail, collection, planning, visited state, photo import, and map display.
- iOS build validation through EAS before the first usable release.

Key manual acceptance checks:

- Fresh install shows built-in routes without network.
- Remote route update adds or updates curated routes without deleting user state.
- A route can be collected, planned, marked visited, and converted to a trip record.
- Photos can be attached to a visited route or stop.
- Footprint map shows visited route stops.
- AMap enrichment failure does not make the route unusable.

## Initial Route Library Shape

The first curated library should contain about 30 routes:

- 8 to 10 half-day routes.
- 12 to 15 one-day routes.
- 8 to 10 weekend routes.

Coverage should include:

- Qinling direction for nature, summer escape, and light hiking.
- Lintong and Huashan direction for history and mountain routes.
- Xianyang, Liquan, and Qianxian direction for short historical trips.
- Baoji and Taibai direction for weekend nature routes.
- Hanzhong and Ankang direction for two-day mountain and water routes.
- Yan'an and Huangling direction for history and longer routes.
- Luoyang and Sanmenxia direction for cross-province weekend routes.

## Open Decisions For Implementation Planning

- Choose the exact map component and decide whether AMap native SDK integration is required immediately.
- Choose the first remote route library host.
- Decide whether the first route seed contains real curated Xi'an routes or a smaller development fixture set.
- Decide how to store and protect AMap API keys for a personal app.
- Decide whether weather data is included in version one or deferred.

## Success Criteria

The first usable release is successful when:

- The app can recommend complete driving routes from Xi'an by half-day, one-day, and weekend categories.
- It works offline with the built-in route library.
- It can refresh route templates from a remote JSON source.
- It uses online route or POI data to enrich recommendations when available.
- The user can collect, plan, mark visited, attach photos, and view visited places on a footprint map.
- The app can be developed on Windows, tested on Android, and packaged for iOS through EAS Build.
