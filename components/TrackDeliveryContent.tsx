import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { acceptQuote, createReview, recordPayment, trackOrder } from "../services/api";
import PaystackPaymentModal from "./PaystackPaymentModal";
import RatingModal from "./RatingModal";

export default function TrackDeliveryContent() {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [ratingVisible, setRatingVisible] = useState(false);
  const [paystackVisible, setPaystackVisible] = useState(false);

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      Alert.alert("Error", "Please enter a tracking ID");
      return;
    }

    setLoading(true);
    setOrder(null);
    try {
      const response = await trackOrder(trackingId.trim());
      setOrder(response.data);
    } catch (error: any) {
      console.error("Tracking error:", error);
      const msg = error.response?.data?.message || "Order not found. Please check the ID.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePaySuccess = async (data: { reference: string }) => {
    setPaystackVisible(false);
    if (!order) return;
    try {
      const result = await recordPayment(order._id, {
        reference: data.reference,
        paymentMethod: "Paystack",
      });
      setOrder(result.data);
      Alert.alert("Success", "Payment successfully verified and recorded via Paystack!");
    } catch (err: any) {
      Alert.alert("Payment Notice", err.response?.data?.message || "Payment processed on Paystack.");
    }
  };

  const handleRatingSubmit = async (reviewData: any) => {
    try {
      await createReview({
        orderId: order._id,
        ...reviewData,
      });
      Alert.alert("Success", "Thank you for your feedback!");
      setRatingVisible(false);
    } catch (error: any) {
      console.error("Review error:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to submit review.");
    }
  };

  const payableAmount = order
    ? order.negotiatedPrice > 0
      ? order.negotiatedPrice
      : order.totalAmount > 0
      ? order.totalAmount
      : 0
    : 0;

  const isPaid = order?.paymentStatus === "Paid";

  return (
    <View style={{ flex: 1, marginTop: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
        Track Your Delivery
      </Text>
      <TextInput
        placeholder="Enter tracking ID (e.g. #TRK-XXXX)"
        value={trackingId}
        onChangeText={setTrackingId}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 12,
          marginBottom: 15,
          fontSize: 16,
        }}
      />
      <TouchableOpacity
        onPress={handleTrack}
        disabled={loading}
        style={{
          backgroundColor: "#439D25",
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>Track Now</Text>
        )}
      </TouchableOpacity>

      {order && (
        <View style={{ marginTop: 25, padding: 20, backgroundColor: "#F0F9EF", borderRadius: 15, borderWidth: 1, borderColor: "#439D25" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <Text style={{ fontSize: 14, color: "#606060" }}>Status</Text>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: isPaid ? "#E6F6E6" : "#FEF3C7",
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 10,
              gap: 4,
            }}>
              <Ionicons name={isPaid ? "checkmark-circle" : "time-outline"} size={12} color={isPaid ? "#439D25" : "#D97706"} />
              <Text style={{ fontSize: 11, fontWeight: "700", color: isPaid ? "#439D25" : "#D97706" }}>
                {isPaid ? "Paid" : "Unpaid"}
              </Text>
            </View>
          </View>

          <Text style={{ fontSize: 24, fontWeight: "900", color: "#439D25", marginBottom: 15 }}>{order.status}</Text>

          <View style={{ height: 1, backgroundColor: "#D0E8CD", marginBottom: 15 }} />

          <Text style={{ fontSize: 14, color: "#606060", marginBottom: 2 }}>Order ID</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#000", marginBottom: 12 }}>{order.trackingId}</Text>

          <Text style={{ fontSize: 14, color: "#606060", marginBottom: 2 }}>Delivery to</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#000", marginBottom: 15 }}>{order.deliveryLocation}</Text>

          {order.totalAmount > 0 && (
            <Text style={{ fontSize: 14, color: "#444", marginBottom: 4 }}>
              Materials: ₦{order.totalAmount.toLocaleString()}
            </Text>
          )}

          {order.negotiatedPrice > 0 && (
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111", marginBottom: 15 }}>
              Delivery Quote: ₦{order.negotiatedPrice.toLocaleString()}
            </Text>
          )}

          {order.status === 'Pending Negotiation' && order.negotiatedPrice > 0 && (
            <TouchableOpacity
              style={{
                backgroundColor: "#439D25",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
                marginBottom: 10,
              }}
              onPress={async () => {
                try {
                  const result = await acceptQuote(order._id);
                  setOrder(result.data);
                } catch (error: any) {
                  Alert.alert('Error', error.response?.data?.message || 'Unable to accept quote');
                }
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                Accept quote: ₦{order.negotiatedPrice.toLocaleString()}
              </Text>
            </TouchableOpacity>
          )}

          {/* Pay with Paystack Button */}
          {!isPaid && payableAmount > 0 && (
            <TouchableOpacity
              onPress={() => setPaystackVisible(true)}
              style={{
                backgroundColor: "#0BA4DB",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons name="card-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
                Pay ₦{payableAmount.toLocaleString()} with Paystack
              </Text>
            </TouchableOpacity>
          )}

          {order.status === 'Delivered' && (
            <TouchableOpacity
              onPress={() => setRatingVisible(true)}
              style={{
                backgroundColor: "#FFF9E6",
                padding: 12,
                borderRadius: 10,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#DAA520",
              }}
            >
              <Text style={{ color: "#DAA520", fontWeight: "700" }}>Rate Experience 🌟</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {order && paystackVisible && (
        <PaystackPaymentModal
          visible={paystackVisible}
          amount={payableAmount}
          email={order.user?.email || "customer@gopickup.com.ng"}
          reference={`track_pay_${order.trackingId}_${Date.now()}`}
          title={`Pay #${order.trackingId}`}
          onSuccess={handlePaySuccess}
          onClose={() => setPaystackVisible(false)}
          metadata={{ orderId: order._id, trackingId: order.trackingId }}
        />
      )}

      <RatingModal
        visible={ratingVisible}
        onClose={() => setRatingVisible(false)}
        onSubmit={handleRatingSubmit}
        riderName="GoPickup delivery team"
      />
    </View>
  );
}
