import { useNotification as useRefineNotification } from "@refinedev/core";
import { TablawyOpenNotificationParams } from "@/components/refine/notification/use-notification-provider";

/**
 * 🛡️ CUSTOM HOOK: useTablawyNotification
 * Wraps Refine's useNotification to provide strict Tablawy types.
 * Mandate Review #9: Eliminates 'as any' sprawl across components.
 */
export const useTablawyNotification = () => {
  const { open, close } = useRefineNotification();

  return {
    open: (params: TablawyOpenNotificationParams) => open?.(params as any),
    close,
  };
};
