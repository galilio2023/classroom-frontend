import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetIdentity, useInvalidate, useNotification } from "@refinedev/core";
import { User } from "@/types";
import { socket, connectSocket } from "@/lib/socket";
import axios from "axios";
import { BACKEND_URL } from "@/config";

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

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: user, isLoading } = useGetIdentity<User>();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const invalidate = useInvalidate();
  const { open } = useNotification();
  const { updateJob, removeJob } = useJobs();

  useEffect(() => {
    if (isLoading) return;

    if (user?.id) {
      // Establish secure connection
      void connectSocket().then(async () => {
        // ... (Join class rooms) ...
      });

      const onConnect = () => setIsConnected(true);
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

      socket.on("AI_ASSIGNMENT_COMPLETED", ({ content }) => {
        open?.({
          type: "success",
          message: "Assignment Generated",
          description: "Your AI assignment draft is ready!",
        });
        updateJob("assignment-gen", { status: "completed" });
        // We can use a custom event or Zustand to pass this to the component
        window.dispatchEvent(new CustomEvent("AI_ASSIGNMENT_READY", { detail: { content } }));
      });

      socket.on("AI_QUIZ_COMPLETED", ({ quiz }) => {
        open?.({
          type: "success",
          message: "Quiz Generated",
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

      socket.on("AI_ASSIGNMENT_FAILED", ({ error }) => {
        open?.({ type: "error", message: "Generation Failed", description: error });
        updateJob("assignment-gen", { status: "failed" });
      });

      socket.on("AI_QUIZ_FAILED", ({ error }) => {
        open?.({ type: "error", message: "Generation Failed", description: error });
        updateJob("quiz-gen", { status: "failed" });
      });

      socket.on("AI_MAGIC_BUILDER_FAILED", ({ error, classId }) => {
        open?.({ type: "error", message: "Generation Failed", description: error });
        updateJob(`magic-builder-${classId}`, { status: "failed" });
      });

      socket.on("AI_SUMMARY_FAILED", ({ error, classId }) => {
        open?.({ type: "error", message: "Generation Failed", description: error });
        updateJob(`summary-${classId}`, { status: "failed" });
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
        socket.off("submission:ai-grade:completed");
        socket.disconnect();
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
