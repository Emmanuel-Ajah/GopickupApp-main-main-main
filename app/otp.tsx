import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import { useAuth } from "../context/AuthContext";
import { sendOtp, verifyOtp } from "../services/api";
import haptic from "../utils/haptics";

const { width } = Dimensions.get("window");

export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { login } = useAuth();

  const email = (params.email as string) || "";
  const flow = (params.flow as string) || "verification"; // 'signup' | 'forgot-password' | 'verification'

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // References to the 6 TextInput elements
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Auto-fill test code in development mode if provided in params
  useEffect(() => {
    if (params.localOtp && typeof params.localOtp === "string" && params.localOtp.length === 6) {
      const chars = params.localOtp.split("");
      setOtp(chars);
    }
  }, [params.localOtp]);

  // Resend Countdown Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    haptic.selection();
    // Check if user pasted a multi-digit code (e.g. 6 digits)
    if (value.length > 1) {
      const pastedDigits = value.replace(/[^0-9]/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedDigits[i] || "";
      }
      setOtp(newOtp);
      const nextFocus = Math.min(pastedDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const cleanVal = value.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto-advance to next input if digit entered
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      haptic.selection();
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      await haptic.warningNotification();
      Alert.alert("Incomplete Code", "Please enter all 6 digits of the verification code.");
      return;
    }

    await haptic.mediumImpact();
    setLoading(true);
    try {
      const res = await verifyOtp({ email, otp: fullOtp });
      const { user, token, resetToken } = res.data;

      await haptic.successNotification();

      if (flow === "forgot-password") {
        Alert.alert("Verified", "Code verified successfully. Set your new password.");
        router.replace({
          pathname: "/reset-password",
          params: { email, token: resetToken || fullOtp },
        });
      } else if (flow === "signup" || flow === "login") {
        if (token && user) {
          await login(token, user);
        }
        Alert.alert("Success", "Account verified successfully!");
        router.replace("/tabs/home");
      } else {
        if (token && user) {
          await login(token, user);
        }
        Alert.alert("Success", "Verification completed successfully!");
        router.replace("/tabs/home");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      await haptic.errorNotification();
      const msg = error.response?.data?.message || "Invalid or expired verification code.";
      Alert.alert("Verification Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || resending) return;

    await haptic.lightImpact();
    setResending(true);
    try {
      const res = await sendOtp({ email, purpose: flow });
      const message = res.data?.message || "A new code has been sent.";
      const newLocalOtp = res.data?.localOtp || res.data?.otp;

      await haptic.successNotification();
      Alert.alert(
        "Code Resent",
        newLocalOtp ? `${message}\n(Code: ${newLocalOtp})` : message
      );

      if (newLocalOtp && newLocalOtp.length === 6) {
        setOtp(newLocalOtp.split(""));
      } else {
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }

      setTimer(60);
      setCanResend(false);
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      await haptic.errorNotification();
      Alert.alert("Resend Failed", error.response?.data?.message || "Could not resend code.");
    } finally {
      setResending(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E6B19" />

      {/* Decorative Brand Blobs */}
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
          {/* Top Back Navigation Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            accessibilityLabel="Back"
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Icon Badge */}
          <View style={styles.badgeWrapper}>
            <View style={styles.badgeCircle}>
              <Ionicons name="shield-checkmark" size={38} color="#439D25" />
            </View>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Verification Code</Text>
          <Text style={styles.subtitle}>
            Please enter the 6-digit code sent to{"\n"}
            <Text style={styles.highlightEmail}>{email || "your email"}</Text>
          </Text>

          {/* Local testing helper pill if available */}
          {params.localOtp && (
            <TouchableOpacity
              style={styles.testOtpPill}
              onPress={() => {
                const code = params.localOtp as string;
                if (code.length === 6) setOtp(code.split(""));
              }}
            >
              <Ionicons name="key-outline" size={14} color="#2E6B19" />
              <Text style={styles.testOtpText}>
                Demo Code: {params.localOtp} (Tap to insert)
              </Text>
            </TouchableOpacity>
          )}

          {/* 6-Digit OTP Box Grid */}
          <View style={styles.otpBoxesRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : undefined,
                ]}
                keyboardType="number-pad"
                maxLength={index === 0 ? 6 : 1}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectTextOnFocus
                textAlign="center"
              />
            ))}
          </View>

          {/* Verify Action Button */}
          <TouchableOpacity
            style={[
              styles.verifyBtn,
              otp.join("").length < 6 && styles.verifyBtnDisabled,
            ]}
            onPress={handleVerify}
            disabled={loading || otp.join("").length < 6}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyBtnText}>Verify & Proceed</Text>
            )}
          </TouchableOpacity>

          {/* Resend Code Section */}
          <View style={styles.resendRow}>
            <Text style={styles.resendPrompt}>Didn&apos;t receive code? </Text>
            {canResend ? (
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resending}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.resendBtnText}>
                  {resending ? "Sending..." : "Resend Code"}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                Resend in {formatTimer(timer)}
              </Text>
            )}
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
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 58 : 42,
    paddingBottom: 40,
    alignItems: "center",
  },
  backBtn: {
    alignSelf: "flex-start",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  badgeWrapper: {
    marginTop: 10,
    marginBottom: 24,
  },
  badgeCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14.5,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  highlightEmail: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  testOtpPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  testOtpText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#2E6B19",
    marginLeft: 6,
  },
  otpBoxesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 36,
    paddingHorizontal: 4,
  },
  otpBox: {
    width: (width - 48 - 40) / 6,
    height: 56,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderWidth: 2,
    borderColor: "transparent",
    fontSize: 22,
    fontWeight: "800",
    color: "#1E3B11",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: "#439D25",
    backgroundColor: "#FFFFFF",
  },
  verifyBtn: {
    width: "100%",
    height: 54,
    backgroundColor: "#439D25",
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  verifyBtnDisabled: {
    opacity: 0.55,
  },
  verifyBtnText: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  resendPrompt: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.75)",
  },
  resendBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#A7F3D0",
    textDecorationLine: "underline",
  },
  timerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
  blob1: {
    width: 260,
    height: 260,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    top: -40,
    right: -60,
  },
  blob2: {
    width: 320,
    height: 320,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    bottom: -60,
    left: -80,
  },
});
