import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { NativeDirections, NativeMap, NativeMarker } from "@/components/maps/NativeMap";

const GOOGLE_MAPS_APIKEY = "YOUR_API_KEY"; // Replace this

const MapScreen = () => {
  const origin = { latitude: 6.5244, longitude: 3.3792 };
  const destination = { latitude: 6.465422, longitude: 3.406448 };

  return (
    <ScrollView style={styles.screen}>
      <View>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Map</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={26} color="#1E1E1E" />
          </TouchableOpacity>
        </View>

        {/* User Card */}
        <View style={styles.userCard}>
          <Image
            source={require("../../assets/images/myImage.jpg")}
            style={styles.userImage}
          />
          <View>
            <Text style={styles.userName}>Azih Monica</Text>
            <View style={styles.userIdRow}>
              <Text style={styles.userIdBadge}>User ID</Text>
              <Text style={styles.userIdText}>D422Q7827</Text>
            </View>
          </View>
        </View>

        {/* Map */}
        <View style={styles.mapWrapper}>
          <NativeMap
            style={styles.map}
            initialRegion={{
              latitude: origin.latitude,
              longitude: origin.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <NativeDirections
              origin={origin}
              destination={destination}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor="#439D25"
            />

            <NativeMarker coordinate={origin}>
              <View style={styles.markerContainer}>
                <Image
                  source={require("../../assets/images/myImage.jpg")}
                  style={styles.markerImage}
                />
              </View>
            </NativeMarker>

            <NativeMarker coordinate={destination}>
              <View style={styles.markerContainer}>
                <Image
                  source={require("../../assets/images/myImage.jpg")}
                  style={styles.markerImage}
                />
              </View>
            </NativeMarker>
          </NativeMap>

          {/* Route Info Bubble */}
          {Platform.OS !== "web" && (
            <View style={styles.infoBubble}>
              <Text style={styles.infoTime}>40 mins</Text>
            </View>
          )}
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <View>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={{ marginTop: 6 }}>
              <Text style={styles.statusItem}>📦 Delivered</Text>
              <Text style={styles.receivedText}>Received ✔</Text>
            </View>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Rate Service</Text>
            <View style={{ flexDirection: "row", marginTop: 6 }}>
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Ionicons
                    key={i}
                    name="star-outline"
                    size={22}
                    color="#000"
                    style={{ marginRight: 3 }}
                  />
                ))}
            </View>
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Delivery details</Text>
          <Text style={styles.detailsText}>
            Time: <Text style={styles.detailsBold}>03:37pm</Text>
          </Text>
          <Text style={styles.detailsText}>
            Route: <Text style={styles.detailsBold}>Wuse → Asokoro</Text>
          </Text>
        </View>

        <View style={{ alignItems: "flex-end", marginRight: 20 }}>
          <TouchableOpacity
            style={{
              backgroundColor: "#439D25",
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 100,
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '900', color: 'white' }}>Track</Text>
          </TouchableOpacity>
        </View>

        <StatusBar hidden />
      </View>
    </ScrollView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 0.3,
    borderBottomColor: "#E5E5E5",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1E1E1E",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    width: "90%",
    height: 65,
    backgroundColor: "white",
    borderRadius: 40,
    marginTop: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  userImage: {
    width: 45,
    height: 45,
    borderRadius: 100,
    marginRight: 15,
  },
  userName: {
    color: "#1E1E1E",
    fontSize: 16,
    fontWeight: "600",
  },
  userIdRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  userIdBadge: {
    color: "white",
    backgroundColor: "#439D25",
    fontSize: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
    overflow: "hidden",
    fontWeight: "600",
  },
  userIdText: {
    color: "#1E1E1E",
    fontWeight: "400",
    marginLeft: 6,
    fontSize: 13,
  },
  mapWrapper: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  map: {
    width: "100%",
    height: 300,
  },
  markerContainer: {
    backgroundColor: "white",
    borderRadius: 30,
    padding: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  infoBubble: {
    position: "absolute",
    top: 100,
    left: 120,
    backgroundColor: "#000",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  infoTime: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E1E1E",
  },
  statusItem: {
    fontWeight: "600",
    color: "#1E1E1E",
  },
  receivedText: {
    color: "#439D25",
    fontWeight: "600",
    marginTop: 2,
  },
  detailsContainer: {
    paddingHorizontal: 25,
    marginTop: 10,
  },
  detailsText: {
    color: "#555",
    fontSize: 14,
    marginTop: 4,
  },
  detailsBold: {
    fontWeight: "bold",
    color: "#1E1E1E",
  },
});
