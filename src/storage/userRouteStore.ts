import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserRouteStateMap } from "@/domain/userRouteState";

const STORAGE_KEY = "freetrip:user-route-state:v1";

export async function loadUserRouteStates(): Promise<UserRouteStateMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as UserRouteStateMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function saveUserRouteStates(
  states: UserRouteStateMap
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(states));
}
