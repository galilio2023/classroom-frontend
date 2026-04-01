import React from "react";
import { useList, type CrudFilter } from "@refinedev/core";
import { cn } from "@/lib/utils";

interface SidebarBadgeProps {
  resource: string;
  className?: string;
}

/**
 * 🏷️ SidebarBadge
 * Displays a small count or indicator next to sidebar items
 * for pending actions (e.g., ungraded submissions, new notifications).
 */
export const SidebarBadge = ({ resource, className }: SidebarBadgeProps) => {
  // Logic to determine what "pending" means for each resource
  const getFilters = (): CrudFilter[] | null => {
    switch (resource) {
      case "submissions":
        return [{ field: "grade", operator: "null", value: null }];
      case "notifications":
        return [{ field: "isRead", operator: "eq", value: false }];
      case "users":
        return [{ field: "verificationStatus", operator: "eq", value: "pending" }];
      default:
        return null;
    }
  };

  const filters = getFilters();

  const { query } = useList({
    resource,
    filters: filters || [],
    queryOptions: {
      enabled: !!filters,
      refetchInterval: 60000, // Sync every minute
    },
    pagination: { pageSize: 1, mode: "server" },
  });

  const count = query.data?.total || 0;

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
