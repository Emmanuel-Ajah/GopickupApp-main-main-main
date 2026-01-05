import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { loginUser } from "./api/api";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const router = useRouter();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = '#2E6B19';
    }
  }, []);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await loginUser(formData);
      const { token } = response.data;
      await AsyncStorage.setItem("token", token);
      router.push("/tabs/home");
    } catch (error: any) {
      const message = error.response?.data?.message || "Invalid email or password";
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <View style={Styles.mainContainer}>
      <StatusBar barStyle="light-content" />

      {/* Decorative Background Elements */}
      <View style={[Styles.blob, Styles.blob1]} />
      <View style={[Styles.blob, Styles.blob2]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={Styles.scrollView}
          contentContainerStyle={Styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={Styles.logoContainer}>
            <Image
              source={require("../assets/images/GoPickUpWhite .png")}
              style={Styles.logo}
              resizeMode="contain"
            />
          </View>

          <BlurView intensity={20} tint="light" style={Styles.card}>
            <View style={Styles.headerSection}>
              <Text style={Styles.title}>Login</Text>
              <Text style={Styles.subtitle}>Welcome back! Please enter your details.</Text>
            </View>

            <InputField
              label="Email Address"
              icon="mail-outline"
              placeholder="example@mail.com"
              keyboardType="email-address"
              fieldId="email"
              value={formData.email}
              onChangeText={(text: string) => setFormData({ ...formData, email: text })}
              autoCapitalize="none"
              focusedField={focusedField}
              setFocusedField={setFocusedField}
            />
            <InputField
              label="Password"
              icon="lock-closed-outline"
              placeholder="••••••••"
              secureTextEntry
              fieldId="password"
              value={formData.password}
              onChangeText={(text: string) => setFormData({ ...formData, password: text })}
              focusedField={focusedField}
              setFocusedField={setFocusedField}
            />

            <View style={Styles.actionSection}>
              <TouchableOpacity style={Styles.forgotPassword} onPress={() => { }}>
                <Text style={Styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity style={Styles.googleButton} activeOpacity={0.8}>
                <Image
                  source={require("../assets/images/GoogleLogo.png")}
                  style={Styles.googleIcon}
                />
                <Text style={Styles.googleText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={Styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.9}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#439D25" />
              ) : (
                <>
                  <Text style={Styles.loginButtonText}>Login</Text>
                  <Ionicons name="arrow-forward" size={20} color="#439D25" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={Styles.signupLink} onPress={() => router.push("/signup")}>
              <Text style={Styles.signupLinkText}>Don't have an account? <Text style={Styles.signupLinkBold}>Sign Up</Text></Text>
            </TouchableOpacity>
          </BlurView>

          <View style={Styles.footer}>
            <Text style={Styles.footerText}>KEEP MOVING</Text>
            <View style={Styles.footerLine} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const InputField = ({ label, icon, placeholder, keyboardType = "default", secureTextEntry = false, fieldId, value, onChangeText, autoCapitalize = "sentences", focusedField, setFocusedField }: any) => (
  <View style={Styles.inputGroup}>
    <Text style={Styles.label}>{label}</Text>
    <View style={[
      Styles.inputContainer,
      focusedField === fieldId && Styles.inputContainerFocused
    ]}>
      <Ionicons name={icon} size={20} color={focusedField === fieldId ? "#FFF" : "#FFFFFF80"} style={Styles.inputIcon} />
      <TextInput
        style={[Styles.input, Platform.OS === "web" && ({ outlineStyle: "none" } as any)]}
        placeholder={placeholder}
        placeholderTextColor="#FFFFFF80"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        cursorColor="#FFF"
        onFocus={() => setFocusedField(fieldId)}
        onBlur={() => setFocusedField(null)}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
      />
    </View>
  </View>
);

const Styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#2E6B19",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#2E6B19",
  },
  logoContainer: {
    marginBottom: 40,
    marginTop: 20,
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 80,
  },
  blob: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#439D25",
    opacity: 0.3,
    filter: "blur(60px)",
  },
  blob1: {
    top: -100,
    right: -100,
  },
  blob2: {
    bottom: -100,
    left: -100,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: Dimensions.get("window").height,
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "#2E6B19",
  },
  card: {
    width: width > 500 ? 450 : "100%",
    borderRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 35,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    marginBottom: 40,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  headerSection: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 5,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)", // Increased visibility
    borderRadius: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "transparent",
  },
  inputContainerFocused: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  actionSection: {
    marginTop: 10,
    gap: 15,
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    fontWeight: "600",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  googleText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 12,
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  loginButton: {
    backgroundColor: "#FFFFFF",
    height: 60,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#439D25",
    marginRight: 10,
  },
  signupLink: {
    marginTop: 25,
    alignItems: "center",
  },
  signupLinkText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  signupLinkBold: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  footer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  footerText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 4,
    opacity: 0.6,
  },
  footerLine: {
    width: 40,
    height: 3,
    backgroundColor: "#FFFFFF",
    marginTop: 10,
    borderRadius: 2,
    opacity: 0.3,
  },
});
