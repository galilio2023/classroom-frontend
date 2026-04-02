import { useEffect } from "react";
import { useSubscription } from "@refinedev/core";
import { UseFormReturn } from "react-hook-form";

/**
 * 🛡️ useOptimisticVersion
 * Subscribes to live updates for a specific resource and ID.
 * If the version changes on the server, it updates the form's version field
 * to prevent optimistic locking conflicts (409) when the user finally hits save.
 */
export const useOptimisticVersion = (
  resource: string,
  id: string | number | undefined,
  form: UseFormReturn<any>,
  onConflict?: (serverVersion: number) => void
) => {
  useSubscription({
    channel: `${resource}/${id}`,
    types: ["*"],
    onLiveEvent: (event) => {
      if (event.type === "updated" || event.type === "patch") {
        const serverVersion = event.payload?.data?.version || event.payload?.version;
        if (serverVersion !== undefined) {
          const currentVersion = form.getValues("version");

          // If server version jumped significantly or user has unsaved changes, trigger conflict
          if (currentVersion !== undefined && serverVersion > currentVersion) {
            if (form.formState.isDirty && onConflict) {
              onConflict(serverVersion);
            } else {
              // Auto-sync if form is clean
              form.setValue("version", serverVersion, { shouldDirty: false });
            }
          }
        }
      }
    },
    enabled: !!id,
  });
};
