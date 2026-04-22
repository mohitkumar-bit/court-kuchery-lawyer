import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function CallScreen() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Audio calls are only supported on mobile devices.</Text>
            <Text style={styles.link} onPress={() => router.back()}>Go Back</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111827",
    },
    text: {
        color: "#fff",
        fontSize: 18,
        textAlign: "center",
        padding: 20,
    },
    link: {
        color: "#3b82f6",
        marginTop: 10,
        fontSize: 16,
    },
});
