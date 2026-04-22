import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import createAgoraRtcEngine, {
    ChannelProfileType,
    ClientRoleType,
    IRtcEngine,
    RtcConnection,
    RtcStats,
    UserOfflineReasonType,
} from "react-native-agora";
import { request, PERMISSIONS, RESULTS } from "react-native-permissions";

import { consultService } from "@/services/consultService";
import { socketService } from "@/services/socket";
import { AppColors } from "@/constants/theme";

export default function CallScreen() {
    const { id: sessionId } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const [joined, setJoined] = useState(false);
    const [remoteUid, setRemoteUid] = useState<number>(0);
    const [isMuted, setIsMuted] = useState(false);
    const [isSpeaker, setIsSpeaker] = useState(true);
    const [loading, setLoading] = useState(true);

    const engine = useRef<IRtcEngine | null>(null);

    useEffect(() => {
        if (!sessionId) return;

        const setupSocket = async () => {
            await socketService.initialize();
            init();

            const socket = socketService.getSocket();
            if (socket) {
                socket.on("SESSION_ENDED", (data) => {
                    console.log("Session ended by server");
                    Alert.alert("Consultation Ended", "The client has ended the session.");
                    // For lawyer, we don't call endCall() directly as it would call the endSession API again
                    // We just cleanup Agora and go back
                    engine.current?.leaveChannel();
                    router.back();
                });

                socket.on("SESSION_FORCE_ENDED", (data) => {
                    console.log("Session force ended by server");
                    Alert.alert("Consultation Ended", "Session ended due to client's insufficient balance.");
                    engine.current?.leaveChannel();
                    router.back();
                });
            }
        };

        setupSocket();

        return () => {
            const socket = socketService.getSocket();
            if (socket) {
                socket.off("SESSION_ENDED");
                socket.off("SESSION_FORCE_ENDED");
            }
            engine.current?.release();
        };
    }, [sessionId]);

    const requestPermission = async () => {
        if (Platform.OS === "android") {
            const res = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
            return res === RESULTS.GRANTED;
        } else if (Platform.OS === "ios") {
            const res = await request(PERMISSIONS.IOS.MICROPHONE);
            return res === RESULTS.GRANTED;
        }
        return true;
    };

    const init = async () => {
        try {
            const hasPermission = await requestPermission();
            if (!hasPermission) {
                Alert.alert("Permission Denied", "Microphone access is required for calls.");
                router.back();
                return;
            }

            const { token, appId } = await consultService.getAgoraToken(sessionId);

            engine.current = createAgoraRtcEngine();
            engine.current.initialize({ appId });

            engine.current.registerEventHandler({
                onJoinChannelSuccess: (connection: RtcConnection, elapsed: number) => {
                    console.log("Joined channel successfully");
                    setJoined(true);
                    setLoading(false);
                },
                onUserJoined: (connection: RtcConnection, remoteUid: number, elapsed: number) => {
                    console.log("Remote user joined:", remoteUid);
                    setRemoteUid(remoteUid);
                },
                onUserOffline: (
                    connection: RtcConnection,
                    remoteUid: number,
                    reason: UserOfflineReasonType
                ) => {
                    console.log("Remote user offline");
                    setRemoteUid(0);
                    Alert.alert("Call Ended", "The client has left the call.");
                    router.back();
                },
                onError: (err) => {
                    console.error("Agora Error:", err);
                },
            });

            engine.current.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
            engine.current.joinChannel(token, sessionId, 0, {});
            engine.current.setEnableSpeakerphone(isSpeaker);

            // 🔥 JOIN SOCKET ROOM
            const socket = await socketService.initialize();
            if (socket) {
                console.log("📌 Joining Session Room:", sessionId);
                socket.emit("JOIN_SESSION", { sessionId });
            }
        } catch (e) {
            console.log("Init Error:", e);
            Alert.alert("Error", "Could not join the call.");
            router.back();
        }
    };

    const toggleMute = () => {
        const nextMute = !isMuted;
        engine.current?.muteLocalAudioStream(nextMute);
        setIsMuted(nextMute);
    };

    const toggleSpeaker = () => {
        const nextSpeaker = !isSpeaker;
        engine.current?.setEnableSpeakerphone(nextSpeaker);
        setIsSpeaker(nextSpeaker);
    };

    const endCall = async () => {
        try {
            await consultService.endSession(sessionId);
            engine.current?.leaveChannel();
            router.back();
        } catch (err) {
            console.error("End Call Error:", err);
            engine.current?.leaveChannel();
            router.back();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Client Consultation</Text>
                <Text style={styles.subtitle}>Session: {sessionId.slice(-6)}</Text>
            </View>

            <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                    <Ionicons name="person" size={80} color="#fff" />
                </View>
                <Text style={styles.statusText}>
                    {loading ? "Connecting..." : remoteUid ? "In Call" : "Waiting for Client..."}
                </Text>
            </View>

            <View style={styles.controls}>
                <TouchableOpacity
                    style={[styles.controlBtn, isMuted && styles.activeBtn]}
                    onPress={toggleMute}
                >
                    <Ionicons name={isMuted ? "mic-off" : "mic"} size={28} color={isMuted ? "#fff" : "#1e293b"} />
                </TouchableOpacity>

                <TouchableOpacity style={[styles.controlBtn, styles.endCallBtn]} onPress={endCall}>
                    <Ionicons name="call" size={32} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.controlBtn, !isSpeaker && styles.activeBtn]}
                    onPress={toggleSpeaker}
                >
                    <Ionicons
                        name={isSpeaker ? "volume-high" : "volume-mute"}
                        size={28}
                        color={!isSpeaker ? "#fff" : "#1e293b"}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
        paddingTop: 60,
        alignItems: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: 60,
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    subtitle: {
        fontSize: 14,
        color: "#9ca3af",
        marginTop: 4,
    },
    avatarContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: AppColors.primary,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    statusText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "500",
    },
    controls: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-evenly",
        width: "100%",
        paddingBottom: 60,
    },
    controlBtn: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: "#f3f4f6",
        justifyContent: "center",
        alignItems: "center",
    },
    activeBtn: {
        backgroundColor: "#ef4444",
    },
    endCallBtn: {
        backgroundColor: "#ef4444",
        width: 80,
        height: 80,
        borderRadius: 40,
        transform: [{ rotate: "135deg" }],
    },
});
