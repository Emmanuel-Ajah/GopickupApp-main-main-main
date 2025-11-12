import React from "react";
import { ScrollView, Text } from "react-native";
import Items from "./Items";

export default function NaturalResourcesContent() {
  return (
    <>
      <Text
        style={{
          fontSize: 20,
          marginBottom: 10,
          fontWeight: 700,
        }}
      >
        Natural Resources
      </Text>
      <ScrollView>
        <Items />
        <Items />
        <Items />
      </ScrollView>
    </>
  );
}
