import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LocationAutocompleteInput from "../../components/LocationAutocompleteInput";
import { NativeMap, NativeMarker } from "../../components/maps/NativeMap";
import { createReview, getMyOrders, trackOrder } from "../../services/api";
import { getPlaceCoordinates, PlaceSuggestion } from "../../services/googlePlaces";

export default function MapScreen() {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [searchLocation, setSearchLocation] = useState<string>("");
  const [loadingTrack, setLoadingTrack] = useState<boolean>(false);

  // Live coordinates for Origin, Destination and Driver
  const [originCoord, setOriginCoord] = useState<{ latitude: number; longitude: number; name: string }>({
    latitude: 9.0765,
    longitude: 7.4816,
    name: "Wuse",
  });
  const [destCoord, setDestCoord] = useState<{ latitude: number; longitude: number; name: string }>({
    latitude: 9.0436,
    longitude: 7.5255,
    name: "Asokoro",
  });
  const [driverCoord, setDriverCoord] = useState<{ latitude: number; longitude: number }>({
    latitude: 9.062,
    longitude: 7.498,
  });

  const loadData = async () => {
    try {
      const rawUser = await AsyncStorage.getItem("user");
      if (rawUser) setUser(JSON.parse(rawUser));

      const res = await getMyOrders();
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        setOrders(res.data);
        const latest = res.data[0];

        // Resolve coordinates for real order addresses
        if (latest.pickupLocation) {
          getPlaceCoordinates(latest.pickupLocation).then((coords) => {
            setOriginCoord({
              latitude: coords.latitude,
              longitude: coords.longitude,
              name: latest.pickupLocation,
            });
          });
        }
        if (latest.deliveryLocation) {
          getPlaceCoordinates(latest.deliveryLocation).then((coords) => {
            setDestCoord({
              latitude: coords.latitude,
              longitude: coords.longitude,
              name: latest.deliveryLocation,
            });
          });
        }
      }
    } catch (err) {
      console.error("Map load data error:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const latestOrder = orders.length > 0 ? orders[0] : null;
  const statusDisplay = latestOrder?.status || "Delivered";
  const pickupName = originCoord.name.split(",")[0] || "Wuse";
  const destName = destCoord.name.split(",")[0] || "Asokoro";
  const orderTime = latestOrder?.createdAt
    ? new Date(latestOrder.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "03:37pm";

  const handleSelectSearchedPlace = async (place: PlaceSuggestion) => {
    setSearchLocation(place.description);
    const coords = await getPlaceCoordinates(place.description, place.placeId);
    setDestCoord({
      latitude: coords.latitude,
      longitude: coords.longitude,
      name: place.mainText,
    });
    Alert.alert("Location Selected", `Destination updated to ${place.mainText}. Live route calculated.`);
  };

  const handleRate = async (star: number) => {
    setRating(star);
    try {
      if (latestOrder?._id) {
        await createReview({
          orderId: latestOrder._id,
          rating: star,
          experience: "Great delivery service, arrived right on schedule!",
        });
      }
      Alert.alert("Rating Submitted", `Thank you for rating our delivery ${star} stars!`);
    } catch (err) {
      Alert.alert("Rating Saved", `Thank you for rating our service ${star} stars!`);
    }
  };

  const handleTrackPress = async () => {
    if (!latestOrder?.trackingId) {
      Alert.alert(
        "Live Driver Tracking",
        `Driver status: En route from ${pickupName} to ${destName}.\nETA: 10 mins (Traffic delay: Normal)`
      );
      return;
    }

    setLoadingTrack(true);
    try {
      const res = await trackOrder(latestOrder.trackingId);
      const trackingData = res.data;
      Alert.alert(
        `Tracking ID: ${trackingData.trackingId}`,
        `Status: ${trackingData.status}\nFrom: ${trackingData.pickupLocation}\nTo: ${trackingData.deliveryLocation}\nVehicle: ${trackingData.vehicle || "Truck"}`
      );
    } catch (err: any) {
      Alert.alert(
        "Live Driver Tracking",
        `Status: ${statusDisplay}\nRoute: ${pickupName} ➔ ${destName}\nDriver is active on the route.`
      );
    } finally {
      setLoadingTrack(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAF8" />

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Map</Text>
        <TouchableOpacity style={styles.headerMenuBtn} accessibilityLabel="Options">
          <Ionicons name="ellipsis-vertical" size={24} color="#222222" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* User Pill Card */}
        <View style={styles.userCard}>
          <Image
            source={require("../../assets/images/myImage.jpg")}
            style={styles.avatarImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || "Azih Monica"}</Text>
            <View style={styles.userIdBadge}>
              <View style={styles.userIdPill}>
                <Text style={styles.userIdPillText}>User ID</Text>
              </View>
              <Text style={styles.userIdText}>{user?.userId || "D422Q7827"}</Text>
            </View>
          </View>
        </View>

        {/* Live Google Places Search Bar */}
        <View style={styles.searchContainer}>
          <LocationAutocompleteInput
            placeholder="Search Google Places / Destination..."
            value={searchLocation}
            onChangeText={setSearchLocation}
            onSelectPlace={handleSelectSearchedPlace}
            containerStyle={{ marginBottom: 0 }}
            inputStyle={styles.placesInputWrapper}
          />
        </View>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          {Platform.OS !== "web" ? (
            <NativeMap
              style={StyleSheet.absoluteFillObject}
              initialRegion={{
                latitude: (originCoord.latitude + destCoord.latitude) / 2,
                longitude: (originCoord.longitude + destCoord.longitude) / 2,
                latitudeDelta: 0.08,
                longitudeDelta: 0.08,
              }}
            >
              {/* Pickup Marker */}
              <NativeMarker
                coordinate={{
                  latitude: originCoord.latitude,
                  longitude: originCoord.longitude,
                }}
                title={`Pickup: ${pickupName}`}
              />

              {/* Destination Marker */}
              <NativeMarker
                coordinate={{
                  latitude: destCoord.latitude,
                  longitude: destCoord.longitude,
                }}
                title={`Drop-off: ${destName}`}
              />

              {/* Driver Marker */}
              <NativeMarker
                coordinate={{
                  latitude: driverCoord.latitude,
                  longitude: driverCoord.longitude,
                }}
                title="Driver en route"
              />
            </NativeMap>
          ) : null}

          {/* Styled Live Street Map Canvas */}
          <View style={styles.mapCanvas} pointerEvents={Platform.OS !== "web" ? "box-none" : "auto"}>
            {/* Street Grid Lines */}
            <View style={[styles.streetH, { top: 60 }]} />
            <View style={[styles.streetH, { top: 150 }]} />
            <View style={[styles.streetH, { top: 220 }]} />
            <View style={[styles.streetH, { top: 310 }]} />

            <View style={[styles.streetV, { left: 80 }]} />
            <View style={[styles.streetV, { left: 160 }]} />
            <View style={[styles.streetV, { left: 240 }]} />
            <View style={[styles.streetV, { left: 310 }]} />

            {/* Landmark Buildings */}
            <View style={[styles.landmarkBuilding, { top: 30, left: 110 }]}>
              <Text style={styles.landmarkText}>North station</Text>
            </View>
            <View style={[styles.landmarkBuilding, { top: 120, right: 35 }]}>
              <Text style={styles.landmarkText}>IBM tower</Text>
            </View>
            <View style={[styles.landmarkPark, { top: 155, right: 35 }]}>
              <Text style={styles.landmarkText}>Botanical Garden</Text>
            </View>
            <View style={[styles.landmarkBuilding, { top: 195, right: 25 }]}>
              <Text style={styles.landmarkText}>Finance tower</Text>
            </View>

            {/* Route Polyline (Green - Black - Green) */}
            <View style={styles.routePolylineSegment1} />
            <View style={styles.routePolylineSegment2} />
            <View style={styles.routePolylineSegment3} />

            {/* Origin Pin (Driver Headshot) */}
            <View style={styles.originPin}>
              <Ionicons name="location-sharp" size={18} color="#222222" />
              <Image
                source={require("../../assets/images/myImage.jpg")}
                style={styles.pinAvatar}
              />
            </View>

            {/* Traffic Badge (10 mins Heavy Traffic) */}
            <View style={styles.trafficBadge}>
              <View style={styles.trafficBadgeInner}>
                <View style={styles.trafficBadgeTimeRow}>
                  <Text style={styles.trafficBadgeNum}>10</Text>
                  <Text style={styles.trafficBadgeMins}>mins</Text>
                </View>
                <Text style={styles.trafficBadgeSub}>Heavy Traffic</Text>
              </View>
              <View style={styles.trafficArrowDown} />
            </View>

            {/* ETA Badge (40 mins) */}
            <View style={styles.etaBadge}>
              <Text style={styles.etaBadgeText}>40 <Text style={styles.etaBadgeSub}>mins</Text></Text>
              <View style={styles.etaArrowRight} />
            </View>

            {/* Destination Pin (Driver + User) */}
            <View style={styles.destinationPin}>
              <Ionicons name="location-sharp" size={18} color="#222222" />
              <View style={styles.destAvatarsRow}>
                <Image
                  source={require("../../assets/images/myImage.jpg")}
                  style={styles.pinAvatar}
                />
                <Image
                  source={require("../../assets/images/myImage.jpg")}
                  style={[styles.pinAvatar, { marginLeft: -6 }]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Status Section */}
        <Text style={styles.statusSectionTitle}>Status</Text>

        <View style={styles.statusRow}>
          {/* Status Info */}
          <View>
            <View style={styles.deliveredHeaderRow}>
              <Ionicons name="cube-outline" size={22} color="#000000" />
              <Text style={styles.deliveredText}>{statusDisplay}</Text>
            </View>
            <View style={styles.receivedRow}>
              <Text style={styles.receivedText}>
                {statusDisplay === "Delivered" ? "Receieved" : "In Progress"}
              </Text>
              <Ionicons name="checkmark-circle-outline" size={16} color="#389E23" style={{ marginLeft: 4 }} />
            </View>
          </View>

          {/* Rate Service Stars */}
          <View style={styles.rateServiceContainer}>
            <Text style={styles.rateServiceLabel}>Rate Service</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRate(star)}
                  hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                >
                  <Ionicons
                    name={star <= rating ? "star" : "star-outline"}
                    size={22}
                    color={star <= rating ? "#FFB800" : "#222222"}
                    style={{ marginLeft: 3 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Delivery Details Section */}
        <Text style={styles.detailsTitle}>Delivery details</Text>

        <View style={styles.deliveryDetailsRow}>
          <View style={styles.detailsLeft}>
            <View style={styles.detailItemRow}>
              <Text style={styles.detailKey}>Time:</Text>
              <Text style={styles.detailValue}>{orderTime}</Text>
            </View>

            <View style={[styles.detailItemRow, { marginTop: 4 }]}>
              <Text style={styles.detailKey}>Route:</Text>
              <Text style={styles.routeTextValue}>
                {pickupName} <Text style={styles.routeArrow}>➔</Text> {destName}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.trackButton}
            onPress={handleTrackPress}
            activeOpacity={0.85}
            disabled={loadingTrack}
          >
            {loadingTrack ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.trackButtonText}>Track</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8FAF8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 54 : 42,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000000",
  },
  headerMenuBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    borderWidth: 1.2,
    borderColor: "#000000",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E0E0E0",
  },
  userInfo: {
    marginLeft: 14,
  },
  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  userIdBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  userIdPill: {
    backgroundColor: "#389E23",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  userIdPillText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  userIdText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#555555",
    marginLeft: 6,
  },
  searchContainer: {
    marginTop: 12,
    zIndex: 100,
  },
  placesInputWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    height: 46,
    paddingHorizontal: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  mapContainer: {
    height: 380,
    borderRadius: 22,
    overflow: "hidden",
    marginTop: 14,
    backgroundColor: "#EBEFEB",
    borderWidth: 1,
    borderColor: "#DCE3DC",
    position: "relative",
  },
  mapCanvas: {
    flex: 1,
    position: "relative",
    backgroundColor: "#F4F6F4",
  },
  streetH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: "#E4E8E4",
  },
  streetV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 14,
    backgroundColor: "#E4E8E4",
  },
  landmarkBuilding: {
    position: "absolute",
    backgroundColor: "#E2E6E2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#CCD2CC",
  },
  landmarkPark: {
    position: "absolute",
    backgroundColor: "#E3EFE3",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#C5D8C5",
  },
  landmarkText: {
    fontSize: 8.5,
    color: "#6B7280",
    fontWeight: "600",
  },
  routePolylineSegment1: {
    position: "absolute",
    top: 60,
    left: 105,
    width: 4.5,
    height: 110,
    backgroundColor: "#389E23",
    borderRadius: 2,
  },
  routePolylineSegment2: {
    position: "absolute",
    top: 170,
    left: 105,
    width: 115,
    height: 5,
    backgroundColor: "#222222",
    borderRadius: 2,
  },
  routePolylineSegment3: {
    position: "absolute",
    top: 170,
    left: 215,
    width: 4.5,
    height: 140,
    backgroundColor: "#389E23",
    borderRadius: 2,
  },
  originPin: {
    position: "absolute",
    top: 24,
    left: 70,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  pinAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 4,
  },
  trafficBadge: {
    position: "absolute",
    top: 130,
    left: 125,
    alignItems: "center",
  },
  trafficBadgeInner: {
    backgroundColor: "#222222",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: "center",
  },
  trafficBadgeTimeRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  trafficBadgeNum: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  trafficBadgeMins: {
    fontSize: 9,
    fontWeight: "600",
    color: "#FFFFFF",
    marginLeft: 3,
  },
  trafficBadgeSub: {
    fontSize: 7.5,
    color: "#C7C7CC",
    fontWeight: "500",
  },
  trafficArrowDown: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#222222",
  },
  etaBadge: {
    position: "absolute",
    top: 260,
    left: 105,
    backgroundColor: "#389E23",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  etaBadgeText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  etaBadgeSub: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  etaArrowRight: {
    position: "absolute",
    right: -5,
    top: 9,
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#389E23",
  },
  destinationPin: {
    position: "absolute",
    bottom: 22,
    left: 145,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingHorizontal: 8,
    paddingVertical: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  destAvatarsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 4,
  },
  statusSectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#000000",
    marginTop: 18,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  deliveredHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deliveredText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
    marginLeft: 8,
  },
  receivedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  receivedText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#389E23",
  },
  rateServiceContainer: {
    alignItems: "flex-end",
  },
  rateServiceLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#000000",
    marginTop: 16,
    marginBottom: 8,
  },
  deliveryDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailsLeft: {
    flex: 1,
  },
  detailItemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailKey: {
    fontSize: 13,
    color: "#757575",
    fontWeight: "500",
    width: 48,
  },
  detailValue: {
    fontSize: 13,
    color: "#000000",
    fontWeight: "700",
  },
  routeTextValue: {
    fontSize: 13,
    color: "#000000",
    fontWeight: "700",
  },
  routeArrow: {
    color: "#389E23",
    fontWeight: "800",
  },
  trackButton: {
    backgroundColor: "#389E23",
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  trackButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
