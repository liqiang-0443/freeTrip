import { useCallback, useEffect, useMemo, useState } from "react";
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

export function useUserRoutes() {
  const [states, setStates] = useState<UserRouteStateMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    loadUserRouteStates().then((loadedStates) => {
      if (active) {
        setStates(loadedStates);
        setLoaded(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((next: UserRouteStateMap) => {
    setStates(next);
    void saveUserRouteStates(next);
  }, []);

  const actions = useMemo(
    () => ({
      toggleCollected: (routeId: string) => update(toggleCollected(states, routeId)),
      planRoute: (routeId: string, plannedDate: string) =>
        update(planRoute(states, routeId, plannedDate)),
      markVisited: (routeId: string, visitedAt: string) =>
        update(markVisited(states, routeId, visitedAt)),
      markNotInterested: (routeId: string) =>
        update(markNotInterested(states, routeId)),
      addRoutePhoto: (routeId: string, photo: RoutePhoto) =>
        update(addRoutePhoto(states, routeId, photo))
    }),
    [states, update]
  );

  return { states, loaded, actions };
}
