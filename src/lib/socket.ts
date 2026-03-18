import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config";
import { authClient } from "./auth-client";

/**
 * Singleton Socket instance to prevent multiple connections
 * and churn during navigation.
 */
export const socket: Socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 2000,
  transports: ["websocket", "polling"],
});

/**
 * Connects the socket using the verified Better Auth session token.
 * This ensures the backend can cryptographically verify the user's identity.
 */
export const connectSocket = async () => {
  try {
    const { data: sessionData } = await authClient.getSession();
    const token = sessionData?.session?.token;

    if (!token) {
      console.warn("Cannot connect socket: No active session token found.");
      return;
    }

    if (socket.connected) {
      // If already connected, check if token changed. If not, skip.
      if (socket.auth && (socket.auth as any).token === token) return;
      socket.disconnect();
    }

    // Attach token to the auth payload for the secure handshake
    socket.auth = { token };
    socket.connect();
  } catch (err) {
    console.error("Failed to establish secure socket connection:", err);
  }
};

/**
 * Safely retrieves the socket instance.
 * Note: Does NOT auto-connect to prevent unauthenticated connections.
 */
export const getSocket = () => {
  if (!socket.connected) {
    console.warn("getSocket called before socket was authenticated or connected.");
  }
  return socket;
};
