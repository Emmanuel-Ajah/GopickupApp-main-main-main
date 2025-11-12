







import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ProductsItems = () => {
  return (
    <View>
      <View
        style={{
          backgroundColor: "white",
          padding: 10,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <View style={styles.FlexItems}>
          <View style={styles.ImageContainer}>
            <View style={styles.Image}></View>
            <Text style={styles.Title}>Dangote {"\n"}Cement</Text>
            <Text style={styles.smallText}>Available</Text>
          </View>
          <View style={styles.SecondItems}>
            <Text style={styles.Size}>50kg</Text>
            <TouchableOpacity style={styles.CartBtn}>
              <Text
                style={{ textAlign: "center", fontSize: 13, color: "white" }}
              >
                Add to Cart
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ProductsItems;

const styles = StyleSheet.create({
  ImageContainer: {
    borderWidth: 0.1,
    width: "50%",
    padding: 8,
    borderRadius: 5,
  },
  Image: {
    backgroundColor: "black",
    width: "100%",
    height: 50,
    borderRadius: 5,
  },
  smallText: {
    fontSize: 10,
    marginTop: 10,
    color: "#439D25",
  },
  Title: {
    marginTop: 10,
  },
  FlexItems: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  SecondItems: {
    width: 100,
  },
  Size: {
    fontSize: 15,
    fontWeight: "900",
    textAlign:'right'
  },
  CartBtn: {
    backgroundColor: "#439D25",
    padding: 10,
    borderRadius: 18,
    marginTop: 10,
  },
});
