import React, { useMemo } from "react";
import { useGetIdentity } from "@refinedev/core";
import { Navigate } from "react-router-dom";
import { User, UserRole, VerificationStatus } from "@/types";
import { Loader2 } from "lucide-react";

const Loading = () => (
  <div className="flex h-dvh items-center justify-center">
    <Loader2 className="h-12 w-12 animate-spin text-primary" />
  </div>
);

export const VerificationGuard = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading } = useGetIdentity<User>();
  
  // Try to use cached user to avoid full-page flickering while useGetIdentity re-fetches
  const activeUser = useMemo(() => {
    if (user) return user;
    const cached = localStorage.getItem("user");
    if (cached) {
      try {
        return JSON.parse(cached) as User;
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [user]);

  // If we have neither the live user nor the cached user, then show loader
  if (isLoading && !activeUser) return <Loading />;
  
  // If we're not loading and still have no user (not logged in), let the router handle it
  if (!activeUser) return <>{children}</>;
  
  const isVerified = activeUser.verificationStatus === VerificationStatus.VERIFIED;
  const isUnverifiedTeacher = activeUser.role === UserRole.TEACHER && !isVerified;
  
  if (isUnverifiedTeacher) {
    return <Navigate to="/pending-verification" replace />;
  }
  
  return <>{children}</>;
};
