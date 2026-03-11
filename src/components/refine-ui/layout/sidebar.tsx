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

// Define which roles can see which groups
const ROLE_GROUP_PERMISSIONS: Record<string, UserRole[]> = {
  "Admin": [UserRole.ADMIN],
  "AI Lab": [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
  "Academic": [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
  "Curriculum": [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT],
  "Progress": [UserRole.ADMIN, UserRole.STUDENT],
};

export function Sidebar() {
  const { open } = useShadcnSidebar();
  const { menuItems, selectedKey } = useMenu();
  const { data: identity } = useGetIdentity<User>();

  // Group items by their meta.group property and filter by role
  const groupedItems = useMemo(() => {
    const groups: Record<string, TreeMenuItem[]> = {
      default: []
    };

    const userRole = identity?.role;

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
      if (userRole === UserRole.STUDENT && item.name === "ai-assistant") {
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
  }, [menuItems, identity?.role]);

  return (
    <ShadcnSidebar collapsible="icon" className={cn("border-none sidebar-glass")}>
      <ShadcnSidebarRail />
      <SidebarHeader />
      <ShadcnSidebarContent
        className={cn("transition-discrete", "pt-8", {
          "px-3": open,
          "px-1": !open,
        })}
      >
        {/* Render default (ungrouped) items first */}
        {groupedItems.default.map((item: TreeMenuItem) => (
          <SidebarItem
            key={item.key || item.name}
            item={item}
            selectedKey={selectedKey}
          />
        ))}

        {/* Render grouped items with headers */}
        {Object.entries(groupedItems).map(([groupName, items]) => {
          if (groupName === "default" || items.length === 0) return null;
          
          return (
            <div key={groupName} className="mt-6 mb-2">
              <AnimatePresence initial={false}>
                {open && (
                  <motion.span
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={cn(
                      "ml-3",
                      "block",
                      "text-[10px]",
                      "font-bold",
                      "uppercase",
                      "tracking-widest",
                      "text-muted-foreground/50",
                      "mb-3"
                    )}
                  >
                    {groupName}
                  </motion.span>
                )}
              </AnimatePresence>
              <div className="flex flex-col gap-1">
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

  if (item.children && item.children.length > 0) {
    if (open) {
      return <SidebarItemCollapsible item={item} selectedKey={selectedKey} />;
    }
    return <SidebarItemDropdown item={item} selectedKey={selectedKey} />;
  }

  return <SidebarItemLink item={item} selectedKey={selectedKey} />;
}

function SidebarItemCollapsible({ item, selectedKey }: MenuItemProps) {
  const { name, children } = item;

  const chevronIcon = (
    <ChevronRight
      className={cn(
        "h-4",
        "w-4",
        "shrink-0",
        "text-muted-foreground",
        "transition-transform",
        "duration-200",
        "group-data-[state=open]:rotate-90",
      )}
    />
  );

  return (
    <Collapsible key={`collapsible-${name}`} className={cn("w-full", "group")}>
      <CollapsibleTrigger asChild>
        <SidebarButton item={item} rightIcon={chevronIcon} />
      </CollapsibleTrigger>
      <CollapsibleContent className={cn("ml-6", "flex", "flex-col", "gap-1", "mt-1")}>
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarButton item={item} />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" className="sidebar-glass">
        {children?.map((child: TreeMenuItem) => {
          const { key: childKey } = child;
          const isSelected = childKey === selectedKey;

          return (
            <DropdownMenuItem key={childKey || child.name} asChild>
              <Link
                to={child.route || ""}
                className={cn("flex w-full items-center gap-2", {
                  "bg-primary/10 text-primary": isSelected,
                })}
              >
                <ItemIcon
                  icon={child.meta?.icon ?? child.icon}
                  isSelected={isSelected}
                />
                <span className="font-medium">{getDisplayName(child)}</span>
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
        "p-0 h-20 border-b border-sidebar-border/50 flex items-center overflow-hidden bg-transparent",
        !open && !isMobile ? "justify-center" : "flex-row justify-between px-6",
      )}
    >
      <AnimatePresence mode="wait">
        {(open || isMobile) && (
          <motion.div
            key="logo-full"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <RouterLink to="/" className="flex flex-row items-center gap-3 whitespace-nowrap hover:opacity-80">
              <div className="shrink-0 p-2 bg-primary/10 rounded-xl">{title.icon}</div>
              <h2 className="text-base font-black tracking-tight text-foreground">
                {title.text}
              </h2>
            </RouterLink>
          </motion.div>
        )}
      </AnimatePresence>
      <ShadcnSidebarTrigger
        className={cn(
          "text-muted-foreground hover:text-foreground transition-colors shrink-0 opacity-100 pointer-events-auto",
          { "mr-0": !open && !isMobile },
        )}
      />
    </ShadcnSidebarHeader>
  );
}

function getDisplayName(item: TreeMenuItem) {
  return item.meta?.label ?? item.label ?? item.name;
}

type IconProps = {
  icon: React.ReactNode;
  isSelected?: boolean;
};

function ItemIcon({ icon, isSelected }: IconProps) {
  return (
    <div
      className={cn("w-5 h-5 flex items-center justify-center transition-colors", {
        "text-muted-foreground group-hover:text-foreground": !isSelected,
        "text-primary": isSelected,
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

  const buttonContent = (
    <>
      <ItemIcon icon={item.meta?.icon ?? item.icon} isSelected={isSelected} />
      <AnimatePresence mode="wait">
        {open && (
          <motion.span
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -5 }}
            transition={{ duration: 0.15 }}
            className={cn("tracking-tight transition-all", {
              "flex-1": rightIcon,
              "text-left": rightIcon,
              "line-clamp-1": !rightIcon,
              truncate: !rightIcon,
              "font-medium": !isSelected,
              "font-bold": isSelected,
              "text-primary": isSelected,
              "text-muted-foreground group-hover:text-foreground": !isSelected,
            })}
          >
            {getDisplayName(item)}
          </motion.span>
        )}
      </AnimatePresence>
      {rightIcon}
    </>
  );

  return (
    <Button
      asChild={!!(asLink && item.route)}
      variant="ghost"
      size="lg"
      className={cn(
        "group flex w-full items-center justify-start gap-3 py-2.5 px-4! text-sm rounded-xl transition-all duration-200",
        {
          "bg-primary/10 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.1)]": isSelected,
          "hover:bg-muted/50": !isSelected,
        },
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {asLink && item.route ? (
        <Link to={item.route} className={cn("flex w-full items-center gap-3")}>
          {buttonContent}
        </Link>
      ) : (
        buttonContent
      )}
    </Button>
  );
}

Sidebar.displayName = "Sidebar";
