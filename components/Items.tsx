import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface ItemProps {
  name: string;
  price: string;
  onAddToCart: (quantity: number) => void;
}

const Items: React.FC<ItemProps> = ({ name, price, onAddToCart }) => {
  const [quantity, setQuantity] = useState("1");

  const increment = () => setQuantity((prev) => (parseInt(prev) + 1).toString());
  const decrement = () => setQuantity((prev) => (parseInt(prev) > 1 ? (parseInt(prev) - 1).toString() : "1"));

  const handleQtyChange = (val: string) => {
    // only allow numbers
    const cleaned = val.replace(/[^0-9]/g, "");
    setQuantity(cleaned || "1");
  };

  // Extract numeric price for calculations
  const numericPrice = parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
  const qtyNum = parseInt(quantity) || 1;
  const totalPrice = numericPrice * qtyNum;

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

        <View style={styles.rightSection}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity onPress={decrement} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.qtyInput}
              value={quantity}
              onChangeText={handleQtyChange}
              keyboardType="numeric"
              maxLength={4}
            />
            <TouchableOpacity onPress={increment} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.addToChartBtn} onPress={() => onAddToCart(qtyNum)}>
            <Text style={styles.addToChartText}>Add N ${totalPrice.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>
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
  rightSection: {
    alignItems: "flex-end",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  qtyBtn: {
    backgroundColor: "#EFF7EE",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#439D25",
  },
  qtyBtnText: {
    color: "#439D25",
    fontSize: 18,
    fontWeight: "700",
  },
  qtyInput: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    textAlign: "center",
    width: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 5,
    paddingVertical: 2,
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
    minWidth: 100,
  },
  addToChartText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default Items;
