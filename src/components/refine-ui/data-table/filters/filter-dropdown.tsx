"use client";

import { useTranslate } from "@refinedev/core";
import type { Column } from "@tanstack/react-table";
import { ListFilter, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DataTableFilterDropdownProps<TData> = {
  column: Column<TData>;
  contentClassName?: string;
  triggerClassName?: string;
  children: (args: {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ReactNode;
};

export function DataTableFilterDropdown<TData>({
  column,
  triggerClassName,
  contentClassName,
  children,
}: DataTableFilterDropdownProps<TData>) {
  const [isOpen, setIsOpen] = useState(false);
  const isFiltered = column.getIsFiltered();

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          variant="ghost"
          size="icon"
          className={cn(
            "data-[state=open]:bg-accent w-5 h-5",
            {
              "text-primary": isFiltered,
              "text-muted-foreground": !isFiltered,
            },
            triggerClassName,
          )}
        >
          <ListFilter className="!h-3 !w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("w-full shadow-sm", contentClassName)}
      >
        {children({ isOpen, setIsOpen })}
      </PopoverContent>
    </Popover>
  );
}

type DataTableFilterDropdownActionsProps = {
  className?: string;
  isClearDisabled?: boolean;
  isApplyDisabled?: boolean;
  onClear: () => void;
  onApply: () => void;
};

export function DataTableFilterDropdownActions({
  className,
  isClearDisabled,
  isApplyDisabled,
  onClear,
  onApply,
}: DataTableFilterDropdownActionsProps) {
  const t = useTranslate();

  return (
    <div
      className={cn(
        "flex items-center justify-between w-full gap-2",
        className,
      )}
    >
      <Button
        size="sm"
        variant="ghost"
        disabled={isClearDisabled}
        className="rounded-sm text-xs font-semibold text-muted-foreground"
        onClick={onClear}
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
        {t("buttons.clear", "Clear")}
      </Button>

      <Button
        size="sm"
        disabled={isApplyDisabled}
        className="rounded-sm text-xs font-semibold"
        onClick={onApply}
      >
        {t("buttons.apply", "Apply")}
      </Button>
    </div>
  );
}
