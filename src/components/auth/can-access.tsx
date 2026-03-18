import React from "react";
import { useCan } from "@refinedev/core";

interface CanAccessProps {
  resource: string;
  action: "list" | "create" | "edit" | "show" | "delete";
  id?: string | number;
  params?: Record<string, any>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ARCHITECTURAL COMPONENT: CanAccess
 * A wrapper to conditionally render UI elements based on Refine's access control.
 * This ensures consistency between route protection and button visibility.
 */
export const CanAccess: React.FC<CanAccessProps> = ({
  resource,
  action,
  id,
  params,
  children,
  fallback = null,
}) => {
  const { data } = useCan({
    resource,
    action,
    params: { id, ...params },
  });

  if (data?.can) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};
