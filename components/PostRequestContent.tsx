import React from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function PostRequestContent() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <Text style={styles.mainTitle}>Post a request</Text>

      <View style={styles.section}>
        <TouchableOpacity style={styles.chooseBtn}>
          <Text style={styles.chooseBtnText}>Preferred Vehicle Type</Text>
        </TouchableOpacity>
      </View>

      {/* Load Type Section */}
      <View style={styles.fieldSection}>
        <Text style={styles.label}>Load type / Goods description</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter pickup location"
            placeholderTextColor="#C0C0C0"
          />
        </View>
        <Text style={styles.hintText}>
          e.g. cartons of bottle water, electronics, groceries.
        </Text>
      </View>

      {/* Pickup Location Section */}
      <View style={styles.fieldSection}>
        <Text style={styles.label}>Pickup Location</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter pickup location"
            placeholderTextColor="#C0C0C0"
          />
        </View>
      </View>

      {/* Delivery Destination Section */}
      <View style={styles.fieldSection}>
        <Text style={styles.label}>Delivery Destination</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter Delivery Destination"
            placeholderTextColor="#C0C0C0"
          />
        </View>
      </View>

      {/* Package Description Section */}
      <View style={styles.fieldSection}>
        <Text style={styles.label}>Package Description</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Enter Description of item"
            placeholderTextColor="#C0C0C0"
          />
        </View>
      </View>

      {/* Contact Information Section */}
      <View style={styles.fieldSection}>
        <Text style={styles.label}>Contact Information</Text>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#C0C0C0"
          />
        </View>
        <View style={[styles.inputWrapper, { marginTop: 10 }]}>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#C0C0C0"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.postBtn}>
          <Text style={styles.postBtnText}>Post</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000",
    marginBottom: 25,
  },
  section: {
    marginBottom: 30,
  },
  chooseBtn: {
    backgroundColor: "#439D25",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
  },
  chooseBtnText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },
  fieldSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 44,
    justifyContent: "center",
  },
  input: {
    fontSize: 15,
    color: "#000",
    fontWeight: "400",
  },
  hintText: {
    fontSize: 11,
    color: "#808080",
    marginTop: 6,
    fontWeight: "400",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  postBtn: {
    backgroundColor: "#439D25",
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 25,
  },
  postBtnText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
