import React from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function BookingDetailsContent() {
    return (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
            <Text style={styles.mainTitle}>Booking Details</Text>

            <View style={styles.section}>
                <Text style={styles.subHeader}>Let's get your goods moving</Text>
                <TouchableOpacity style={styles.chooseBtn}>
                    <Text style={styles.chooseBtnText}>Choose the right vehicle</Text>
                </TouchableOpacity>
            </View>

            {/* Pickup Section */}
            <View style={styles.fieldSection}>
                <Text style={styles.label}>Pickup Location</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter pickup location"
                        placeholderTextColor="#C0C0C0"
                    />
                </View>
            </View>

            {/* Dropoff Section */}
            <View style={styles.fieldSection}>
                <Text style={styles.label}>Drop off Location</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Delivery Destination"
                        placeholderTextColor="#C0C0C0"
                    />
                </View>
            </View>

            {/* Package Section */}
            <View style={styles.fieldSection}>
                <Text style={styles.label}>Package Description</Text>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Description of item"
                        placeholderTextColor="#C0C0C0"
                    />
                </View>
                <View style={[styles.inputWrapper, { marginTop: 10 }]}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter weight/size"
                        placeholderTextColor="#C0C0C0"
                    />
                </View>
            </View>

            {/* Delivery Time Section */}
            <View style={styles.fieldSection}>
                <Text style={styles.label}>Delivery Time</Text>
                <View style={styles.timeOptions}>
                    <TouchableOpacity style={styles.timePill}>
                        <Text style={styles.timeText}>Immediate Pickup</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.timePill, { marginTop: 10 }]}>
                        <Text style={styles.timeText}>Schedule Later</Text>
                    </TouchableOpacity>
                </View>
            </View>

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
        marginBottom: 25,
    },
    section: {
        marginBottom: 20,
    },
    subHeader: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
        marginBottom: 15,
    },
    chooseBtn: {
        backgroundColor: "#439D25",
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: "center",
    },
    chooseBtnText: {
        color: "white",
        fontSize: 15,
        fontWeight: "700",
    },
    fieldSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000",
        marginBottom: 8,
    },
    inputWrapper: {
        backgroundColor: "#F5F5F5",
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 44,
        justifyContent: "center",
    },
    input: {
        fontSize: 15,
        color: "#000",
        fontWeight: "400",
    },
    timeOptions: {
        width: "100%",
    },
    timePill: {
        backgroundColor: "#F5F5F5",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        height: 44,
        justifyContent: "center",
    },
    timeText: {
        fontSize: 14,
        color: "#A0A0A0",
        fontWeight: "400",
    },
    paymentRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
    },
    paymentText: {
        fontSize: 14,
        color: "#606060",
        fontWeight: "600",
        marginLeft: 12,
    },
});
