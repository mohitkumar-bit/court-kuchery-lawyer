import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import * as ImagePicker from 'expo-image-picker';
import { useAuth } from "@/contexts/AuthContext";
import { AppColors } from "@/constants/theme";
import { CloudinaryConfig } from "@/constants/cloudinaryConfig";

const { width } = Dimensions.get("window");

export default function CompleteProfileScreen() {
    const { id } = useLocalSearchParams<{ id?: string }>();
    const { latitude, longitude, address, district, state } = useLocalSearchParams<{ latitude?: string, longitude?: string, address?: string, district?: string, state?: string }>();
    const router = useRouter();
    const { completeProfile, user } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    // Step 1: Professional Basics
    const [specialization, setSpecialization] = useState("");
    const [experienceYears, setExperienceYears] = useState("");
    const [ratePerMinute, setRatePerMinute] = useState("");
    const [courtType, setCourtType] = useState<string[]>(["Civil Court"]);

    // Step 2: Legal Verification
    const [bio, setBio] = useState("");
    const [barCouncilId, setBarCouncilId] = useState("");

    // Step 3: Bank details
    const [accountHolder, setAccountHolder] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [bankName, setBankName] = useState("");
    
    // Media
    const [barCouncilIdPhoto, setBarCouncilIdPhoto] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Animation values
    const translateX = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const nextStep = () => {
        if (currentStep === 1) {
            if (!specialization || !experienceYears || !ratePerMinute || courtType.length === 0) {
                setError("Please fill in all professional details");
                return;
            }
        } else if (currentStep === 2) {
            if (!barCouncilId || !bio) {
                setError("Please provide your Bar Council ID and Bio");
                return;
            }
        }

        setError("");
        translateX.value = withTiming(-width * currentStep, { duration: 300 });
        setCurrentStep(prev => prev + 1);
    };

    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                setError('Sorry, we need camera roll permissions to make this work!');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.7,
            });

            if (!result.canceled) {
                uploadToCloudinary(result.assets[0].uri);
            }
        } catch (err) {
            console.error("Pick image error:", err);
            setError("Failed to pick image");
        }
    };

    const uploadToCloudinary = async (uri: string) => {
        setUploadingImage(true);
        setError("");
        
        try {
            const response1 = await fetch(uri);
            const blob = await response1.blob();

            const formData = new FormData();
            formData.append('file', blob);
            formData.append('upload_preset', CloudinaryConfig.uploadPreset);
            formData.append('cloud_name', CloudinaryConfig.cloudName);

            const response2 = await fetch(
                `https://api.cloudinary.com/v1_1/${CloudinaryConfig.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await response2.json();
            
            if (data.secure_url) {
                setBarCouncilIdPhoto(data.secure_url);
            } else {
                console.error("Cloudinary error:", data);
                setError(data.error?.message || "Image upload failed. Please check Cloudinary config.");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError("Failed to upload image to Cloudinary");
        } finally {
            setUploadingImage(false);
        }
    };

    const prevStep = () => {
        setError("");
        translateX.value = withTiming(-width * (currentStep - 2), { duration: 300 });
        setCurrentStep(prev => prev - 1);
    };

    const handleCompleteProfile = async () => {
        try {
            setError("");

            if (!accountHolder || !accountNumber || !ifscCode || !bankName) {
                setError("Please fill in all bank details");
                return;
            }

            setLoading(true);

            await completeProfile({
                specialization: [specialization.toLowerCase()],
                experienceYears: Number(experienceYears),
                ratePerMinute: Number(ratePerMinute),
                bio,
                barCouncilId,
                barCouncilIdPhoto: barCouncilIdPhoto || undefined,
                bankDetails: {
                    accountHolder,
                    accountNumber,
                    ifscCode,
                    bankName,
                },
                courtType,
                location: latitude && longitude ? {
                    type: "Point",
                    coordinates: [Number(longitude), Number(latitude)],
                } : undefined,
                address: address || undefined,
                district: district || undefined,
                state: state || undefined,
            });

            router.replace("/(tabs)");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Profile update failed");
        } finally {
            setLoading(false);
        }
    };

    const renderProgress = () => (
        <View style={styles.progressContainer}>
            {[1, 2, 3].map((step) => (
                <View key={step} style={styles.stepWrapper}>
                    <View style={[
                        styles.stepCircle,
                        step <= currentStep ? styles.activeStepCircle : styles.inactiveStepCircle
                    ]}>
                        {step < currentStep ? (
                            <Ionicons name="checkmark" size={16} color="#fff" />
                        ) : (
                            <Text style={[
                                styles.stepText,
                                step === currentStep ? styles.activeStepText : styles.inactiveStepText
                            ]}>{step}</Text>
                        )}
                    </View>
                    {step < totalSteps && (
                        <View style={[
                            styles.stepLine,
                            step < currentStep ? styles.activeStepLine : styles.inactiveStepLine
                        ]} />
                    )}
                </View>
            ))}
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <LinearGradient
                colors={['#fff', '#f0f4ff']}
                style={styles.gradientBg}
            />

            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => currentStep > 1 ? prevStep() : router.back()}
                >
                    <Ionicons name="chevron-back" size={24} color={AppColors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Complete Profile</Text>
                <View style={{ width: 40 }} />
            </View>

            {renderProgress()}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Animated.View style={[styles.wizardContainer, animatedStyle]}>
                {/* STEP 1: Professional Basics */}
                <View style={styles.stepPage}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.stepTitle}>Professional Details</Text>
                        <Text style={styles.stepSubtitle}>Let's start with your professional expertise and rates.</Text>

                        <Input
                            icon="briefcase-outline"
                            placeholder="Specialization (Criminal, Family, etc.)"
                            value={specialization}
                            setValue={setSpecialization}
                        />

                        <Input
                            icon="time-outline"
                            placeholder="Experience (Years)"
                            value={experienceYears}
                            setValue={setExperienceYears}
                            keyboardType="numeric"
                        />

                        <Input
                            icon="cash-outline"
                            placeholder="Rate per minute (₹)"
                            value={ratePerMinute}
                            setValue={setRatePerMinute}
                            keyboardType="numeric"
                        />

                        <Text style={[styles.stepSubtitle, { marginBottom: 12, marginTop: 10 }]}>Select Court Practice (Multiple possible)</Text>
                        <View style={styles.courtTypeContainer}>
                            {["Civil Court", "High Court", "Supreme Court"].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.courtBadge,
                                        courtType.includes(type) && styles.activeCourtBadge
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
                                        styles.courtText,
                                        courtType.includes(type) && styles.activeCourtText
                                    ]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                            <Text style={styles.buttonText}>Continue</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* STEP 2: Legal Verification */}
                <View style={styles.stepPage}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.stepTitle}>Legal Verification</Text>
                        <Text style={styles.stepSubtitle}>These details help us verify your credentials.</Text>

                        <Input
                            icon="card-outline"
                            placeholder="Bar Council ID"
                            value={barCouncilId}
                            setValue={setBarCouncilId}
                        />

                        <View style={styles.bioContainer}>
                            <Ionicons name="document-text-outline" size={20} color={AppColors.primary} />
                            <TextInput
                                style={[styles.input, styles.bioInput]}
                                placeholder="Tell us about your practice (Bio)"
                                value={bio}
                                onChangeText={setBio}
                                multiline
                                numberOfLines={4}
                            />
                        </View>

                        <Text style={[styles.stepSubtitle, { marginBottom: 12, marginTop: 10 }]}>Bar Council ID Photo (Optional)</Text>
                        <TouchableOpacity 
                            style={[styles.uploadBox, barCouncilIdPhoto ? styles.uploadBoxActive : null]} 
                            onPress={pickImage}
                            disabled={uploadingImage}
                        >
                            {uploadingImage ? (
                                <ActivityIndicator color={AppColors.primary} />
                            ) : barCouncilIdPhoto ? (
                                <View style={styles.uploadedContainer}>
                                    <Ionicons name="checkmark-circle" size={32} color={AppColors.success} />
                                    <Text style={styles.uploadedText}>ID Photo Uploaded</Text>
                                    <TouchableOpacity onPress={() => setBarCouncilIdPhoto(null)}>
                                        <Text style={styles.removeText}>Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <Ionicons name="camera-outline" size={32} color={AppColors.primary} />
                                    <Text style={styles.uploadText}>Select ID Card Photo</Text>
                                    <Text style={styles.uploadHint}>JPG or PNG, max 5MB</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
                            <Text style={styles.buttonText}>Almost there</Text>
                            <Ionicons name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.backLink} onPress={prevStep}>
                            <Text style={styles.backLinkText}>Previous Step</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>

                {/* STEP 3: Bank Account */}
                <View style={styles.stepPage}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <Text style={styles.stepTitle}>Payout Details</Text>
                        <Text style={styles.stepSubtitle}>Where should we send your earnings?</Text>

                        <Input
                            icon="person-outline"
                            placeholder="Account Holder Name"
                            value={accountHolder}
                            setValue={setAccountHolder}
                        />

                        <Input
                            icon="business-outline"
                            placeholder="Bank Name"
                            value={bankName}
                            setValue={setBankName}
                        />

                        <Input
                            icon="card-outline"
                            placeholder="Account Number"
                            value={accountNumber}
                            setValue={setAccountNumber}
                            keyboardType="numeric"
                        />

                        <Input
                            icon="code-outline"
                            placeholder="IFSC Code"
                            value={ifscCode}
                            setValue={setIfscCode}
                        />

                        <TouchableOpacity
                            style={[styles.nextButton, styles.submitButton]}
                            onPress={handleCompleteProfile}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>Submit for Verification</Text>
                                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.backLink} onPress={prevStep}>
                            <Text style={styles.backLinkText}>Previous Step</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    );
}

function Input({ icon, placeholder, value, setValue, keyboardType }: any) {
    return (
        <View style={styles.inputContainer}>
            <Ionicons name={icon} size={20} color={AppColors.primary} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                value={value}
                onChangeText={setValue}
                keyboardType={keyboardType}
                placeholderTextColor={AppColors.textSecondary}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
    gradientBg: { ...StyleSheet.absoluteFillObject },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
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
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginBottom: 30,
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    activeStepCircle: {
        backgroundColor: AppColors.primary,
        borderColor: AppColors.primary,
    },
    inactiveStepCircle: {
        backgroundColor: '#fff',
        borderColor: AppColors.border,
    },
    stepText: { fontSize: 14, fontWeight: '600' },
    activeStepText: { color: '#fff' },
    inactiveStepText: { color: AppColors.textSecondary },
    stepLine: {
        width: 40,
        height: 3,
        marginHorizontal: 8,
        borderRadius: 2,
    },
    activeStepLine: { backgroundColor: AppColors.primary },
    inactiveStepLine: { backgroundColor: AppColors.border },
    wizardContainer: {
        flexDirection: 'row',
        width: width * 3,
        flex: 1,
    },
    stepPage: {
        width: width,
        paddingHorizontal: 24,
    },
    scrollContent: { paddingBottom: 40 },
    stepTitle: { fontSize: 24, fontWeight: '800', color: AppColors.text, marginBottom: 8 },
    stepSubtitle: { fontSize: 15, color: AppColors.textSecondary, marginBottom: 32, lineHeight: 22 },
    error: {
        color: '#ef4444',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 16,
        marginHorizontal: 24,
        padding: 10,
        backgroundColor: '#fef2f2',
        borderRadius: 8,
        overflow: 'hidden'
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: AppColors.border,
        borderRadius: 16,
        paddingHorizontal: 16,
        marginBottom: 16,
        gap: 12,
        backgroundColor: '#fff',
        height: 60,
    },
    input: { flex: 1, fontSize: 16, color: AppColors.text },
    bioContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderWidth: 1.5,
        borderColor: AppColors.border,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginBottom: 16,
        gap: 12,
        backgroundColor: '#fff',
    },
    bioInput: { height: 120, textAlignVertical: 'top', paddingTop: 0 },
    nextButton: {
        backgroundColor: AppColors.primary,
        flexDirection: 'row',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        gap: 8,
        elevation: 4,
        shadowColor: AppColors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
    },
    submitButton: { backgroundColor: AppColors.success, shadowColor: AppColors.success },
    buttonText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    backLink: { marginTop: 20, alignItems: 'center' },
    backLinkText: { color: AppColors.textSecondary, fontSize: 16, fontWeight: '500' },
    uploadBox: {
        borderWidth: 2,
        borderColor: AppColors.border,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    uploadBoxActive: {
        borderColor: AppColors.success,
        backgroundColor: '#f0fdf4',
        borderStyle: 'solid',
    },
    uploadText: {
        fontSize: 16,
        fontWeight: '600',
        color: AppColors.text,
        marginTop: 10,
    },
    uploadHint: {
        fontSize: 12,
        color: AppColors.textSecondary,
        marginTop: 4,
    },
    uploadedContainer: {
        alignItems: 'center',
    },
    uploadedText: {
        fontSize: 16,
        fontWeight: '700',
        color: AppColors.success,
        marginTop: 8,
    },
    removeText: {
        color: '#ef4444',
        fontWeight: '600',
        marginTop: 12,
        textDecorationLine: 'underline',
    },
    courtTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    courtBadge: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: AppColors.border,
    },
    activeCourtBadge: {
        backgroundColor: AppColors.primaryLight,
        borderColor: AppColors.primary,
    },
    courtText: {
        fontSize: 14,
        fontWeight: '600',
        color: AppColors.textSecondary,
    },
    activeCourtText: {
        color: AppColors.primary,
    },
});
