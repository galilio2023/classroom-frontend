import React, { useMemo } from "react";
import { useCustom } from "@refinedev/core";
import { cn } from "@/lib/utils";

interface SidebarBadgeProps {
  resource: string;
  className?: string;
}

/**
 * 🏷️ SidebarBadge
 * Optimized: Uses a single batched endpoint (/stats/sidebar-counts)
 * to prevent overfetching when multiple sidebar items are rendered.
 */
export const SidebarBadge = ({ resource, className }: SidebarBadgeProps) => {
  // 🚀 BATCHED FETCH: Fetch all counts at once
  const { result: customResult } = useCustom<Record<string, number>>({
    url: "/stats/sidebar-counts",
    method: "get",
    queryOptions: {
      refetchInterval: 60000, // Sync every minute
      staleTime: 30000, // 🛡️ DEDUPLICATION: Allow all badges to share the same cached result
    },
  });

  const counts = customResult?.data;

  // Memoize the count extraction to prevent unnecessary logic on every render
  const count = useMemo(() => {
    if (!counts) return 0;
    return counts[resource] || 0;
  }, [counts, resource]);

  if (!count || count === 0) return null;

  return (
    <div
      className={cn(
        "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-sm animate-in zoom-in duration-300",
        className
      )}
    >
      {count > 9 ? "9+" : count}
    </div>
  );
};
