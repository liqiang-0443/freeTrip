import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { configureAmapNativePrivacy } from "@/services/amapNativePrivacy";

configureAmapNativePrivacy();

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="route/[id]" />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
