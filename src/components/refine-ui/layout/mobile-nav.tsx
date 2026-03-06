import React from "react";
import { Home, LayoutGrid, BrainCircuit, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Classes", icon: LayoutGrid, path: "/classes" },
  { label: "AI Lab", icon: BrainCircuit, path: "/ai-study-lab" },
  { label: "Alerts", icon: Bell, path: "/notifications" },
];

export const MobileNav = () => {
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border px-6 py-3 flex justify-between items-center shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5", isActive && "fill-primary/10")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};
