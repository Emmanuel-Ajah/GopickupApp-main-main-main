import Ionicons from "@expo/vector-icons/Ionicons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import BookingDetailsContent from '../../components/BookingDetailsContent'
import BuyMaterialContent from '../../components/BuyMaterialContent'
import NaturalResourcesContent from '../../components/NaturalResourcesContent'
import TrackDeliveryContent from '../../components/TrackDeliveryContent'
import PostRequestContent from '../../components/PostRequestContent'
import LocationAutocompleteInput from '../../components/LocationAutocompleteInput'
import { createOrder } from "../../services/api"

export default function Home() {
  const router = useRouter();
  const [selected, setSelected] = useState("Buy Material");
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showPostRequest, setShowPostRequest] = useState(false);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Redirect if admin
        if (parsedUser.role === "admin") {
          router.replace("/tabs/admin_home" as any);
        }
      }
    };
    fetchUser();
  }, [router]);

  const tabs = [
    "Buy Material",
    "Natural Resources",
    "Track My Delivery",
  ];

  const [booking, setBooking] = useState({ pickupLocation: '', deliveryLocation: '', vehicle: '', description: '', weight: '', contactPhone: '', scheduledAt: '' });
  const [search, setSearch] = useState('');
  const [cartReady, setCartReady] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?._id) return;
    let active = true;
    setCartReady(false);
    AsyncStorage.getItem(`cart:${user._id}`).then(raw => {
      if (active) { setCart(raw ? JSON.parse(raw) : []); setCartReady(true); }
    }).catch(() => { if (active) setCartReady(true); });
    return () => { active = false; };
  }, [user?._id]);
  useEffect(() => {
    if (cartReady && user?._id) AsyncStorage.setItem(`cart:${user._id}`, JSON.stringify(cart)).catch(() => {});
  }, [cart, cartReady, user?._id]);

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const onAddToCart = (item: any) => {
    if (!cartReady) { Alert.alert('Please wait', 'Your cart is loading.'); return; }
    setCart((prev) => [...prev, item]);
  };

  const handlePostLoad = async () => {
    setLoading(true);
    try {
      const orderData = { ...booking, kind: 'load' };
      const response = await createOrder(orderData);
      Alert.alert("GoPickup", `Load Posted Successfully! Admin will contact you in chat to negotiate the rate. trackingId: ${response.data.trackingId}`);
      setVisible(false);
      setActiveTab(null);
    } catch (error: any) {
      console.error("Post Load error:", error);
      Alert.alert("GoPickup", "Failed to post load: " + (error.response?.data?.message || "Error"));
    } finally {
      setLoading(false);
    }
  };


  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("GoPickup", "Please add items to your cart before confirming.");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          name: item.title || item.name,
          size: item.size || "",
          quantity: item.quantity || 1,
          price: item.price
        })),
        ...booking,
        kind: 'materials',
      };

      const response = await createOrder(orderData);
      Alert.alert("GoPickup", `Order Success! trackingId: ${response.data.trackingId}`);
      setVisible(false);
      setCart([]);
    } catch (error: any) {
      console.error("Order error:", error);
      Alert.alert("GoPickup", "Order Failed: " + (error.response?.data?.message || "Error"));
    } finally {
      setLoading(false);
    }
  };
  const handleTabPress = (tab: string) => {
    setSelected(tab);
    setActiveTab(tab);
    setVisible(true);
  };

  if (showPostRequest) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAF8" />
        <PostRequestContent
          onClose={() => setShowPostRequest(false)}
          user={user}
        />
      </View>
    );
  }

  if (showBookingDetails) {
    return (
      <View style={styles.mainContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAF8" />
        <BookingDetailsContent
          onClose={() => setShowBookingDetails(false)}
          user={user}
        />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAF8" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Home</Text>
        <View style={styles.headerRight}>
          <View style={styles.profileSection}>
            {user?.image ? (
              <Image
                source={{ uri: user.image }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="person" size={20} color="#606060" />
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || "Guest"}</Text>
              <View style={styles.idBadge}>
                <Text style={styles.idLabel}>User ID</Text>
                <Text style={styles.idValue}>{user?.userId || "..."}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationBtn}
            onPress={() => router.push("/tabs/notifications")}
          >
            <Ionicons name="notifications-outline" size={28} color="#000" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#757575"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => handleTabPress("Buy Material")}
          >
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Track My Delivery Button */}
        <TouchableOpacity
          style={styles.trackDeliveryButton}
          onPress={() => {
            setActiveTab("Track My Delivery");
            setVisible(true);
          }}
        >
          <Text style={styles.trackDeliveryButtonText}>Track My Delivery</Text>
        </TouchableOpacity>

        {/* Cards Row */}
        <View style={styles.gridRow}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => {
              setShowPostRequest(true);
            }}
          >
            <View style={styles.gridCardHeader}>
              <Text style={styles.gridCardTitle}>Ready to{"\n"}Ship?</Text>
              <View style={styles.iconBg}>
                <Ionicons name="location-outline" size={22} color="#439D25" />
              </View>
            </View>
            <Text style={styles.gridCardSub}>Post a load</Text>
            <Text style={styles.gridCardDesc}>
              Truck Delivery and Pickup anywhere in Nigeria.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => {
              setShowBookingDetails(true);
            }}
          >
            <View style={styles.gridCardHeader}>
              <Text style={styles.gridCardTitle}>Book a{"\n"}truck driver</Text>
              <View style={styles.iconBg}>
                <Ionicons name="bus-outline" size={22} color="#439D25" />
              </View>
            </View>
            <Text style={styles.gridCardSub}>Our Dispatch Equipment</Text>
            <Text style={styles.gridCardDesc}>
              Van, Pick Up, Truck, Flat bed, Trailer and Tipper.
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Content Modal */}
      <Modal
        visible={visible}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={28} color="black" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="ellipsis-vertical" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {activeTab === "Buy Material" && <BuyMaterialContent search={search} onAddToCart={onAddToCart} />}
            {activeTab === "Natural Resources" && <NaturalResourcesContent onAddToCart={onAddToCart} />}
            {activeTab === "Track My Delivery" && <TrackDeliveryContent />}
            {activeTab === "Booking Details" && <BookingDetailsContent value={booking} onChange={setBooking} />}
          </ScrollView>

          {(activeTab === 'Buy Material' || activeTab === 'Natural Resources') && (
            <View style={{ padding: 12 }}>
              <Text>Delivery details · delivery fee quoted separately</Text>
              <LocationAutocompleteInput
                placeholder="Supplier / pickup address"
                value={booking.pickupLocation}
                onChangeText={(text) => setBooking({ ...booking, pickupLocation: text })}
                containerStyle={{ marginTop: 8, marginBottom: 8 }}
              />
              <LocationAutocompleteInput
                placeholder="Delivery address"
                value={booking.deliveryLocation}
                onChangeText={(text) => setBooking({ ...booking, deliveryLocation: text })}
                containerStyle={{ marginBottom: 8 }}
              />
              <TextInput
                accessibilityLabel="contactPhone"
                placeholder="Contact phone"
                value={booking.contactPhone}
                onChangeText={(text) => setBooking({ ...booking, contactPhone: text })}
                keyboardType="phone-pad"
                style={{ borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 8, marginBottom: 8 }}
              />
              {cart.map((item, index) => <View key={index} style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <Text>{item.quantity} × {item.title || item.name}</Text>
                <TouchableOpacity onPress={() => setCart(cart.filter((_, i) => i !== index))}><Text>Remove</Text></TouchableOpacity>
              </View>)}
              {cart.length > 0 && <TouchableOpacity onPress={() => setCart([])}><Text>Clear cart</Text></TouchableOpacity>}
            </View>
          )}
          {/* Fallback for Coal Card click if not strictly setting activeTab */}
          {!activeTab && <NaturalResourcesContent onAddToCart={onAddToCart} />}

          {activeTab !== "Track My Delivery" && (
            <TouchableOpacity
              onPress={activeTab === "Booking Details" ? handlePostLoad : handleConfirmOrder}
              disabled={loading}
              style={[styles.confirmButton, { opacity: loading ? 0.7 : 1 }]}
            >
              <Text style={styles.confirmText}>
                {loading ? "Processing..." : activeTab === "Booking Details" ? "Post to Load Board & Book" : `Confirm Order (${totalItems} items)`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 54 : 40,
    paddingBottom: 14,
    backgroundColor: "#F8FAF8",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  userInfo: {
    marginLeft: 8,
    marginRight: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  idBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  idLabel: {
    backgroundColor: "#439D25",
    color: "white",
    fontSize: 8,
    fontWeight: "800",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  idValue: {
    fontSize: 9.5,
    color: "#555555",
    marginLeft: 4,
    fontWeight: "600",
  },
  notificationBtn: {
    position: "relative",
    padding: 2,
  },
  notificationDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    borderWidth: 1.5,
    borderColor: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingLeft: 18,
    paddingRight: 6,
    height: 52,
    borderWidth: 1.2,
    borderColor: "#222222",
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  searchButton: {
    backgroundColor: "#439D25",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  trackDeliveryButton: {
    width: "100%",
    borderWidth: 1.2,
    borderColor: "#439D25",
    backgroundColor: "#F2F7F0",
    borderRadius: 26,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  trackDeliveryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  gridCard: {
    backgroundColor: "#E6EFE4",
    width: "48%",
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
  },
  gridCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  gridCardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F1A0E",
    lineHeight: 21,
  },
  iconBg: {
    backgroundColor: "#D2EBD0",
    width: 40,
    height: 40,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  gridCardSub: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1A1A1A",
    marginTop: 18,
  },
  gridCardDesc: {
    fontSize: 10.5,
    color: "#5A6559",
    marginTop: 4,
    lineHeight: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#439D25",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 20,
  },
  confirmText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
