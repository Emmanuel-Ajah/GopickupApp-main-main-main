import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MapScreen = () => {
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

  const timelineData = [
    {
      id: 1,
      title: "Order Received",
      description: "waiting for vendor release your material.",
      time: "12:30 PM",
      status: "completed",
    },
    {
      id: 2,
      title: "Preparing your order",
      description: "Your goods will be ready in 1hr.",
      time: "12:50 PM",
      status: "completed",
    },
    {
      id: 3,
      title: "Driver Receives Materials",
      description: "Your goods has been assigned to driver.",
      time: "01:50 PM",
      status: "completed",
    },
    {
      id: 4,
      title: "Driver Documentation",
      description: "Drive is in touch with Go Pickup agent.",
      time: "",
      status: "pending",
    },
    {
      id: 5,
      title: "Driver has left pickup location.",
      description: "Your materials is on it way.",
      time: "",
      status: "pending",
    },
    {
      id: 6,
      title: "Driver Delivers goods at client's location.",
      description: "Good delivered.",
      time: "",
      status: "pending",
    },
  ];

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Map</Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Monica status card */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewName}>{user?.name || "User"}</Text>
          <Text style={styles.overviewStatus}>
            Driver is on their way to deliver your material.
          </Text>
        </View>

        {/* Timeline Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Delivery info per time</Text>
        </View>

        <View style={styles.timelineContainer}>
          {timelineData.map((item, index) => (
            <View key={item.id} style={styles.timelineItem}>
              {/* Timeline Line & Dot */}
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.dot,
                    item.status === 'completed' ? styles.dotCompleted : styles.dotPending
                  ]}
                >
                  {item.status === 'completed' && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                {index !== timelineData.length - 1 && (
                  <View style={[styles.line, item.status === 'completed' ? styles.lineCompleted : styles.linePending]} />
                )}
              </View>

              {/* Timeline Content */}
              <View style={styles.timelineBody}>
                <View style={styles.timelineRow}>
                  <View style={styles.textColumn}>
                    <Text
                      style={[
                        styles.itemTitle,
                        item.status === 'pending' && styles.pendingText
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        styles.itemDesc,
                        item.status === 'pending' && styles.pendingTextLight
                      ]}
                    >
                      {item.description}
                    </Text>
                  </View>
                  {item.time !== "" && (
                    <Text style={styles.itemTime}>{item.time}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Shipment Detail Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shipment detail</Text>
        </View>

        <View style={styles.detailGrid}>
          <View style={styles.detailCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircleYellow}>
                <Text style={styles.iconText}>!</Text>
              </View>
              <Text style={styles.cardCount}>2</Text>
            </View>
            <Text style={styles.cardLabel}>Delivery Update</Text>
          </View>

          <View style={styles.detailCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircleBlue}>
                <Text style={styles.iconText}>!</Text>
              </View>
              <Text style={styles.cardCount}>0</Text>
            </View>
            <Text style={styles.cardLabel}>Exceptions</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    backgroundColor: "#FFFFFF",
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
  overviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 25,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  overviewName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#000",
  },
  overviewStatus: {
    fontSize: 14,
    color: "#808080",
    marginTop: 6,
    fontWeight: "500",
  },
  sectionHeader: {
    marginTop: 30,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
  },
  timelineContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  timelineItem: {
    flexDirection: "row",
    minHeight: 80,
  },
  timelineLeft: {
    alignItems: "center",
    width: 30,
    marginRight: 15,
  },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  dotCompleted: {
    backgroundColor: "#439D25",
  },
  dotPending: {
    backgroundColor: "#C0C0C0",
  },
  line: {
    flex: 1,
    width: 2,
    marginTop: -2,
    marginBottom: -2,
  },
  lineCompleted: {
    backgroundColor: "#439D25",
  },
  linePending: {
    backgroundColor: "#F0F0F0",
  },
  timelineBody: {
    flex: 1,
  },
  timelineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  textColumn: {
    flex: 1,
    paddingRight: 10,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
  },
  itemDesc: {
    fontSize: 12,
    color: "#808080",
    marginTop: 4,
    lineHeight: 16,
    fontWeight: "500",
  },
  itemTime: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000",
  },
  pendingText: {
    color: "#C0C0C0",
  },
  pendingTextLight: {
    color: "#DBDBDB",
  },
  detailGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailCard: {
    backgroundColor: "#F4F4F4",
    borderRadius: 15,
    padding: 15,
    width: "48%",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircleYellow: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#EAB308",
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleBlue: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "white",
    fontSize: 14,
    fontWeight: "900",
  },
  cardCount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#000",
    marginLeft: 10,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: "900",
    color: "#000",
  },
});

export default MapScreen;
