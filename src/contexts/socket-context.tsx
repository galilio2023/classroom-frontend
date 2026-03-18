import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { socket, connectSocket } from "@/lib/socket"; 

interface SocketContextType {
  socket: typeof socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: user, isLoading } = useGetIdentity<User>();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    if (isLoading) return;

    if (user?.id) {
      // Establish secure connection using the session token (internal to connectSocket)
      void connectSocket();

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
