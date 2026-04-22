import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    ScrollView,
    SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";

import { AppColors } from "@/constants/theme";
import { consultService } from "@/services/consultService";

export default function ConsultDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>(); // sessionId
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        const fetchSessionData = async () => {
            try {
                if (!id) return;
                const res = await consultService.getSessionDetails(id);
                setSession(res.session);
            } catch (error) {
                console.error("LOAD CONSULT DETAILS ERROR:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessionData();
    }, [id]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={AppColors.primary} />
            </View>
        );
    }

    if (!session) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>Session details not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
                    <Text style={styles.backLinkText}>Go back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const clientName = session.userId?.name || "Client";
    const date = new Date(session.createdAt);
    const dateStr = date.toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
    const timeStr = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ENDED": return "#10b981";
            case "FORCE_ENDED": return "#f59e0b";
            case "CANCELLED": return "#ef4444";
            case "DECLINED": return "#ef4444";
            default: return "#64748b";
        }
    };

    const getStatusBg = (status: string) => {
        switch (status) {
            case "ENDED": return "#ecfdf5";
            case "FORCE_ENDED": return "#fffbeb";
            case "CANCELLED": return "#fef2f2";
            case "DECLINED": return "#fef2f2";
            default: return "#f1f5f9";
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={AppColors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Consult Details</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatarFallback}>
                        <Ionicons name="person" size={40} color="#94a3b8" />
                    </View>
                    <Text style={styles.clientName}>{clientName}</Text>
                    <Text style={styles.consultTypeLabel}>
                        {session.type === "CALL" ? "Audio Call" : "Chat Consultation"}
                    </Text>

                    {session.type !== "CALL" ? (
                        <TouchableOpacity
                            style={styles.chatHistoryBtn}
                            onPress={() => router.push(`/chat-view/${id}`)}
                        >
                            <Ionicons name="chatbubbles" size={20} color="#fff" />
                            <Text style={styles.chatHistoryBtnText}>View Chat History</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.durationSummaryBadge}>
                            <Ionicons name="time" size={20} color={AppColors.primary} />
                            <Text style={styles.durationSummaryText}>
                                Total Duration: {session.durationSeconds ? Math.ceil(session.durationSeconds / 60) : 0} mins
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.divider} />

                {/* Session Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>SESSION SUMMARY</Text>

                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={styles.fieldLabel}>Status</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusBg(session.status) }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(session.status) }]}>
                                    {session.status}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.fieldLabel}>Type</Text>
                            <Text style={styles.fieldValue}>{session.type}</Text>
                        </View>
                    </View>

                    <View style={[styles.row, { marginTop: 20 }]}>
                        <View style={styles.col}>
                            <Text style={styles.fieldLabel}>Date</Text>
                            <Text style={styles.fieldValue}>{dateStr}</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.fieldLabel}>Time</Text>
                            <Text style={styles.fieldValue}>{timeStr}</Text>
                        </View>
                    </View>

                    <View style={[styles.row, { marginTop: 20 }]}>
                        <View style={styles.col}>
                            <Text style={styles.fieldLabel}>Rate</Text>
                            <Text style={styles.fieldValue}>₹{session.ratePerMinute}/min</Text>
                        </View>
                        <View style={styles.col}>
                            <Text style={styles.fieldLabel}>Duration</Text>
                            <Text style={styles.fieldValue}>
                                {session.durationSeconds ? Math.ceil(session.durationSeconds / 60) : 0} mins
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.divider, { marginVertical: 20 }]} />

                {/* Billing Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>BILLING INFO</Text>

                    <View style={styles.billingRow}>
                        <View>
                            <Text style={styles.billingLabel}>Total Earnings</Text>
                            <Text style={styles.billingSubLabel}>Consultation fee credited to your account</Text>
                        </View>
                        <Text style={styles.totalAmount}>₹{(session.lawyerEarning || 0).toFixed(2)}</Text>
                    </View>
                </View>

                <View style={styles.reportSection}>
                    <TouchableOpacity style={styles.reportBtn}>
                        <Ionicons name="help-circle-outline" size={20} color="#64748b" />
                        <Text style={styles.reportText}>Report an issue with this consult</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", paddingTop: 25 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    errorText: { color: "#ef4444", fontSize: 16 },
    backLink: { marginTop: 16 },
    backLinkText: { color: AppColors.primary, fontSize: 14 },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
    scrollContent: { paddingBottom: 40 },
    profileSection: { alignItems: "center", paddingVertical: 30 },
    avatarFallback: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "#eff6ff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    clientName: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
    consultTypeLabel: { fontSize: 14, color: "#64748b", marginTop: 4, marginBottom: 20 },
    chatHistoryBtn: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: AppColors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    chatHistoryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
    durationSummaryBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    durationSummaryText: { color: "#475569", fontWeight: "700", fontSize: 15 },
    divider: { height: 8, backgroundColor: "#f8fafc" },
    section: { paddingHorizontal: 24, paddingVertical: 20 },
    sectionTitle: { fontSize: 12, fontWeight: "800", color: "#64748b", marginBottom: 20, letterSpacing: 1 },
    row: { flexDirection: "row", justifyContent: "space-between", gap: 40 },
    col: { flex: 1 },
    fieldLabel: { fontSize: 12, color: "#94a3b8", marginBottom: 4 },
    fieldValue: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: { fontSize: 12, fontWeight: "800" },
    billingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    billingLabel: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
    billingSubLabel: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
    totalAmount: { fontSize: 24, fontWeight: "800", color: "#10b981" },
    reportSection: { alignItems: "center", marginTop: 40 },
    reportBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
    reportText: { fontSize: 14, color: "#64748b", fontWeight: "500" },
});
