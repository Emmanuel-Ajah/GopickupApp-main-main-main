import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, TextInput, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAdminOrders, negotiateOrder, sendMessage } from "../services/api";

import AdminUsersContent from "./AdminUsersContent";

export default function AdminDashboardContent() {
    const [rates, setRates] = useState<Record<string, string>>({});
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'orders' | 'users'>('orders');

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
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

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
            Alert.alert("GoPickup", "Rate set and message sent to client!");
        } catch {
            Alert.alert("Error", "Could not set rate. Check the amount and connection.");
        }
    };

    const router = useRouter();

    const handleChatWithClient = async (userId: string) => {
        router.push({
            pathname: "/tabs/chat" as any,
            params: { recipientId: userId }
        });
    };

    if (loading && activeTab === 'orders') {
        return <ActivityIndicator size="large" color="#439D25" style={{ marginTop: 50 }} />;
    }

    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
            <Text style={styles.mainTitle}>Admin Dashboard</Text>

            <View style={styles.tabSwitcher}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
                    onPress={() => setActiveTab('orders')}
                >
                    <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>Requests</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'users' && styles.activeTab]}
                    onPress={() => setActiveTab('users')}
                >
                    <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Users</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'orders' ? (
                <>
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
                                <View style={{ flexDirection: "row", gap: 6 }}>
                                    <View style={[styles.statusBadge, { backgroundColor: order.paymentStatus === 'Paid' ? '#E8F5E9' : '#FFF3E0' }]}>
                                        <Text style={[styles.statusText, { color: order.paymentStatus === 'Paid' ? '#439D25' : '#D97706' }]}>
                                            {order.paymentStatus === 'Paid' ? 'Paid ✓' : 'Unpaid'}
                                        </Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: order.status === 'Pending' ? '#FFF3E0' : '#E8F5E9' }]}>
                                        <Text style={styles.statusText}>{order.status}</Text>
                                    </View>
                                </View>
                            </View>

                            <Text style={styles.orderUser}>Customer: {order.user?.name || 'Unknown'}</Text>
                            <Text style={styles.orderDetail}>Route: {order.pickupLocation} ➔ {order.deliveryLocation}</Text>
                            <Text style={[styles.orderDetail, { marginBottom: 6 }]}>
                                Payment: {order.paymentStatus || 'Unpaid'}{order.totalAmount > 0 ? ` (Materials: ₦${order.totalAmount.toLocaleString()})` : ''}
                            </Text>

                            <TextInput placeholder="Quote total (₦), including delivery" keyboardType="numeric" value={rates[order._id] || ''} onChangeText={value => setRates({ ...rates, [order._id]: value })} style={{ padding: 10, borderWidth: 1, borderColor: '#ddd' }} />
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={styles.negotiateBtn}
                                    onPress={() => handleNegotiate(order._id, order.user?._id, Number(rates[order._id]))}
                                >
                                    <Text style={styles.btnText}>Send quote</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.chatBtn}
                                    onPress={() => handleChatWithClient(order.user?._id)}
                                >
                                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="white" />
                                </TouchableOpacity>
                            </View>
                            {(['Processing', 'In Transit'].includes(order.status)) && <TouchableOpacity onPress={async () => {
                              try { await negotiateOrder(order._id, { status: order.status === 'Processing' ? 'In Transit' : 'Delivered' }); fetchOrders(); }
                              catch { Alert.alert('Error', 'Unable to update delivery'); }
                            }}><Text style={{ padding: 12 }}>Mark {order.status === 'Processing' ? 'In Transit' : 'Delivered'}</Text></TouchableOpacity>}
                        </View>
                    ))}
                    {orders.length === 0 && <Text style={styles.emptyText}>No requests found.</Text>}
                </>
            ) : (
                <AdminUsersContent />
            )}
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
    tabSwitcher: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 5,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#606060',
    },
    activeTabText: {
        color: '#439D25',
        fontWeight: '700',
    },
    emptyText: {
        textAlign: 'center',
        color: '#A0A0A0',
        marginTop: 40,
        fontSize: 14,
    },
});
