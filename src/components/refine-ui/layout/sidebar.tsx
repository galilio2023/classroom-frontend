"use client";

import {
  Sidebar as ShadcnSidebar,
  SidebarContent as ShadcnSidebarContent,
  SidebarRail as ShadcnSidebarRail,
  useSidebar as useShadcnSidebar,
} from "@/components/ui/sidebar";
import { type TreeMenuItem } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils.ts";
import { useTranslation } from "react-i18next";
import { useSidebarMenu } from "./hooks/use-sidebar-menu";
import { SidebarHeader } from "./components/sidebar-header";
import { SidebarItem } from "./components/sidebar-item";

export function Sidebar() {
  const { t } = useTranslation();
  const { open } = useShadcnSidebar();
  const { groupedItems, selectedKey, isSidebarLoading } = useSidebarMenu();

  return (
    <ShadcnSidebar collapsible="icon" className={cn("border-none sidebar-glass")}>
      <ShadcnSidebarRail />
      <SidebarHeader />
      <ShadcnSidebarContent
        className={cn("transition-all duration-300", "pt-6", {
          "px-4": open,
          "px-2": !open,
        })}
      >
        {isSidebarLoading ? (
            <div className="flex flex-col gap-4 items-center justify-center py-10 opacity-40">
                <Loader2 className="h-5 w-5 animate-spin" />
            </div>
        ) : (
            <>
                {/* Render default (ungrouped) items first */}
                <div className="flex flex-col gap-1.5">
                    {groupedItems.default.map((item: TreeMenuItem) => (
                        <SidebarItem
                            key={item.key || item.name}
                            item={item}
                            selectedKey={selectedKey}
                        />
                    ))}
                </div>

                {/* Render grouped items with headers */}
                {Object.entries(groupedItems).map(([groupName, items]) => {
                if (groupName === "default" || items.length === 0) return null;
                
                return (
                    <div key={groupName} className="mt-8 mb-2">
                    <div
                        className={cn(
                        "ms-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 transition-all duration-300",
                        !open && "opacity-0 -translate-x-4 pointer-events-none h-0 mb-0 overflow-hidden"
                        )}
                    >
                        {t(groupName as any)}
                    </div>
                    <div className="flex flex-col gap-1.5">
                        {items.map((item: TreeMenuItem) => (
                        <SidebarItem
                            key={item.key || item.name}
                            item={item}
                            selectedKey={selectedKey}
                        />
                        ))}
                    </div>
                    </div>
                );
                })}
            </>
        )}
      </ShadcnSidebarContent>
    </ShadcnSidebar>
  );
}

Sidebar.displayName = "Sidebar";
