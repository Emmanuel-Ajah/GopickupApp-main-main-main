import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Google from "expo-auth-session/providers/google";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
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
import { GOOGLE_CONFIG } from "../constants/Config";
import { googleLogin, registerUser } from "./api/api";

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get("window");

export default function SignupScreen() {
  const router = useRouter();
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CONFIG.webClientId,
    iosClientId: GOOGLE_CONFIG.iosClientId,
    androidClientId: GOOGLE_CONFIG.androidClientId,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setLoading(true);
    try {
      console.log("Attempting Google login...");
      const res = await googleLogin({ idToken });
      console.log("Google login success:", res.data);
      const { token, isNewUser, ...userData } = res.data;
      
      const msg = isNewUser 
        ? "Account created successfully with Google!" 
        : `Welcome back, ${userData.name || 'user'}! (Account already exists)`;

      if (Platform.OS === 'web') alert(msg);
      else Alert.alert("Success", msg);

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      router.push("/tabs/home");
    } catch (error: any) {
      console.error("Google login error:", error);
      const message = error.response?.data?.message || "Google login failed";
      if (Platform.OS === 'web') alert(message);
      else Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.backgroundColor = '#2E6B19';
    }
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      if (Platform.OS === 'web') {
        alert("Please fill in all required fields (Name, Email, Password)");
      } else {
        Alert.alert("Error", "Please fill in all required fields (Name, Email, Password)");
      }
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting signup with:", formData);
      const response = await registerUser(formData);
      console.log("Signup success:", response.data);
      if (Platform.OS === 'web') {
        alert("Account created successfully!");
      } else {
        Alert.alert("Success", "Account created successfully!");
      }
      router.push("/login");
    } catch (error: any) {
      console.error("Signup error:", error);
      const message = error.response?.data?.message || "Something went wrong";
      if (Platform.OS === 'web') {
        alert("Registration Failed: " + message);
      } else {
        Alert.alert("Registration Failed", message);
      }
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
          <BlurView intensity={20} tint="light" style={Styles.card}>
            <View style={Styles.headerSection}>
              <Text style={Styles.title}>Create Account</Text>
              <Text style={Styles.subtitle}>Sign up to get started with GoPickup</Text>
            </View>

            <InputField label="Full Name" icon="person-outline" placeholder="Enter your full name" fieldId="name" value={formData.name} onChangeText={(text: string) => setFormData({ ...formData, name: text })} focusedField={focusedField} setFocusedField={setFocusedField} />
            <InputField label="Email Address" icon="mail-outline" placeholder="example@mail.com" keyboardType="email-address" fieldId="email" value={formData.email} onChangeText={(text: string) => setFormData({ ...formData, email: text })} autoCapitalize="none" focusedField={focusedField} setFocusedField={setFocusedField} />
            <InputField label="Phone Number" icon="call-outline" placeholder="+234 ..." keyboardType="phone-pad" fieldId="phone" value={formData.phone} onChangeText={(text: string) => setFormData({ ...formData, phone: text })} focusedField={focusedField} setFocusedField={setFocusedField} />
            <InputField label="Password" icon="lock-closed-outline" placeholder="••••••••" secureTextEntry={true} fieldId="password" value={formData.password} onChangeText={(text: string) => setFormData({ ...formData, password: text })} focusedField={focusedField} setFocusedField={setFocusedField} />

            <View style={Styles.actionSection}>
              <TouchableOpacity style={Styles.forgotPassword} onPress={() => { }}>
                <Text style={Styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={Styles.googleButton}
                activeOpacity={0.8}
                disabled={!request || loading}
                onPress={() => promptAsync()}
              >
                <Image
                  source={require("../assets/images/GoogleLogo.png")}
                  style={Styles.googleIcon}
                />
                <Text style={Styles.googleText}>Continue with Google</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={Styles.signUpButton}
              onPress={handleSignup}
              activeOpacity={0.9}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#439D25" />
              ) : (
                <>
                  <Text style={Styles.signUpButtonText}>Sign Up</Text>
                  <Ionicons name="arrow-forward" size={20} color="#439D25" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={Styles.loginLink} onPress={() => router.push("/login")}>
              <Text style={Styles.loginLinkText}>Already have an account? <Text style={Styles.loginLinkBold}>Login</Text></Text>
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

const InputField = ({ label, icon, placeholder, keyboardType = "default", secureTextEntry = false, fieldId, value, onChangeText, autoCapitalize = "sentences", focusedField, setFocusedField }: any) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
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
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          cursorColor="#FFF"
          onFocus={() => setFocusedField(fieldId)}
          onBlur={() => setFocusedField(null)}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={autoCapitalize}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={Styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={focusedField === fieldId ? "#FFF" : "#FFFFFF80"}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const Styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#2E6B19",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#2E6B19",
  },
  blob: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#439D25",
    opacity: 0.3,
    filter: "blur(60px)", // Works on web
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
    backgroundColor: "rgba(255, 255, 255, 0.05)", // Subtle backing for blur
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
  signUpButton: {
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
  signUpButtonText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#439D25",
    marginRight: 10,
  },
  loginLink: {
    marginTop: 25,
    alignItems: "center",
  },
  loginLinkText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  loginLinkBold: {
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
  eyeIcon: {
    padding: 5,
  },
});
