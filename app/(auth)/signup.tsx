import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
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
  Image,
} from "react-native";

import { useAuth } from "@/contexts/AuthContext";
import { AppColors, ROUTES } from "@/constants";

export default function LawyerSignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      setError("");
      setLoading(true);

      if (!name || !email || !phone || !password) {
        setError("All fields are required");
        return;
      }

      await signUp(name, email, phone, password);

      // Successfully registered, now go to location setup
      router.replace("/location-setup" as any);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={AppColors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/court/court-k-logo.png")}
            style={styles.logo}
          />
        </View>

        <Text style={styles.title}>Lawyer Registration</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* NAME */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={AppColors.primaryLight} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={AppColors.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* EMAIL */}
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={AppColors.primaryLight} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={AppColors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* PHONE */}
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={AppColors.primaryLight} />
          <View style={styles.phonePrefixContainer}>
            <Text style={styles.flagEmoji}>🇮🇳</Text>
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor={AppColors.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* PASSWORD */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={AppColors.primaryLight} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={AppColors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={AppColors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleSignup}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.registerButtonText}>Continue to Profile Details</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Already registered?</Text>
          <Link href={ROUTES.AUTH.LOGIN} asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
    paddingTop: 25,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backText: {
    fontSize: 16,
    color: AppColors.primary,
    marginLeft: 4,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 210,
    height: 74,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: AppColors.text,
    marginBottom: 24,
  },
  error: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: AppColors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  phonePrefixContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRightWidth: 1,
    borderRightColor: AppColors.border,
    paddingRight: 8,
  },
  flagEmoji: {
    fontSize: 18,
  },
  prefixText: {
    fontSize: 16,
    color: AppColors.text,
    fontWeight: "500",
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: AppColors.text,
  },
  registerButton: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 24,
  },
  registerButtonText: {
    color: AppColors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  loginPrompt: {
    fontSize: 15,
    color: AppColors.textSecondary,
  },
  loginLink: {
    fontSize: 15,
    color: AppColors.primary,
    fontWeight: "600",
  },
});
