import React from "react";
import { Home, LayoutGrid, BrainCircuit, Bell } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import { useTranslation } from "react-i18next";

const navItems = [
  { label: "resources.dashboard.label", icon: Home, path: "/dashboard" },
  { label: "resources.classes.label", icon: LayoutGrid, path: "/classes" },
  {
    label: "resources.ai-study-lab.label",
    icon: BrainCircuit,
    path: "/ai-study-lab",
  },
  {
    label: "resources.notifications.label",
    icon: Bell,
    path: "/notifications",
  },
];

export const MobileNav = () => {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="md:hidden fixed bottom-0 start-0 end-0 z-60 bg-background/80 backdrop-blur-xl border-t border-border/40 px-6 py-2 pb-safe-area flex justify-between items-center shadow-[0_-8px_32px_rgba(0,0,0,0.1)] rounded-t-3xl"
    >
      {navItems.map((item) => {
        const isActive =
          location.pathname === item.path ||
          (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-all duration-300 relative py-1 px-3 rounded-xl",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <motion.div whileTap={{ scale: 0.85 }} className="relative">
              <item.icon
                className={cn(
                  "h-5 w-5 md:h-6 md:w-6 transition-transform",
                  isActive && "scale-110"
                )}
              />
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-1 -end-1 w-2 h-2 bg-primary rounded-full border-2 border-background shadow-sm"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.div>
            <span
              className={cn(
                "text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-opacity",
                isActive ? "opacity-100" : "opacity-60"
              )}
            >
              {t(item.label as any)}
            </span>

            {isActive && (
              <motion.div
                layoutId="pill"
                className="absolute inset-0 bg-primary/5 rounded-xl -z-10"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </motion.div>
  );
};
