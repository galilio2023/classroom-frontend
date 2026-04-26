import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useUserRole } from "@/features/users/hooks/use-user-role";
import { useGetIdentity, useCan, useCustom } from "@refinedev/core";
import { User } from "@/types";
import { BACKEND_URL } from "@/config";
import { AI_CONSENT_VERSION } from "@/constants/ai";

/**
 * Centralized hook to manage AI feature access and gating.
 * Adheres to Tablawy OS Rule #2 regarding Adaptive UI and Parent Gating.
 */
export const useAiAccess = () => {
  const { coreData, isCoreLoading: isDashboardLoading } = useDashboard();
  const { isParent, isLoading: isRoleLoading } = useUserRole();
  const { data: user } = useGetIdentity<User>();

  // 🛡️ CIRCUIT BREAKER: Monitor AI System Health
  const { query: healthQuery } = useCustom({
    url: `${BACKEND_URL}/ai/health`,
    method: "get",
    queryOptions: {
      refetchInterval: (data) => {
        const health = (data as { data?: { data?: { isAvailable?: boolean } } })?.data?.data;
        // If degraded or unavailable, poll more slowly
        return health?.isAvailable === false ? 30000 : 60000;
      },
    },
  });

  const health = healthQuery.data?.data;

  // 🛡️ RBAC: Secondary layer of defense via Refine accessControl
  const { data: canAccess, isLoading: isCanLoading } = useCan({
    resource: "ai_features",
    action: "access",
  });

  // 🛡️ Global Master Switch: Only enabled if coreData is loaded and explicitly true
  const isAiEnabled = !!coreData?.globalConfig && coreData.globalConfig.enableAiFeatures === true;

  // 🛡️ RBAC: AI interactive features are strictly disabled for the Parent role
  const isAllowed = !isParent && (canAccess?.can ?? true);

  // 📊 QUOTA: Check if user has exceeded their monthly token limit
  const isQuotaExceeded = user ? (user.aiTokensUsed || 0) >= (user.aiMonthlyLimit || 50000) : false;

  // 🛡️ CONSENT: Check if user has agreed to the LATEST governance version (Mandate Review)
  const requiresConsent = user ? user.aiConsentVersion !== AI_CONSENT_VERSION : true;

  return {
    isAiEnabled: isAiEnabled && health?.isAvailable !== false,
    isAllowed,
    isQuotaExceeded,
    requiresConsent: requiresConsent && !isParent,
    isDegraded: health?.isDegraded || health?.isAvailable === false,
    retryAfter: health?.maxRetryAfter,
    isLoading: isDashboardLoading || isRoleLoading || isCanLoading || healthQuery.isLoading,
    refetch: healthQuery.refetch,
  };
};
