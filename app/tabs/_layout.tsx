import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function TabsLayout() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          setRole(user.role);
        }
      } catch (error) {
        console.error("Error checking role:", error);
      } finally {
        setLoading(false);
      }
    };
    checkRole();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#439D25" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"] =
            "home-outline";

          if (route.name === "home" || route.name === "admin_home") iconName = "home-outline";
          else if (route.name === "chat") iconName = "chatbubble-outline";
          else if (route.name === "profile") iconName = "person-outline";
          else if (route.name === "map") iconName = "globe-outline";

          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: "#439D25",
        tabBarInactiveTintColor: "#A0A0A0",
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          backgroundColor: "#FFFFFF",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          borderTopWidth: 0,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
        headerShown: false,
      })}
    >
      {role === "admin" ? (
        <>
          <Tabs.Screen name="admin_home" options={{ title: "Dashboard" }} />
          <Tabs.Screen name="chat" options={{ title: "Messages" }} />
          <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        </>
      ) : (
        <>
          <Tabs.Screen name="home" options={{ title: "Home" }} />
          <Tabs.Screen name="chat" options={{ title: "Chat" }} />
          <Tabs.Screen name="profile" options={{ title: "Profile" }} />
          <Tabs.Screen name="map" options={{ title: "Map" }} />
        </>
      )}

      {/* Hidden screens */}
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
