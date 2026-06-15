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
        tabBarStyle: {
          position: "absolute",
          left: 14,
          right: 14,
          bottom: 10,
          height: 64,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          borderRadius: 18,
          backgroundColor: "rgba(255, 255, 255, 0.96)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          elevation: 12,
          zIndex: 50
        },
        tabBarItemStyle: {
          paddingVertical: 8
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "800"
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
    </Tabs>
  );
}
