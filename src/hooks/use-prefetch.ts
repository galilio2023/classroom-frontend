import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { dataProvider } from "../providers/data";

/**
 * 🚀 PERFORMANCE: Centralized prefetching hook to speed up transitions.
 */
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchClass = useCallback(
    async (id: string | number) => {
      await queryClient.prefetchQuery({
        queryKey: ["classes", "getOne", String(id)],
        queryFn: () => dataProvider.getOne({ resource: "classes", id: String(id) }),
        staleTime: 60000, // 1 minute
      });
    },
    [queryClient]
  );

  return { prefetchClass };
};
