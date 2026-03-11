import React from "react";
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
  
  if (isLoading) return <Loading />;
  if (!user) return <>{children}</>;
  
  const isVerified = user.verificationStatus === VerificationStatus.VERIFIED;
  const isUnverifiedTeacher = user.role === UserRole.TEACHER && !isVerified;
  
  if (isUnverifiedTeacher) {
    return <Navigate to="/pending-verification" replace />;
  }
  
  return <>{children}</>;
};
