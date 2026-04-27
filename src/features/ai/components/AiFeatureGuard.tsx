import React from "react";
import { useAiAccess } from "@/features/ai/hooks/use-ai-access";
import { Lock, Clock, Sparkles, BrainCircuit, RefreshCcw, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCan } from "@refinedev/core";
import { ConsentBarrier } from "./ConsentBarrier";

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
 * 3. User has provided AI Governance Consent (Law 151 compliance).
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
    requiresConsent,
    isDegraded,
    retryAfter,
    isLoading: isAiLoading,
    isClientLagging,
    refetch,
  } = useAiAccess();
  const { data: canAccess, isLoading: isCanLoading } = useCan({
    resource: "ai_features",
    action: "access",
  });

  const isLoading = isAiLoading || isCanLoading;

  if (isLoading) {
    return <Skeleton className={skeletonClassName} />;
  }

  // 🛡️ VERSION SAFETY: Force refresh if client is outdated (Review #25)
  if (isClientLagging) {
    return (
      <Alert variant="destructive" className="border-2 border-dashed bg-destructive/5">
        <RefreshCcw className="h-4 w-4" />
        <AlertTitle className="uppercase font-black tracking-widest">
          Platform Update Required
        </AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <span>
            A new AI Governance update has been deployed. Please refresh your browser to ensure
            continued access to AI features.
          </span>
          <Button
            size="sm"
            className="w-fit h-9 rounded-xl font-bold gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh Now
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // 🛡️ LAW 151: Consent Gating (Highest priority after availability)
  if (requiresConsent) {
    return <ConsentBarrier />;
  }

  const isAllowed = canAccess?.can ?? false;

  const getGuardContent = () => {
    if (isQuotaExceeded) {
      return {
        title: "Monthly Limit Reached",
        icon: <BrainCircuit className="h-4 w-4" />,
        description:
          "You have exhausted your AI token quota for this month. Your limit will reset on the 1st of next month.",
      };
    }

    if (isDegraded) {
      return {
        title: "AI System Offline",
        // 🛡️ VISUAL IDENTITY: Rule 7 - Use Sparkles/BrainCircuit even in degraded state
        icon: <Sparkles className="h-4 w-4 animate-pulse text-primary" />,
        description: retryAfter
          ? `The AI co-teacher is currently cooling down due to high traffic. Estimated return in ${Math.ceil(retryAfter / 60)} minutes.`
          : "The AI system is temporarily unavailable due to upstream provider maintenance. Please try again later.",
      };
    }

    if (!isAiEnabled) {
      return {
        title: "AI Features Disabled",
        icon: <Clock className="h-4 w-4" />,
        description:
          "Tablawy OS AI features are currently disabled by the administrator for this institution.",
      };
    }

    if (!isAllowed) {
      return {
        title: "AI Feature Restricted",
        icon: <Lock className="h-4 w-4" />,
        description:
          "Your current account role does not have permission to access interactive AI features.",
      };
    }

    return null;
  };

  // 🛡️ Guard logic
  const guardContent = getGuardContent();
  if (guardContent) {
    if (silent) return null;
    if (fallback) return <>{fallback}</>;

    return (
      <Alert variant="destructive" className="border-dashed border-2">
        {guardContent.icon}
        <AlertTitle>{guardContent.title}</AlertTitle>
        <AlertDescription className="flex flex-col gap-4">
          <span>{guardContent.description}</span>
          {isDegraded && (
            <Button
              variant="outline"
              size="sm"
              className="w-fit h-8 rounded-lg font-black uppercase text-[10px] tracking-widest gap-2"
              onClick={() => void refetch()}
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCcw className="h-3 w-3" />
              )}
              {isAiLoading ? "Checking..." : "Check Status Again"}
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
