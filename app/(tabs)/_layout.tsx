import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/styles/theme";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 10,
          height: 78,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          borderRadius: 22,
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          boxShadow: "0 14px 34px rgba(15, 63, 50, 0.18)",
          elevation: 12,
          zIndex: 50,
          paddingTop: 6,
          paddingBottom: 10
        },
        tabBarItemStyle: {
          paddingVertical: 4
        },
        tabBarIconStyle: {
          marginTop: 2
        },
        tabBarLabelStyle: {
          fontSize: 12,
          lineHeight: 16,
          fontWeight: "800",
          paddingBottom: 2
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "推荐",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "路线库",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="footprint"
        options={{
          title: "足迹",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" color={color} size={size} />
          )
        }}
      />
      <Tabs.Screen name="route/[id]" options={{ href: null }} />
    </Tabs>
  );
}
