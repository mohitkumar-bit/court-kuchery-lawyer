import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";

import { AppColors } from "@/constants/theme";
import { consultService } from "@/services/consultService";
import { api } from "@/services/api";

type Message = {
  _id: string;
  content: string;
  senderRole: "USER" | "LAWYER";
  createdAt: string;
};

export default function ChatViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // id is sessionId
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        if (!id) return;

        // 1. Fetch Session Details
        const sessionRes = await consultService.getSessionDetails(id);
        setSession(sessionRes.session);

        // 2. Fetch Messages
        const messagesRes = await api.get(`/chat/${id}`);
        setMessages(messagesRes.data.messages);
      } catch (error) {
        console.error("LOAD CHAT VIEW ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
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
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={AppColors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Chat History</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Conversation not found</Text>
        </View>
      </View>
    );
  }

  const clientName = session.userId?.name || "Client";
  const dateStr = new Date(session.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={AppColors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{clientName}</Text>
          <Text style={styles.headerDate}>{dateStr}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{session.status}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isMe = item.senderRole === "LAWYER";
          return (
            <View
              style={[
                styles.bubbleWrap,
                isMe ? styles.bubbleRight : styles.bubbleLeft,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isMe ? styles.bubbleLawyer : styles.bubbleClient,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    isMe ? styles.bubbleTextLawyer : styles.bubbleTextClient,
                  ]}
                >
                  {item.content}
                </Text>
                <Text style={[styles.timeText, isMe ? styles.timeLawyer : styles.timeClient]}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No messages in this session</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <Ionicons name="information-circle-outline" size={16} color="#64748b" />
        <Text style={styles.footerText}>This is a read-only view of the consultation.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
  },
  headerCenter: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0f172a",
  },
  headerDate: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#0369a1",
    textTransform: "uppercase",
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bubbleWrap: {
    marginBottom: 16,
  },
  bubbleLeft: {
    alignItems: "flex-start",
  },
  bubbleRight: {
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "85%",
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleClient: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
  },
  bubbleLawyer: {
    backgroundColor: AppColors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTextClient: {
    color: "#1e293b",
  },
  bubbleTextLawyer: {
    color: "#ffffff",
  },
  timeText: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeClient: {
    color: "#94a3b8",
  },
  timeLawyer: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  empty: {
    flex: 1,
    paddingVertical: 100,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f1f5f9',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  }
});
