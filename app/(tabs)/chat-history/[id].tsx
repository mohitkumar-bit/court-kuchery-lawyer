import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
} from "react-native";
import React, { useState, useEffect, useRef, useCallback } from "react";

import { AppColors } from "@/constants/theme";
import { consultService } from "@/services/consultService";
import { socketService } from "@/services/socket";
import { api } from "@/services/api";

type Message = {
  _id: string;
  content: string;
  senderRole: "USER" | "LAWYER";
  createdAt: string;
};

import { useAuth } from "@/contexts";

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); // id is sessionId here
  const { trackActiveSession, clearActiveSession } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<any>(null);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [summaryVisible, setSummaryVisible] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [sessionActive, setSessionActive] = useState(true);

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        if (!id) return;

        await trackActiveSession(id);

        // 1. Fetch Session Details
        const sessionRes = await consultService.getSessionDetails(id);
        setSession(sessionRes.session);

        // 2. Fetch Messages
        const messagesRes = await api.get(`/chat/${id}`);
        setMessages(messagesRes.data.messages);
      } catch (error) {
        console.error("LOAD CHAT ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatData();
  }, [id]);

  useEffect(() => {
    let socket: any;

    const setupSocket = async () => {
      socket = await socketService.initialize();
      if (socket && id) {
        console.log("🟢 Lawyer Joining Session:", id);
        socket.emit("JOIN_SESSION", { sessionId: id });

        socket.on("RECEIVE_MESSAGE", (msg: Message) => {
          console.log("📥 Lawyer received message:", msg);
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find(m => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        });

        socket.on("SESSION_ENDED", async (data: any) => {
          console.log("ℹ️ Lawyer: Session Ended", data);
          await clearActiveSession();
          setSummary(data);
          setSummaryVisible(true);
          setSessionActive(false);
        });

        socket.on("SESSION_FORCE_ENDED", async (data: any) => {
          console.log("⚠️ Lawyer: Session Force Ended", data);
          await clearActiveSession();
          setSummary(data);
          setSummaryVisible(true);
          setSessionActive(false);
        });
      }
    };

    setupSocket();

    return () => {
      if (socket) {
        console.log("🧹 Lawyer Leaving Session:", id);
        socket.emit("LEAVE_SESSION", { sessionId: id });
        socket.off("RECEIVE_MESSAGE");
        socket.off("SESSION_ENDED");
        socket.off("SESSION_FORCE_ENDED");
      }
    };
  }, [id]);

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isSending || !id) return;

    try {
      setIsSending(true);
      const socket = socketService.getSocket();
      if (socket) {
        socket.emit("SEND_MESSAGE", {
          sessionId: id,
          content: inputText,
          messageType: "TEXT",
        });
        setInputText("");
      }
    } catch (error) {
      console.error("SEND ERROR:", error);
    } finally {
      setIsSending(false);
    }
  }, [inputText, id, isSending]);

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
          <Text style={styles.title}>Chat</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Conversation not found</Text>
        </View>
      </View>
    );
  }

  const clientName = session.userId?.name || "Client";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={AppColors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{clientName}</Text>
          <Text style={styles.headerCase}>{session.status}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubbleWrap,
                item.senderRole === "USER" ? styles.bubbleLeft : styles.bubbleRight,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  item.senderRole === "USER" ? styles.bubbleClient : styles.bubbleLawyer,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    item.senderRole === "USER" ? styles.bubbleTextClient : styles.bubbleTextLawyer,
                  ]}
                >
                  {item.content}
                </Text>
              </View>
            </View>
          )}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            placeholderTextColor="#94a3b8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={sessionActive}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={[
              styles.sendBtn,
              (!inputText.trim() || isSending || !sessionActive) && { opacity: 0.5 },
            ]}
            disabled={!inputText.trim() || isSending || !sessionActive}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {summaryVisible && summary && (
        <View style={styles.summaryOverlay}>
          <View style={styles.summaryContainer}>
            <Ionicons
              name="checkmark-circle"
              size={64}
              color={AppColors.success}
            />
            <Text style={styles.summaryTitle}>Consultation Ended</Text>

            <View style={styles.summaryStats}>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryLabel}>Total Earning</Text>
                <Text style={styles.summaryValue}>
                  ₹{(summary.lawyerEarning || 0).toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryStat}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={styles.summaryValue}>
                  {summary.durationSeconds ? Math.ceil(summary.durationSeconds / 60) : 0} mins
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.summaryBtn}
              onPress={async () => {
                await clearActiveSession();
                router.replace("/my-cases");
              }}
            >
              <Text style={styles.summaryBtnText}>Back to Cases</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: AppColors.white,
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AppColors.border,
    gap: 16,
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
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
  },
  headerCase: {
    fontSize: 13,
    color: AppColors.primary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  bubbleWrap: {
    marginBottom: 12,
  },
  bubbleLeft: {
    alignItems: "flex-start",
  },
  bubbleRight: {
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  bubbleClient: {
    backgroundColor: AppColors.white,
    borderBottomLeftRadius: 4,
  },
  bubbleLawyer: {
    backgroundColor: AppColors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  bubbleTextClient: {
    color: AppColors.text,
  },
  bubbleTextLawyer: {
    color: AppColors.white,
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: AppColors.textSecondary,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: AppColors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: AppColors.border,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: AppColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 1000,
  },
  summaryContainer: {
    backgroundColor: AppColors.white,
    borderRadius: 24,
    padding: 32,
    width: "100%",
    alignItems: "center",
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: AppColors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  summaryStats: {
    flexDirection: "row",
    width: "100%",
    gap: 16,
    marginBottom: 32,
  },
  summaryStat: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  summaryLabel: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    color: AppColors.text,
  },
  summaryBtn: {
    backgroundColor: AppColors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  summaryBtnText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
