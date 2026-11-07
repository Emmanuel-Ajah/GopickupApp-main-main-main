import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as WebBrowser from "expo-web-browser";
import { useRouter } from "expo-router";
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
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { deleteMe, getMe, getMyOrders, updateMe } from "../../services/api";
import haptic from "../../utils/haptics";

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser, logout, updateUser } = useAuth();
  const [user, setUser] = useState<any>(authUser || null);
  const [orders, setOrders] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [updatingPhoto, setUpdatingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    await haptic.heavyImpact();
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rawUser = await AsyncStorage.getItem("user");
        if (rawUser) {
          const parsed = JSON.parse(rawUser);
          setUser(parsed);
          setName(parsed.name || "");
          setPhone(parsed.phone || "");
          setEmail(parsed.email || "");
          setLocation(parsed.location || "");
        } else if (authUser) {
          setUser(authUser);
          setName(authUser.name || "");
          setPhone(authUser.phone || "");
          setEmail(authUser.email || "");
          setLocation(authUser.location || "");
        }

        const profileRes = await getMe();
        if (profileRes?.data) {
          const profile = profileRes.data;
          setUser(profile);
          setName(profile.name || "");
          setPhone(profile.phone || "");
          setEmail(profile.email || "");
          setLocation(profile.location || "");
          await AsyncStorage.setItem("user", JSON.stringify(profile));
          await updateUser(profile);
        }

        const ordersRes = await getMyOrders();
        if (ordersRes?.data && Array.isArray(ordersRes.data)) {
          setOrders(ordersRes.data);
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };
    fetchData();
  }, []);

  // Detect location using device location services
  const handleDetectLocation = async () => {
    await haptic.selection();
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        await haptic.warningNotification();
        Alert.alert(
          "Permission Denied",
          "Permission to access location was denied. You can manually enter your city or state."
        );
        setDetectingLocation(false);
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const city = place.city || place.subregion || place.district || "";
        const region = place.region || place.country || "";
        const country = place.country || "Nigeria";
        const formattedLoc = [city, region, country].filter(Boolean).join(", ");

        setLocation(formattedLoc);
        await haptic.successNotification();

        // Persist detected location
        const res = await updateMe({ location: formattedLoc });
        if (res?.data) {
          setUser(res.data);
          await AsyncStorage.setItem("user", JSON.stringify(res.data));
          await updateUser(res.data);
        }
      } else {
        await haptic.errorNotification();
        Alert.alert("Location", "Could not resolve address. Please type it in.");
      }
    } catch (err) {
      console.warn("Location detection error:", err);
      await haptic.errorNotification();
      Alert.alert("Location Error", "Unable to detect your current location. Please check GPS settings.");
    } finally {
      setDetectingLocation(false);
    }
  };

  // Pick profile photo from gallery or camera
  const handlePickImage = async () => {
    await haptic.lightImpact();

    Alert.alert("Profile Photo", "Choose an option to update your profile photo", [
      {
        text: "Photo Library",
        onPress: async () => {
          try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
              await haptic.warningNotification();
              Alert.alert("Permission Needed", "Please grant photo library permission to upload a profile picture.");
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.6,
              base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              await uploadPhoto(result.assets[0]);
            }
          } catch (e) {
            console.error("Image pick error:", e);
          }
        },
      },
      {
        text: "Take Photo",
        onPress: async () => {
          try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== "granted") {
              await haptic.warningNotification();
              Alert.alert("Permission Needed", "Please grant camera permission to take a profile picture.");
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.6,
              base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              await uploadPhoto(result.assets[0]);
            }
          } catch (e) {
            console.error("Camera pick error:", e);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const uploadPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    setUpdatingPhoto(true);
    await haptic.mediumImpact();
    try {
      const photoUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
      const res = await updateMe({ image: photoUri, avatar: photoUri });
      if (res?.data) {
        setUser(res.data);
        await AsyncStorage.setItem("user", JSON.stringify(res.data));
        await updateUser(res.data);
        await haptic.successNotification();
        Alert.alert("Success", "Profile photo updated successfully!");
      }
    } catch (error: any) {
      await haptic.errorNotification();
      Alert.alert("Error", error.response?.data?.message || "Could not update profile photo.");
    } finally {
      setUpdatingPhoto(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    await haptic.mediumImpact();
    try {
      const res = await updateMe({ name, phone, location });
      setUser(res.data);
      await AsyncStorage.setItem("user", JSON.stringify(res.data));
      await updateUser(res.data);
      setEditing(false);
      await haptic.successNotification();
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err: any) {
      await haptic.errorNotification();
      Alert.alert("Error", err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    haptic.warningNotification();
    Alert.alert(
      "Delete Account?",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await haptic.heavyImpact();
            try {
              await deleteMe();
              await handleLogout();
            } catch (err: any) {
              await haptic.errorNotification();
              Alert.alert("Error", err?.response?.data?.message || "Unable to delete account");
            }
          },
        },
      ]
    );
  };

  // Real order stats (No dummy data)
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const lastDeliveredOrder = deliveredOrders.length > 0
    ? deliveredOrders[0]
    : (orders.length > 0 ? orders[0] : null);

  const profileImageUrl = user?.image || user?.avatar;

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAF8" />

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.headerMenuBtn}
          accessibilityLabel="Logout"
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#E53935" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile Pill Card with Photo Edit */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            onPress={handlePickImage}
            activeOpacity={0.8}
            disabled={updatingPhoto}
          >
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarImage, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={22} color="#439D25" />
              </View>
            )}
            <View style={styles.cameraBadge}>
              {updatingPhoto ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={12} color="#FFFFFF" />
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {user?.name || "GoPickup User"}
            </Text>
            <View style={styles.idBadgeContainer}>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>User ID</Text>
              </View>
              <Text style={styles.idText}>{user?.userId || "Pending ID"}</Text>
            </View>
          </View>
        </View>

        {/* Account Info Section Title */}
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={22} color="#000000" />
          <Text style={styles.sectionTitle}>Account Info</Text>
        </View>

        {/* White Card Container */}
        <View style={styles.infoCard}>
          {/* Name Row */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={styles.value}>{user?.name || "Not provided"}</Text>
            )}
          </View>
          <View style={styles.divider} />

          {/* Phone Row */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone No:</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. +234 800 000 0000"
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={styles.value}>{user?.phone || "No phone added"}</Text>
            )}
          </View>
          <View style={styles.divider} />

          {/* Location Row with GPS detector */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Enter city or state"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={styles.value} numberOfLines={1}>
                {location || "Location not set"}
              </Text>
            )}
            <TouchableOpacity
              style={styles.locationGpsBtn}
              onPress={handleDetectLocation}
              disabled={detectingLocation}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              {detectingLocation ? (
                <ActivityIndicator size="small" color="#439D25" />
              ) : (
                <Ionicons name="locate" size={19} color="#439D25" />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />

          {/* Email Row */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value} numberOfLines={1}>
              {user?.email || "No email"}
            </Text>
          </View>
          <View style={styles.divider} />

          {/* Real Delivery Stats (No Dummy Data) */}
          <View style={[styles.infoRow, { marginTop: 14 }]}>
            <Text style={styles.subLabel}>Last Delivery:</Text>
            <Text style={styles.subValue}>
              {lastDeliveredOrder
                ? new Date(lastDeliveredOrder.createdAt).toLocaleDateString()
                : "No orders yet"}
            </Text>
          </View>
          <Text style={styles.itemDelivered}>
            Item status:{" "}
            <Text style={{ color: "#555" }}>
              {lastDeliveredOrder
                ? `${lastDeliveredOrder.status} (${lastDeliveredOrder.pickupLocation} → ${lastDeliveredOrder.deliveryLocation})`
                : "Book your first haul on the Home tab"}
            </Text>
          </Text>

          {/* Total Delivery Pill */}
          <View style={styles.totalDeliveryContainer}>
            <View style={styles.totalDeliveryPill}>
              <Text style={styles.totalDeliveryText}>
                Total Deliveries:{" "}
                <Text style={styles.totalDeliveryCount}>
                  {deliveredOrders.length}
                </Text>
              </Text>
              {deliveredOrders.length > 0 && (
                <Text style={styles.successBadge}>Successful</Text>
              )}
            </View>
          </View>

          {/* Bottom Actions Row: Delete Account & Edit */}
          <View style={styles.cardBottomRow}>
            <TouchableOpacity
              style={styles.deleteRow}
              onPress={handleDeleteAccount}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={18} color="#E53935" />
              <Text style={styles.deleteText}>Delete Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.editButton, saving && { opacity: 0.7 }]}
              onPress={async () => {
                await haptic.selection();
                if (editing) {
                  handleSaveProfile();
                } else {
                  setEditing(true);
                }
              }}
              activeOpacity={0.85}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.editButtonText}>{editing ? "Save" : "Edit"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Refer a Friend Card */}
        <TouchableOpacity
          style={styles.referCard}
          onPress={async () => {
            await haptic.lightImpact();
            Alert.alert("Refer a Friend", "Share GoPickup with friends and earn delivery bonus credits!");
          }}
          activeOpacity={0.85}
        >
          <Image
            source={require("../../assets/images/Futures 1.png")}
            style={styles.referImage}
            resizeMode="contain"
          />
          <View style={styles.referInfo}>
            <Text style={styles.referTitle}>Refer a friend</Text>
            <Text style={styles.referSub}>And get Bonus</Text>
          </View>
        </TouchableOpacity>

        {/* Legal & Policy Links */}
        <View style={styles.legalSection}>
          <TouchableOpacity
            style={styles.legalLink}
            onPress={async () => {
              await haptic.lightImpact();
              WebBrowser.openBrowserAsync("https://gopickup.app/privacy");
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark-outline" size={18} color="#4B5563" />
            <Text style={styles.legalText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
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
    padding: 6,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 40,
    borderWidth: 1.2,
    borderColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EBF7EA",
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D4EED0",
  },
  cameraBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#439D25",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
  },
  idBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3,
  },
  idBadge: {
    backgroundColor: "#389E23",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  idText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#555555",
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000000",
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  label: {
    fontSize: 14.5,
    fontWeight: "700",
    color: "#000000",
    width: 90,
  },
  value: {
    fontSize: 14.5,
    color: "#333333",
    fontWeight: "400",
    flex: 1,
  },
  locationGpsBtn: {
    padding: 6,
    backgroundColor: "#F0F9EF",
    borderRadius: 14,
    marginLeft: 8,
  },
  input: {
    fontSize: 14.5,
    color: "#000000",
    backgroundColor: "#F7F8F9",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginVertical: 10,
  },
  subLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555555",
    width: 120,
  },
  subValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
  },
  itemDelivered: {
    fontSize: 11.5,
    color: "#777777",
    fontWeight: "600",
    marginTop: 4,
  },
  totalDeliveryContainer: {
    marginTop: 16,
  },
  totalDeliveryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F7F4",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  totalDeliveryText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#222222",
  },
  totalDeliveryCount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#000000",
  },
  successBadge: {
    color: "#389E23",
    fontWeight: "700",
    fontSize: 12,
    marginLeft: 12,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  deleteRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  deleteText: {
    fontSize: 13.5,
    color: "#E53935",
    fontWeight: "600",
    marginLeft: 6,
  },
  editButton: {
    backgroundColor: "#439D25",
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 18,
    minWidth: 70,
    alignItems: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "700",
  },
  referCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#439D25",
    borderRadius: 20,
    padding: 16,
    marginTop: 16,
  },
  referImage: {
    width: 60,
    height: 60,
  },
  referInfo: {
    marginLeft: 14,
  },
  referTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  referSub: {
    fontSize: 13,
    color: "#E8F5E9",
    marginTop: 2,
  },
  legalSection: {
    marginTop: 14,
    marginBottom: 30,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  legalLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  legalText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
});
