import React from "react";
import { useAiAccess } from "@/hooks/use-ai-access";
import { Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

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
 * 2. User role (RBAC) allows AI interactions.
 *
 * Prevents "if (isAiEnabled)" sprawl across the codebase.
 */
export const AiFeatureGuard: React.FC<AiFeatureGuardProps> = ({
  children,
  fallback,
  silent = false,
}) => {
  const { isAiEnabled, isAllowed, isLoading } = useAiAccess();

  if (isLoading) {
    return <Skeleton className="w-full h-32 rounded-lg" />;
  }

  // 🛡️ Guard logic
  if (!isAiEnabled || !isAllowed) {
    if (silent) return null;

    if (fallback) return <>{fallback}</>;

    return (
      <Alert variant="destructive" className="border-dashed border-2">
        <Lock className="h-4 w-4" />
        <AlertTitle>AI Feature Restricted</AlertTitle>
        <AlertDescription>
          {!isAiEnabled
            ? "Tablawy AI features are currently disabled by the administrator."
            : "Your current account role does not have permission to access interactive AI features."}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};
