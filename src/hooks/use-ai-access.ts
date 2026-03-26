import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useUserRole } from "@/hooks/use-user-role";

/**
 * Centralized hook to manage AI feature access and gating.
 * Adheres to Tablawy OS Rule #2 regarding Adaptive UI and Parent Gating.
 */
export const useAiAccess = () => {
  const { coreData, isCoreLoading: isDashboardLoading } = useDashboard();
  const { isParent, isLoading: isRoleLoading } = useUserRole();

  // 🛡️ Global Master Switch: Only enabled if coreData is loaded and explicitly true
  const isAiEnabled = !!coreData?.globalConfig && coreData.globalConfig.enableAiFeatures === true;

  // 🛡️ RBAC: AI interactive features are strictly disabled for the Parent role
  const isAllowed = !isParent;

  return {
    isAiEnabled,
    isAllowed,
    isLoading: isDashboardLoading || isRoleLoading,
  };
};
