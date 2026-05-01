"use client";

import type { PropsWithChildren } from "react";

import { CreateButton } from "@/components/refine/buttons/create";
import {} from "@/components/refine/layout/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useResourceParams, useUserFriendlyName } from "@refinedev/core";
import { motion } from "framer-motion";

import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import React from "react";

type ListViewProps = PropsWithChildren<{
  className?: string;
  title?: React.ReactNode;
  breadcrumb?: React.ReactNode;
  headerProps?: {
    subtitle?: string;
  };
  headerButtons?: React.ReactNode;
}>;

export function ListView({
  children,
  className,
  title,
  breadcrumb,
  headerProps,
  headerButtons,
}: ListViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-col gap-6 w-full max-w-full overflow-hidden pb-10", className)}
    >
      {(title || breadcrumb || headerButtons) && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4 flex-1 text-start">
            {breadcrumb !== undefined ? breadcrumb : <Breadcrumb />}
            {title && <h1 className="page-title mb-0 flex items-center gap-3">{title}</h1>}
            {headerProps?.subtitle && (
              <p className="text-muted-foreground font-medium max-w-2xl">{headerProps.subtitle}</p>
            )}
          </div>
          {headerButtons && (
            <div className="flex items-center gap-3 w-full md:w-auto">{headerButtons}</div>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
}

type ListHeaderProps = PropsWithChildren<{
  resource?: string;
  title?: string;
  canCreate?: boolean;
  headerClassName?: string;
  wrapperClassName?: string;
}>;

export const ListViewHeader = ({
  canCreate,
  resource: resourceFromProps,
  title: titleFromProps,
  wrapperClassName,
  headerClassName,
}: ListHeaderProps) => {
  const getUserFriendlyName = useUserFriendlyName();

  const { resource, identifier } = useResourceParams({
    resource: resourceFromProps,
  });
  const resourceName = identifier ?? resource?.name;

  const isCreateButtonVisible = canCreate ?? !!resource?.create;

  const title =
    titleFromProps ??
    getUserFriendlyName(resource?.meta?.label ?? identifier ?? resource?.name, "plural");

  return (
    <div className={cn("flex flex-col gap-6 mb-2", wrapperClassName)}>
      <div className="flex items-center relative gap-2">
        <Separator className={cn("absolute", "start-0", "end-0", "z-[1] opacity-50")} />
      </div>
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
          headerClassName
        )}
      >
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{title}</h1>
        {isCreateButtonVisible && (
          <div className="flex items-center gap-2">
            <CreateButton
              resource={resourceName}
              className="rounded-xl font-bold uppercase tracking-widest text-[10px] h-11 px-6 shadow-lg shadow-primary/20"
            />
          </div>
        )}
      </div>
    </div>
  );
};

ListView.displayName = "ListView";
