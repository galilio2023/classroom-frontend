import { CanAccess, CanAccessProps } from "@refinedev/core";
import UnauthorizedPage from "@/pages/unauthorized";

interface AuthorizedRouteProps extends CanAccessProps {
  children: React.ReactNode;
}

export const AuthorizedRoute = ({ children, ...props }: AuthorizedRouteProps) => {
  return (
    <CanAccess {...props} fallback={<UnauthorizedPage />}>
      {children}
    </CanAccess>
  );
};
