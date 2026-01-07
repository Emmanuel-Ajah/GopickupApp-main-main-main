import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ItemProps {
  name: string;
  price: string;
  onAddToCart: () => void;
}

const Items: React.FC<ItemProps> = ({ name, price, onAddToCart }) => {
  return (
    <View style={styles.cardContainer}>
      <View style={styles.cardHeader}>
        <View style={styles.titleSection}>
          <Text style={styles.itemName}>{name}</Text>
          <TouchableOpacity style={styles.arrowButton}>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.priceSection}>
          <Text style={styles.availableLabel}>Available</Text>
          <Text style={styles.priceText}>{price}</Text>
        </View>

        <TouchableOpacity style={styles.addToChartBtn} onPress={onAddToCart}>
          <Text style={styles.addToChartText}>Add to Chart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  titleSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
    marginRight: 10,
  },
  arrowButton: {
    backgroundColor: "#000",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  priceSection: {
    flex: 1,
  },
  availableLabel: {
    fontSize: 12,
    color: "#808080",
    marginBottom: 4,
    fontWeight: "600",
  },
  priceText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#439D25",
  },
  addToChartBtn: {
    backgroundColor: "#439D25",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  addToChartText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
  },
});

export default Items;
