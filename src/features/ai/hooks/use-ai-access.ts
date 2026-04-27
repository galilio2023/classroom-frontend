import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useUserRole } from "@/features/users/hooks/use-user-role";
import { useGetIdentity, useCan, useCustom } from "@refinedev/core";
import { User } from "@/types";
import { BACKEND_URL } from "@/config";
import { AI_CONSENT_VERSION } from "@/constants/ai";

import { isNewerVersion } from "../utils/version-utils";

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
  // 🛡️ RBAC Hardening: Parents are exempt from AI data processing consent as they only view
  // aggregated analytics and don't interact with generative agents directly.
  // (Reference: Law 151/2020 Art. 4, Para. 2 - Aggregated Educational Analytics Exemption)
  // (Privacy Policy Section 8.4 - Role-Based Data Processing Scopes)
  const requiresConsent = user ? user.aiConsentVersion !== AI_CONSENT_VERSION : false;

  // 🛡️ VERSION SAFETY: Detect if the client is lagging behind a version the user has accepted elsewhere (Review #25 Fix).
  // If user.aiConsentVersion (server) is NEWER than AI_CONSENT_VERSION (client), the client bundle is stale.
  const isClientLagging = user?.aiConsentVersion
    ? isNewerVersion(AI_CONSENT_VERSION, user.aiConsentVersion)
    : false;

  return {
    isAiEnabled: isAiEnabled && health?.isAvailable !== false,
    isAllowed,
    isQuotaExceeded,
    requiresConsent: requiresConsent && !isParent,
    isClientLagging, // 🚀 NEW: Exposed for global reload banners
    isDegraded: health?.isDegraded || health?.isAvailable === false,
    retryAfter: health?.maxRetryAfter,
    isLoading: isDashboardLoading || isRoleLoading || isCanLoading || healthQuery.isLoading,
    refetch: healthQuery.refetch,
  };
};
