import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ProductItems = ({ image, title, size, price, available }) => {
  return (
    <View style={styles.card}>
      <View style={styles.FlexItems}>
        <View style={styles.ImageContainer}>
          <Image source={image} style={styles.Image} />
          <Text style={styles.Title}>{title}</Text>
          <Text style={styles.smallText}>
            {available ? "Available" : "Out of Stock"}
          </Text>
          <Text style={styles.price}>{price}</Text>
        </View>

        <View style={styles.SecondItems}>
          <Text style={styles.Size}>{size}</Text>
          <TouchableOpacity style={styles.CartBtn}>
            <Text style={styles.CartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginVertical: 8,
  },
  FlexItems: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ImageContainer: {
    // alignItems: "center",
    borderWidth: 0.1,
    width: "50%",
    padding: 8,
    borderRadius: 5,
  },
  Image: {
    // width: 50,
    // height: 50,
    // borderRadius: 8,
    // marginBottom: 5,

    backgroundColor: "black",
    width: "100%",
    height: 50,
    borderRadius: 5,
  },
  Title: {
    fontWeight: "600",
    fontSize: 14,
    textAlign: "left",
  },
  smallText: {
    color: "green",
    fontSize: 12,
  },
  price: {
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 4,
  },
  SecondItems: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  Size: {
    fontSize: 13,
    fontWeight: "500",
  },
  CartBtn: {
    backgroundColor: "black",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  CartText: {
    textAlign: "center",
    fontSize: 13,
    color: "white",
  },
});

export default ProductItems;