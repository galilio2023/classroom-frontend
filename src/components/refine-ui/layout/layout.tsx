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

export function Layout({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const { data: identity } = useGetIdentity<User>();
  const isStudent = identity?.role === UserRole.STUDENT;

  return (
    <ThemeProvider>
      <SidebarProvider>
        <Sidebar />
        <SidebarInset className="overflow-hidden">
          <Header />
          <main
            key={pathname} // Key forces re-mount for animation on route change
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
              "pb-20 md:pb-4", // Add padding for mobile nav
              "page-transition" // Apply the animation class
            )}
          >
            {children}
          </main>
          {isStudent && <XPGainPopup />}
          {isStudent && <MobileNav />}
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  );
}

Layout.displayName = "Layout";
