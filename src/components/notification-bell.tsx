import { useState, useEffect } from "react";
import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCheck, Info, GraduationCap, ClipboardCheck } from "lucide-react";
import { Notification, User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { io } from "socket.io-client";
import { toast } from "sonner";

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { data: identity } = useGetIdentity<User>();

  // Fetch notifications
  const { query } = useCustom<Notification[]>({
    url: "/notifications",
    method: "get",
  });

  const notificationsData = query.data;
  const refetch = query.refetch;

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

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
      toast.info(newNotification.title, {
        description: newNotification.message,
        action: newNotification.link ? {
          label: "View",
          onClick: () => navigate(newNotification.link!),
        } : undefined,
      });
    };

    socket.on("notification", handleNotification);

    // Reconnection Logic: Fetch notifications when socket reconnects
    socket.on("connect", () => {
      refetch();
    });

    return () => {
      socket.off("notification", handleNotification);
      socket.off("connect"); // Clean up connect listener
      socket.disconnect();
    };
  }, [identity?.id, refetch, navigate]);

  // Mark as read mutation
  const { mutate: markAsRead } = useCustomMutation();
  const { mutate: markAllAsRead } = useCustomMutation();

  const handleMarkAsRead = (id: number, link: string | null) => {
    markAsRead(
      {
        url: `/notifications/${id}/read`,
        method: "patch",
        values: {},
      },
      {
        onSuccess: () => {
          refetch();
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
      },
      {
        onSuccess: () => {
          refetch();
        },
      }
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment": return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case "grade": return <CheckCheck className="h-4 w-4 text-green-500" />;
      case "attendance": return <ClipboardCheck className="h-4 w-4 text-orange-500" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
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
                  onClick={() => handleMarkAsRead(notification.id, notification.link)}
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
  );
};
