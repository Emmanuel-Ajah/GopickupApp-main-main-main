import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

interface ProductProps {
  image: any;
  title: string;
  size: string;
  price: string;
  available: boolean;
  onAddToCart: (quantity: number) => void;
}

const ProductItems: React.FC<ProductProps> = ({ image, title, size, price, available, onAddToCart }) => {
  const [quantity, setQuantity] = useState("1");

  const increment = () => setQuantity((prev) => (parseInt(prev) + 1).toString());
  const decrement = () => setQuantity((prev) => (parseInt(prev) > 1 ? (parseInt(prev) - 1).toString() : "1"));

  const handleQtyChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setQuantity(cleaned || "1");
  };

  // Extract numeric price for calculations (e.g., "N 5,500" -> 5500)
  const numericPrice = parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
  const qtyNum = parseInt(quantity) || 1;
  const totalPrice = numericPrice * qtyNum;

  return (
    <View style={styles.card}>
      <View style={styles.contentRow}>
        {/* Left Column */}
        <View style={styles.leftColumn}>
          <View style={styles.imageWrapper}>
            <Image source={image} style={styles.productImage} resizeMode="cover" />
          </View>
          <Text style={styles.titleText}>{title}</Text>
          <View style={styles.pricingSection}>
            <Text style={styles.statusText}>
              {available ? "Available" : "Out of Stock"}
            </Text>
            <Text style={styles.priceText}>{price}</Text>
          </View>
        </View>

        {/* Right Column */}
        <View style={styles.rightColumn}>
          <Text style={styles.specText}>{size}</Text>

          {/* Quantity Selector */}
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

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAddToCart(qtyNum)}
          >
            <Text style={styles.addButtonText}>Add N {totalPrice.toLocaleString()}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  leftColumn: {
    flex: 1,
    paddingRight: 15,
  },
  imageWrapper: {
    width: "100%",
    height: 80,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#EFF7EE",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  titleText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000",
    marginBottom: 8,
    lineHeight: 20,
  },
  pricingSection: {
    marginTop: "auto",
  },
  statusText: {
    fontSize: 11,
    color: "#439D25",
    fontWeight: "600",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#439D25",
    marginTop: 2,
  },
  rightColumn: {
    width: "40%",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  specText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000",
    textAlign: "right",
    marginTop: 10,
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
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#439D25",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 100,
  },
  addButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default ProductItems;