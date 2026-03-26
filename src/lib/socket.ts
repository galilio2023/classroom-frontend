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
  transports: ["polling"], // Force polling to rule out websocket issues
  upgrade: false, // Disable upgrade to websocket
});

let connectionPromise: Promise<void> | null = null;

/**
 * Connects the socket using the verified Better Auth session token.
 * This ensures the backend can cryptographically verify the user's identity.
 */
export const connectSocket = async () => {
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
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
      console.log(
        "🔗 Attempting socket connection to:",
        SOCKET_URL,
        "with token:",
        token.substring(0, 10) + "..."
      );
      socket.connect();

      // Wait for connection to be established or timeout
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error(
            "⏳ Socket connection timeout after 15s. Socket status:",
            socket.connected ? "connected" : "disconnected"
          );
          reject(new Error("Socket connection timeout (15s)"));
        }, 15000);

        socket.once("connect", () => {
          clearTimeout(timeout);
          console.log("🚀 Socket connected successfully:", socket.id);
          resolve();
        });

        socket.once("connect_error", (err) => {
          clearTimeout(timeout);
          console.error("❌ Socket handshake failed:", err.message, err);
          reject(err);
        });
      });
    } catch (err) {
      console.error("Failed to establish secure socket connection:", err);
    } finally {
      connectionPromise = null;
    }
  })();

  return connectionPromise;
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
