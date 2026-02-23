import { useState } from "react";
import { useCustom, useCustomMutation } from "@refinedev/core";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, CheckCheck, Info, GraduationCap, ClipboardCheck } from "lucide-react";
import { Notification } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export const NotificationBell = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications
  const { data: notificationsData, refetch } = useCustom<Notification[]>({
    url: "/notifications",
    method: "get",
  }) as any;

  const notifications = notificationsData?.data || [];
  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length;

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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification: Notification) => (
                <div
                  key={notification.id}
                  className={`flex gap-3 p-4 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                    !notification.isRead ? "bg-primary/5" : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification.id, notification.link)}
                >
                  <div className="mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-medium ${!notification.isRead ? "text-primary" : ""}`}>
                        {notification.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
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
