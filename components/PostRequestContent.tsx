import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createOrder } from "../services/api";
import haptic from "../utils/haptics";

import LocationAutocompleteInput from "./LocationAutocompleteInput";

interface PostRequestContentProps {
  onClose?: () => void;
  user?: any;
}

const VEHICLE_OPTIONS = [
  { id: "Van", label: "Van", icon: "van-utility" as const },
  { id: "Pick Up", label: "Pick Up", icon: "car-pickup" as const },
  { id: "Truck", label: "Truck", icon: "truck-outline" as const },
  { id: "Trailer / Tractor", label: "Trailer / Tractor", icon: "truck-trailer" as const },
];

export default function PostRequestContent({ onClose, user }: PostRequestContentProps) {
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const [loadType, setLoadType] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [contactName, setContactName] = useState(user?.name || "");
  const [contactPhone, setContactPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!selectedVehicle) {
      await haptic.warningNotification();
      Alert.alert("Vehicle Required", "Please select your preferred vehicle type.");
      setShowVehicleDropdown(true);
      return;
    }
    if (!pickupLocation.trim()) {
      await haptic.warningNotification();
      Alert.alert("Pickup Location Required", "Please enter the pickup location.");
      return;
    }
    if (!deliveryLocation.trim()) {
      await haptic.warningNotification();
      Alert.alert("Delivery Destination Required", "Please enter the delivery destination.");
      return;
    }
    if (!contactPhone.trim()) {
      await haptic.warningNotification();
      Alert.alert("Contact Phone Required", "Please enter your contact phone number.");
      return;
    }

    const description = (loadType.trim() || packageDescription.trim() || "General Cargo").trim();

    await haptic.mediumImpact();
    setLoading(true);
    try {
      const orderData = {
        pickupLocation: pickupLocation.trim(),
        deliveryLocation: deliveryLocation.trim(),
        vehicle: selectedVehicle,
        description,
        contactPhone: contactPhone.trim(),
        contactName: contactName.trim(),
        kind: "load",
      };

      const res = await createOrder(orderData);
      await haptic.successNotification();
      Alert.alert(
        "Request Posted!",
        `Your load request has been posted successfully!\nTracking ID: ${res.data.trackingId}\nAdmin will contact you in chat to negotiate the rate.`,
        [
          {
            text: "OK",
            onPress: () => {
              if (onClose) onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      console.error("Post request error:", error);
      await haptic.errorNotification();
      Alert.alert(
        "Submission Failed",
        error?.response?.data?.message || "Failed to submit request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerBtn}
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={28} color="#222222" />
        </TouchableOpacity>

        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.headerBtn}
          accessibilityLabel="Options"
        >
          <Ionicons name="ellipsis-vertical" size={22} color="#444444" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <Text style={styles.mainTitle}>Post a request</Text>

        {/* Form Card Container */}
        <View style={styles.card}>
          {/* Preferred Vehicle Type Button */}
          <TouchableOpacity
            style={styles.vehicleButton}
            onPress={async () => {
              await haptic.selection();
              setShowVehicleDropdown((prev) => !prev);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.vehicleButtonText}>
              {selectedVehicle ? `Vehicle: ${selectedVehicle}` : "Preferred Vehicle Type"}
            </Text>
          </TouchableOpacity>

          {/* Vehicle Dropdown Selection List */}
          {showVehicleDropdown && (
            <View style={styles.dropdownContainer}>
              {VEHICLE_OPTIONS.map((item, index) => {
                const isSelected = selectedVehicle === item.id;
                const isLast = index === VEHICLE_OPTIONS.length - 1;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.vehicleRow, !isLast && styles.vehicleRowBorder]}
                    onPress={async () => {
                      await haptic.selection();
                      setSelectedVehicle(item.id);
                      setShowVehicleDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.iconContainer}>
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={26}
                        color={isSelected ? "#389E23" : "#757575"}
                      />
                    </View>
                    <Text
                      style={[
                        styles.vehicleLabel,
                        isSelected && styles.vehicleLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#389E23"
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Load type / Goods description */}
          <View style={styles.fieldSection}>
            <Text style={styles.label}>Load type / Goods description</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="e.g. 50 cartons of bottled water, electronics"
                placeholderTextColor="#C7C7CC"
                value={loadType}
                onChangeText={setLoadType}
              />
            </View>
            <Text style={styles.hintText}>
              e.g. cartons of bottle water, electronics, groceries.
            </Text>
          </View>

          {/* Pickup Location */}
          <LocationAutocompleteInput
            label="Pickup Location"
            placeholder="Enter pickup location"
            value={pickupLocation}
            onChangeText={setPickupLocation}
          />

          {/* Delivery Destination */}
          <LocationAutocompleteInput
            label="Delivery Destination"
            placeholder="Enter Delivery Destination"
            value={deliveryLocation}
            onChangeText={setDeliveryLocation}
          />

          {/* Package Description */}
          <View style={styles.fieldSection}>
            <Text style={styles.label}>Package Description</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter Description of item"
                placeholderTextColor="#C7C7CC"
                value={packageDescription}
                onChangeText={setPackageDescription}
              />
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.fieldSection}>
            <Text style={styles.label}>Contact Information</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Name"
                placeholderTextColor="#C7C7CC"
                value={contactName}
                onChangeText={setContactName}
              />
            </View>
            <View style={[styles.inputWrapper, { marginTop: 10 }]}>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor="#C7C7CC"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Post Action Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.postBtn, loading && { opacity: 0.7 }]}
              onPress={handlePost}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.postBtnText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAF8",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "ios" ? 54 : 42,
    paddingBottom: 8,
  },
  headerBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#000000",
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 16,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: "visible",
    zIndex: 100,
  },
  vehicleButton: {
    backgroundColor: "#389E23",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  vehicleButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  dropdownContainer: {
    backgroundColor: "#F7F8F9",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 20,
  },
  vehicleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  vehicleRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  iconContainer: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  vehicleLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#222222",
    marginLeft: 14,
  },
  vehicleLabelSelected: {
    color: "#389E23",
    fontWeight: "700",
  },
  checkIcon: {
    marginLeft: 8,
  },
  fieldSection: {
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: "#F7F8F9",
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 44,
    justifyContent: "center",
  },
  input: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "400",
  },
  hintText: {
    fontSize: 11,
    color: "#8E8E93",
    marginTop: 5,
    fontWeight: "400",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
  },
  postBtn: {
    backgroundColor: "#389E23",
    paddingVertical: 10,
    paddingHorizontal: 36,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  postBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
