import React from "react";
import {
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView from "react-native-maps";
import Ionicons from "@expo/vector-icons/Ionicons";

const MapScreen = () => {
  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Map</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* User Info Card */}
      <View style={styles.userCardContainer}>
        <View style={styles.userCard}>
          <Image
            source={require("../../assets/images/myImage.jpg")}
            style={styles.userImage}
          />
          <View>
            <Text style={styles.userName}>John Doe</Text>
            <View style={styles.userIdRow}>
              <Text style={styles.userIdBadge}>User ID</Text>
              <Text style={styles.userIdText}>D422Q7827</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Map Section */}
      <View style={styles.mapContainer}>
        {/* <MapView
          style={styles.map}
          initialRegion={{
            latitude: 6.5244, Lagos, Nigeria example
            longitude: 3.3792,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
        /> */}
      </View>

      <StatusBar hidden />
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
  },
  userCardContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  userCard: {
    borderWidth: 1,
    width: 360,
    height: 64,
    paddingLeft: 23,
    borderRadius: 39,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
  },
  userImage: {
    width: 45,
    height: 45,
    borderRadius: 100,
    marginRight: 20,
  },
  userName: {
    color: "#1E1E1E",
    fontWeight: "600",
  },
  userIdRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  userIdBadge: {
    color: "white",
    backgroundColor: "#439D25",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 6,
    borderRadius: 100,
    fontWeight: "600",
  },
  userIdText: {
    color: "#1E1E1E",
    fontWeight: "300",
    marginLeft: 6,
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
