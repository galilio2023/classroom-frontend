import { useState, useEffect } from "react";
import { useSocket } from "@/contexts/socket-context";

interface LiveSessionPayload {
  classId: string | number;
}

export const useClassRealtime = (userId: string | undefined, classId: string) => {
  const { socket, isConnected } = useSocket();
  const [isLiveIndicator, setIsLiveIndicator] = useState(false);

  useEffect(() => {
    if (!userId || !classId || !socket || !isConnected) return;

    const handleStart = (data: LiveSessionPayload) => {
      if (Number(data.classId) === Number(classId)) {
        setIsLiveIndicator(true);
      }
    };

    const handleEnd = (data: LiveSessionPayload) => {
      if (Number(data.classId) === Number(classId)) {
        setIsLiveIndicator(false);
      }
    };

    socket.on("live_session_started", handleStart);
    socket.on("live_session_ended", handleEnd);

    return () => {
      socket.off("live_session_started", handleStart);
      socket.off("live_session_ended", handleEnd);
    };
  }, [userId, classId, socket, isConnected]);

  return {
    isLiveIndicator,
    setIsLiveIndicator,
  };
};
