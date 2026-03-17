"use client";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent as ShadcnSidebarContent,
  SidebarHeader as ShadcnSidebarHeader,
  SidebarRail as ShadcnSidebarRail,
  SidebarTrigger as ShadcnSidebarTrigger,
  useSidebar as useShadcnSidebar,
} from "@/components/ui/sidebar";
import {
  useLink,
  useMenu,
  useRefineOptions,
  useGetIdentity,
  type TreeMenuItem,
} from "@refinedev/core";
import { ChevronRight, ListIcon } from "lucide-react";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils.ts";
import { Link as RouterLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, UserRole } from "@/types";
import { useTranslation } from "react-i18next";

// Define which roles can see which groups - Internal keys used here
const ROLE_GROUP_PERMISSIONS: Record<string, UserRole[]> = {
  "groups.admin": [UserRole.ADMIN],
  "groups.ai-lab": [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
  "groups.academic": [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
  "groups.curriculum": [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
  "groups.progress": [UserRole.ADMIN, UserRole.STUDENT],
};

export function Sidebar() {
  const { t } = useTranslation();
  const { open } = useShadcnSidebar();
  const { menuItems, selectedKey } = useMenu();
  const { data: identity, isLoading: identityLoading } = useGetIdentity<User>();

  // Use a fallback identity from local storage to prevent UI blinking during refetch
  const activeIdentity = useMemo(() => {
    if (identity) return identity;
    const cached = localStorage.getItem("user");
    if (cached) {
      try {
        return JSON.parse(cached) as User;
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [identity]);

  // Group items by their meta.group property and filter by role
  const groupedItems = useMemo(() => {
    const groups: Record<string, TreeMenuItem[]> = {
      default: []
    };

    const userRole = activeIdentity?.role;

    menuItems.forEach((item) => {
      const groupName = item.meta?.group as string | undefined;
      
      // 1. Check if the group itself is allowed for this role
      if (groupName && userRole) {
        const allowedRoles = ROLE_GROUP_PERMISSIONS[groupName];
        if (allowedRoles && !allowedRoles.includes(userRole)) {
          return; // Skip this item if the group isn't for this role
        }
      }

      // 2. Fail-safe: Explicitly hide specific items for roles
      if (userRole === UserRole.STUDENT && (item.name === "ai-assistant" || item.name === "teacher-channel")) {
        return;
      }

      if (groupName) {
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        groups[groupName].push(item);
      } else {
        groups.default.push(item);
      }
    });

    return groups;
  }, [menuItems, activeIdentity?.role]);

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
                  "ml-4 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 transition-all duration-300",
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
      </ShadcnSidebarContent>
    </ShadcnSidebar>
  );
}

type MenuItemProps = {
  item: TreeMenuItem;
  selectedKey?: string;
};

function SidebarItem({ item, selectedKey }: MenuItemProps) {
  const { open } = useShadcnSidebar();

  // STABLE RENDER: Always render the same base component structure
  // We use CSS to hide/show parts rather than conditional component swapping
  if (item.children && item.children.length > 0) {
    return (
      <div className="relative">
        <div className={cn(!open && "hidden")}>
           <SidebarItemCollapsible item={item} selectedKey={selectedKey} />
        </div>
        <div className={cn(open && "hidden")}>
           <SidebarItemDropdown item={item} selectedKey={selectedKey} />
        </div>
      </div>
    );
  }

  return <SidebarItemLink item={item} selectedKey={selectedKey} />;
}

function SidebarItemCollapsible({ item, selectedKey }: MenuItemProps) {
  const { name, children } = item;

  const chevronIcon = (
    <ChevronRight
      className={cn(
        "h-3.5",
        "w-3.5",
        "shrink-0",
        "text-muted-foreground/60",
        "transition-transform",
        "duration-300",
        "group-data-[state=open]:rotate-90",
      )}
    />
  );

  return (
    <Collapsible key={`collapsible-${name}`} className={cn("w-full", "group")}>
      <CollapsibleTrigger asChild>
        <SidebarButton item={item} rightIcon={chevronIcon} />
      </CollapsibleTrigger>
      <CollapsibleContent className={cn("ml-8", "flex", "flex-col", "gap-1.5", "mt-1.5", "border-l border-border/40 pl-2")}>
        {children?.map((child: TreeMenuItem) => (
          <SidebarItem
            key={child.key || child.name}
            item={child}
            selectedKey={selectedKey}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function SidebarItemDropdown({ item, selectedKey }: MenuItemProps) {
  const { children } = item;
  const Link = useLink();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarButton item={item} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="sidebar-glass w-56 p-2">
        {children?.map((child: TreeMenuItem) => {
          const { key: childKey } = child;
          const isSelected = childKey === selectedKey;

          return (
            <DropdownMenuItem key={childKey || child.name} asChild className="rounded-lg mb-1 last:mb-0 cursor-pointer">
              <Link
                to={child.route || ""}
                className={cn("flex w-full items-center gap-3 p-2", {
                  "bg-primary/10 text-primary font-bold": isSelected,
                })}
              >
                <ItemIcon
                  icon={child.meta?.icon ?? child.icon}
                  isSelected={isSelected}
                />
                <span className="text-sm">{getDisplayName(child, t)}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarItemLink({ item, selectedKey }: MenuItemProps) {
  const isSelected = item.key === selectedKey;

  return <SidebarButton item={item} isSelected={isSelected} asLink={true} />;
}
function SidebarHeader() {
  const { title } = useRefineOptions();
  const { open, isMobile } = useShadcnSidebar();

  return (
    <ShadcnSidebarHeader
      className={cn(
        "p-0 h-20 border-b border-border/40 flex items-center overflow-hidden bg-transparent transition-all duration-300",
        !open && !isMobile ? "justify-center" : "flex-row justify-between px-6",
      )}
    >
      <AnimatePresence mode="wait">
        {(open || isMobile) && (
          <motion.div
            key="logo-full"
            initial={{ opacity: 0, x: -20, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <RouterLink to="/" className="flex flex-row items-center gap-3 whitespace-nowrap group">
              <div className="shrink-0 p-2.5 bg-primary/10 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
                {title.icon}
              </div>
              <div className="flex flex-col">
                <h2 className="text-sm font-black tracking-tight text-foreground leading-none mb-0.5">
                    {title.text}
                </h2>
                <span className="text-[10px] text-muted-foreground/60 font-medium tracking-wide">
                    {open ? "Learning Management" : ""}
                </span>
              </div>
            </RouterLink>
          </motion.div>
        )}
      </AnimatePresence>
      <ShadcnSidebarTrigger
        className={cn(
          "text-muted-foreground/60 hover:text-primary transition-all duration-300 shrink-0 opacity-100 pointer-events-auto",
          { "mr-0": !open && !isMobile },
        )}
      />
    </ShadcnSidebarHeader>
  );
}

function getDisplayName(item: TreeMenuItem, t: any) {
  const label = item.meta?.label ?? item.label ?? item.name;
  // If the label looks like a translation key, translate it
  return typeof label === "string" && label.includes(".") ? t(label) : label;
}

type IconProps = {
  icon: React.ReactNode;
  isSelected?: boolean;
};

function ItemIcon({ icon, isSelected }: IconProps) {
  return (
    <div
      className={cn("w-5 h-5 flex items-center justify-center transition-all duration-300", {
        "text-muted-foreground/70 group-hover:text-foreground group-hover:scale-110": !isSelected,
        "text-primary scale-110": isSelected,
      })}
    >
      {icon ?? <ListIcon className="w-4 h-4" />}
    </div>
  );
}

type SidebarButtonProps = React.ComponentProps<typeof Button> & {
  item: TreeMenuItem;
  isSelected?: boolean;
  rightIcon?: React.ReactNode;
  asLink?: boolean;
  onClick?: () => void;
};

function SidebarButton({
  item,
  isSelected = false,
  rightIcon,
  asLink = false,
  className,
  onClick,
  ...props
}: SidebarButtonProps) {
  const Link = useLink();
  const { open } = useShadcnSidebar();
  const { t } = useTranslation();

  const buttonContent = (
    <>
      <ItemIcon icon={item.meta?.icon ?? item.icon} isSelected={isSelected} />
      <span
        className={cn(
          "tracking-tight transition-all duration-200",
          open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none w-0",
          {
            "flex-1": rightIcon,
            "text-left": rightIcon,
            "line-clamp-1": !rightIcon,
            truncate: !rightIcon,
            "font-medium": !isSelected,
            "font-bold": isSelected,
            "text-primary": isSelected,
            "text-muted-foreground group-hover:text-foreground": !isSelected,
          }
        )}
      >
        {getDisplayName(item, t)}
      </span>
      {rightIcon && open && rightIcon}
    </>
  );

  return (
    <Button
      asChild={!!(asLink && item.route)}
      variant="ghost"
      size="lg"
      className={cn(
        "group flex w-full items-center justify-start gap-3.5 py-3 px-4! text-sm rounded-xl transition-all duration-300",
        {
          "bg-primary/10 shadow-[inset_0_0_0_1px_rgba(var(--primary),0.1)] text-primary": isSelected,
          "hover:bg-muted/60": !isSelected,
        },
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {asLink && item.route ? (
        <Link to={item.route} className={cn("flex w-full items-center gap-3.5")}>
          {buttonContent}
        </Link>
      ) : (
        buttonContent
      )}
    </Button>
  );
}

Sidebar.displayName = "Sidebar";
