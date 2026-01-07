import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Items from "./Items";

export default function QuarryMaterialsContent() {
    const materials = [
        { name: "Pure Dust (Dust 1)", price: "N 9,600 per ton" },
        { name: "Stone Dust (Dust 2)", price: "N 9,600 per ton" },
        { name: "3/8", price: "N 9,600 per ton" },
        { name: "Half inch", price: "N 9,600 per ton" },
        { name: "3/4", price: "N 9,600 per ton" },
        { name: "1 inch", price: "N 9,600 per ton" },
        { name: "Hard core", price: "N 9,600 per ton" },
        { name: "Boulder", price: "N 9,600 per ton" },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Quarry Materials</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {materials.map((item, index) => (
                    <Items key={index} name={item.name} price={item.price} />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "#000",
        marginBottom: 20,
        marginTop: 10,
    },
    scrollContent: {
        paddingBottom: 20,
    },
});
