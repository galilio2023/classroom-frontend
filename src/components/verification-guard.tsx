import React from "react";
import { Navigate } from "react-router-dom";
import { VerificationStatus } from "@/types";
import { Loader2 } from "lucide-react";
import { useCapabilities } from "@/hooks/use-capabilities";

const Loading = () => (
  <div className="flex h-dvh w-full items-center justify-center bg-background/50 backdrop-blur-sm">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Verifying session...
      </p>
    </div>
  </div>
);

/**
 * VerificationGuard
 * Strictly enforces verification status based on authoritative server data.
 * Reverted localStorage fallback to prevent security bypass risks as per security review.
 */
export const VerificationGuard = ({ children }: { children: React.ReactNode }) => {
  const { identity: user, isTeacher, isLoading } = useCapabilities();

  // Security: We MUST wait for the authoritative server-fetched identity.
  // Using localStorage here would allow a client-side bypass of the verification check.
  if (isLoading) return <Loading />;

  // If no user is found, we allow children to render so the AuthProvider/Router
  // can handle the redirect to login (Standard Refine/React Router pattern).
  if (!user) return <>{children}</>;

  const isVerified = user.verificationStatus === VerificationStatus.VERIFIED;
  const isUnverifiedTeacher = isTeacher && !isVerified;

  if (isUnverifiedTeacher) {
    return <Navigate to="/pending-verification" replace />;
  }

  return <>{children}</>;
};
