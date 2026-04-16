import React, { Suspense } from "react";
import { useCan } from "@refinedev/core";
import { Navigate, useParams, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Use lazy loading to avoid static vs dynamic import warning in build
const UnauthorizedPage = React.lazy(() => import("@/pages/unauthorized"));

interface AuthorizedRouteProps {
  resource: string;
  action: "list" | "create" | "edit" | "show" | "delete";
  children: React.ReactNode;
}

export const AuthorizedRoute = ({ children, resource, action }: AuthorizedRouteProps) => {
  const { id } = useParams();
  const location = useLocation();

  const { data, isLoading, isError } = useCan({
    resource,
    action,
    params: { id, location },
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center w-full h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (data?.can) {
    return <div className="flex flex-1 flex-col w-full h-full">{children}</div>;
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center w-full h-full min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <UnauthorizedPage reason={data?.reason} />
    </Suspense>
  );
};
