import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ProductProps {
  image: any;
  title: string;
  size: string;
  price: string;
  available: boolean;
}

const ProductItems: React.FC<ProductProps> = ({ image, title, size, price, available }) => {
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
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Add to Chart</Text>
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
  addButton: {
    backgroundColor: "#439D25",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  addButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});

export default ProductItems;