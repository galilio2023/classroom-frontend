import React from "react";
import { useAiAccess } from "@/hooks/use-ai-access";
import { Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useCan } from "@refinedev/core";

interface AiFeatureGuardProps {
  children: React.ReactNode;
  /** Optional fallback UI when feature is disabled */
  fallback?: React.ReactNode;
  /** Whether to show a detailed 'Disabled' UI or just hide the feature */
  silent?: boolean;
}

/**
 * 🛡️ ARCHITECTURAL COMPONENT: AiFeatureGuard
 * Wraps AI-powered features to ensure they only mount when:
 * 1. Global Master Switch (enableAiFeatures) is ON.
 * 2. User role (RBAC) allows AI interactions via useCan.
 *
 * Prevents "if (isAiEnabled)" sprawl across the codebase.
 */
export const AiFeatureGuard: React.FC<AiFeatureGuardProps> = ({
  children,
  fallback,
  silent = false,
}) => {
  const { isAiEnabled, isQuotaExceeded, isLoading: isAiLoading } = useAiAccess();
  const { data: canAccess, isLoading: isCanLoading } = useCan({
    resource: "ai_features",
    action: "access",
  });

  const isLoading = isAiLoading || isCanLoading;

  if (isLoading) {
    return <Skeleton className="w-full h-32 rounded-lg" />;
  }

  const isAllowed = canAccess?.can ?? false;

  // 🛡️ Guard logic
  if (!isAiEnabled || !isAllowed || isQuotaExceeded) {
    if (silent) return null;

    if (fallback) return <>{fallback}</>;

    const title = isQuotaExceeded ? "Monthly Limit Reached" : "AI Feature Restricted";
    const description = isQuotaExceeded
      ? "You have exhausted your AI token quota for this month. Your limit will reset on the 1st of next month."
      : !isAiEnabled
        ? "Tablawy AI features are currently disabled by the administrator."
        : "Your current account role does not have permission to access interactive AI features.";

    return (
      <Alert variant="destructive" className="border-dashed border-2">
        <Lock className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
