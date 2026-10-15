import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, StatusBar, Text, View } from "react-native";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function HomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "admin") {
        router.replace("/tabs/admin_home");
      } else {
        router.replace("/tabs/home");
      }
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || isAuthenticated) {
    return (
      <View style={{ flex: 1, backgroundColor: "#439D25", justifyContent: "center", alignItems: "center" }}>
        <StatusBar barStyle="light-content" backgroundColor="#439D25" />
        <Image
          source={require("../assets/images/GoPickUpWhite .png")}
          style={{ width: 220, height: 88 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="small" color="#FFFFFF" style={{ marginTop: 28 }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#439D25" }}>
      <StatusBar hidden={true} />
      <View style={Styles.centered}>
        <Image
          source={require("../assets/images/GoPickUpWhite .png")}
          style={{ width: 211, height: 84 }}
          resizeMode="contain"
        />
      </View>
      <View style={Styles.buttonGroup}>
        <Button
          style={{ borderWidth: 1, borderColor: "white" }}
          textStyle={{ color: "white" }}
          title="Login"
          onPress={() => router.push("/login")}
          variant="outlined"
        />
        <Button
          style={{ backgroundColor: "white" }}
          textStyle={{ color: "#439D25" }}
          title="Sign Up"
          onPress={() => router.push("/signup")}
          variant="filled"
        />
        <GoogleSignInButton onPress={() => {}} />
      </View>
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          alignItems: "center",
          marginBottom: 50,
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 13, letterSpacing: 1.5, fontWeight: "600" }}>
          KEEP MOVING
        </Text>
      </View>
    </View>
  );
}

const Styles = {
  centered: {
    alignItems: "center" as const,
    marginTop: 140,
  },
  buttonGroup: {
    alignItems: "center" as const,
    marginTop: 100,
  },
};
