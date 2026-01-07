import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const Notifications = () => {
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

    const notifications: any[] = [];
    /* 
    // Cleared for new users as requested
    // previously contained dummy data
    */

    const getStatusIcon = (type: string) => {
        switch (type) {
            case "delivered":
                return <Ionicons name="checkmark-circle-outline" size={28} color="#439D25" />;
            case "pending":
                return <Ionicons name="arrow-back-circle-outline" size={28} color="#FACC15" style={{ transform: [{ rotate: '180deg' }] }} />;
            case "canceled":
                return <Ionicons name="close-circle-outline" size={28} color="#EF4444" />;
            default:
                return null;
        }
    };

    const getStatusStyle = (type: string) => {
        switch (type) {
            case "delivered":
                return { bg: "#E4F4E2", text: "#439D25" };
            case "pending":
                return { bg: "#FEF9C3", text: "#A16207" };
            case "canceled":
                return { bg: "#FEE2E2", text: "#EF4444" };
            default:
                return { bg: "#F0F0F0", text: "#606060" };
        }
    };

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Notification</Text>
                <TouchableOpacity>
                    <Ionicons name="options-outline" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* User Card */}
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

                {/* Filter Button */}
                <TouchableOpacity style={styles.filterPill}>
                    <Text style={styles.filterText}>Last Month</Text>
                </TouchableOpacity>

                {/* Notification Items */}
                {notifications.map((item) => {
                    const statusStyle = getStatusStyle(item.type);
                    return (
                        <View key={item.id} style={styles.notificationCard}>
                            <View style={styles.cardMain}>
                                <View style={styles.iconContainer}>
                                    {getStatusIcon(item.type)}
                                </View>
                                <View style={styles.infoContainer}>
                                    <Text style={styles.itemTitle}>{item.title}</Text>
                                    <Text style={styles.itemDesc}>{item.description}</Text>
                                </View>
                                <View style={styles.statusContainer}>
                                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                        <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                                            {item.status}
                                        </Text>
                                    </View>
                                    <View style={styles.dateTimeContainer}>
                                        <Text style={styles.dateTimeText}>Date: {item.date}</Text>
                                        <Text style={styles.dateTimeText}>time: {item.time}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    );
                })}

                {/* Spacing for Tab Bar */}
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
    profileCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 50,
        padding: 10,
        paddingHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E0E0E0",
        marginTop: 20,
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
    filterPill: {
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
        alignSelf: "flex-start",
        marginTop: 20,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    filterText: {
        fontSize: 12,
        color: "#808080",
        fontWeight: "600",
    },
    notificationCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardMain: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: "800",
        color: "#000",
    },
    itemDesc: {
        fontSize: 12,
        color: "#808080",
        marginTop: 2,
        fontWeight: "500",
    },
    statusContainer: {
        alignItems: "flex-end",
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
        marginBottom: 8,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: "800",
    },
    dateTimeContainer: {
        alignItems: "flex-end",
    },
    dateTimeText: {
        fontSize: 10,
        color: "#808080",
        fontWeight: "500",
    },
});

export default Notifications;
