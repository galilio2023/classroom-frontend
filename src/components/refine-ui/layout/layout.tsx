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
        <SidebarInset className="flex flex-col min-h-screen bg-background/50">
          <OfflineBanner />
          <Header />
          <main className="flex-1 flex flex-col relative w-full overflow-x-hidden">
            {/* Removed mode="wait" to prevent white-screen gaps between page transitions */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ 
                  duration: 0.3, 
                  ease: [0.23, 1, 0.32, 1] 
                }}
                className={cn(
                  "flex-1 flex flex-col w-full mx-auto",
                  "max-w-screen-2xl",
                  "p-4 md:p-6 lg:p-8 xl:p-10",
                  "pb-28 md:pb-10"
                )}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          {isStudent && <XPGainPopup />}
          {isStudent && <MobileNav />}
          <PWAInstaller />
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}

Layout.displayName = "Layout";
