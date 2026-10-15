import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { forgotPassword, resetPassword } from "../services/api";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState((params.email as string) || "");
  const [token, setToken] = useState((params.token as string) || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requestingCode, setRequestingCode] = useState(false);

  useEffect(() => {
    if (params.token) setToken(params.token as string);
    if (params.email) setEmail(params.email as string);
  }, [params.token, params.email]);

  const handleRequestCode = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your registered email address.");
      return;
    }

    setRequestingCode(true);
    try {
      const { data } = await forgotPassword({ email: email.trim() });
      const localOtp = data.localToken || data.otp;

      router.push({
        pathname: "/otp",
        params: {
          email: email.trim(),
          flow: "forgot-password",
          ...(localOtp && { localOtp }),
        },
      });
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || "Failed to send recovery code.");
    } finally {
      setRequestingCode(false);
    }
  };

  const handleResetPassword = async () => {
    if (!token.trim()) {
      Alert.alert("Error", "Please enter the recovery / OTP code.");
      return;
    }
    if (!password || password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await resetPassword({ token: token.trim(), password });
      Alert.alert("Success", data.message || "Password updated successfully!");
      router.replace("/login");
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || "Invalid code or connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E6B19" />

      {/* Decorative Blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="key" size={32} color="#439D25" />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your recovery code and create a new secure password.
            </Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Email Field */}
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#777777" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>

            {/* Request code shortcut button */}
            {!token && (
              <TouchableOpacity
                style={styles.requestCodeBtn}
                onPress={handleRequestCode}
                disabled={requestingCode}
              >
                {requestingCode ? (
                  <ActivityIndicator size="small" color="#439D25" />
                ) : (
                  <Text style={styles.requestCodeText}>
                    Send 6-digit OTP code to email
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {/* Code Field */}
            <Text style={styles.label}>Recovery / OTP Code</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#777777" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter 6-digit OTP"
                placeholderTextColor="#A0A0A0"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* New Password */}
            <Text style={styles.label}>New Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#777777" style={styles.inputIcon} />
              <TextInput
                placeholder="At least 8 characters"
                placeholderTextColor="#A0A0A0"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#777777"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#777777" style={styles.inputIcon} />
              <TextInput
                placeholder="Re-enter password"
                placeholderTextColor="#A0A0A0"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Save New Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2E6B19",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 54 : 38,
    paddingBottom: 40,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 6,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAF7",
    borderWidth: 1,
    borderColor: "#E2EBE2",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#111111",
  },
  eyeBtn: {
    padding: 4,
  },
  requestCodeBtn: {
    alignSelf: "flex-end",
    marginTop: 6,
    marginBottom: 6,
  },
  requestCodeText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#439D25",
  },
  submitBtn: {
    height: 52,
    backgroundColor: "#439D25",
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#439D25",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
  blob1: {
    width: 250,
    height: 250,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    top: -30,
    right: -50,
  },
  blob2: {
    width: 300,
    height: 300,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    bottom: -40,
    left: -70,
  },
});
