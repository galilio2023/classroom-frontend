import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import {
  Search,
  Bell,
  Info,
  GraduationCap,
  CheckCheck,
  ClipboardCheck,
  Trophy,
  BrainCircuit,
  Trash2,
  CheckCircle2,
  Filter,
  MoreHorizontal,
  Eye,
  Clock,
  CheckSquare,
  MailOpen,
  Mail,
  Calendar,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef, useCallback } from "react";
import {
  useList,
  useDelete,
  useGetIdentity,
  useCustomMutation,
  useInvalidate,
} from "@refinedev/core";
import { Notification, User } from "@/types";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

const NotificationsListPage = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("notifications.title"));
  const { data: identity } = useGetIdentity<User>();
  const isAr = i18n.language === 'ar';

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const { mutate: deleteMutation } = useDelete();
  const { mutate: markAsRead } = useCustomMutation();
  const invalidate = useInvalidate();

  const handleMarkAsRead = (id: number) => {
    markAsRead(
      {
        url: `/notifications/${id}/read`,
        method: "patch",
        values: { id },
      },
      {
        onSuccess: () => {
          toast.success(t("notifications.actions.markRead"));
          invalidate({ resource: "notifications", invalidates: ["list"] });
        },
      },
    );
  };

  const handleMarkAllAsRead = () => {
    toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
      loading: "Marking all as read...",
      success: t("notifications.markAllRead"),
      error: "Failed to update notifications",
    });
  };

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({
        field: "title",
        operator: "contains" as const,
        value: searchQuery,
      });
    }
    return f;
  }, [searchQuery]);

  const { query } = useList<Notification>({
    resource: "notifications",
    pagination: { pageSize: 50, mode: "server" },
    filters,
    sorters: [{ field: "createdAt", order: "desc" }],
  });

  const { data: notificationsData, isLoading } = query;

  const notifications = notificationsData?.data || [];
  const hasData = notifications.length > 0;

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <GraduationCap className="h-6 w-6 text-blue-500" />;
      case "grade":
        return <CheckCheck className="h-6 w-6 text-green-500" />;
      case "attendance":
        return <ClipboardCheck className="h-6 w-6 text-orange-500" />;
      case "achievement":
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case "agent_alert":
        return <BrainCircuit className="h-6 w-6 text-purple-500" />;
      default:
        return <Info className="h-6 w-6 text-primary" />;
    }
  };

  const stats = useMemo(() => {
    if (!notifications.length) return { total: 0, unread: 0, alerts: 0 };
    return {
      total: notifications.length,
      unread: notifications.filter((n: Notification) => !n.isRead).length,
      alerts: notifications.filter(
        (n: Notification) => n.type === "agent_alert",
      ).length,
    };
  }, [notifications]);

  return (
    <ListView>
      <div className="space-y-8 md:space-y-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div className="space-y-4 flex-1">
            <Breadcrumb />
            <div className="space-y-1">
              <h1 className="page-title mb-0 flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <Bell className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                {t("notifications.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                Stay updated with class activities, academic performance, and system alerts.
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <Button
              variant="outline"
              size="lg"
              onClick={handleMarkAllAsRead}
              className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-8 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-bold uppercase tracking-widest text-[10px]"
            >
              <CheckSquare className={cn("h-4 w-4", isAr ? "ml-2" : "mr-2")} />
              {t("notifications.markAllRead")}
            </Button>
          </div>
        </motion.div>

        {/* Stats Row - Adaptive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
              <Bell className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("notifications.stats.total")}
              </p>
              <p className="text-2xl md:text-3xl font-black">
                {isLoading ? "..." : stats.total}
              </p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600">
              <Mail className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("notifications.stats.unread")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-indigo-600">
                {isLoading ? "..." : stats.unread}
              </p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-600">
              <BrainCircuit className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("notifications.stats.ai")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-purple-600">
                {isLoading ? "..." : stats.alerts}
              </p>
            </div>
          </Card>
        </div>

        {/* Search & Filter - Sticky */}
        <Card className="p-2 border-border/40 bg-muted/20 rounded-[1.75rem] md:rounded-3xl backdrop-blur-md sticky top-20 z-30 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1 group">
              <Search
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors",
                  isAr ? "right-4" : "left-4",
                )}
              />
              <Input
                type="text"
                placeholder={t("common.search")}
                className={cn(
                  "h-12 rounded-2xl border-none bg-background/50 shadow-none font-medium",
                  isAr ? "pr-11 pl-4" : "pl-11 pr-4",
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-2xl border border-border/40">
              <Filter className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {t("notifications.filters.label")}
              </span>
            </div>
          </div>
        </Card>

        {/* Notifications List - Global Scroll Behavior */}
        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i: any) => (
                <Card key={i} className="p-6 flex items-center gap-6 border-border/20 bg-background/50">
                  <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-[250px] max-w-full" />
                    <Skeleton className="h-4 w-[180px] max-w-full" />
                  </div>
                  <Skeleton className="h-10 w-24 rounded-xl" />
                </Card>
              ))}
            </div>
          ) : !hasData ? (
            <div className="flex items-center justify-center p-16 bg-card/20 rounded-[2.5rem] border border-dashed border-border/40">
              <EmptyState
                icon={Bell}
                title={t("notifications.noNotifications")}
                description={t("notifications.noNotificationsDesc")}
                className="border-none bg-transparent min-h-0"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification: any, index: any) => {
                  const createdAt = dayjs(notification.createdAt);

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative flex flex-col md:flex-row items-center p-5 md:p-6 rounded-[2rem] border transition-all duration-300 shadow-sm",
                        !notification.isRead
                          ? "bg-primary/[0.04] border-primary/20 hover:bg-primary/[0.06] shadow-md"
                          : "bg-card/40 border-border/40 hover:bg-card/80 hover:border-primary/20",
                      )}
                    >
                      {/* Read/Unread Accent */}
                      {!notification.isRead && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-r-full" />
                      )}

                      {/* Icon */}
                      <div className="relative shrink-0 mb-4 md:mb-0">
                        <div
                          className={cn(
                            "h-20 w-20 rounded-[1.5rem] border-4 border-background flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500",
                            !notification.isRead
                              ? "bg-primary/10 text-primary"
                              : "bg-muted/40 text-muted-foreground/60",
                          )}
                        >
                          {getIcon(notification.type)}
                        </div>
                        {!notification.isRead && (
                          <div className="absolute -top-1 -right-1 size-5 bg-primary rounded-full border-4 border-background shadow-lg animate-pulse" />
                        )}
                      </div>

                      {/* Info Area */}
                      <div className={cn("flex-1 text-center min-w-0 w-full", isAr ? "md:mr-8 md:text-right" : "md:ml-8 md:text-left")}>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <h3
                            className={cn(
                              "text-xl tracking-tight truncate leading-tight",
                              !notification.isRead
                                ? "font-black text-foreground"
                                : "font-bold text-muted-foreground",
                            )}
                          >
                            {notification.title}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Badge
                              variant={notification.type === 'agent_alert' ? 'ai' : 'outline'}
                              className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full"
                            >
                              {notification.type}
                            </Badge>
                          </div>
                        </div>

                        <p
                          className={cn(
                            "text-sm font-medium leading-relaxed line-clamp-2 md:line-clamp-1 mb-4",
                            !notification.isRead
                              ? "text-foreground/80"
                              : "text-muted-foreground/60",
                          )}
                        >
                          {notification.message}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                          <div className="flex items-center gap-2 bg-background/40 px-3 py-1 rounded-full border border-border/20">
                            <Calendar className="h-3.5 w-3.5 text-primary/60" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                              {createdAt.locale(i18n.language).format("MMM D, YYYY")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 bg-background/40 px-3 py-1 rounded-full border border-border/20">
                            <Clock className="h-3.5 w-3.5 text-primary/60" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60">
                              {createdAt.locale(i18n.language).fromNow()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                        <div className={cn("hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300", isAr ? "-translate-x-4 group-hover:translate-x-0" : "translate-x-4 group-hover:translate-x-0")}>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-11 w-11 rounded-2xl text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-500"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <CheckCircle2 className="h-5 w-5" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11 rounded-2xl text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(notification.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>

                        {notification.link ? (
                          <Button
                            variant={!notification.isRead ? "default" : "outline"}
                            size="lg"
                            className={cn(
                              "rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] transition-all",
                              !notification.isRead 
                                ? "shadow-lg shadow-primary/20" 
                                : "border-primary/20 text-primary hover:bg-primary/5"
                            )}
                            asChild
                          >
                            <a href={notification.link}>
                              {t("buttons.viewDetails")}
                              <ArrowRight className={cn("h-4 w-4", isAr ? "mr-2 rotate-180" : "ml-2")} />
                            </a>
                          </Button>
                        ) : (
                             <div className="hidden lg:block w-36"></div> // Spacer to keep actions aligned
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-12 w-12 rounded-2xl md:hidden lg:flex bg-muted/30"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 p-2 rounded-3xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 px-3 py-3">
                              {t("notifications.actions.options")}
                            </DropdownMenuLabel>
                            {!notification.isRead && (
                              <DropdownMenuItem
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="rounded-xl gap-3 py-3 cursor-pointer"
                              >
                                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                                    <MailOpen className="h-4 w-4" />
                                </div>
                                <span className="font-bold">{t("notifications.actions.markRead")}</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(notification.id)}
                              className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:bg-destructive/10"
                            >
                                <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </div>
                                <span className="font-bold">{t("notifications.actions.deleteAlert")}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader className="space-y-6">
            <div className="p-5 rounded-2xl bg-destructive/10 text-destructive w-fit mx-auto">
              <Trash2 className="h-10 w-10" />
            </div>
            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-3xl font-black tracking-tight">
                {t("classes.list.deleteDialog.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium px-8 leading-relaxed">
                {t("notifications.deleteDialog.description")}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-4 pt-8">
            <AlertDialogCancel className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px]">
              {t("buttons.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation(
                    { resource: "notifications", id: deleteTarget },
                    {
                      onSuccess: () => {
                        toast.success("Notification deleted");
                        setDeleteTarget(null);
                      },
                    },
                  );
                }
              }}
              className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-[10px] bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
            >
              {t("buttons.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ListView>
  );
};

export default NotificationsListPage;
