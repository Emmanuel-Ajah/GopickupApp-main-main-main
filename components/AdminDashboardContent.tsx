import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAdminOrders, negotiateOrder, sendMessage } from "../app/api/api";

export default function AdminDashboardContent() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const response = await getAdminOrders();
            setOrders(response.data);
        } catch (error) {
            console.error("Error fetching admin orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleNegotiate = async (orderId: string, userId: string, price: number) => {
        try {
            await negotiateOrder(orderId, {
                negotiatedPrice: price,
                status: 'Pending Negotiation'
            });

            // Auto-send a message to the user about the new rate
            await sendMessage({
                recipientId: userId,
                content: `Update: We have a rate for your load! The negotiated price is N ${price.toLocaleString()}. Please check your profile or chat with us for details.`,
                orderId: orderId
            });

            fetchOrders();
            alert("Rate set and message sent to client!");
        } catch (error) {
            console.error("Negotiation error:", error);
        }
    };

    const router = useRouter();

    const handleChatWithClient = async (userId: string) => {
        router.push({
            pathname: "/tabs/chat" as any,
            params: { recipientId: userId }
        });
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#439D25" style={{ marginTop: 50 }} />;
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
            <Text style={styles.mainTitle}>Admin Dashboard</Text>

            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statLabel}>Total Requests</Text>
                    <Text style={styles.statValue}>{orders.length}</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: '#F0F9EF' }]}>
                    <Text style={[styles.statLabel, { color: '#439D25' }]}>Pending</Text>
                    <Text style={[styles.statValue, { color: '#439D25' }]}>
                        {orders.filter(o => o.status === 'Pending' || o.status === 'Pending Negotiation').length}
                    </Text>
                </View>
            </View>

            <Text style={styles.sectionHeader}>Active Load Requests</Text>

            {orders.map((order) => (
                <View key={order._id} style={styles.orderCard}>
                    <View style={styles.orderHeader}>
                        <Text style={styles.orderId}>{order.trackingId}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: order.status === 'Pending' ? '#FFF3E0' : '#E8F5E9' }]}>
                            <Text style={styles.statusText}>{order.status}</Text>
                        </View>
                    </View>

                    <Text style={styles.orderUser}>Customer: {order.user?.name || 'Unknown'}</Text>
                    <Text style={styles.orderDetail}>Route: {order.pickupLocation} ➔ {order.deliveryLocation}</Text>

                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.negotiateBtn}
                            onPress={() => handleNegotiate(order._id, order.user?._id, 135000)}
                        >
                            <Text style={styles.btnText}>Set Rate (N 135k)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.chatBtn}
                            onPress={() => handleChatWithClient(order.user?._id)}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#000",
        marginBottom: 20,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    statBox: {
        backgroundColor: '#F5F5F5',
        borderRadius: 15,
        padding: 15,
        width: '48%',
    },
    statLabel: {
        fontSize: 12,
        color: '#606060',
        fontWeight: '600',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: '#000',
        marginTop: 4,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
    },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    orderId: {
        fontSize: 14,
        fontWeight: '700',
        color: '#439D25',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 5,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    orderUser: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 4,
    },
    orderDetail: {
        fontSize: 12,
        color: '#606060',
        marginBottom: 15,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    negotiateBtn: {
        backgroundColor: '#439D25',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 15,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    chatBtn: {
        backgroundColor: '#000',
        borderRadius: 10,
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 14,
    },
});
