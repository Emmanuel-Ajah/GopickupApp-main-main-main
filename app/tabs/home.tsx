import Ionicons from "@expo/vector-icons/Ionicons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import {
  Image,
  Modal,
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
import { createOrder } from "../api/api"

export default function Home() {
  const router = useRouter();
  const [selected, setSelected] = useState("Buy Material");
  const [visible, setVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    };
    fetchUser();
  }, []);

  const tabs = [
    "Buy Material",
    "Natural Resources",
    "Track My Delivery",
  ];

  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const onAddToCart = (item: any) => {
    setCart([...cart, item]);
    alert(`${item.quantity > 1 ? `${item.quantity}x ` : ""}${item.title || item.name} added to cart!`);
  };

  const handleConfirmOrder = async () => {
    if (cart.length === 0) {
      alert("Please add items to your cart before confirming.");
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
        totalAmount: 0,
        pickupLocation: "Mining Site",
        deliveryLocation: "Customer Address",
      };

      const response = await createOrder(orderData);
      alert(`Order Success! trackingId: ${response.data.trackingId}`);
      setVisible(false);
      setCart([]);
    } catch (error: any) {
      console.error("Order error:", error);
      alert("Order Failed: " + (error.response?.data?.message || "Error"));
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = (tab: string) => {
    setSelected(tab);
    setActiveTab(tab);
    setVisible(true);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
            placeholderTextColor="#A0A0A0"
          />
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Coal Card */}
        <View style={styles.coalCard}>
          <View>
            <Text style={styles.coalTitle}>Coal</Text>
            <Text style={styles.coalSubtitle}>Available</Text>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => {
                setActiveTab("Natural Resources");
                setVisible(true);
              }}
            >
              <Text style={styles.buyText}>Buy</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={require("../../assets/images/Rock.png")}
            style={styles.coalImage}
          />
        </View>

        {/* GoMarket Banner */}
        <TouchableOpacity style={styles.bannerContainer}>
          <Image
            source={require("../../assets/images/GoMarket.png")}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => handleTabPress(tab)}
                style={[
                  styles.tabButton,
                  selected === tab && styles.selectedTabButton,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    selected === tab && styles.selectedTabText,
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Cards Row */}
        <View style={styles.gridRow}>


          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => {
              setActiveTab("Booking Details");
              setVisible(true);
            }}
          >
            <View style={styles.gridCardHeader}>
              <Text style={styles.gridCardTitle}>Book a{"\n"}truck driver</Text>
              <View style={styles.iconBg}>
                <Ionicons name="bus-outline" size={20} color="#439D25" />
              </View>
            </View>
            <Text style={styles.gridCardSub}>Our Dispatch Equipment</Text>
            <Text style={styles.gridCardDesc}>
              Van, Pick Up, Truck, Flat bed, Trailer and Tipper.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Register Vendor Card */}
        <TouchableOpacity style={styles.vendorCard}>
          <Image
            source={require("../../assets/images/Futures 1.png")}
            style={styles.vendorImage}
          />
          <View style={styles.vendorInfo}>
            <Text style={styles.vendorTitle}>
              Register as a building material vendor.
            </Text>
            <Text style={styles.vendorSub}>
              Begin your journey to great business values
            </Text>
          </View>
        </TouchableOpacity>

        <Image
          source={require("../../assets/images/Truck GoPick 1.png")}
          style={styles.bottomTruckImage}
        />

        {/* Driver Section */}
        <View style={styles.driverSection}>
          <View style={styles.driverBorder}>
            <Image
              source={require("../../assets/images/Futures 1.png")}
              style={styles.driverIcon}
            />
            <View style={styles.driverTextContainer}>
              <Text style={styles.driverQuestion}>Are you a Driver?</Text>
              <Text style={styles.driverAction}>Register to drive with Go pickup</Text>
            </View>
          </View>
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
            {activeTab === "Buy Material" && <BuyMaterialContent onAddToCart={onAddToCart} />}
            {activeTab === "Natural Resources" && <NaturalResourcesContent onAddToCart={onAddToCart} />}
            {activeTab === "Track My Delivery" && <TrackDeliveryContent />}
            {activeTab === "Booking Details" && <BookingDetailsContent />}
          </ScrollView>

          {/* Fallback for Coal Card click if not strictly setting activeTab */}
          {!activeTab && <NaturalResourcesContent onAddToCart={onAddToCart} />}

          {activeTab !== "Booking Details" && activeTab !== "Track My Delivery" && (
            <TouchableOpacity
              onPress={handleConfirmOrder}
              disabled={loading}
              style={[styles.confirmButton, { opacity: loading ? 0.7 : 1 }]}
            >
              <Text style={styles.confirmText}>
                {loading ? "Processing..." : `Confirm Order (${cart.length} items)`}
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
    backgroundColor: "#F8FBF8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
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
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  userInfo: {
    marginLeft: 8,
    marginRight: 15,
  },
  userName: {
    fontSize: 13,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  idValue: {
    fontSize: 9,
    color: "#606060",
    marginLeft: 4,
    fontWeight: "600",
  },
  notificationBtn: {
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 2,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    borderWidth: 1.5,
    borderColor: "white",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingLeft: 20,
    paddingRight: 6,
    height: 54,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#000",
  },
  searchButton: {
    backgroundColor: "#439D25",
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  coalCard: {
    backgroundColor: "#EFF7EE",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  coalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#000",
  },
  coalSubtitle: {
    fontSize: 14,
    color: "#606060",
    marginTop: 2,
  },
  buyButton: {
    backgroundColor: "#000000",
    borderRadius: 20,
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginTop: 15,
    alignSelf: "flex-start",
  },
  buyText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },
  coalImage: {
    width: 160,
    height: 100,
    resizeMode: "contain",
  },
  bannerContainer: {
    marginTop: 20,
    borderRadius: 15,
    overflow: "hidden",
  },
  bannerImage: {
    width: "100%",
    height: 110,
  },
  tabsContainer: {
    marginTop: 25,
  },
  tabButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedTabButton: {
    borderColor: "#439D25",
    backgroundColor: "#F0F9EF",
  },
  tabText: {
    fontSize: 13,
    color: "#606060",
    fontWeight: "600",
  },
  selectedTabText: {
    color: "#439D25",
    fontWeight: "700",
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },
  gridCard: {
    backgroundColor: "#EFF7EE",
    width: "48%",
    borderRadius: 20,
    padding: 15,
  },
  gridCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  gridCardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
  },
  iconBg: {
    backgroundColor: "#D9EBD7",
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  gridCardSub: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
    marginTop: 12,
  },
  gridCardDesc: {
    fontSize: 11,
    color: "#606060",
    marginTop: 4,
    lineHeight: 14,
  },
  vendorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  vendorImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  vendorInfo: {
    flex: 1,
    marginLeft: 15,
  },
  vendorTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000",
  },
  vendorSub: {
    fontSize: 11,
    color: "#606060",
    marginTop: 2,
  },
  bottomTruckImage: {
    width: "100%",
    height: 160,
    borderRadius: 20,
    marginTop: 25,
    resizeMode: "cover",
  },
  driverSection: {
    marginTop: 25,
    backgroundColor: "#CDEBC9",
    padding: 15,
    borderRadius: 12,
  },
  driverBorder: {
    borderWidth: 1,
    borderColor: "white",
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
  },
  driverIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  driverTextContainer: {
    marginLeft: 15,
  },
  driverQuestion: {
    fontSize: 12,
    fontWeight: "700",
    color: "#000",
  },
  driverAction: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
    marginTop: 2,
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
