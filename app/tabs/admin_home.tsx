import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import AdminDashboardContent from "../../components/AdminDashboardContent";

export default function AdminHome() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <AdminDashboardContent />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
});
