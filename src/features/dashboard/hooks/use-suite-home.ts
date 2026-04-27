import { useCustom, useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { useEffect } from "react";
import { socket } from "@/lib/socket";

export interface SuiteHomeData {
  suiteType: "private" | "school" | "faculty" | "corporate";
  schoolName: string;
  widgets: any[];
}

export const useSuiteHome = () => {
  const { data: identity } = useGetIdentity<User>();

  const { query } = useCustom<SuiteHomeData>({
    url: `${import.meta.env.VITE_API_URL}/suite/home`,
    method: "get",
    queryOptions: {
      enabled: !!identity,
      staleTime: 60000,
    },
  });

  useEffect(() => {
    if (!identity?.id) return;
    const handleRefresh = () => void query.refetch();
    socket.on("notification", handleRefresh);
    return () => {
      socket.off("notification", handleRefresh);
    };
  }, [identity?.id, query]);

  return {
    data: query.data?.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
