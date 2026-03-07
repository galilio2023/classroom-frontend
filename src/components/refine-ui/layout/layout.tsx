"use client";

import { Header } from "@/components/refine-ui/layout/header";
import { ThemeProvider } from "@/components/refine-ui/theme/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";
import { useLocation } from "react-router-dom";
import { XPGainPopup } from "@/components/xp-gain-popup";
import { useGetIdentity } from "@refinedev/core";
import { User, UserRole } from "@/types";
import { MobileNav } from "./mobile-nav";
import { motion, AnimatePresence } from "framer-motion";
import { OfflineBanner } from "@/components/offline-banner";
import { PWAInstaller } from "@/components/pwa-installer";

export function Layout({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const { data: identity } = useGetIdentity<User>();
  const isStudent = identity?.role === UserRole.STUDENT;

  return (
    <ThemeProvider>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset className="overflow-hidden">
          <OfflineBanner />
          <Header />
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={cn(
                "@container/main",
                "container",
                "mx-auto",
                "relative",
                "w-full",
                "max-w-full",
                "overflow-hidden",
                "flex",
                "flex-col",
                "flex-1",
                "px-2",
                "pt-4",
                "md:p-4",
                "lg:px-6",
                "lg:pt-6",
                "pb-20 md:pb-4"
              )}
            >
              {children}
            </motion.main>
          </AnimatePresence>
          {isStudent && <XPGainPopup />}
          {isStudent && <MobileNav />}
          <PWAInstaller />
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}

Layout.displayName = "Layout";
