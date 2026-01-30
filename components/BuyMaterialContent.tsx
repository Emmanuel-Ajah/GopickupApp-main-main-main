import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Products from "./ProductItems";

export default function BuyMaterialContent({
  onAddToCart,
}: {
  onAddToCart: (item: any) => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Materials</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {products.map((item, index) => (
          <Products
            key={index}
            image={item.image}
            title={item.title}
            size={item.size}
            price={item.price}
            available={item.available}
            onAddToCart={(qty) => onAddToCart({ ...item, quantity: qty })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const products = [
  {
    title: "Dangote Cement",
    size: "50kg",
    price: "N 5,500",
    available: true,
    image: require("../assets/images/DangoteCement.png"),
  },
  {
    title: "BUA Cement",
    size: "50kg",
    price: "N 5,500",
    available: true,
    image: require("../assets/images/BUACement.jpg"),
  },
  {
    title: "Mangal Cement",
    size: "50kg",
    price: "N 5,500",
    available: true,
    image: require("../assets/images/MangalCement.jpg"),
  },
  {
    title: "Roofing Sheet",
    size: "Zinc",
    price: "N 3,000/sqm",
    available: true,
    image: require("../assets/images/ZincRoofing.png"),
  },
  {
    title: "Steel Rods",
    size: "12mm, 16mm",
    price: "N 9,800 per bundle",
    available: true,
    image: require("../assets/images/SteelRods.png"),
  },
  {
    title: "Hollow Blocks",
    size: "9 inches",
    price: "N 600 each",
    available: true,
    image: require("../assets/images/HollowBlocks9.png"),
  },
  {
    title: "Hollow Blocks",
    size: "6 inches",
    price: "N 500 each",
    available: true,
    image: require("../assets/images/HollowBlocks6.png"),
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
    marginBottom: 20,
    marginTop: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
