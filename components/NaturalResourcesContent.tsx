import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Items from "./Items";

export default function NaturalResourcesContent({ onAddToCart }: { onAddToCart: (item: any) => void }) {
  const resources = [
    { name: "Coal", price: "N 7,300,000 per trip" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Natural Resources</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {resources.map((item, index) => (
          <Items key={index} name={item.name} price={item.price} onAddToCart={(qty) => onAddToCart({ ...item, quantity: qty })} />
        ))}
      </ScrollView>
    </View>
  );
}

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
