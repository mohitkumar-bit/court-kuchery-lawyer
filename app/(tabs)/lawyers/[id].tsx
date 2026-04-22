import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";

import { lawyerService } from "@/services/lawyerService";

type Lawyer = {
  _id: string;
  name: string;
  specialization: string;
  experienceYears: number;
  ratePerMinute: number;
  rating: number;
  isOnline: boolean;
  bio: string
};

export default function LawyerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const [lawyer, setLawyer] = useState<Lawyer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLawyer = async () => {
      try {
        if (!id) return;
        const res = await lawyerService.getLawyerById(id);
        setLawyer(res.lawyer);
      } catch (error) {
        console.log("DETAIL ERROR", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyer();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!lawyer) {
    return (
      <View style={styles.center}>
        <Text>Lawyer not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lawyer Details</Text>
        <Ionicons name="ellipsis-vertical" size={22} color="#2563EB" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <Image
            source={require("@/assets/court/lawyer1.jpeg")}
            style={styles.avatar}
          />

          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{lawyer.name}</Text>

              {/* ONLINE STATUS */}
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: lawyer.isOnline
                      ? "#16A34A"
                      : "#9CA3AF",
                  },
                ]}
              />
            </View>

            <Text style={styles.specialty}>
              {lawyer.specialization} Lawyer
            </Text>

            <Text style={styles.exp}>
              Exp – {lawyer.experienceYears} Years
            </Text>

            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < lawyer.rating ? "star" : "star-outline"}
                  size={16}
                  color="#F4B400"
                />
              ))}
            </View>
          </View>
        </View>

        {/* STATS ROW */}
        <View style={styles.stats}>
          <Stat icon="chatbubble-ellipses" label="7.5K+ min" />
          <Stat
            icon="time"
            label={`₹${lawyer.ratePerMinute}/min`}
          />
          <Stat icon="hammer" label="250+ Cases Won" />
        </View>

        {/* ABOUT */}
        <Text style={styles.about}>
         {lawyer.bio}...
          <Text style={{ color: "#2563EB" }}> More</Text>
        </Text>

        {/* REVIEWS HEADER */}
        <View style={styles.reviewHeader}>
          <Text style={styles.reviewTitle}>Reviews & Ratings</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        {/* DUMMY REVIEW CARD */}
        <View style={styles.reviewCard}>
          <Image
            source={require("@/assets/court/lawyer1.jpeg")}
            style={styles.reviewAvatar}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.reviewName}>Megha Kiran</Text>

            <View style={styles.ratingRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < 4 ? "star" : "star-outline"}
                  size={14}
                  color="#F4B400"
                />
              ))}
            </View>

            <Text style={styles.reviewText}>
              Great experience with the criminal lawyer professional,
              knowledgeable, and very supportive.
            </Text>

            <Text style={styles.replyName}>{lawyer.name}</Text>
            <Text style={styles.replyText}>
              Thank you so much Megha Kiran for the appreciation.
            </Text>
          </View>

          <Ionicons name="ellipsis-vertical" size={16} color="#2563EB" />
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.callBtn}>
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.btnText}>Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatBtn}>
          <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
          <Text style={styles.btnText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* STAT COMPONENT */
function Stat({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={16} color="#2563EB" />
      <Text style={styles.statText}>{label}</Text>
    </View>
  );
}

/* STYLES */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F7FF" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#EAF0FF",
  },

  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    color: "#1E3A8A",
  },

  profileCard: {
    flexDirection: "row",
    backgroundColor: "#EAF0FF",
    margin: 16,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },

  avatar: { width: 64, height: 64, borderRadius: 32 },

  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  name: { fontSize: 16, fontWeight: "700" },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  specialty: { color: "#2563EB", marginTop: 2 },
  exp: { color: "#64748B", marginTop: 2 },

  ratingRow: { flexDirection: "row", gap: 2, marginTop: 6 },

  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#EAF0FF",
  },

  statItem: { flexDirection: "row", gap: 6, alignItems: "center" },
  statText: { fontSize: 13, color: "#2563EB", fontWeight: "600" },

  about: {
    padding: 16,
    fontSize: 14,
    color: "#0F172A",
    lineHeight: 22,
  },

  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  reviewTitle: { fontSize: 16, fontWeight: "700", color: "#2563EB" },
  viewAll: { color: "#2563EB" },

  reviewCard: {
    backgroundColor: "#EAF0FF",
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
  },

  reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewName: { fontWeight: "600" },
  reviewText: { fontSize: 13, color: "#0F172A", marginTop: 4 },

  replyName: { marginTop: 6, fontWeight: "600", color: "#2563EB" },
  replyText: { fontSize: 13, color: "#2563EB" },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#fff",
  },

  callBtn: {
    flex: 1,
    backgroundColor: "#2563EB",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  chatBtn: {
    flex: 1,
    backgroundColor: "#1E40AF",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  btnText: { color: "#fff", fontWeight: "600" },
});
