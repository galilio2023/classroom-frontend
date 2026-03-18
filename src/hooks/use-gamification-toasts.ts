import { useEffect } from "react";
import { toast } from "sonner";
import { useSocket } from "@/contexts/socket-context";
import { useTranslation } from "react-i18next";
import { useInvalidate } from "@refinedev/core";

/**
 * Custom hook to listen for gamification events (XP, Level Up, Badges)
 * and display beautiful notifications to the student.
 */
export const useGamificationToasts = (userId: string | undefined) => {
  const { socket, isConnected } = useSocket();
  const { t } = useTranslation();
  const invalidate = useInvalidate();

  useEffect(() => {
    if (!userId || !socket || !isConnected) return;

    // 1. Listen for XP Gained
    const handleXPGained = (data: { amount: number; reason: string; totalXP: number; level: number }) => {
      toast.success(`+${data.amount} XP`, {
        description: data.reason,
        style: {
          background: "linear-gradient(to right, #f59e0b, #d97706)",
          color: "#fff",
          border: "none",
        },
      });
      
      // Sync UI data
      invalidate({
        resource: "users",
        invalidates: ["detail"],
        id: userId,
      });
    };

    // 2. Listen for Level Up
    const handleLevelUp = (data: { level: number; message: string }) => {
      toast("🚀 " + t("gamification.levelUp", "Level Up!"), {
        description: data.message,
        duration: 6000,
        style: {
          background: "linear-gradient(to right, #8b5cf6, #6d28d9)",
          color: "#fff",
          border: "none",
          fontSize: "1.1rem",
          fontWeight: "bold",
        },
      });
    };

    // 3. Listen for Badge Earned
    const handleBadgeEarned = (data: { badge: any; message: string }) => {
      toast("🏆 " + t("gamification.newBadge", "New Badge Unlocked!"), {
        description: data.message,
        duration: 8000,
        style: {
          background: "linear-gradient(to right, #10b981, #059669)",
          color: "#fff",
          border: "none",
        },
      });
      
      invalidate({
        resource: "badges",
        invalidates: ["list"],
      });
    };

    socket.on("xp_gained", handleXPGained);
    socket.on("level_up", handleLevelUp);
    socket.on("badge_earned", handleBadgeEarned);

    return () => {
      socket.off("xp_gained", handleXPGained);
      socket.off("level_up", handleLevelUp);
      socket.off("badge_earned", handleBadgeEarned);
    };
  }, [userId, socket, isConnected, t, invalidate]);
};
