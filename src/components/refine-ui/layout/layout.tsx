"use client";

import { Header } from "@/components/refine-ui/layout/header";
import { ThemeProvider } from "@/components/refine-ui/theme/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { PropsWithChildren } from "react";
import { Sidebar } from "./sidebar";
import { useLocation, useParams } from "react-router-dom";
import { XPGainPopup } from "@/components/xp-gain-popup";
import { useGetIdentity } from "@refinedev/core";
import { User, UserRole } from "@/types";
import { MobileNav } from "./mobile-nav";
import { motion, AnimatePresence } from "framer-motion";
import { OfflineBanner } from "@/components/offline-banner";
import { PWAInstaller } from "@/components/pwa-installer";
import { AIStudyBuddy } from "@/components/ai-study-buddy";
import { useGamificationToasts } from "@/hooks/use-gamification-toasts";

export function Layout({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const { id } = useParams();
  const { data: identity } = useGetIdentity<User>();
  const isStudent = identity?.role === UserRole.STUDENT;

  // 🚀 GAMIFICATION: Activate listeners for XP, Levels, and Badges
  useGamificationToasts(identity?.id);

  // Extract classId from URL if present (supports /classes/show/:id or /assignments/show/:id)
  const classIdFromUrl = pathname.includes("/classes/show/") ? id : undefined;

  return (
    <ThemeProvider>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset className="flex flex-col min-h-screen bg-background/50 relative overflow-hidden">
          {/* Global Mesh Gradient Background */}
          <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
            <div className="absolute top-[-10%] start-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] end-[-10%] w-[40%] h-[40%] bg-ai-primary/5 rounded-full blur-[120px]" />
          </div>
          
          <OfflineBanner />
          <Header />
          <main className="flex-1 flex flex-col relative w-full overflow-x-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={pathname.split('/')[1] || 'root'}
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
          
          {/* PERSISTENT AI STUDY BUDDY */}
          {identity && (
              <AIStudyBuddy 
                classId={classIdFromUrl}
              />
          )}

          {isStudent && <XPGainPopup />}
          {isStudent && <MobileNav />}
          <PWAInstaller />
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}

Layout.displayName = "Layout";
