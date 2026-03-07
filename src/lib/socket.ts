import { io } from "socket.io-client";
import { BACKEND_URL } from "@/config";

// The backend URL for socket.io is usually the same as the API URL
// but we might need to strip the /api suffix if it exists
const SOCKET_URL = BACKEND_URL.replace(/\/api$/, "");

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});
