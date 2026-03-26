import React from "react";
import { useLink, type TreeMenuItem } from "@refinedev/core";
import { ChevronRight, ListIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useSidebar as useShadcnSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type Props = {
  item: TreeMenuItem;
  selectedKey?: string;
};

export function SidebarItem({ item, selectedKey }: Props) {
  const { open } = useShadcnSidebar();

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

function SidebarItemCollapsible({ item, selectedKey }: Props) {
  const { name, children } = item;
  const { t } = useTranslation();

  return (
    <Collapsible key={`collapsible-${name}`} className="w-full group">
      <CollapsibleTrigger asChild>
        <SidebarButton
          item={item}
          rightIcon={
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 transition-transform duration-300 group-data-[state=open]:rotate-90" />
          }
          className="justify-between"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="ms-8 flex flex-col gap-1.5 mt-1.5 border-l border-border/40 ps-2">
        {children?.map((child: TreeMenuItem) => (
          <SidebarItem key={child.key || child.name} item={child} selectedKey={selectedKey} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

function SidebarItemDropdown({ item, selectedKey }: Props) {
  const { children } = item;
  const Link = useLink();
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarButton item={item} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="right"
        align="start"
        className="w-56 p-2 bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl"
      >
        {children?.map((child: TreeMenuItem) => {
          const isSelected = child.key === selectedKey;
          return (
            <DropdownMenuItem
              key={child.key || child.name}
              asChild
              className="rounded-lg mb-1 last:mb-0 cursor-pointer"
            >
              <Link
                to={child.route || ""}
                className={cn(
                  "flex w-full items-center gap-3 p-2",
                  isSelected && "bg-primary/10 text-primary font-bold"
                )}
              >
                <ItemIcon icon={child.meta?.icon ?? child.icon} isSelected={isSelected} />
                <span className="text-sm">{getDisplayName(child, t)}</span>
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SidebarItemLink({ item, selectedKey }: Props) {
  return <SidebarButton item={item} isSelected={item.key === selectedKey} />;
}

function ItemIcon({ icon, isSelected }: { icon: React.ReactNode; isSelected?: boolean }) {
  return (
    <div
      className={cn(
        "w-5 h-5 flex items-center justify-center transition-all duration-300",
        isSelected ? "text-primary scale-110" : "text-muted-foreground/70"
      )}
    >
      {icon ?? <ListIcon className="w-4 h-4" />}
    </div>
  );
}

function SidebarButton({ item, isSelected, rightIcon, className, onClick }: any) {
  const Link = useLink();
  const { open } = useShadcnSidebar();
  const { t } = useTranslation();

  const content = (
    <>
      <ItemIcon icon={item.meta?.icon ?? item.icon} isSelected={isSelected} />
      <span
        className={cn(
          "tracking-tight transition-all duration-200",
          open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none w-0",
          isSelected ? "font-bold text-primary" : "font-medium text-muted-foreground"
        )}
      >
        {getDisplayName(item, t)}
      </span>
      {rightIcon && open && rightIcon}
    </>
  );

  const buttonClasses = cn(
    "group flex w-full items-center justify-start gap-3.5 py-3 !px-4 text-sm rounded-xl transition-all duration-300",
    isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted/60",
    className
  );

  return item.route && !item.children?.length ? (
    <Button asChild variant="ghost" size="lg" className={buttonClasses} onClick={onClick}>
      <Link to={item.route}>{content}</Link>
    </Button>
  ) : (
    <Button variant="ghost" size="lg" className={buttonClasses} onClick={onClick}>
      {content}
    </Button>
  );
}

function getDisplayName(item: TreeMenuItem, t: any) {
  const label = item.meta?.label ?? item.label ?? item.name;
  return typeof label === "string" && label.includes(".") ? t(label) : label;
}
