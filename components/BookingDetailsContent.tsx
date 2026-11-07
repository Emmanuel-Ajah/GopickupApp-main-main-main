import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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

interface BookingDetailsContentProps {
  onClose?: () => void;
  user?: any;
  value?: any;
  onChange?: (val: any) => void;
}

const VEHICLE_OPTIONS = [
  { id: "Van", label: "Van", icon: "van-utility" as const },
  { id: "Pick Up", label: "Pick Up", icon: "car-pickup" as const },
  { id: "Truck", label: "Truck", icon: "truck-outline" as const },
  { id: "Trailer / Tractor", label: "Trailer / Tractor", icon: "truck-trailer" as const },
  { id: "Flat bed", label: "Flat bed", icon: "truck-flatbed" as const },
  { id: "Tipper", label: "Tipper", icon: "dump-truck" as const },
];

export default function BookingDetailsContent({
  onClose,
  user,
  value,
  onChange,
}: BookingDetailsContentProps) {
  const [selectedVehicle, setSelectedVehicle] = useState(value?.vehicle || "");
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(value?.pickupLocation || "");
  const [deliveryLocation, setDeliveryLocation] = useState(value?.deliveryLocation || "");
  const [description, setDescription] = useState(value?.description || "");
  const [weight, setWeight] = useState(value?.weight || "");
  const [deliveryTime, setDeliveryTime] = useState("Immediate");
  const [scheduledDate, setScheduledDate] = useState(value?.scheduledAt || "");
  const [paymentMethod, setPaymentMethod] = useState("Paystack");
  const [contactPhone, setContactPhone] = useState(value?.contactPhone || user?.phone || "");
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (onChange) {
      onChange({
        vehicle: selectedVehicle,
        pickupLocation,
        deliveryLocation,
        description,
        weight,
        contactPhone,
        scheduledAt: scheduledDate,
      });
    }
  }, [selectedVehicle, pickupLocation, deliveryLocation, description, weight, contactPhone, scheduledDate]);

  const handleConfirm = async () => {
    if (!selectedVehicle) {
      await haptic.warningNotification();
      Alert.alert("Vehicle Required", "Please choose the right vehicle.");
      setShowVehicleModal(true);
      return;
    }
    if (!pickupLocation.trim()) {
      await haptic.warningNotification();
      Alert.alert("Pickup Location Required", "Please enter the pickup location.");
      return;
    }
    if (!deliveryLocation.trim()) {
      await haptic.warningNotification();
      Alert.alert("Drop off Location Required", "Please enter the drop off location.");
      return;
    }
    if (!description.trim()) {
      await haptic.warningNotification();
      Alert.alert("Package Description Required", "Please enter a description of the package.");
      return;
    }

    const phone = (contactPhone || user?.phone || "").trim();
    if (!phone) {
      await haptic.warningNotification();
      Alert.alert("Contact Phone Required", "Please enter your contact phone number.");
      return;
    }

    await haptic.mediumImpact();
    setLoading(true);
    try {
      const orderData = {
        pickupLocation: pickupLocation.trim(),
        deliveryLocation: deliveryLocation.trim(),
        vehicle: selectedVehicle,
        description: description.trim(),
        weight: weight.trim(),
        contactPhone: phone,
        kind: "load",
        paymentMethod,
        scheduledAt: deliveryTime === "Schedule Later" && scheduledDate ? scheduledDate : undefined,
      };

      const res = await createOrder(orderData);
      await haptic.successNotification();
      Alert.alert(
        "Booking Confirmed!",
        `Your driver booking request has been confirmed!\nTracking ID: ${res.data.trackingId}\nOur dispatch team will connect with you in chat.`,
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
      console.error("Booking error:", error);
      await haptic.errorNotification();
      Alert.alert(
        "Booking Failed",
        error?.response?.data?.message || "Failed to confirm booking. Please try again."
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
        {/* Main Title */}
        <Text style={styles.mainTitle}>Booking Details</Text>

        {/* Form Card Container */}
        <View style={styles.card}>
          {/* Sub Header */}
          <Text style={styles.subHeader}>Let&apos;s get your goods moving</Text>

          {/* Choose Vehicle Button */}
          <TouchableOpacity
            style={styles.vehicleButton}
            onPress={() => setShowVehicleModal(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.vehicleButtonText}>
              {selectedVehicle ? `Selected: ${selectedVehicle}` : "Choose the right vehicle"}
            </Text>
          </TouchableOpacity>

          {/* Pickup Location */}
          <LocationAutocompleteInput
            label="Pickup Location"
            placeholder="Enter pickup location"
            value={pickupLocation}
            onChangeText={setPickupLocation}
          />

          {/* Drop off Location */}
          <LocationAutocompleteInput
            label="Drop off Location"
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
                value={description}
                onChangeText={setDescription}
              />
            </View>
            <View style={[styles.inputWrapper, { marginTop: 8 }]}>
              <TextInput
                style={styles.input}
                placeholder="Enter weight/size"
                placeholderTextColor="#C7C7CC"
                value={weight}
                onChangeText={setWeight}
              />
            </View>
          </View>

          {/* Delivery Time */}
          <View style={styles.fieldSection}>
            <Text style={styles.label}>Delivery Time</Text>
            <TouchableOpacity
              style={[
                styles.timePill,
                deliveryTime === "Immediate" && styles.timePillSelected,
              ]}
              onPress={() => setDeliveryTime("Immediate")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.timePillText,
                  deliveryTime === "Immediate" && styles.timePillTextSelected,
                ]}
              >
                Immediate  Pickup
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.timePill,
                deliveryTime === "Schedule Later" && styles.timePillSelected,
                { marginTop: 8 },
              ]}
              onPress={() => setDeliveryTime("Schedule Later")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.timePillText,
                  deliveryTime === "Schedule Later" && styles.timePillTextSelected,
                ]}
              >
                Schedule Later
              </Text>
            </TouchableOpacity>

            {deliveryTime === "Schedule Later" && (
              <View style={[styles.inputWrapper, { marginTop: 8 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DDTHH:mm (future date/time)"
                  placeholderTextColor="#C7C7CC"
                  value={scheduledDate}
                  onChangeText={setScheduledDate}
                />
              </View>
            )}
          </View>

          {/* Contact Information */}
          <View style={styles.fieldSection}>
            <Text style={styles.label}>Contact Phone</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="e.g. 08012345678"
                placeholderTextColor="#9CA3AF"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.fieldSection}>
            <Text style={styles.label}>Payment Method</Text>

            {/* Paystack (Card, Bank Transfer, USSD) */}
            <TouchableOpacity
              style={styles.paymentRow}
              onPress={() => setPaymentMethod("Paystack")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="flash-outline"
                size={22}
                color={paymentMethod === "Paystack" ? "#389E23" : "#333333"}
              />
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text
                  style={[
                    styles.paymentText,
                    paymentMethod === "Paystack" && styles.paymentTextSelected,
                  ]}
                >
                  Paystack (Card / Transfer / USSD)
                </Text>
                <View style={{ backgroundColor: "#E6F6FC", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#0BA4DB" }}>Instant</Text>
                </View>
              </View>
              {paymentMethod === "Paystack" && (
                <Ionicons name="checkmark-circle" size={18} color="#389E23" style={styles.checkIcon} />
              )}
            </TouchableOpacity>

            {/* Card */}
            <TouchableOpacity
              style={styles.paymentRow}
              onPress={() => setPaymentMethod("Card")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="card-outline"
                size={22}
                color={paymentMethod === "Card" ? "#389E23" : "#333333"}
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === "Card" && styles.paymentTextSelected,
                ]}
              >
                Card
              </Text>
              {paymentMethod === "Card" && (
                <Ionicons name="checkmark-circle" size={18} color="#389E23" style={styles.checkIcon} />
              )}
            </TouchableOpacity>

            {/* Account Wallet */}
            <TouchableOpacity
              style={styles.paymentRow}
              onPress={() => setPaymentMethod("Account Wallet")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="wallet-outline"
                size={22}
                color={paymentMethod === "Account Wallet" ? "#389E23" : "#333333"}
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === "Account Wallet" && styles.paymentTextSelected,
                ]}
              >
                Account Wallet
              </Text>
              {paymentMethod === "Account Wallet" && (
                <Ionicons name="checkmark-circle" size={18} color="#389E23" style={styles.checkIcon} />
              )}
            </TouchableOpacity>

            {/* Cash on Delivery */}
            <TouchableOpacity
              style={styles.paymentRow}
              onPress={() => setPaymentMethod("Cash on Delivery")}
              activeOpacity={0.7}
            >
              <Ionicons
                name="cash-outline"
                size={22}
                color={paymentMethod === "Cash on Delivery" ? "#389E23" : "#333333"}
              />
              <Text
                style={[
                  styles.paymentText,
                  paymentMethod === "Cash on Delivery" && styles.paymentTextSelected,
                ]}
              >
                Cash on Delivery
              </Text>
              {paymentMethod === "Cash on Delivery" && (
                <Ionicons name="checkmark-circle" size={18} color="#389E23" style={styles.checkIcon} />
              )}
            </TouchableOpacity>
          </View>

          {/* Confirm Action Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.confirmBtnText}>Confirm</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Vehicle Selection Modal */}
      <Modal
        visible={showVehicleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVehicleModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVehicleModal(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Choose the right vehicle</Text>
            {VEHICLE_OPTIONS.map((item) => {
              const isSelected = selectedVehicle === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.vehicleItem}
                  onPress={() => {
                    setSelectedVehicle(item.id);
                    setShowVehicleModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.vehicleItemLeft}>
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={24}
                      color={isSelected ? "#389E23" : "#555555"}
                    />
                    <Text
                      style={[
                        styles.vehicleItemText,
                        isSelected && styles.selectedVehicleItemText,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={22} color="#389E23" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
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
  subHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 14,
  },
  vehicleButton: {
    backgroundColor: "#389E23",
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  vehicleButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
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
  timePill: {
    backgroundColor: "#F7F8F9",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "transparent",
  },
  timePillSelected: {
    borderColor: "#389E23",
    backgroundColor: "#F2F7F0",
  },
  timePillText: {
    fontSize: 14,
    color: "#757575",
    fontWeight: "500",
  },
  timePillTextSelected: {
    color: "#389E23",
    fontWeight: "700",
  },
  paymentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  paymentText: {
    fontSize: 15,
    color: "#222222",
    fontWeight: "500",
    marginLeft: 12,
    flex: 1,
  },
  paymentTextSelected: {
    color: "#389E23",
    fontWeight: "700",
  },
  checkIcon: {
    marginLeft: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  confirmBtn: {
    backgroundColor: "#389E23",
    paddingVertical: 10,
    paddingHorizontal: 36,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    padding: 20,
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
    color: "#000000",
  },
  vehicleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F2F2F2",
  },
  vehicleItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleItemText: {
    fontSize: 15,
    color: "#333333",
    fontWeight: "500",
    marginLeft: 12,
  },
  selectedVehicleItemText: {
    color: "#389E23",
    fontWeight: "700",
  },
});
