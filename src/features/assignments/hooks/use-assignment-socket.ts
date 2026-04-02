import { useEffect } from "react";
import { UserRole } from "@/types";
import { socket, connectSocket } from "@/lib/socket";

interface AgentAlertData {
  classId: number;
  [key: string]: unknown;
}

export const useAssignmentSocket = (
  userId?: string,
  userRole?: UserRole,
  classId?: number,
  submissionId?: number, // 🚀 NEW: Join specific submission room
  onAlert?: () => void
) => {
  useEffect(() => {
    if (!userId) return;

    void connectSocket().then(() => {
      // 1. Join Class Room (for general alerts)
      if (classId) {
        socket.emit("join_class", classId);
      }

      // 2. Join Submission Room (for specific AI/Grading updates)
      if (submissionId) {
        socket.emit("join_submission", submissionId);
      }

      socket.on("agent_alert", (data: AgentAlertData) => {
        if (data.classId === classId) {
          onAlert?.();
        }
      });

      // 🚀 Listen for specific submission updates
      socket.on("submission:ai-grade:completed", (data: any) => {
        if (data.submissionId === submissionId) {
          onAlert?.();
        }
      });

      socket.on("submission:ai-grade:failed", (data: any) => {
        if (data.submissionId === submissionId) {
          onAlert?.();
        }
      });
    });

    return () => {
      if (classId) socket.emit("leave_class", classId);
      if (submissionId) socket.emit("leave_submission", submissionId);
      socket.off("agent_alert");
      socket.off("submission:ai-grade:completed");
      socket.off("submission:ai-grade:failed");
    };
  }, [userId, userRole, classId, submissionId, onAlert]);
};
