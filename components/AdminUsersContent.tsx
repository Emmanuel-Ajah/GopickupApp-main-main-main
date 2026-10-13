import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAdminUsers, toggleUserBan } from "../services/api";

export default function AdminUsersContent() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await getAdminUsers();
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching admin users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleBanToggle = async (userId: string, currentStatus: boolean, userName: string) => {
        const action = currentStatus ? "unban" : "ban";

        Alert.alert(
            "Confirm Action",
            `Are you sure you want to ${action} ${userName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Yes",
                    onPress: async () => {
                        try {
                            await toggleUserBan(userId);
                            fetchUsers();
                        } catch (error) {
                            console.error("Ban toggle error:", error);
                            alert("Failed to update user status");
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#439D25" style={{ marginTop: 50 }} />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.sectionHeader}>Manage Users ({users.length})</Text>

            {users.map((user) => (
                <View key={user._id} style={styles.userCard}>
                    <View style={styles.userInfo}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={24} color="#606060" />
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.userName}>{user.name}</Text>
                            <Text style={styles.userEmail}>{user.email}</Text>
                            <View style={styles.idRow}>
                                <Text style={styles.idLabel}>ID:</Text>
                                <Text style={styles.idValue}>{user.userId}</Text>
                                <View style={[styles.roleBadge, { backgroundColor: user.role === 'driver' ? '#E3F2FD' : '#F5F5F5' }]}>
                                    <Text style={[styles.roleText, { color: user.role === 'driver' ? '#1976D2' : '#606060' }]}>
                                        {user.role}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.banBtn, user.isBanned && styles.unbanBtn]}
                        onPress={() => handleBanToggle(user._id, user.isBanned, user.name)}
                    >
                        <Ionicons
                            name={user.isBanned ? "checkmark-circle-outline" : "ban-outline"}
                            size={18}
                            color="white"
                        />
                        <Text style={styles.banBtnText}>{user.isBanned ? "Unban" : "Ban"}</Text>
                    </TouchableOpacity>
                </View>
            ))}

            {users.length === 0 && (
                <Text style={styles.emptyText}>No users found.</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 15,
        marginTop: 10,
    },
    userCard: {
        backgroundColor: 'white',
        borderRadius: 15,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#000',
    },
    userEmail: {
        fontSize: 12,
        color: '#606060',
        marginTop: 2,
    },
    idRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    idLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#A0A0A0',
    },
    idValue: {
        fontSize: 10,
        fontWeight: '700',
        color: '#606060',
        marginLeft: 4,
    },
    roleBadge: {
        marginLeft: 10,
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    banBtn: {
        backgroundColor: '#FF3B30',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        marginLeft: 10,
    },
    unbanBtn: {
        backgroundColor: '#439D25',
    },
    banBtnText: {
        color: 'white',
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 5,
    },
    emptyText: {
        textAlign: 'center',
        color: '#A0A0A0',
        marginTop: 30,
        fontSize: 14,
    }
});
