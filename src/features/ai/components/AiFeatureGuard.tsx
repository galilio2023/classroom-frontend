import React from "react";
import { useAiAccess } from "@/features/ai/hooks/use-ai-access";
import { Lock, Clock, Sparkles, BrainCircuit } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useCan } from "@refinedev/core";

interface AiFeatureGuardProps {
  children: React.ReactNode;
  /** Optional fallback UI when feature is disabled */
  fallback?: React.ReactNode;
  /** Whether to show a detailed 'Disabled' UI or just hide the feature */
  silent?: boolean;
  /** Custom CSS for the loading skeleton to avoid layout shift */
  skeletonClassName?: string;
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
  skeletonClassName = "w-full h-32 rounded-lg",
}) => {
  const {
    isAiEnabled,
    isQuotaExceeded,
    isDegraded,
    retryAfter,
    isLoading: isAiLoading,
  } = useAiAccess();
  const { data: canAccess, isLoading: isCanLoading } = useCan({
    resource: "ai_features",
    action: "access",
  });

  const isLoading = isAiLoading || isCanLoading;

  if (isLoading) {
    return <Skeleton className={skeletonClassName} />;
  }

  const isAllowed = canAccess?.can ?? false;

  // 🛡️ Guard logic
  if (!isAiEnabled || !isAllowed || isQuotaExceeded) {
    if (silent) return null;

    if (fallback) return <>{fallback}</>;

    let title = "AI Feature Restricted";
    let description =
      "Your current account role does not have permission to access interactive AI features.";
    let icon = <Lock className="h-4 w-4" />;

    if (isQuotaExceeded) {
      title = "Monthly Limit Reached";
      icon = <BrainCircuit className="h-4 w-4" />;
      description =
        "You have exhausted your AI token quota for this month. Your limit will reset on the 1st of next month.";
    } else if (isDegraded) {
      title = "AI System Offline";
      // 🛡️ VISUAL IDENTITY: Rule 7 - Use Sparkles/BrainCircuit even in degraded state
      icon = <Sparkles className="h-4 w-4 animate-pulse text-primary" />;
      description = retryAfter
        ? `The AI co-teacher is currently cooling down due to high traffic. Estimated return in ${Math.ceil(retryAfter / 60)} minutes.`
        : "The AI system is temporarily unavailable due to upstream provider maintenance. Please try again later.";
    } else if (!isAiEnabled) {
      title = "AI Features Disabled";
      icon = <Clock className="h-4 w-4" />;
      description =
        "Tablawy OS AI features are currently disabled by the administrator for this institution.";
    }

    return (
      <Alert variant="destructive" className="border-dashed border-2">
        {icon}
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
