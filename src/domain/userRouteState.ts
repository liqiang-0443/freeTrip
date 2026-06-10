import type { RouteUserStateSummary } from "./recommendations";

export type RoutePhoto = {
  id: string;
  uri: string;
  addedAt: string;
  stopId?: string;
};

export type UserRouteState = RouteUserStateSummary & {
  photos?: RoutePhoto[];
};

export type UserRouteStateMap = Record<string, UserRouteState>;

export function toggleCollected(
  states: UserRouteStateMap,
  routeId: string
): UserRouteStateMap {
  const current = ensureState(states, routeId);
  return {
    ...states,
    [routeId]: {
      ...current,
      collected: !current.collected
    }
  };
}

export function planRoute(
  states: UserRouteStateMap,
  routeId: string,
  plannedDate: string
): UserRouteStateMap {
  return {
    ...states,
    [routeId]: {
      ...ensureState(states, routeId),
      plannedDate,
      notInterested: false
    }
  };
}

export function markVisited(
  states: UserRouteStateMap,
  routeId: string,
  visitedAt: string
): UserRouteStateMap {
  return {
    ...states,
    [routeId]: {
      ...ensureState(states, routeId),
      visitedAt,
      notInterested: false
    }
  };
}

export function markNotInterested(
  states: UserRouteStateMap,
  routeId: string
): UserRouteStateMap {
  return {
    ...states,
    [routeId]: {
      ...ensureState(states, routeId),
      notInterested: true
    }
  };
}

export function addRoutePhoto(
  states: UserRouteStateMap,
  routeId: string,
  photo: RoutePhoto
): UserRouteStateMap {
  const current = ensureState(states, routeId);
  return {
    ...states,
    [routeId]: {
      ...current,
      photos: [...(current.photos ?? []), photo]
    }
  };
}

function ensureState(states: UserRouteStateMap, routeId: string): UserRouteState {
  return states[routeId] ?? { routeId };
}
