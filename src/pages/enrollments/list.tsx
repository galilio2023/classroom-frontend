import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { 
  Search, 
  UserPlus, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  CheckSquare, 
  Square, 
  Phone, 
  Mail, 
  LayoutGrid, 
  Activity,
  Users,
  UserCheck,
  UserMinus,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef } from "react";
import { useList, useNavigation, useDelete, useGetIdentity, useCustomMutation, useInvalidate } from "@refinedev/core";
import { Enrollment, User, UserRole } from "@/types";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useTerm } from "@/contexts/term-context";
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

const EnrollmentsList = () => {
  const { t } = useTranslation();
  usePageTitle(t("enrollments.title"));
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;
  const { selectedTerm } = useTerm();
  
  const { create, show } = useNavigation();
  const { mutate: unenroll } = useDelete();
  const { mutate: updateStatus, mutation } = useCustomMutation();
  const isUpdating = mutation.isPending;
  const invalidate = useInvalidate();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const filters = useMemo(() => {
    const f = [];
    if (statusFilter !== "all") {
        f.push({ field: "status", operator: "eq" as const, value: statusFilter });
    }
    if (searchQuery) {
        f.push({ field: "student.name", operator: "contains" as const, value: searchQuery });
    }
    if (selectedTerm) {
        f.push({ field: "termId", operator: "eq" as const, value: selectedTerm.id });
    }
    return f;
  }, [statusFilter, searchQuery, selectedTerm]);

  const { query: { data: enrollmentsData, isLoading } } = useList<Enrollment>({
    resource: "enrollments",
    pagination: { pageSize: 1000, mode: "server" },
    filters,
    sorters: [{ field: "id", order: "desc" }],
    meta: {
      populate: ["student", "class"]
    }
  });

  const enrollments = enrollmentsData?.data || [];
  const hasData = enrollments.length > 0;

  const handleStatusUpdate = (id: number, status: "approved" | "rejected") => {
    updateStatus({
        url: `/enrollments/${id}/status`,
        method: "patch",
        values: { status },
    }, {
        onSuccess: () => {
            toast.success(t("enrollments.toasts.statusUpdate", { status }));
            invalidate({ resource: "enrollments", invalidates: ["list"] });
        }
    });
  };

  const handleBulkAction = (status: "approved" | "rejected") => {
    if (selectedIds.length === 0) return;
    
    const promises = selectedIds.map(id => 
        new Promise((resolve) => {
            updateStatus({
                url: `/enrollments/${id}/status`,
                method: "patch",
                values: { status },
            }, { onSuccess: resolve, onError: resolve });
        })
    );

    toast.promise(Promise.all(promises), {
        loading: t("enrollments.toasts.processing", { count: selectedIds.length }),
        success: () => {
            setSelectedIds([]);
            invalidate({ resource: "enrollments", invalidates: ["list"] });
            return t("enrollments.toasts.bulkSuccess", { count: selectedIds.length });
        },
        error: t("enrollments.toasts.bulkError"),
    });
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: enrollments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  // Stats calculation
  const stats = useMemo(() => {
    if (!enrollments.length) return { total: 0, pending: 0, approved: 0 };
    return {
      total: enrollments.length,
      pending: enrollments.filter((e: Enrollment) => e.status === 'pending').length,
      approved: enrollments.filter((e: Enrollment) => e.status === 'approved').length
    };
  }, [enrollments]);

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
                <h1 className="text-4xl font-black tracking-tight">{t("enrollments.title")}</h1>
                <p className="text-muted-foreground font-medium mt-1">{t("enrollments.description")}</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                {isStaff && (
                  <Button 
                    onClick={() => create("classes")}
                    className="flex-1 md:flex-none rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <UserPlus className="h-5 w-5" />
                    {t("enrollments.enrollStudent")}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-primary/5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("enrollments.stats.total")}</p>
                <p className="text-2xl font-black">{isLoading ? "..." : stats.total}</p>
              </div>
            </Card>
            <Card className="p-6 border-amber-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-amber-500/5">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("enrollments.stats.pending")}</p>
                <p className="text-2xl font-black text-amber-600">{isLoading ? "..." : stats.pending}</p>
              </div>
            </Card>
            <Card className="p-6 border-green-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-green-500/5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("enrollments.stats.active")}</p>
                <p className="text-2xl font-black text-green-600">{isLoading ? "..." : stats.approved}</p>
              </div>
            </Card>
          </div>
          
          {/* Filters & Search */}
          <Card className="p-4 border-primary/5 bg-muted/30 rounded-4xl backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder={t("enrollments.searchPlaceholder")}
                  className="pl-11 h-14 rounded-2xl border-none bg-background shadow-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-2 bg-primary/5 px-4 rounded-2xl border border-primary/10 animate-in fade-in slide-in-from-right-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{selectedIds.length} {t("common.cases")}</span>
                        <Button size="sm" variant="ghost" className="h-8 text-green-600 hover:bg-green-50 font-black text-[10px] uppercase tracking-widest" onClick={() => handleBulkAction("approved")}>
                            {t("buttons.approve")}
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-destructive hover:bg-destructive/5 font-black text-[10px] uppercase tracking-widest" onClick={() => handleBulkAction("rejected")}>
                            {t("buttons.reject")}
                        </Button>
                    </div>
                )}
                <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40 border-none h-10 focus:ring-0 shadow-none font-black text-[10px] uppercase tracking-widest">
                      <SelectValue placeholder={t("enrollments.allStatus")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl">
                      <SelectItem value="all" className="rounded-xl font-bold">{t("enrollments.allStatus")}</SelectItem>
                      <SelectItem value="pending" className="rounded-xl font-bold">{t("status.upcoming")}</SelectItem>
                      <SelectItem value="approved" className="rounded-xl font-bold">{t("status.active")}</SelectItem>
                      <SelectItem value="rejected" className="rounded-xl font-bold">{t("buttons.reject")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                  <div key={i} className="flex flex-col md:flex-row items-center gap-6">
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
                  icon={Users}
                  title={t("enrollments.empty.title")}
                  description={t("enrollments.empty.desc")}
                  className="border-none bg-transparent min-h-0"
                />
              </div>
            ) : (
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const enrollment = enrollments[virtualItem.index];
                  const isSelected = selectedIds.includes(enrollment.id);
                  const enrollmentDate = dayjs(enrollment.createdAt);
                  
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
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "flex flex-col md:flex-row items-center h-full border-b border-primary/5 transition-all group",
                          isSelected ? "bg-primary/[0.04]" : "hover:bg-primary/[0.02]"
                        )}
                      >
                        {/* Selection & Avatar */}
                        <div className="flex items-center gap-6 shrink-0 mb-4 md:mb-0">
                          <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl hover:bg-primary/10"
                              onClick={() => toggleSelect(enrollment.id)}
                          >
                              {isSelected ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5 text-muted-foreground/40" />}
                          </Button>
                          <Avatar className="h-16 w-16 rounded-2xl border-4 border-background shadow-lg group-hover:scale-110 transition-transform">
                            <AvatarImage src={enrollment.student.image ?? undefined} className="object-cover" />
                            <AvatarFallback className="bg-primary/5 text-primary font-black text-xl">
                              {enrollment.student.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Info */}
                        <div className="flex-1 md:ml-8 text-center md:text-left min-w-0 w-full">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h3 className="text-xl font-black tracking-tight truncate group-hover:text-primary transition-colors">
                              {enrollment.student.name}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                              <Badge 
                                  variant={enrollment.status === 'approved' ? 'default' : enrollment.status === 'pending' ? 'secondary' : 'destructive'}
                                  className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none"
                              >
                                  {enrollment.status}
                              </Badge>
                              <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-primary/10">
                                  {enrollment.class?.name}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="p-1.5 rounded-lg bg-primary/5">
                                  <Mail className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="text-xs font-bold">{enrollment.student.email}</span>
                            </div>

                            {enrollment.student.phoneNumber && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                  <div className="p-1.5 rounded-lg bg-primary/5">
                                      <Phone className="h-3.5 w-3.5 text-primary" />
                                  </div>
                                  <span className="text-xs font-bold">{enrollment.student.phoneNumber}</span>
                              </div>
                            )}

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="p-1.5 rounded-lg bg-primary/5">
                                  <Clock className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="text-xs font-bold uppercase tracking-tight">
                                  {t("enrollments.requested", { time: enrollmentDate.fromNow() })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                          {enrollment.status === 'pending' && (
                              <div className="flex items-center gap-2">
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] border-green-500/20 text-green-600 bg-green-500/5 hover:bg-green-500/10 px-4"
                                      onClick={() => handleStatusUpdate(enrollment.id, "approved")}
                                      disabled={isUpdating}
                                  >
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      {t("buttons.approve")}
                                  </Button>
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 px-4"
                                      onClick={() => handleStatusUpdate(enrollment.id, "rejected")}
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
                              <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl">
                                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">{t("enrollments.options")}</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => show("users", enrollment.student.id)} className="rounded-xl gap-3 py-3 cursor-pointer">
                                      <Eye className="h-4 w-4 text-primary" />
                                      <span className="font-bold">{t("enrollments.viewProfile")}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => show("classes", enrollment.class.id)} className="rounded-xl gap-3 py-3 cursor-pointer">
                                      <LayoutGrid className="h-4 w-4 text-primary" />
                                      <span className="font-bold">{t("enrollments.viewClass")}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="my-2" />
                                  <DropdownMenuItem 
                                      onClick={() => setDeleteTarget(enrollment.id)} 
                                      className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:text-destructive"
                                  >
                                      <UserMinus className="h-4 w-4" />
                                      <span className="font-bold">{t("enrollments.remove")}</span>
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

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border border-border/50 shadow-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none">
          <AlertDialogHeader className="space-y-4">
            <div className="p-4 rounded-2xl bg-destructive/10 text-destructive w-fit">
              <Trash2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
                <AlertDialogTitle className="text-3xl font-black tracking-tight">{t("enrollments.deleteDialog.title")}</AlertDialogTitle>
                <AlertDialogDescription className="font-medium text-base leading-relaxed">
                    {t("enrollments.deleteDialog.desc")}
                </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8">{t("buttons.cancel")}</AlertDialogCancel>
            <AlertDialogAction 
                onClick={() => {
                    if (deleteTarget) {
                        unenroll({ resource: "enrollments", id: deleteTarget }, { onSuccess: () => { toast.success(t("enrollments.toasts.removed")); setDeleteTarget(null); } });
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

export default EnrollmentsList;
