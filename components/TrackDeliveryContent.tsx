import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { trackOrder } from "../app/api/api";

export default function TrackDeliveryContent() {
  const [trackingId, setTrackingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);

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
      Alert.alert("Error", error.response?.data?.message || "Order not found. Please check the ID.");
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={{ fontSize: 14, color: "#606060", marginBottom: 5 }}>Status</Text>
          <Text style={{ fontSize: 24, fontWeight: "900", color: "#439D25", marginBottom: 15 }}>{order.status}</Text>

          <View style={{ height: 1, backgroundColor: "#D0E8CD", marginBottom: 15 }} />

          <Text style={{ fontSize: 14, color: "#606060", marginBottom: 2 }}>Order ID</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#000", marginBottom: 12 }}>{order.trackingId}</Text>

          <Text style={{ fontSize: 14, color: "#606060", marginBottom: 2 }}>Delivery to</Text>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>{order.deliveryLocation}</Text>
        </View>
      )}
    </View>
  );
}
