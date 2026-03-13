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
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { useVirtualizer } from "@tanstack/react-virtual";
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

  const {
    query: { data: notificationsData, isLoading },
  } = useList<Notification>({
    resource: "notifications",
    pagination: { pageSize: 1000, mode: "server" },
    filters,
    sorters: [{ field: "createdAt", order: "desc" }],
  });

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

  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 120, []);

  const rowVirtualizer = useVirtualizer({
    count: notifications.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  // Stats calculation
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
    <div className="space-y-10 pb-20 text-start">
      <ListView>
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight">
                  {t("notifications.title")}
                </h1>
                <p className="text-muted-foreground font-medium mt-1">
                  Stay updated with class activities, academic performance, and
                  system alerts.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button
                  variant="outline"
                  onClick={handleMarkAllAsRead}
                  className="flex-1 md:flex-none rounded-2xl h-14 px-8 border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px] shadow-sm"
                >
                  {isAr ? <CheckSquare className="h-4 w-4 ml-2" /> : <CheckSquare className="h-4 w-4 mr-2" />}
                  {t("notifications.markAllRead")}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-primary/5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Bell className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("notifications.stats.total")}
                </p>
                <p className="text-2xl font-black">
                  {isLoading ? "..." : stats.total}
                </p>
              </div>
            </Card>
            <Card className="p-6 border-indigo-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-indigo-500/5">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("notifications.stats.unread")}
                </p>
                <p className="text-2xl font-black text-indigo-600">
                  {isLoading ? "..." : stats.unread}
                </p>
              </div>
            </Card>
            <Card className="p-6 border-purple-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-purple-500/5">
              <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600">
                <BrainCircuit className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("notifications.stats.ai")}
                </p>
                <p className="text-2xl font-black text-purple-600">
                  {isLoading ? "..." : stats.alerts}
                </p>
              </div>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card className="p-4 border-primary/5 bg-muted/30 rounded-4xl backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 group">
                <div className={cn("absolute top-1/2 -translate-y-1/2 flex items-center pointer-events-none", isAr ? "right-4" : "left-4")}>
                    <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <Input
                  type="text"
                  placeholder={t("common.search")}
                  className={cn(
                    "h-14 rounded-2xl border-none bg-background shadow-sm font-medium",
                    isAr ? "pr-11" : "pl-11"
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("notifications.filters.label")}
                </span>
              </div>
            </div>
          </Card>

          {/* Virtualized List Container */}
          <div
            ref={parentRef}
            className="h-150 overflow-auto pr-2 custom-scrollbar rounded-[2.5rem] border border-primary/5 bg-card/30 backdrop-blur-sm relative"
          >
            {isLoading ? (
              <div className="p-8 space-y-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row items-center gap-6"
                  >
                    <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3 w-full">
                      <Skeleton className="h-6 w-62.5" />
                      <Skeleton className="h-4 w-45" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : !hasData ? (
              <div className="h-full w-full flex items-center justify-center p-12">
                <EmptyState
                  icon={Bell}
                  title={t("notifications.noNotifications")}
                  description={t("notifications.noNotificationsDesc")}
                  className="border-none bg-transparent min-h-0"
                />
              </div>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const notification = notifications[virtualItem.index];
                  const createdAt = dayjs(notification.createdAt);

                  return (
                    <motion.div
                      key={virtualItem.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      className={cn(
                        "flex flex-col md:flex-row items-center px-8 py-6 border-b border-primary/5 transition-all group",
                        !notification.isRead
                          ? "bg-primary/[0.03]"
                          : "hover:bg-primary/[0.01]",
                      )}
                    >
                      {/* Icon */}
                      <div className="relative shrink-0 mb-4 md:mb-0">
                        <div
                          className={cn(
                            "h-16 w-16 rounded-2xl border-4 border-background flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform",
                            !notification.isRead
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {getIcon(notification.type)}
                        </div>
                        {!notification.isRead && (
                          <div className="absolute -top-1 -right-1 size-4 bg-primary rounded-full border-2 border-background shadow-lg animate-pulse" />
                        )}
                      </div>

                      {/* Info */}
                      <div className={cn("flex-1 text-center min-w-0 w-full", isAr ? "md:mr-8 md:text-right" : "md:ml-8 md:text-left")}>
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                          <h3
                            className={cn(
                              "text-xl tracking-tight truncate transition-colors",
                              !notification.isRead
                                ? "font-black text-foreground"
                                : "font-bold text-muted-foreground",
                            )}
                          >
                            {notification.title}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Badge
                              variant="outline"
                              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-primary/10"
                            >
                              {notification.type}
                            </Badge>
                            {!notification.isRead && (
                              <Badge className="bg-primary/10 text-primary border-none font-black px-2 py-0.5 rounded-md text-[9px] tracking-widest uppercase">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>

                        <p
                          className={cn(
                            "text-sm mt-1 line-clamp-1 font-medium",
                            !notification.isRead
                              ? "text-foreground/80"
                              : "text-muted-foreground/60",
                          )}
                        >
                          {notification.message}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="p-1.5 rounded-lg bg-primary/5">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-xs font-bold">
                              {createdAt.locale(i18n.language).format("MMM D, YYYY")}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="p-1.5 rounded-lg bg-primary/5">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-tight">
                              {createdAt.locale(i18n.language).fromNow()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                        <div className={cn("hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all", isAr ? "-translate-x-4 group-hover:translate-x-0" : "translate-x-4 group-hover:translate-x-0")}>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl text-green-600 hover:bg-green-50"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title={t("notifications.actions.markRead")}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/5"
                            onClick={() => setDeleteTarget(notification.id)}
                            title={t("buttons.delete")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {notification.link && (
                          <Button
                            variant="outline"
                            className="rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                            asChild
                          >
                            <a href={notification.link}>
                              {t("buttons.viewDetails")}
                              {isAr ? <ArrowRight className="h-4 w-4 mr-2 rotate-180" /> : <ArrowRight className="h-4 w-4 ml-2" />}
                            </a>
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 rounded-xl md:hidden lg:flex"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-56 rounded-[1.5rem] p-2"
                          >
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">
                              {t("notifications.actions.options")}
                            </DropdownMenuLabel>
                            {!notification.isRead && (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                className="rounded-xl gap-3 py-3 cursor-pointer"
                              >
                                <MailOpen className="h-4 w-4 text-primary" />
                                <span className="font-bold">{t("notifications.actions.markRead")}</span>
                              </DropdownMenuItem>
                            )}
                            {notification.link && (
                              <DropdownMenuItem
                                asChild
                                className="rounded-xl gap-3 py-3 cursor-pointer"
                              >
                                <a href={notification.link}>
                                  <Eye className="h-4 w-4 text-primary" />
                                  <span className="font-bold">{t("notifications.actions.viewSource")}</span>
                                </a>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="my-2" />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(notification.id)}
                              className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="font-bold">
                                {t("notifications.actions.deleteAlert")}
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ListView>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader className="space-y-4">
            <div className="p-4 rounded-2xl bg-destructive/10 text-destructive w-fit">
              <Trash2 className="h-8 w-8" />
            </div>
            <div className="space-y-1 text-start">
              <AlertDialogTitle className="text-3xl font-black tracking-tight">
                {t("classes.list.deleteDialog.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="font-medium text-base leading-relaxed">
                {t("notifications.deleteDialog.description")}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8">
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
              className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
            >
              {t("buttons.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotificationsListPage;
