import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { WebView } from "react-native-webview";
import haptic from "../utils/haptics";

export interface PaystackPaymentModalProps {
  visible: boolean;
  amount: number; // in Naira, e.g. 5000
  email: string;
  reference?: string;
  onSuccess: (data: { reference: string; status?: string }) => void;
  onClose: () => void;
  metadata?: Record<string, any>;
  title?: string;
}

export default function PaystackPaymentModal({
  visible,
  amount,
  email,
  reference,
  onSuccess,
  onClose,
  metadata = {},
  title = "Complete Payment",
}: PaystackPaymentModalProps) {
  const paystackKey =
    process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY ||
    "pk_test_f6ec6d17b011409f98aa55cf73c1d431057ea783";

  const paymentRef =
    reference ||
    `gopickup_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

  const amountInKobo = Math.round(Number(amount) * 100);
  const userEmail = email?.trim() || "customer@gopickup.com.ng";

  const paystackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Paystack Payment</title>
  <script src="https://js.paystack.co/v1/inline.js"></script>
  <style>
    * { box-sizing: border-box; }
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: #F8FAF8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .loading-card {
      text-align: center;
      padding: 30px;
      color: #333;
    }
    .spinner {
      border: 4px solid #E0E0E0;
      border-top: 4px solid #439D25;
      border-radius: 50%;
      width: 44px;
      height: 44px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="loading-card">
    <div class="spinner"></div>
    <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px;">Opening Secure Checkout...</div>
    <div style="font-size: 13px; color: #666;">Secured by Paystack</div>
  </div>

  <script>
    function sendToRN(payload) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    }

    function initPayment() {
      try {
        var handler = PaystackPop.setup({
          key: '${paystackKey}',
          email: '${userEmail}',
          amount: ${amountInKobo},
          currency: 'NGN',
          ref: '${paymentRef}',
          metadata: ${JSON.stringify(metadata)},
          callback: function(response) {
            sendToRN({ event: 'success', data: response });
          },
          onClose: function() {
            sendToRN({ event: 'close' });
          }
        });
        handler.openIframe();
      } catch (err) {
        sendToRN({ event: 'error', message: err.message || 'Payment initialization failed' });
      }
    }

    if (window.PaystackPop) {
      initPayment();
    } else {
      window.onload = initPayment;
    }
  </script>
</body>
</html>
`;

  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.event === "success") {
        await haptic.successNotification();
        onSuccess({
          reference: data.data?.reference || paymentRef,
          status: "success",
        });
      } else if (data.event === "close") {
        await haptic.lightImpact();
        onClose();
      } else if (data.event === "error") {
        await haptic.errorNotification();
        Alert.alert("Payment Notice", data.message || "Payment cancelled or unavailable.");
        onClose();
      }
    } catch (e) {
      console.warn("Paystack onMessage parse error:", e);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={async () => {
              await haptic.lightImpact();
              onClose();
            }}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={26} color="#000" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>
              Amount: ₦{Number(amount).toLocaleString()}
            </Text>
          </View>

          <View style={styles.badgeContainer}>
            <View style={styles.paystackBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#0BA4DB" />
              <Text style={styles.paystackBadgeText}>Paystack</Text>
            </View>
          </View>
        </View>

        {/* WebView Container */}
        <View style={styles.webViewContainer}>
          <WebView
            source={{ html: paystackHtml }}
            originWhitelist={["*"]}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={handleMessage}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#439D25" />
                <Text style={styles.loadingText}>Loading Paystack...</Text>
              </View>
            )}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAF8",
    paddingTop: Platform.OS === "android" ? 30 : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  closeBtn: {
    padding: 6,
  },
  titleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#439D25",
    marginTop: 2,
  },
  badgeContainer: {
    width: 65,
    alignItems: "flex-end",
  },
  paystackBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F6FC",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  paystackBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0BA4DB",
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#F8FAF8",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#606060",
    fontWeight: "500",
  },
});
