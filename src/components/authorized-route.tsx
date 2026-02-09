import { useCan } from "@refinedev/core";
import { Navigate, useParams } from "react-router-dom";
import UnauthorizedPage from "@/pages/unauthorized";
import { Loader2 } from "lucide-react";

interface AuthorizedRouteProps {
  resource: string;
  action: "list" | "create" | "edit" | "show" | "delete";
  children: React.ReactNode;
}

export const AuthorizedRoute = ({
  children,
  resource,
  action,
}: AuthorizedRouteProps) => {
  // Get the 'id' from the URL if it exists
  const { id } = useParams();

  const { data, isLoading, isError } = useCan({
    resource,
    action,
    params: { id }, // Pass the id to the useCan hook
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    // If there's an error (e.g., user is not authenticated), redirect to login
    return <Navigate to="/login" />;
  }

  if (data?.can) {
    return <>{children}</>;
  }

  return <UnauthorizedPage reason={data?.reason} />;
};
