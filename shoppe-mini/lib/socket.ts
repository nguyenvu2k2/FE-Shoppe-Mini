import { io } from "socket.io-client";

const SOCKET_URL =
    process.env.NEXT_PUBLIC_SOCKET_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001";

const socket = io(SOCKET_URL, {
    autoConnect: false,
    withCredentials: true,
    // BE chưa gắn engine thì 404; không retry vô hạn
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 2000,
});

let loggedHandshakeError = false;

socket.on("connect_error", (err) => {
    if (loggedHandshakeError) return;
    loggedHandshakeError = true;
    console.warn(
        `[socket] Handshake fail → ${SOCKET_URL}/socket.io (${err.message}). ` +
            "Nếu JSON Nest Cannot GET /socket.io thì BE chưa mount Socket.IO trên cùng port REST."
    );
});

socket.on("connect", () => {
    loggedHandshakeError = false;
});

export function connectSocket() {
    if (socket.connected) return;
    socket.connect();
}

export function disconnectSocket() {
    socket.disconnect();
}

export function onOrderUpdatedSocet(handler: (payload: any) => void) {
    socket.on("orderUpdated", handler);
}

export function offOrderUpdatedSocet(handler: (payload: any) => void) {
    socket.off("orderUpdated", handler);
}
