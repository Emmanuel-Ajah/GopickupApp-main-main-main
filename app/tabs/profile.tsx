import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
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
import { deleteMe, getMe, getMyOrders, updateMe } from "../../services/api";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Nigeria, Abuja");
  const [email, setEmail] = useState("");

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
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
          setName(parsed.name || "Azih Monica");
          setPhone(parsed.phone || "+234 000 000 0000");
          setEmail(parsed.email || "Azihmonica@gmail.com");
        }

        const profileRes = await getMe();
        if (profileRes?.data) {
          const profile = profileRes.data;
          setUser(profile);
          setName(profile.name || "Azih Monica");
          setPhone(profile.phone || "+234 000 000 0000");
          setEmail(profile.email || "Azihmonica@gmail.com");
          await AsyncStorage.setItem("user", JSON.stringify(profile));
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

  const handleSaveProfile = async () => {
    try {
      const res = await updateMe({ name, phone });
      setUser(res.data);
      await AsyncStorage.setItem("user", JSON.stringify(res.data));
      setEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to update profile");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account?",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMe();
              await handleLogout();
            } catch (err: any) {
              Alert.alert("Error", err?.response?.data?.message || "Unable to delete account");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAF8" />

      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.headerMenuBtn} accessibilityLabel="Options">
          <Ionicons name="ellipsis-vertical" size={24} color="#000000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Profile Pill Card */}
        <View style={styles.profileCard}>
          <Image
            source={require("../../assets/images/myImage.jpg")}
            style={styles.avatarImage}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "Azih Monica"}</Text>
            <View style={styles.idBadgeContainer}>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>User ID</Text>
              </View>
              <Text style={styles.idText}>{user?.userId || "D422Q7827"}</Text>
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
                placeholder="Name"
              />
            ) : (
              <Text style={styles.value}>{name || "Azih Monica"}</Text>
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
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.value}>{phone || "+234 000 000 0000"}</Text>
            )}
          </View>
          <View style={styles.divider} />

          {/* Location Row */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            {editing ? (
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="Location"
              />
            ) : (
              <Text style={styles.value}>{location || "Nigeria, Abuja"}</Text>
            )}
          </View>
          <View style={styles.divider} />

          {/* Email Row */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{email || "Azihmonica@gmail.com"}</Text>
          </View>
          <View style={styles.divider} />

          {/* Last Delivery */}
          <View style={[styles.infoRow, { marginTop: 14 }]}>
            <Text style={styles.subLabel}>Last Delivery:</Text>
            <Text style={styles.subValue}>May 6th, 2025</Text>
          </View>
          <Text style={styles.itemDelivered}>
            Item delivered: <Text style={{ color: "#555" }}>2 trips of coal</Text>
          </Text>

          {/* Total Delivery Pill */}
          <View style={styles.totalDeliveryContainer}>
            <View style={styles.totalDeliveryPill}>
              <Text style={styles.totalDeliveryText}>
                Total Delivery: <Text style={styles.totalDeliveryCount}>30</Text>
              </Text>
              <Text style={styles.successBadge}>Successful</Text>
            </View>
          </View>

          {/* Warning Note */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>
              You Can Only Edit Your Profile Once a month.
            </Text>
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
              style={styles.editButton}
              onPress={() => {
                if (editing) {
                  handleSaveProfile();
                } else {
                  setEditing(true);
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.editButtonText}>{editing ? "Save" : "Edit"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Refer a Friend Card */}
        <TouchableOpacity
          style={styles.referCard}
          onPress={() => Alert.alert("Refer a Friend", "Share GoPickup with friends and earn delivery bonus credits!")}
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
  profileCard: {
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
  profileInfo: {
    marginLeft: 14,
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
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  idBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  idText: {
    fontSize: 10,
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
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  warningIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  warningText: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "500",
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
  },
  deleteRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  deleteText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E53935",
    marginLeft: 6,
  },
  editButton: {
    backgroundColor: "#389E23",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  referCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  referImage: {
    width: 80,
    height: 50,
  },
  referInfo: {
    alignItems: "flex-end",
  },
  referTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#389E23",
  },
  referSub: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111111",
    marginTop: 2,
  },
});
