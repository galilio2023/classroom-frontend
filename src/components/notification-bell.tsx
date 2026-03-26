import { useState, useEffect } from "react";
import { useCustom, useCustomMutation, useGetIdentity, useNavigation } from "@refinedev/core";
import { useQueryClient } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bell,
  CheckCheck,
  Info,
  GraduationCap,
  ClipboardCheck,
  Trophy,
  BrainCircuit,
  Video,
  MessageSquare,
} from "lucide-react";
import { Notification, User } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLiveNotifications } from "@/hooks/use-live-notifications"; // IMPORT NEW HOOK
import { socket } from "@/lib/socket"; // Keep for custom events
import { toast } from "sonner";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useTranslation } from "react-i18next";

export const NotificationBell = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const navigate = useNavigate();
  const { showUrl } = useNavigation();
  const [isOpen, setIsOpen] = useState(false);
  const { data: identity } = useGetIdentity<User>();
  const queryClient = useQueryClient();
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();

  const formatNotificationUrl = (link: string | null) => {
    if (!link) return null;

    // Handle message deep-links: /messages?userId=...
    if (link.includes("/messages?userId=")) {
      return link;
    }

    const parts = link.split("/").filter(Boolean);

    // If it's a resource/id pattern (e.g. classes/1), use Refine's showUrl
    if (parts.length === 2) {
      const [resource, id] = parts;
      try {
        return showUrl(resource, id);
      } catch (e) {
        return `/${resource}/show/${id}`;
      }
    }

    if (link.startsWith("http")) return link;
    return link.startsWith("/") ? link : `/${link}`;
  };

  // NEW: USE THE CENTRALIZED HOOK
  const { unreadCount: socketUnreadCount, setUnreadCount } = useLiveNotifications(identity?.id);

  // Fetch initial notifications
  const { query } = useCustom<Notification[]>({
    url: "/notifications",
    method: "get",
    queryOptions: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });

  const notifications = query.data?.data || [];

  // Use socket count if available, otherwise calculate from fetched list
  const unreadCount =
    socketUnreadCount > 0
      ? socketUnreadCount
      : notifications.filter((n: Notification) => !n.isRead).length;

  // CUSTOM LOGIC (Preserved events not in the general notification flow)
  useEffect(() => {
    if (!identity?.id) return;

    const handleBadgeEarned = (data: any) => {
      setShowConfetti(true);
      toast.success(data.message, {
        icon: <Trophy className="h-5 w-5 text-yellow-500" />,
        duration: 5000,
      });
      setTimeout(() => setShowConfetti(false), 5000);
    };

    const handleAgentAlert = (data: any) => {
      toast(data.title, {
        icon: <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />,
        description: data.message,
        duration: 8000,
        action: data.classId
          ? {
              label: t("notifications.viewClass"),
              onClick: () => navigate(`/classes/show/${data.classId}`),
            }
          : undefined,
      });
    };

    const handleLiveSessionStarted = (data: any) => {
      toast.info(t("notifications.liveSessionStarted"), {
        icon: <Video className="h-5 w-5 text-live-primary animate-pulse" />,
        description: t("notifications.liveSessionDescription", {
          name: data.startedBy,
        }),
        duration: 10000,
        action: {
          label: t("notifications.joinNow"),
          onClick: () => navigate(`/classes/show/${data.classId}?tab=live`),
        },
      });
    };

    socket.on("badge_earned", handleBadgeEarned);
    socket.on("agent_alert", handleAgentAlert);
    socket.on("live_session_started", handleLiveSessionStarted);

    return () => {
      socket.off("badge_earned", handleBadgeEarned);
      socket.off("agent_alert", handleAgentAlert);
      socket.off("live_session_started", handleLiveSessionStarted);
    };
  }, [identity?.id, navigate, t]);

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
            ),
          };
        });

        setUnreadCount((prev) => Math.max(0, prev - 1));
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
        void queryClient.invalidateQueries({ queryKey });
      },
    },
  });

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
            data: old.data.map((n: Notification) => ({ ...n, isRead: true })),
          };
        });

        setUnreadCount(0);
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
        void queryClient.invalidateQueries({ queryKey });
      },
    },
  });

  const handleMarkAsRead = (notification: Notification) => {
    const { id, isRead } = notification;
    const link = formatNotificationUrl(notification.link);

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
    markAllAsRead({
      url: "/notifications/read-all",
      method: "patch",
      values: {},
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case "grade":
        return <CheckCheck className="h-4 w-4 text-green-500" />;
      case "attendance":
        return <ClipboardCheck className="h-4 w-4 text-orange-500" />;
      case "achievement":
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "agent_alert":
        return <BrainCircuit className="h-4 w-4 text-purple-500" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-pink-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
      )}
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
                className="absolute -top-0.5 -end-0.5 h-5 min-w-5 flex items-center justify-center p-1 text-[10px] font-black border-2 border-background shadow-sm"
              >
                {new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US").format(
                  unreadCount > 9 ? 9 : unreadCount
                )}
                {unreadCount > 9 && "+"}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 p-0 mt-2 bg-white dark:bg-[#09090b] border border-border/50 shadow-2xl opacity-100 backdrop-blur-none animate-in zoom-in-95 duration-200"
          align="end"
        >
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-muted/20">
            <h4 className="font-bold text-sm tracking-tight">{t("notifications.title")}</h4>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-[10px] h-7 px-2 uppercase tracking-widest font-black hover:bg-primary/10 hover:text-primary"
                onClick={handleMarkAllAsRead}
              >
                {t("notifications.markAllRead")}
              </Button>
            )}
          </div>
          <ScrollArea className="h-100">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="p-4 bg-muted rounded-full mb-4 opacity-20">
                  <Bell className="h-8 w-8" />
                </div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  {t("notifications.noNotifications")}
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex gap-3 p-4 border-b border-border/50 cursor-pointer transition-all duration-200 hover:bg-muted/50",
                      !notification.isRead
                        ? "bg-primary/5 ltr:border-s-2 rtl:border-e-2 ltr:border-s-primary rtl:border-e-primary"
                        : ""
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
                        <span
                          className={cn(
                            "text-xs truncate",
                            !notification.isRead
                              ? "font-bold text-foreground"
                              : "font-medium text-muted-foreground"
                          )}
                        >
                          {notification.title}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground/60 whitespace-nowrap uppercase">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            locale: isArabic ? ar : enUS,
                          })}
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
