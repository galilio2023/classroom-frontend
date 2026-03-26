import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSocket } from "@/contexts/socket-context";
import { useNavigate } from "react-router-dom";

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Enterprise hook for real-time notifications and badge syncing.
 * Listens to events emitted by the unified NotificationService.
 */
export const useLiveNotifications = (userId: string | undefined) => {
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [latestNotification, setLatestNotification] =
    useState<Notification | null>(null);

  useEffect(() => {
    if (!userId || !socket || !isConnected) return;

    // 1. Listen for Real-time Toast Alerts
    const handleNotification = (notification: Notification) => {
      setLatestNotification(notification);

      // Trigger Global Toast
      toast(notification.title, {
        description: notification.message,
        action: notification.link
          ? {
              label: "View",
              onClick: () => navigate(notification.link!),
            }
          : undefined,
      });
    };

    // 2. Listen for Atomic Unread Count Updates
    // This event is fired by our backend transaction every time count changes
    const handleUnreadCount = (data: { count: number }) => {
      setUnreadCount(data.count);
    };

    socket.on("notification", handleNotification);
    socket.on("unread_count", handleUnreadCount);

    return () => {
      socket.off("notification", handleNotification);
      socket.off("unread_count", handleUnreadCount);
    };
  }, [userId, socket, isConnected]);

  return {
    unreadCount,
    latestNotification,
    setUnreadCount,
  };
};
