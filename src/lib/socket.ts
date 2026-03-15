import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config";

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
 * Helper to connect the socket with a specific user ID
 */
export const connectSocket = (userId: string) => {
  if (socket.connected) {
    if (socket.io.opts.query && (socket.io.opts.query as any).userId !== userId) {
      socket.disconnect();
    } else {
      return; 
    }
  }

  socket.io.opts.query = { userId };
  socket.connect();
};

export const getSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
    return socket;
};
