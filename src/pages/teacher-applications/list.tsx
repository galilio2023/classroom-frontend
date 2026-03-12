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
  Briefcase
} from "lucide-react";
import { useMemo, useState, useRef } from "react";
import { useList, useNavigation, useGetIdentity, useCustomMutation, useInvalidate } from "@refinedev/core";
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
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { useVirtualizer } from "@tanstack/react-virtual";
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
  const { t } = useTranslation();
  usePageTitle(t("teacherApps.title"));
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === UserRole.ADMIN;
  
  const { show } = useNavigation();
  const { mutate: updateStatus, mutation: updateMutation } = useCustomMutation();
  const invalidate = useInvalidate();

  const isUpdating = updateMutation.isPending;

  const [statusFilter, setStatusFilter] = useState<string>("pending");

  const filters = useMemo(() => {
    const f = [];
    if (statusFilter !== "all") {
        f.push({ field: "status", operator: "eq" as const, value: statusFilter });
    }
    return f;
  }, [statusFilter]);

  const { query: { data: appsData, isLoading } } = useList<TeacherApplication>({
    resource: "teacher-applications",
    pagination: { pageSize: 1000, mode: "server" },
    filters,
    sorters: [{ field: "id", order: "desc" }],
  });

  const applications = appsData?.data || [];
  const hasData = applications.length > 0;

  const handleStatusUpdate = (id: number, status: "approved" | "rejected") => {
    updateStatus({
        url: `/teacher-applications/${id}/status`,
        method: "patch",
        values: { status },
    }, {
        onSuccess: () => {
            toast.success(t("teacherApps.toasts.statusUpdate", { status }));
            invalidate({ resource: "teacher-applications", invalidates: ["list"] });
            invalidate({ resource: "classes", invalidates: ["list"] });
        }
    });
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: applications.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  return (
    <div className="space-y-10 pb-20">
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
                <h1 className="text-4xl font-black tracking-tight">{t("teacherApps.title")}</h1>
                <p className="text-muted-foreground font-medium mt-1">{t("teacherApps.description")}</p>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <Card className="p-4 border-primary/5 bg-muted/30 rounded-4xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 border-none h-10 focus:ring-0 shadow-none font-black text-[10px] uppercase tracking-widest">
                      <SelectValue placeholder={t("enrollments.allStatus")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="all" className="rounded-xl font-bold">{t("enrollments.allStatus")}</SelectItem>
                      <SelectItem value="pending" className="rounded-xl font-bold">{t("status.upcoming")}</SelectItem>
                      <SelectItem value="approved" className="rounded-xl font-bold">{t("status.active")}</SelectItem>
                      <SelectItem value="rejected" className="rounded-xl font-bold">{t("buttons.reject")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>
          </Card>

          {/* List Container */}
          <div 
            ref={parentRef} 
            className="h-150 overflow-auto pr-2 custom-scrollbar rounded-[2.5rem] border border-primary/5 bg-card/30 backdrop-blur-sm relative"
          >
            {isLoading ? (
              <div className="p-8 space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-3xl" />
                ))}
              </div>
            ) : !hasData ? (
              <div className="h-full w-full flex items-center justify-center p-12">
                <EmptyState
                  icon={Briefcase}
                  title={t("teacherApps.empty.title")}
                  description={t("teacherApps.empty.desc")}
                  className="border-none bg-transparent min-h-0"
                />
              </div>
            ) : (
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const app = applications[virtualItem.index];
                  const appDate = dayjs(app.createdAt);
                  
                  return (
                    <div
                      key={virtualItem.key}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      className="px-8"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col md:flex-row items-center h-full border-b border-primary/5 hover:bg-primary/[0.02] transition-all group"
                      >
                        <div className="flex items-center gap-6 shrink-0">
                          <Avatar className="h-16 w-16 rounded-2xl border-4 border-background shadow-lg">
                            <AvatarImage src={app.teacher?.image ?? undefined} className="object-cover" />
                            <AvatarFallback className="bg-primary/5 text-primary font-black text-xl">
                              {app.teacher?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1 md:ml-8 text-center md:text-left min-w-0 w-full">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h3 className="text-xl font-black tracking-tight truncate">
                              {app.teacher?.name}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                              <Badge 
                                  variant={app.status === 'approved' ? 'default' : app.status === 'pending' ? 'secondary' : 'destructive'}
                                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none"
                              >
                                  {app.status}
                              </Badge>
                              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-primary/10">
                                  {t("teacherApps.labels.applyingFor", { name: app.class?.name })}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs font-bold">{app.teacher?.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                              <span className="text-xs font-bold uppercase tracking-tight">
                                  {t("teacherApps.labels.applied", { time: appDate.fromNow() })}
                              </span>
                            </div>
                            {app.message && (
                                <div className="flex items-center gap-2 text-primary/60 italic">
                                    <MessageSquare className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium truncate max-w-xs">"{app.message}"</span>
                                </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                          {app.status === 'pending' && isAdmin && (
                              <div className="flex items-center gap-2">
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] border-green-500/20 text-green-600 bg-green-500/5 hover:bg-green-500/10 px-4"
                                      onClick={() => handleStatusUpdate(app.id, "approved")}
                                      disabled={isUpdating}
                                  >
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      {t("buttons.approve")}
                                  </Button>
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 px-4"
                                      onClick={() => handleStatusUpdate(app.id, "rejected")}
                                      disabled={isUpdating}
                                  >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      {t("buttons.reject")}
                                  </Button>
                              </div>
                          )}

                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl">
                                      <MoreHorizontal className="h-5 w-5" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2">
                                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">{t("assignments.list.labels.options")}</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => show("users", app.teacher.id)} className="rounded-xl gap-3 py-3 cursor-pointer">
                                      <Eye className="h-4 w-4 text-primary" />
                                      <span className="font-bold">{t("teacherApps.labels.viewTeacher")}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => show("classes", app.class.id)} className="rounded-xl gap-3 py-3 cursor-pointer">
                                      <LayoutGrid className="h-4 w-4 text-primary" />
                                      <span className="font-bold">{t("teacherApps.labels.viewClass")}</span>
                                  </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ListView>
    </div>
  );
};

export default TeacherApplicationsList;
