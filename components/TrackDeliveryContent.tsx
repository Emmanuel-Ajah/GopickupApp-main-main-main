import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

export default function TrackDeliveryContent() {
  return (
    <View style={{ flex: 1, marginTop: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
        Track Your Delivery
      </Text>
      <TextInput
        placeholder="Enter tracking ID"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 10,
          marginBottom: 15,
        }}
      />
      <TouchableOpacity
        style={{
          backgroundColor: "#439D25",
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>Track Now</Text>
      </TouchableOpacity>
    </View>
  );
}
