import { useCan, CanReturnType } from "@refinedev/core";
import { Navigate } from "react-router-dom";
import UnauthorizedPage from "@/pages/unauthorized";
import { Loader2 } from "lucide-react";

interface AuthorizedRouteProps {
  resource: string;
  action: "list" | "create" | "edit" | "show" | "delete";
  children: React.ReactNode;
  params?: { id?: string };
}

export const AuthorizedRoute = ({
  children,
  resource,
  action,
  params,
}: AuthorizedRouteProps) => {
  const { data, isLoading, isError } = useCan({
    resource,
    action,
    params,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return <Navigate to="/login" />;
  }

  if (data?.can) {
    return <>{children}</>;
  }

  return <UnauthorizedPage reason={data?.reason} />;
};
