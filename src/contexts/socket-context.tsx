import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { socket, connectSocket } from "@/lib/socket";
import axios from "axios";
import { BACKEND_URL } from "@/config";

interface SocketContextType {
  socket: typeof socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: user, isLoading } = useGetIdentity<User>();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    if (isLoading) return;

    if (user?.id) {
      // Establish secure connection
      void connectSocket().then(async () => {
        // 🚀 GLOBAL SYNC: Join all class rooms for this user
        try {
          const response = await axios.get(`${BACKEND_URL}/classes/mine`, {
            withCredentials: true,
          });
          const classes = response.data?.data || [];
          classes.forEach((c: any) => {
            socket.emit("join_class", c.id);
            console.log(`[Socket] Globally joined class room: ${c.id}`);
          });
        } catch (err) {
          console.error("Failed to auto-join class rooms:", err);
        }
      });

      const onConnect = () => setIsConnected(true);
      const onDisconnect = () => setIsConnected(false);

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);

      setIsConnected(socket.connected);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.disconnect();
      };
    } else {
      if (socket.connected) {
        socket.disconnect();
        setIsConnected(false);
      }
    }
  }, [user?.id, isLoading]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
