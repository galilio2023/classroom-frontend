import { useEffect } from "react";
import { UserRole } from "@/types";
import { socket, connectSocket } from "@/lib/socket";

export const useAssignmentSocket = (userId?: string, userRole?: UserRole, classId?: number, onAlert?: () => void) => {
  useEffect(() => {
    if (!userId || userRole === UserRole.STUDENT) return;

    void connectSocket().then(() => {
        socket.on("agent_alert", (data: any) => {
            if (data.classId === classId) {
                onAlert?.();
            }
        });
    });

    return () => {
      socket.off("agent_alert");
    };
  }, [userId, userRole, classId, onAlert]);
};
