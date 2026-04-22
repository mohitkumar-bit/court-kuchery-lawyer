import { io, Socket } from "socket.io-client";
import { tokenStorage } from "./tokenStorage";
import { BASE_URL } from "./api";

let socket: Socket | null = null;

export const socketService = {
    async initialize() {
        if (socket) return socket;

        const token = await tokenStorage.getAccessToken();
        if (!token) return null;

        socket = io(BASE_URL, {
            transports: ["websocket"],
            auth: { token },
        });

        socket.on("connect", () => {
            console.log("🟢 Lawyer Socket connected:", socket?.id);
        });

        socket.on("connect_error", (err) => {
            console.error("🔴 Lawyer Socket Error:", err.message);
        });

        return socket;
    },

    getSocket() {
        return socket;
    },

    disconnect() {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    },
};
