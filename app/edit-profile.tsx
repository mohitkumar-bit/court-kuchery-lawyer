import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";

import { SPECIALIZATION_OPTIONS } from "@/constants";
import { AppColors } from "@/constants/theme";
import { useAuth } from "@/contexts";
import { lawyerService } from "@/services/lawyerService";
import {
    fetchCurrentLocationDetails,
    parseStoredLocation,
    type GeoPoint,
} from "@/utils";

const COURT_TYPES = ["Civil Court", "High Court", "Supreme Court"];

export default function EditProfileScreen() {
    const { user, refreshProfile } = useAuth();
    const router = useRouter();

    const [name, setName] = useState(user?.name || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [rate, setRate] = useState(user?.ratePerMinute?.toString() || "");
    const [experience, setExperience] = useState(user?.experienceYears?.toString() || "");
    const [selectedSpecs, setSelectedSpecs] = useState<string[]>(user?.specialization || []);
    const [courtType, setCourtType] = useState<string[]>(user?.courtType || ["Civil Court"]);
    const [address, setAddress] = useState(user?.address || "");
    const [district, setDistrict] = useState(user?.district || "");
    const [state, setState] = useState(user?.state || "");
    const [location, setLocation] = useState<GeoPoint | undefined>(() =>
        parseStoredLocation(user?.location as GeoPoint | undefined)
    );
    const [loading, setLoading] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    const handleFetchLocation = async () => {
        setFetchingLocation(true);
        try {
            const details = await fetchCurrentLocationDetails();
            setAddress(details.address);
            setDistrict(details.district);
            setState(details.state);
            setLocation(details.location);
        } catch (error: any) {
            Alert.alert(
                "Location Error",
                error?.message || "Unable to fetch your current location"
            );
        } finally {
            setFetchingLocation(false);
        }
    };

    const toggleSpec = (spec: string) => {
        if (selectedSpecs.includes(spec)) {
            setSelectedSpecs(selectedSpecs.filter(s => s !== spec));
        } else {
            setSelectedSpecs([...selectedSpecs, spec]);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            await lawyerService.updateProfile({
                name,
                phone,
                bio,
                ratePerMinute: Number(rate),
                experienceYears: Number(experience),
                specialization: selectedSpecs,
                courtType,
                location,
                address,
                district,
                state,
            });

            // Refresh local auth context
            if (refreshProfile) {
                await refreshProfile();
            }

            Alert.alert("Success", "Profile updated successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error("UPDATE PROFILE ERROR:", error);
            Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={AppColors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="person-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Enter your name"
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Bio (About You)</Text>
                            <View style={[styles.inputContainer, { height: 100, alignItems: 'flex-start', paddingTop: 12 }]}>
                                <TextInput
                                    style={[styles.input, { height: 80 }]}
                                    value={bio}
                                    onChangeText={setBio}
                                    placeholder="Tell clients about your expertise..."
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Rate (₹/min)</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={rate}
                                        onChangeText={setRate}
                                        placeholder="0"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}>
                                <Text style={styles.label}>Exp (Years)</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={experience}
                                        onChangeText={setExperience}
                                        placeholder="0"
                                        placeholderTextColor="#94a3b8"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Specializations</Text>
                            <View style={styles.chipContainer}>
                                {SPECIALIZATION_OPTIONS.map((spec) => (
                                    <TouchableOpacity
                                        key={spec.value}
                                        style={[
                                            styles.chip,
                                            selectedSpecs.includes(spec.value) && styles.chipSelected
                                        ]}
                                        onPress={() => toggleSpec(spec.value)}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            selectedSpecs.includes(spec.value) && styles.chipTextSelected
                                        ]}>
                                            {spec.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Court Type</Text>
                            <View style={styles.chipContainer}>
                                {COURT_TYPES.map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.chip,
                                            courtType.includes(type) && styles.chipSelected
                                        ]}
                                        onPress={() => {
                                            if (courtType.includes(type)) {
                                                setCourtType(courtType.filter(c => c !== type));
                                            } else {
                                                setCourtType([...courtType, type]);
                                            }
                                        }}
                                    >
                                        <Text style={[
                                            styles.chipText,
                                            courtType.includes(type) && styles.chipTextSelected
                                        ]}>
                                            {type}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Phone Number</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="call-outline" size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Enter phone number"
                                    placeholderTextColor="#94a3b8"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={[styles.label, styles.labelInline]}>Office Address</Text>
                                <TouchableOpacity
                                    style={styles.locationBtn}
                                    onPress={handleFetchLocation}
                                    disabled={fetchingLocation}
                                >
                                    {fetchingLocation ? (
                                        <ActivityIndicator size="small" color={AppColors.primary} />
                                    ) : (
                                        <>
                                            <Ionicons name="navigate" size={16} color={AppColors.primary} />
                                            <Text style={styles.locationBtnText}>Use current location</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                            <View style={[styles.inputContainer, { height: 80, alignItems: 'flex-start', paddingTop: 12 }]}>
                                <Ionicons name="location-outline" size={20} color="#64748b" style={[styles.inputIcon, { marginTop: 2 }]} />
                                <TextInput
                                    style={[styles.input, { height: 60 }]}
                                    value={address}
                                    onChangeText={setAddress}
                                    placeholder="Enter your office address"
                                    placeholderTextColor="#94a3b8"
                                    multiline
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>District</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={district}
                                        onChangeText={setDistrict}
                                        placeholder="City/District"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </View>
                            <View style={[styles.inputGroup, { flex: 1, marginLeft: 16 }]}>
                                <Text style={styles.label}>State</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.input}
                                        value={state}
                                        onChangeText={setState}
                                        placeholder="State"
                                        placeholderTextColor="#94a3b8"
                                    />
                                </View>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.saveBtnText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
        marginTop: Platform.OS === 'android' ? 40 : 0,
    },
    backBtn: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },
    form: {
        marginBottom: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#475569",
        marginBottom: 8,
        marginLeft: 4,
    },
    labelRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    labelInline: {
        marginBottom: 0,
    },
    locationBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: AppColors.primaryLight,
        borderWidth: 1,
        borderColor: AppColors.primary,
    },
    locationBtnText: {
        fontSize: 12,
        fontWeight: "700",
        color: AppColors.primary,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        borderRadius: 12,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: "#0f172a",
    },
    chipContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 4,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#f1f5f9",
        borderWidth: 1,
        borderColor: "#e2e8f0",
    },
    chipSelected: {
        backgroundColor: AppColors.primaryLight,
        borderColor: AppColors.primary,
    },
    chipText: {
        fontSize: 13,
        color: "#64748b",
        fontWeight: "600",
    },
    chipTextSelected: {
        color: AppColors.primary,
    },
    saveBtn: {
        backgroundColor: AppColors.primary,
        height: 56,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveBtnDisabled: {
        opacity: 0.7,
    },
    saveBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
