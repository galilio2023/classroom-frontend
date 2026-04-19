import { useEffect } from "react";
import { useInvalidate, useNotification } from "@refinedev/core";
import { socket } from "@/lib/socket";
import { useCapabilities } from "@/features/users/hooks/use-capabilities";
import { toast } from "sonner"; // For high-fidelity Lifecycle Pulse notifications

/**
 * 🚀 useLifecyclePulse
 * The "Brain" of the real-time lifecycle.
 * Listens for 'lifecycle:pulse' events and reacts by:
 * 1. Invalidating Refine caches (Silent Refresh)
 * 2. Showing specialized "Pulse" notifications
 * 3. Updating presence/badge states
 */
export const useLifecyclePulse = () => {
  const { identity: user, isStudent } = useCapabilities();
  const invalidate = useInvalidate();
  const { open } = useNotification();

  useEffect(() => {
    if (!socket || !user) return;

    // 1. GENERAL PULSE (Audience: Students & Staff)
    socket.on("lifecycle:pulse", (payload: any) => {
      const { event, entityType, data } = payload;

      // --- SILENT CACHE INVALIDATION ---
      // When content changes, we must refresh the background list
      if (entityType === "module" || entityType === "resource") {
        void invalidate({
          resource: entityType === "module" ? "modules" : "resources",
          invalidates: ["list", "many", "detail"],
        });
      }

      // --- SPECIALIZED NOTIFICATIONS ---
      if (event === "content:published" && isStudent) {
        toast.success("New Content Available", {
          description: `Teacher just published a new ${entityType}.`,
          duration: 10000,
        });
      }

      if (event === "submission:graded" && user.id === data.studentId) {
        toast.info("Assignment Graded", {
          description: "One of your assignments has been graded. Check your results!",
          duration: 15000,
        });
        void invalidate({ resource: "submissions", id: data.id, invalidates: ["detail"] });
        void invalidate({ resource: "progress", invalidates: ["list"] });
      }
    });

    // 2. STAFF-ONLY PULSE (Audience: Teachers & Admins)
    socket.on("lifecycle:staff_pulse", (payload: any) => {
      const { event, _entityType: _dataityType, data: _data } = payload;

      if (event === "submission:received") {
        toast.info("New Submission", {
          description: `A student just submitted an assignment.`,
        });

        // Refresh the teacher's grading queue
        void invalidate({
          resource: "submissions",
          invalidates: ["list"],
        });
      }
    });

    return () => {
      socket.off("lifecycle:pulse");
      socket.off("lifecycle:staff_pulse");
    };
  }, [user, invalidate, open, isStudent]);
};
