import { useState, useEffect } from "react";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCheck, Info, GraduationCap, ClipboardCheck, Trophy } from "lucide-react";
import { Notification, User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { io } from "socket.io-client";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

/**
 * Safely formats notification links to match frontend route structure.
 * e.g., /classes/1 -> /classes/show/1
 */
const formatNotificationLink = (link: string | null) => {
  if (!link) return null;
  
  const parts = link.split("/").filter(Boolean);
  const resourcesWithShow = ["classes", "users", "assignments"];

  // If link is exactly /resource/id and resource has a show route
  if (parts.length === 2 && resourcesWithShow.includes(parts[0])) {
    return `/${parts[0]}/show/${parts[1]}`;
  }

  return link;
};

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { data: identity } = useGetIdentity<User>();
  const queryClient = useQueryClient();
  const [socketUnreadCount, setSocketUnreadCount] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  // Fetch notifications
  const { query } = useCustom<Notification[]>({
    url: "/notifications",
    method: "get",
  });

  const notificationsData = query.data;
  const refetch = query.refetch;

  const notifications = notificationsData?.data || [];
  
  // Use socket count if available, otherwise calculate from fetched data
  const unreadCount = socketUnreadCount !== null 
    ? socketUnreadCount 
    : notifications.filter((n: Notification) => !n.isRead).length;

  // --- SOCKET.IO INTEGRATION ---
  useEffect(() => {
    if (!identity?.id) return;

    // Use environment variable for Socket.io URL, fallback to API URL base
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL.replace("/api", "");
    
    const socket = io(socketUrl, {
      query: { userId: identity.id },
      withCredentials: true, // Ensure cookies are sent for authentication
    });

    const handleNotification = (newNotification: Notification) => {
      refetch();
      const link = formatNotificationLink(newNotification.link);
      toast.info(newNotification.title, {
        description: newNotification.message,
        action: link ? {
          label: "View",
          onClick: () => navigate(link),
        } : undefined,
      });
    };

    const handleUnreadCount = (data: { count: number }) => {
      setSocketUnreadCount(data.count);
    };

    const handleBadgeEarned = (data: any) => {
      setShowConfetti(true);
      toast.success(data.message, {
        icon: <Trophy className="h-5 w-5 text-yellow-500" />,
        duration: 5000,
      });
      setTimeout(() => setShowConfetti(false), 5000);
    };

    const handleStudentBadgeEarned = (data: any) => {
      toast.success(data.message, {
        icon: <Trophy className="h-5 w-5 text-yellow-500" />,
        description: `In ${data.className}`,
      });
    };

    socket.on("notification", handleNotification);
    socket.on("unread_count", handleUnreadCount);
    socket.on("badge_earned", handleBadgeEarned);
    socket.on("student_badge_earned", handleStudentBadgeEarned);

    // Reconnection Logic: Fetch notifications when socket reconnects
    socket.on("connect", () => {
      refetch();
    });

    return () => {
      socket.off("notification", handleNotification);
      socket.off("unread_count", handleUnreadCount);
      socket.off("badge_earned", handleBadgeEarned);
      socket.off("student_badge_earned", handleStudentBadgeEarned);
      socket.off("connect");
      socket.disconnect();
    };
  }, [identity?.id, refetch, navigate]);

  // Mark as read mutation (Optimistic Update)
  const { mutate: markAsRead } = useCustomMutation({
    mutationOptions: {
        onMutate: async (variables: any) => {
            const id = variables.values.id;
            const queryKey = ["custom", "get", "/notifications"];
            await queryClient.cancelQueries({ queryKey });
            const previousNotifications = queryClient.getQueryData(queryKey);

            queryClient.setQueriesData({ queryKey }, (old: any) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: old.data.map((n: Notification) => 
                        n.id === Number(id) ? { ...n, isRead: true } : n
                    )
                };
            });

            // Optimistically decrement unread count
            setSocketUnreadCount(prev => prev !== null ? Math.max(0, prev - 1) : null);

            return { previousNotifications };
        },
        onError: (_err, _variables, context: any) => {
            if (context?.previousNotifications) {
                const queryKey = ["custom", "get", "/notifications"];
                queryClient.setQueriesData({ queryKey }, context.previousNotifications);
            }
        },
        onSettled: () => {
            const queryKey = ["custom", "get", "/notifications"];
            queryClient.invalidateQueries({ queryKey });
        },
    }
  });

  // Mark all as read mutation (Optimistic Update)
  const { mutate: markAllAsRead } = useCustomMutation({
    mutationOptions: {
        onMutate: async () => {
            const queryKey = ["custom", "get", "/notifications"];
            await queryClient.cancelQueries({ queryKey });
            const previousNotifications = queryClient.getQueryData(queryKey);

            queryClient.setQueriesData({ queryKey }, (old: any) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: old.data.map((n: Notification) => ({ ...n, isRead: true }))
                };
            });

            // Optimistically clear unread count
            setSocketUnreadCount(0);

            return { previousNotifications };
        },
        onError: (_err, _variables, context: any) => {
             if (context?.previousNotifications) {
                const queryKey = ["custom", "get", "/notifications"];
                queryClient.setQueriesData({ queryKey }, context.previousNotifications);
            }
        },
        onSettled: () => {
            const queryKey = ["custom", "get", "/notifications"];
            queryClient.invalidateQueries({ queryKey });
        },
    }
  });

  const handleMarkAsRead = (notification: Notification) => {
    const { id, isRead } = notification;
    const link = formatNotificationLink(notification.link);

    if (isRead) {
      if (link) {
        navigate(link);
        setIsOpen(false);
      }
      return;
    }

    markAsRead(
      {
        url: `/notifications/${id}/read`,
        method: "patch",
        values: { id },
      },
      {
        onSuccess: () => {
          if (link) {
            navigate(link);
            setIsOpen(false);
          }
        },
      }
    );
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(
      {
        url: "/notifications/read-all",
        method: "patch",
        values: {},
      }
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment": return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case "grade": return <CheckCheck className="h-4 w-4 text-green-500" />;
      case "attendance": return <ClipboardCheck className="h-4 w-4 text-orange-500" />;
      case "achievement": return <Trophy className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
              variant="ghost" 
              size="icon" 
              className={cn(
                  "relative h-10 w-10 rounded-full transition-all duration-200",
                  isOpen ? "bg-primary/10 text-primary shadow-inner" : "hover:bg-primary/5"
              )}
          >
            <Bell className={cn("h-5 w-5 transition-transform", isOpen && "scale-110")} />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-0.5 -right-0.5 h-5 min-w-5 flex items-center justify-center p-1 text-[10px] font-black border-2 border-background shadow-sm"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 mt-2 sidebar-glass border-border/50 shadow-2xl animate-in zoom-in-95 duration-200" align="end">
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
            <h4 className="font-bold text-sm tracking-tight">Notifications</h4>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] h-7 px-2 uppercase tracking-widest font-black hover:bg-primary/10 hover:text-primary"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
          <ScrollArea className="h-[400px]">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="p-4 bg-muted rounded-full mb-4 opacity-20">
                  <Bell className="h-8 w-8" />
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No notifications yet</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-3 p-4 border-b border-border/50 cursor-pointer transition-all duration-200 hover:bg-muted/50",
                      !notification.isRead ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    )}
                    onClick={() => handleMarkAsRead(notification)}
                  >
                    <div className="mt-1 shrink-0">
                      <div className="p-2 bg-background rounded-lg shadow-sm border border-border/50">
                          {getIcon(notification.type)}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          "text-xs truncate",
                          !notification.isRead ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                        )}>
                          {notification.title}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground/60 whitespace-nowrap uppercase">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="mt-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)] shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </>
  );
};
