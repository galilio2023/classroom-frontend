import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import {
  CheckCircle2,
  XCircle,
  Filter,
  MoreHorizontal,
  Eye,
  Mail,
  LayoutGrid,
  Loader2,
  Clock,
  MessageSquare,
  Briefcase,
  Layers,
} from "lucide-react";
import { useMemo, useState, useRef } from "react";
import {
  useList,
  useNavigation,
  useGetIdentity,
  useCustomMutation,
  useInvalidate,
} from "@refinedev/core";
import { TeacherApplication, User, UserRole } from "@/types";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

const TeacherApplicationsList = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("teacherApps.title"));
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === UserRole.ADMIN;

  const { show } = useNavigation();
  const { mutate: updateStatus, mutation: updateMutationObj } = useCustomMutation();
  const invalidate = useInvalidate();

  const isUpdating = updateMutationObj.isPending;

  const [statusFilter, setStatusFilter] = useState<string>("pending");

  const filters = useMemo(() => {
    const f = [];
    if (statusFilter !== "all") {
      f.push({ field: "status", operator: "eq" as const, value: statusFilter });
    }
    return f;
  }, [statusFilter]);

  const { query } = useList<TeacherApplication>({
    resource: "teacher-applications",
    pagination: { pageSize: 50, mode: "server" }, // Reduced page size for global scroll
    filters,
    sorters: [{ field: "id", order: "desc" }],
  });

  const applications = query.data?.data || [];
  const isLoading = query.isLoading;
  const hasData = applications.length > 0;

  const handleStatusUpdate = (id: number, status: "approved" | "rejected") => {
    updateStatus(
      {
        url: `/teacher-applications/${id}/status`,
        method: "patch",
        values: { status },
      },
      {
        onSuccess: () => {
          toast.success(t("teacherApps.toasts.statusUpdate", { status }));
          invalidate({
            resource: "teacher-applications",
            invalidates: ["list"],
          });
          invalidate({ resource: "classes", invalidates: ["list"] });
        },
      }
    );
  };

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
                  <Briefcase className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                {t("teacherApps.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                {t("teacherApps.description")}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters - Sticky */}
        <Card className="p-2 border-border/40 bg-muted/20 rounded-[1.75rem] md:rounded-3xl backdrop-blur-md sticky top-20 z-30 shadow-sm">
          <div className="flex items-center gap-2 bg-background/50 px-3 py-1 rounded-2xl border border-border/40">
            <Filter className="h-3.5 w-3.5 text-muted-foreground/60" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] border-none h-10 focus:ring-0 shadow-none font-bold text-[10px] uppercase tracking-wider bg-transparent">
                <SelectValue placeholder={t("enrollments.allStatus")} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl">
                <SelectItem value="all" className="font-bold">
                  {t("enrollments.allStatus")}
                </SelectItem>
                <SelectItem value="pending" className="font-bold">
                  {t("status.upcoming")}
                </SelectItem>
                <SelectItem value="approved" className="font-bold">
                  {t("status.active")}
                </SelectItem>
                <SelectItem value="rejected" className="font-bold">
                  {t("buttons.reject")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* List Container */}
        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i: any) => (
                <Card
                  key={i}
                  className="p-6 flex flex-col md:flex-row items-center gap-6 border-border/20 bg-background/50"
                >
                  <Skeleton className="h-20 w-20 rounded-3xl shrink-0" />
                  <div className="flex-1 space-y-4 w-full">
                    <Skeleton className="h-8 w-[350px] max-w-full" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-36 rounded-2xl" />
                </Card>
              ))}
            </div>
          ) : !hasData ? (
            <div className="flex items-center justify-center p-16 bg-card/20 rounded-[2.5rem] border border-dashed border-border/40">
              <EmptyState
                icon={Layers}
                title={t("teacherApps.empty.title")}
                description={t("teacherApps.empty.desc")}
                className="border-none bg-transparent min-h-0"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {applications.map((app: any, index: any) => {
                  const appDate = dayjs(app.createdAt);

                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative flex flex-col md:flex-row items-center p-5 md:p-6 rounded-4xl bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5"
                      )}
                    >
                      {/* Status Color Accent */}
                      <div
                        className={cn(
                          "absolute start-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-e-full transition-all group-hover:h-20",
                          app.status === "approved"
                            ? "bg-green-500"
                            : app.status === "pending"
                              ? "bg-amber-500"
                              : "bg-destructive"
                        )}
                      />

                      {/* Avatar */}
                      <div className="relative shrink-0 mb-4 md:mb-0">
                        <Avatar className="h-20 w-20 rounded-[1.5rem] border-4 border-background shadow-lg group-hover:scale-105 transition-transform duration-500">
                          <AvatarImage
                            src={app.teacher?.image ?? undefined}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-black text-xl">
                            {app.teacher?.name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Info */}
                      <div
                        className={cn(
                          "flex-1 min-w-0 w-full",
                          i18n.language === "ar" ? "md:me-8 md:text-end" : "md:ms-8 md:text-start"
                        )}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <h3 className="text-xl md:text-2xl font-black tracking-tight truncate group-hover:text-primary transition-colors leading-tight">
                            {app.teacher?.name}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Badge
                              variant={
                                app.status === "approved"
                                  ? "default"
                                  : app.status === "pending"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className={cn(
                                "text-[10px] md:text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm",
                                app.status === "pending" &&
                                  "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              )}
                            >
                              {app.status}
                            </Badge>
                            <Badge
                              variant="ai"
                              className="text-[10px] md:text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm"
                            >
                              {t("teacherApps.labels.applyingFor", {
                                name: app.class?.name,
                              })}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-4">
                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <Mail className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Email
                              </span>
                              <span className="text-[11px] font-black text-foreground truncate max-w-[150px]">
                                {app.teacher?.email}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Applied
                              </span>
                              <span className="text-[11px] font-black text-foreground uppercase tracking-tight">
                                {appDate.fromNow()}
                              </span>
                            </div>
                          </div>
                          {app.message && (
                            <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                              <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                  Message
                                </span>
                                <span className="text-[11px] font-black text-foreground truncate max-w-[150px]">
                                  "{app.message}"
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                        {app.status === "pending" && isAdmin && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-full md:w-auto rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] border-green-500/20 text-green-600 bg-green-500/5 hover:bg-green-500/10 shadow-sm"
                              onClick={() => handleStatusUpdate(app.id, "approved")}
                              disabled={isUpdating}
                            >
                              <CheckCircle2 className="h-4 w-4 me-2" />
                              {t("buttons.approve")}
                            </Button>
                            <Button
                              variant="outline"
                              size="lg"
                              className="w-full md:w-auto rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 shadow-sm"
                              onClick={() => handleStatusUpdate(app.id, "rejected")}
                              disabled={isUpdating}
                            >
                              <XCircle className="h-4 w-4 me-2" />
                              {t("buttons.reject")}
                            </Button>
                          </div>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-12 w-12 rounded-2xl bg-muted/30 hover:bg-muted/50"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-64 p-2 rounded-3xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl"
                          >
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 px-3 py-3">
                              {t("assignments.list.labels.options")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => show("users", app.teacher.id)}
                              className="rounded-xl gap-3 py-3 cursor-pointer"
                            >
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Eye className="h-4 w-4" />
                              </div>
                              <span className="font-bold">
                                {t("teacherApps.labels.viewTeacher")}
                              </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => show("classes", app.class.id)}
                              className="rounded-xl gap-3 py-3 cursor-pointer"
                            >
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <LayoutGrid className="h-4 w-4" />
                              </div>
                              <span className="font-bold">{t("teacherApps.labels.viewClass")}</span>
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
    </ListView>
  );
};

export default TeacherApplicationsList;
