import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "@/config";

const SOCKET_URL = BACKEND_URL.replace(/\/api$/, "");

/**
 * Singleton Socket instance to prevent multiple connections
 * and churn during navigation.
 */
export const socket: Socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

/**
 * Helper to connect the socket with a specific user ID
 */
export const connectSocket = (userId: string) => {
  if (socket.connected) {
    // If already connected with different user, disconnect first
    if (socket.io.opts.query && (socket.io.opts.query as any).userId !== userId) {
      socket.disconnect();
    } else {
      return; // Already connected with correct user
    }
  }

  socket.io.opts.query = { userId };
  socket.connect();
};
