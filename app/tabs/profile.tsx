import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["token", "user"]);
      router.replace("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
      try {
        const { getMyReviews } = require("../api/api");
        const response = await getMyReviews();
        if (response.data.success) {
          setReviews(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Profile Card */}
        <View style={styles.profileCard}>
          {user?.image ? (
            <Image
              source={{ uri: user.image }}
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profileImage, { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' }]}>
              <Ionicons name="person" size={30} color="#A0A0A0" />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || "User"}</Text>
            <View style={styles.idBadgeContainer}>
              <View style={styles.idBadge}>
                <Text style={styles.idBadgeText}>User ID</Text>
              </View>
              <Text style={styles.idText}>{user?.userId || "..."}</Text>
            </View>
          </View>
        </View>

        {/* Account Info Title */}
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={24} color="#000" />
          <Text style={styles.sectionTitle}>Account Info</Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{user?.name || "-"}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone No:</Text>
            <Text style={styles.value}>{user?.phone || "-"}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.value}>Nigeria, Abuja</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user?.email || "-"}</Text>
          </View>
          <View style={styles.divider} />

          <View style={[styles.infoRow, { marginTop: 15 }]}>
            <Text style={styles.subLabel}>Last Delivery:</Text>
            <Text style={styles.subValue}>May 6th, 2025</Text>
          </View>
          <Text style={styles.itemDelivered}>
            <Text style={{ fontWeight: "600" }}>Item delivered:</Text> 2 trips of coal
          </Text>

          <View style={styles.totalDeliveryContainer}>
            <View style={styles.totalDeliveryPill}>
              <Text style={styles.totalDeliveryText}>
                Total Delivery: <Text style={styles.totalDeliveryCount}>30</Text>
              </Text>
              <View style={styles.successBadge}>
                <Text style={styles.successText}>Successful</Text>
              </View>
            </View>
          </View>

          <View style={styles.warningContainer}>
            <Ionicons name="warning" size={20} color="#EAB308" />
            <Text style={styles.warningText}>
              You Can Only Edit Your Profile Once a month.
            </Text>
          </View>

          <TouchableOpacity style={styles.deleteContainer}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>

          <View style={styles.editBtnWrapper}>
            <TouchableOpacity style={styles.editBtn}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* My Reviews Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="star-outline" size={24} color="#000" />
          <Text style={styles.sectionTitle}>My Reviews</Text>
        </View>

        <View style={styles.reviewsCard}>
          {reviews.length > 0 ? (
            reviews.map((rev, idx) => (
              <View key={rev._id || idx} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewRider}>Rider: {rev.riderName}</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{rev.rating} ★</Text>
                  </View>
                </View>
                <Text style={styles.experienceText}>{rev.experience}</Text>
                {rev.feedback ? <Text style={styles.feedbackText}>"{rev.feedback}"</Text> : null}
                <View style={styles.tagBubbleContainer}>
                  {rev.tags?.map((tag: string) => (
                    <View key={tag} style={styles.tagBubble}>
                      <Text style={styles.tagBubbleText}>{tag}</Text>
                    </View>
                  ))}
                </View>
                {idx < reviews.length - 1 && <View style={styles.reviewDivider} />}
              </View>
            ))
          ) : (
            <View style={styles.emptyReviews}>
              <Ionicons name="chatbox-ellipses-outline" size={40} color="#CCC" />
              <Text style={styles.emptyText}>No reviews yet. Rate your deliveries to see them here!</Text>
            </View>
          )}
        </View>

        {/* Refer a Friend Banner */}
        <TouchableOpacity style={styles.referCard}>
          <Image
            source={require("../../assets/images/Futures 1.png")}
            style={styles.referImage}
          />
          <View style={styles.referInfo}>
            <Text style={styles.referTitle}>Refer a friend</Text>
            <Text style={styles.referSub}>And get Bonus</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>


      {/* Spacing for Tab Bar */}
      <View style={{ height: 100 }} />
    </View>
  );
};

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
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#000",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    padding: 10,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 10,
    alignSelf: "center",
    width: "100%",
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  profileInfo: {
    marginLeft: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
  },
  idBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  idBadge: {
    backgroundColor: "#439D25",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  idBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  idText: {
    fontSize: 10,
    color: "#606060",
    marginLeft: 6,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000",
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
    width: 80,
  },
  value: {
    fontSize: 15,
    color: "#000",
    fontWeight: "500",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  subLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#606060",
  },
  subValue: {
    fontSize: 15,
    fontWeight: "800",
    color: "#606060",
    marginLeft: 15,
  },
  itemDelivered: {
    fontSize: 11,
    color: "#606060",
    marginTop: 5,
  },
  totalDeliveryContainer: {
    marginTop: 20,
  },
  totalDeliveryPill: {
    backgroundColor: "#F0F9EF",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },
  totalDeliveryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#606060",
  },
  totalDeliveryCount: {
    fontSize: 18,
    color: "#000",
    fontWeight: "900",
  },
  successBadge: {
    backgroundColor: "#E4F4E2",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 10,
  },
  successText: {
    color: "#439D25",
    fontSize: 10,
    fontWeight: "800",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
  },
  warningText: {
    fontSize: 10,
    color: "#606060",
    marginLeft: 8,
    fontWeight: "700",
  },
  deleteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
  },
  deleteText: {
    color: "#439D25",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 10,
  },
  editBtnWrapper: {
    alignItems: "flex-end",
    marginTop: -35,
  },
  editBtn: {
    backgroundColor: "#439D25",
    borderRadius: 25,
    paddingHorizontal: 35,
    paddingVertical: 12,
  },
  editBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  referCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  referImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  referInfo: {
    marginLeft: 100,
  },
  referTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#439D25",
  },
  referSub: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
    marginTop: 2,
  },
  reviewsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 10,
    marginTop: 10,
  },
  reviewItem: {
    marginBottom: 15,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewRider: {
    fontSize: 14,
    fontWeight: "700",
    color: "#000",
  },
  ratingBadge: {
    backgroundColor: "#EFF7EE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  ratingText: {
    color: "#439D25",
    fontSize: 12,
    fontWeight: "900",
  },
  experienceText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#DAA520",
    marginTop: 4,
  },
  feedbackText: {
    fontSize: 13,
    color: "#606060",
    fontStyle: "italic",
    marginTop: 6,
  },
  tagBubbleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  tagBubble: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagBubbleText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#808080",
  },
  reviewDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginTop: 15,
  },
  emptyReviews: {
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 13,
    color: "#A0A0A0",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
});

export default Profile;
