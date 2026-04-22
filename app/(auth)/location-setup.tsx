import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    TextInput,
} from "react-native";
import * as Location from "expo-location";
import { LinearGradient } from "expo-linear-gradient";
import { AppColors } from "@/constants/theme";

const { width } = Dimensions.get("window");

export default function LocationSetupScreen() {
    const router = useRouter();
    
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [address, setAddress] = useState<string>("");
    const [district, setDistrict] = useState<string>("");
    const [state, setState] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const getLocation = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);

            if (Platform.OS === 'web') {
                // Fallback for web since Expo Geocoding API is removed in SDK 49 for web
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.coords.latitude}&lon=${location.coords.longitude}`
                    );
                    const data = await response.json();
                    if (data && data.address) {
                        const addr = data.address;
                        const fullAddress = data.display_name;
                        setAddress(fullAddress);
                        setDistrict(addr.city_district || addr.district || addr.city || addr.town || "");
                        setState(addr.state || "");
                    }
                } catch (webErr) {
                    console.error("Web geocoding error:", webErr);
                    setErrorMsg("Unable to reverse geocode on web. Please enter address manually in profile.");
                }
            } else {
                // Native implementation
                let reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });

                if (reverseGeocode.length > 0) {
                    const addr = reverseGeocode[0];
                    const fullAddress = `${addr.name || ""}, ${addr.street || ""}, ${addr.district || ""}, ${addr.city || ""}, ${addr.region || ""}, ${addr.postalCode || ""}, ${addr.country || ""}`.replace(/, ,/g, ",").replace(/^, /, "").replace(/, $/, "");
                    setAddress(fullAddress);
                    setDistrict(addr.district || addr.city || "");
                    setState(addr.region || "");
                }
            }
        } catch (error) {
            console.error(error);
            setErrorMsg('Error fetching location or address');
        } finally {
            setLoading(false);
        }
    };

    const handleContinue = () => {
        if (!location || !address) {
            Alert.alert("Missing Information", "Please allow us to fetch your location and address to continue.");
            return;
        }

        router.push({
            pathname: "/complete-profile",
            params: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                address: address,
                district: district,
                state: state
            }
        });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#fff', '#f0f4ff']}
                style={styles.gradientBg}
            />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color={AppColors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Location Setup</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="location-outline" size={80} color={AppColors.primary} />
                </View>

                <Text style={styles.title}>Office Location</Text>
                <Text style={styles.subtitle}>
                    Please share your office location. This helps clients find you and ensures you are matched with relevant cases.
                </Text>

                {errorMsg && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{errorMsg}</Text>
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator size="large" color={AppColors.primary} style={styles.loader} />
                ) : address ? (
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressLabel}>Verify Office Location:</Text>
                        
                        <View style={styles.inputWrapper}>
                            <Text style={styles.inputLabel}>Full Address</Text>
                            <TextInput
                                style={styles.manualInput}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Enter full address"
                                multiline
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputWrapper, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>District</Text>
                                <TextInput
                                    style={styles.manualInput}
                                    value={district}
                                    onChangeText={setDistrict}
                                    placeholder="District"
                                />
                            </View>
                            <View style={[styles.inputWrapper, { flex: 1 }]}>
                                <Text style={styles.inputLabel}>State</Text>
                                <TextInput
                                    style={styles.manualInput}
                                    value={state}
                                    onChangeText={setState}
                                    placeholder="State"
                                />
                            </View>
                        </View>

                        <TouchableOpacity onPress={getLocation} style={styles.retryButton}>
                            <Ionicons name="refresh" size={16} color={AppColors.primary} />
                            <Text style={styles.retryText}>Re-fetch Location</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.fetchButton} onPress={getLocation}>
                        <Ionicons name="locate" size={24} color="#fff" />
                        <Text style={styles.fetchButtonText}>Fetch Current Location</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.continueButton, (!address || !district || !state) && styles.disabledButton]} 
                    onPress={handleContinue}
                    disabled={!address || !district || !state}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const Input = ({ label, value, onChange, placeholder, multiline }: any) => (
    <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{label}</Text>
        <TextInput
            style={[styles.manualInput, multiline && { height: 80, textAlignVertical: 'top' }]}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            multiline={multiline}
        />
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    gradientBg: { ...StyleSheet.absoluteFillObject },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        marginBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: AppColors.text },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#EAF0FF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: { fontSize: 24, fontWeight: '800', color: AppColors.text, marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 15, color: AppColors.textSecondary, marginBottom: 30, lineHeight: 22, textAlign: 'center' },
    fetchButton: {
        backgroundColor: AppColors.primary,
        flexDirection: 'row',
        paddingVertical: 18,
        paddingHorizontal: 30,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        elevation: 4,
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        width: '100%',
    },
    fetchButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    addressContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    addressLabel: { fontSize: 16, fontWeight: '700', color: AppColors.text, marginBottom: 20 },
    inputWrapper: { marginBottom: 15, width: '100%' },
    inputLabel: { fontSize: 12, fontWeight: '600', color: AppColors.textSecondary, marginBottom: 6, marginLeft: 4 },
    manualInput: {
        backgroundColor: '#f8fafc',
        borderWidth: 1,
        borderColor: '#e2e8f0',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: AppColors.text,
    },
    row: { flexDirection: 'row', gap: 12, width: '100%' },
    retryButton: { 
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 10,
        paddingVertical: 10,
    },
    retryText: { color: AppColors.primary, fontWeight: '700', fontSize: 14 },
    loader: { marginVertical: 20 },
    errorContainer: {
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        width: '100%',
    },
    errorText: { color: '#ef4444', textAlign: 'center', fontSize: 14, fontWeight: '500' },
    footer: {
        padding: 24,
        paddingBottom: 40,
    },
    continueButton: {
        backgroundColor: AppColors.primary,
        flexDirection: 'row',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        elevation: 4,
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    disabledButton: {
        backgroundColor: '#cbd5e1',
        shadowOpacity: 0,
        elevation: 0,
    },
    continueButtonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
});
