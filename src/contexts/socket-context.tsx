import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetIdentity, useInvalidate, useNotification } from "@refinedev/core";
import { User } from "@/types";
import { socket, connectSocket } from "@/lib/socket";

interface SocketContextType {
  socket: typeof socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

import { useJobs } from "./job-context";
import { useStudyPlanToast } from "@/hooks/use-study-plan-toast";
import { handleError } from "@/providers/utils/api-errors";
import { Sparkles } from "lucide-react";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: user, isLoading } = useGetIdentity<User>();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const invalidate = useInvalidate();
  const { open } = useNotification();
  const { updateJob, removeJob, syncJobs } = useJobs();

  // 🚀 RULE 5: Standardized Notifications with Action Buttons
  useStudyPlanToast();

  useEffect(() => {
    if (isLoading) return;

    if (user?.id) {
      // Establish secure connection
      void connectSocket().then(async () => {
        // ... (Join class rooms) ...
      });

      const onConnect = () => {
        setIsConnected(true);
        void syncJobs(); // 🚀 SRE: Instant recovery of missed AI events upon reconnection
      };
      const onDisconnect = () => setIsConnected(false);

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);

      // 🚀 GLOBAL BACKGROUND JOB LISTENERS
      socket.on("bulk-enroll:completed", ({ results }) => {
        open?.({
          type: "success",
          message: "Bulk Enrollment Complete",
          description: `Created ${results.created} users and enrolled ${results.enrolled} students.`,
        });
        updateJob("bulk-enroll", { status: "completed" });
        // Seamlessly refresh the students/enrollments list
        void invalidate({
          resource: "enrollments",
          invalidates: ["list", "many"],
        });
      });

      socket.on("AI_SUMMARY_COMPLETED", ({ classId }) => {
        open?.({
          type: "success",
          message: "AI Summary Ready",
          description: "The class summary has been generated and is now available.",
        });
        updateJob(`summary-${classId}`, { status: "completed" });
        void invalidate({
          resource: "classes",
          id: classId,
          invalidates: ["detail"],
        });
      });

      socket.on("AI_STUDY_PLAN_COMPLETED", ({ jobId }) => {
        open?.({
          type: "success",
          message: "✨ Your study plan is ready",
          description: "Your personalized AI study journey has been generated.",
          // 🚀 RULE 5: Standardized Error Handling/Notifications
          // We use the notification's ability to show an action button if supported,
          // or we rely on the user clicking the toast.
          // Note: Refine's default notification provider might not support custom buttons in the 'open' call directly
          // depending on the UI kit used. We'll use the description or a custom toast if needed.
        });

        updateJob(jobId || "study-plan-gen", { status: "completed" });

        // 🔄 REFRESH: Invalidate study plan query
        void invalidate({
          resource: "study-planner",
          invalidates: ["list", "detail", "many"],
        });

        // 🚀 NAVIGATION: Custom toast via window.dispatchEvent or direct toast if sonner is available
        // Since we are in a context, we can use window.dispatchEvent to let components handle specific actions
        window.dispatchEvent(new CustomEvent("AI_STUDY_PLAN_READY"));
      });

      socket.on(
        "magic_builder_progress",
        (data: { step: string; progress: number; classId: number }) => {
          const jobId = `magic-builder-${data.classId}`;
          updateJob(jobId, {
            metadata: {
              progress: data.progress,
              step: data.step,
              classId: data.classId,
            },
          });

          if (data.progress === 100) {
            updateJob(jobId, { status: "completed" });
            void invalidate({ resource: "modules", invalidates: ["list"] });
            void invalidate({ resource: "classes", id: data.classId, invalidates: ["detail"] });
          }
        }
      );

      socket.on("AI_ASSIGNMENT_GENERATED", ({ content }) => {
        open?.({
          type: "success",
          message: "✨ Assignment Generated",
          description: "Your AI assignment draft is ready!",
        });
        updateJob("assignment-gen", { status: "completed" });
        // We can use a custom event or Zustand to pass this to the component
        window.dispatchEvent(new CustomEvent("AI_ASSIGNMENT_READY", { detail: { content } }));
      });

      socket.on("AI_QUIZ_GENERATED", ({ quiz }) => {
        open?.({
          type: "success",
          message: "✨ Quiz Generated",
          description: "Your AI quiz draft is ready!",
        });
        updateJob("quiz-gen", { status: "completed" });
        window.dispatchEvent(new CustomEvent("AI_QUIZ_READY", { detail: { quiz } }));
      });

      socket.on("AI_MAGIC_BUILDER_COMPLETED", ({ lessonData, classId }) => {
        open?.({
          type: "success",
          message: "Curriculum Built",
          description: "Magic Builder has finished creating your modules and lessons.",
        });
        updateJob(`magic-builder-${classId}`, { status: "completed" });
        window.dispatchEvent(
          new CustomEvent("AI_MAGIC_BUILDER_READY", { detail: { lessonData, classId } })
        );
        void invalidate({ resource: "classes", id: classId, invalidates: ["detail"] });
      });

      socket.on("AI_ASSIGNMENT_FAILED", async ({ error }) => {
        updateJob("assignment-gen", { status: "failed" });
        const handled = await handleError(error);
        open?.({
          type: "error",
          message: "Assignment Generation Failed",
          description: `${handled.message} (Support ID: ${handled.meta?.correlationId})`,
        });
      });

      socket.on("AI_QUIZ_FAILED", async ({ error }) => {
        updateJob("quiz-gen", { status: "failed" });
        const handled = await handleError(error);
        open?.({
          type: "error",
          message: "Quiz Generation Failed",
          description: `${handled.message} (Support ID: ${handled.meta?.correlationId})`,
        });
      });

      socket.on("AI_MAGIC_BUILDER_FAILED", async ({ error, classId }) => {
        updateJob(`magic-builder-${classId}`, { status: "failed" });
        const handled = await handleError(error);
        open?.({
          type: "error",
          message: "Curriculum Construction Failed",
          description: `${handled.message} (Support ID: ${handled.meta?.correlationId})`,
        });
      });

      socket.on("AI_SUMMARY_FAILED", async ({ error, classId }) => {
        updateJob(`summary-${classId}`, { status: "failed" });
        const handled = await handleError(error);
        open?.({
          type: "error",
          message: "Class Summary Failed",
          description: `${handled.message} (Support ID: ${handled.meta?.correlationId})`,
        });
      });

      socket.on("submission:ai-grade:completed", ({ submissionId }) => {
        void invalidate({
          resource: "submissions",
          id: submissionId,
          invalidates: ["detail", "list"],
        });
      });

      setIsConnected(socket.connected);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("bulk-enroll:completed");
        socket.off("AI_SUMMARY_COMPLETED");
        socket.off("AI_STUDY_PLAN_COMPLETED");
        socket.off("magic_builder_progress");
        socket.off("AI_ASSIGNMENT_GENERATED");
        socket.off("AI_QUIZ_GENERATED");
        socket.off("AI_MAGIC_BUILDER_COMPLETED");
        socket.off("AI_ASSIGNMENT_FAILED");
        socket.off("AI_QUIZ_FAILED");
        socket.off("AI_MAGIC_BUILDER_FAILED");
        socket.off("AI_SUMMARY_FAILED");
        socket.off("submission:ai-grade:completed");

        // 🛡️ SRE: Properly disconnect on unmount to prevent dangling connections (Review #21)
        socket.disconnect();
        setIsConnected(false);
      };
    } else {
      if (socket.connected) {
        socket.disconnect();
        setIsConnected(false);
      }
    }
  }, [user?.id, isLoading, invalidate, open]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
};
