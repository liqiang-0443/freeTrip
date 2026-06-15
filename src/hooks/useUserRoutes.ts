import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import {
  addRoutePhoto,
  markNotInterested,
  markVisited,
  planRoute,
  toggleCollected,
  type RoutePhoto,
  type UserRouteStateMap
} from "@/domain/userRouteState";
import {
  loadUserRouteStates,
  saveUserRouteStates
} from "@/storage/userRouteStore";

type UserRouteSnapshot = {
  states: UserRouteStateMap;
  loaded: boolean;
};

let snapshot: UserRouteSnapshot = {
  states: {},
  loaded: false
};
let loadStarted = false;
const listeners = new Set<() => void>();

export function useUserRoutes() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    ensureLoaded();
  }, []);

  const update = useCallback((next: UserRouteStateMap) => {
    setSnapshot({ states: next, loaded: true });
    void saveUserRouteStates(next);
  }, []);

  const actions = useMemo(
    () => ({
      toggleCollected: (routeId: string) => update(toggleCollected(snapshot.states, routeId)),
      planRoute: (routeId: string, plannedDate: string) =>
        update(planRoute(snapshot.states, routeId, plannedDate)),
      markVisited: (routeId: string, visitedAt: string) =>
        update(markVisited(snapshot.states, routeId, visitedAt)),
      markNotInterested: (routeId: string) =>
        update(markNotInterested(snapshot.states, routeId)),
      addRoutePhoto: (routeId: string, photo: RoutePhoto) =>
        update(addRoutePhoto(snapshot.states, routeId, photo))
    }),
    [update]
  );

  return { states: current.states, loaded: current.loaded, actions };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return snapshot;
}

function setSnapshot(next: UserRouteSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function ensureLoaded() {
  if (loadStarted) {
    return;
  }

  loadStarted = true;
  loadUserRouteStates().then((loadedStates) => {
    setSnapshot({ states: loadedStates, loaded: true });
  });
}
