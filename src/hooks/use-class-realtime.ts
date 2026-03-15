import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config";

export const useClassRealtime = (
  userId: string | undefined,
  classId: string,
) => {
  const [isLiveIndicator, setIsLiveIndicator] = useState(false);

  useEffect(() => {
    if (!userId || !classId) return;

    const socket: Socket = io(SOCKET_URL, {
      query: { userId },
      withCredentials: true,
    });

    socket.on("live_session_started", (data: any) => {
      if (Number(data.classId) === Number(classId)) {
        setIsLiveIndicator(true);
      }
    });

    socket.on("live_session_ended", (data: any) => {
      if (Number(data.classId) === Number(classId)) {
        setIsLiveIndicator(false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [userId, classId]);

  return {
    isLiveIndicator,
    setIsLiveIndicator,
  };
};
