import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";

export default function TabsLayout() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Reset background color for Web
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = '#FFFFFF';
    }

    const checkRole = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setRole(user.role || "user");
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Error checking role:", error);
        setRole("user");
      } finally {
        setLoading(false);
      }
    };
    checkRole();
  }, []);


  if (loading) return null;

  return (
    <Tabs
      key={role}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"] =
            "home-outline";

          if (route.name === "home" || route.name === "admin_home") iconName = "home-outline";
          else if (route.name === "chat") iconName = "chatbox-outline";
          else if (route.name === "profile") iconName = "person-outline";
          else if (route.name === "map") iconName = "globe-outline";

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: "#439D25",
        tabBarInactiveTintColor: "#555555",
        tabBarStyle: {
          height: 72,
          paddingBottom: Platform.OS === "ios" ? 14 : 10,
          paddingTop: 10,
          backgroundColor: "#FFFFFF",
          borderRadius: 36,
          borderTopWidth: 0,
          elevation: 15,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          position: "absolute",
          bottom: Platform.OS === "ios" ? 22 : 14,
          left: 16,
          right: 16,
          marginHorizontal: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          href: role === "admin" ? null : "/tabs/home",
        }}
      />
      <Tabs.Screen
        name="admin_home"
        options={{
          title: "Dashboard",
          href: (role === "admin" ? "/tabs/admin_home" : null) as any,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: role === "admin" ? "Messages" : "Chat" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile" }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          href: role === "admin" ? null : "/tabs/map",
        }}
      />

      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
