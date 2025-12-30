import React from "react";
import { Text, View } from "react-native";

export const NativeMap = ({ children }: any) => (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F1F1F1" }}>
        <Text>Map view is available only on mobile.</Text>
    </View>
);

export const NativeMarker = () => null;
export const NativeDirections = () => null;
