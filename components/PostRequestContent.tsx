import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function PostRequestContent() {
  return (
    <View style={{ flex: 1, marginTop: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 10 }}>
        Post a request
      </Text>
      {/* <TextInput
        placeholder="Enter material name"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 10,
          padding: 10,
          marginBottom: 15,
        }}
      /> */}
      <TouchableOpacity
        style={{
          backgroundColor: "#439D25",
          padding: 15,
          borderRadius: 10,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>Submit Request</Text>
      </TouchableOpacity>
    </View>
  );
}
