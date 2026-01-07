import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Items from "./Items";

export default function NaturalResourcesContent({ onAddToCart }: { onAddToCart: (item: any) => void }) {
  const coalItems = [
    { name: "Coal", price: "N 7,300,000 per trip" },
  ];

  const quarryItems = [
    { name: "Pure Dust (Dust 1)", price: "N 9,600 per ton" },
    { name: "Stone Dust (Dust 2)", price: "N 9,600 per ton" },
    { name: "3/8", price: "N 9,600 per ton" },
    { name: "Half inch", price: "N 9,600 per ton" },
    { name: "3/4", price: "N 9,600 per ton" },
    { name: "1 inch", price: "N 9,600 per ton" },
    { name: "Hard core", price: "N 9,600 per ton" },
    { name: "Boulder", price: "N 9,600 per ton" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Natural Resources</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Coal</Text>
        {coalItems.map((item, index) => (
          <Items key={`coal-${index}`} name={item.name} price={item.price} onAddToCart={(qty) => onAddToCart({ ...item, quantity: qty })} />
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Quarry Materials</Text>
        {quarryItems.map((item, index) => (
          <Items key={`quarry-${index}`} name={item.name} price={item.price} onAddToCart={(qty) => onAddToCart({ ...item, quantity: qty })} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#439D25",
    marginBottom: 10,
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
