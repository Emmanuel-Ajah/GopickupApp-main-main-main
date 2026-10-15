import * as Font from "expo-font";
import { Stack, usePathname, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import notificationService from "../services/notificationService";


function RootNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [initialNavDone, setInitialNavDone] = useState(false);

  // Restore session / last visited tab on startup
  useEffect(() => {
    if (isLoading || initialNavDone) return;

    const navigateInitial = async () => {
      try {
        if (isAuthenticated && user) {
          // If user opens the app while already logged in
          if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
            const lastRoute = await AsyncStorage.getItem("lastRoute");
            if (lastRoute && lastRoute.startsWith("/tabs")) {
              router.replace(lastRoute as any);
            } else if (user.role === "admin") {
              router.replace("/tabs/admin_home");
            } else {
              router.replace("/tabs/home");
            }
          }
        }
      } catch (e) {
        console.error("Initial session navigation error:", e);
      } finally {
        setInitialNavDone(true);
      }
    };

    navigateInitial();
  }, [isLoading, isAuthenticated, user, pathname, initialNavDone]);

  // Initialize notifications and listen for notification tap responses
  useEffect(() => {
    notificationService.init();

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Record<string, any> | undefined;
      if (data?.type === 'message') {
        router.push({
          pathname: '/tabs/chat' as any,
          params: data.senderId ? { recipientId: String(data.senderId) } : {},
        });
      } else if (data?.type === 'order' || data?.type === 'quote' || data?.type === 'delivery') {
        router.push('/tabs/notifications' as any);
      }
    });

    return () => {
      responseSubscription.remove();
    };
  }, [router]);

  // Persist the last visited active tab for session restoration
  useEffect(() => {
    if (pathname && pathname.startsWith("/tabs")) {
      AsyncStorage.setItem("lastRoute", pathname).catch(() => {});
    }
  }, [pathname]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="info" />
      <Stack.Screen name="info2" />
      <Stack.Screen name="tabs" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded, setLoaded] = useState(false);

  // Load custom fonts
  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
        });
      } catch (e) {
        console.warn("Font loading error:", e);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}
