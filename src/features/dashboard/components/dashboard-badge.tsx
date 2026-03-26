import React from "react";
import { cn } from "@/lib/utils";

interface DashboardBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "destructive";
  className?: string;
}

export const DashboardBadge = ({
  children,
  variant = "default",
  className = "",
}: DashboardBadgeProps) => {
  const variants = {
    default: "bg-primary text-primary-foreground shadow-md",
    outline:
      "border-2 border-primary/20 bg-white/50 dark:bg-black/20 text-foreground backdrop-blur-sm",
    destructive:
      "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 animate-pulse",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all",
        variants[variant],
        className,
      )}
    >
      {children}
    </div>
  );
};
