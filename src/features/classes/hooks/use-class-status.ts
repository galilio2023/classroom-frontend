import { useOne } from "@refinedev/core";
import { useEffect } from "react";
import { socket } from "@/lib/socket";

export interface ClassStatus {
  isLive: boolean;
  whiteboardVersion: number;
  isBreakoutActive: boolean;
  activeQuizId: number | null;
}

/**
 * 🚀 RECONCILIATION HOOK
 * Ensures the frontend ground-truth stays in sync with the backend.
 * Fetches status on mount and after socket reconnections.
 */
export const useClassStatus = (classId: string | number | undefined) => {
  const { query } = useOne<ClassStatus>({
    resource: `classes/${classId}/status`,
    id: "current", // Singleton-style endpoint
    queryOptions: {
      enabled: !!classId,
      // Re-fetch when window regains focus (standard react-query behavior)
      refetchOnWindowFocus: true,
    },
  });

  const { data, refetch, isLoading, isError } = query;
  const status = data?.data;

  useEffect(() => {
    if (!classId) return;

    const handleReconnect = () => {
      void refetch();
    };

    // Also listen for pulse events to trigger a refresh if we suspect we're out of sync
    socket.on("connect", handleReconnect);
    socket.on("lifecycle:pulse:reconcile", handleReconnect);

    return () => {
      socket.off("connect", handleReconnect);
      socket.off("lifecycle:pulse:reconcile", handleReconnect);
    };
  }, [classId, refetch]);

  return {
    status,
    isLoading,
    isError,
    refetch,
  };
};
