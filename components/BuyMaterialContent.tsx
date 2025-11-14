import React from "react";
import { ScrollView, Text, View } from "react-native";
import Products from "./ProductItems";
export default function BuyMaterialContent() {
  return (
    <>
      <Text
        style={{
          fontSize: 20,
          marginBottom: 10,
          fontWeight: 700,
        }}
      >
        Material
      </Text>
      <ScrollView>
        <Products
          image={require("../assets/images/myImage.jpg")}
          title='Dangote                 Cement'
          size="50kg"
          price="₦5,200"
          available
        />
      </ScrollView>
    </>
  );
}
