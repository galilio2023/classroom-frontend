import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCapabilities } from "@/hooks/use-capabilities";
import { Loader2 } from "lucide-react";

export const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOwner, suiteOnboardingComplete, isLoading } = useCapabilities();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // 🛡️ HUB REDIRECTION: If school owner hasn't selected a suite, force them to choose.
  // We exclude the selection page itself to prevent infinite loops.
  const isOnboardingPage = location.pathname.startsWith("/onboarding");

  if (isOwner && !suiteOnboardingComplete && !isOnboardingPage) {
    return <Navigate to="/onboarding/select-suite" replace />;
  }

  return <>{children}</>;
};
