import { ListView } from "@/components/refine-ui/views/list-view";
import {
  Search,
  FileText,
  Calendar,
  Clock,
  AlertCircle,
  PlusCircle,
  Trash2,
  Edit3,
  Eye,
  Filter,
  MoreHorizontal,
  CheckCircle2,
  Timer,
  ArrowRight,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import {
  useList,
  useNavigation,
  useDelete,
  useGetIdentity,
} from "@refinedev/core";
import { Assignment, User, UserRole, Class } from "@/types";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { EmptyState } from "@/components/empty-state";
import { useTerm } from "@/contexts/term-context";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import usePageTitle from "@/hooks/use-page-title";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

type AssignmentListItem = Assignment & { class?: Class; isEnrolled?: boolean };

const AssignmentsListPage = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("assignments.list.title"));
  const { data: identity } = useGetIdentity<User>();
  const isStaff =
    identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;
  const { selectedTerm } = useTerm();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [view, setView] = useState<"discovery" | "my">(
    identity?.role === UserRole.STUDENT ? "discovery" : "my",
  );

  const { edit, show, create } = useNavigation();
  const { mutate: deleteMutation } = useDelete();

  dayjs.locale(i18n.language === "ar" ? "ar" : "en");

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({
        field: "title",
        operator: "contains" as const,
        value: searchQuery,
      });
    }
    if (selectedTerm) {
      f.push({
        field: "termId",
        operator: "eq" as const,
        value: selectedTerm.id,
      });
    }
    if (view === "my" && !isStaff && identity?.id) {
      f.push({ field: "my", operator: "eq" as const, value: "true" });
    }
    // IMPORTANT: Filter assignments by teacherId if the current user is a staff member (teacher)
    if (isStaff && identity?.id) {
      f.push({
        field: "teacherId",
        operator: "eq" as const,
        value: identity.id,
      });
    }
    return f;
  }, [searchQuery, selectedTerm, isStaff, identity?.id, view]);

  const {
    query: { data: assignmentsData, isLoading },
  } = useList<AssignmentListItem>({
    resource: "assignments",
    pagination: { pageSize: 50, mode: "server" },
    filters,
    sorters: [{ field: "dueDate", order: "asc" }],
    meta: {
      populate: ["class", "class.subject"],
    },
  });

  const assignments = assignmentsData?.data || [];
  const hasData = assignments.length > 0;

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "assignments",
        id: deleteTarget,
        mutationMode: "pessimistic",
      });
      setDeleteTarget(null);
    }
  };

  const stats = useMemo(() => {
    if (!assignments.length) return { total: 0, active: 0, overdue: 0 };
    return {
      total: assignments.length,
      active: assignments.filter(
        (a: AssignmentListItem) =>
          !a.dueDate || dayjs().isBefore(dayjs(a.dueDate)),
      ).length,
      overdue: assignments.filter(
        (a: AssignmentListItem) =>
          a.dueDate && dayjs().isAfter(dayjs(a.dueDate)),
      ).length,
    };
  }, [assignments]);

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
            <div className="space-y-1 text-start">
              <h1 className="page-title mb-0 flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <FileText className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                {t("assignments.list.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                {t("assignments.list.description")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {!isStaff && (
              <div className="flex bg-muted/50 p-1 rounded-2xl border border-border/40 me-2">
                <Button
                  variant={view === "discovery" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-xl font-bold px-6"
                  onClick={() => setView("discovery")}
                >
                  {t("classes.list.discover")}
                </Button>
                <Button
                  variant={view === "my" ? "default" : "ghost"}
                  size="sm"
                  className="rounded-xl font-bold px-6"
                  onClick={() => setView("my")}
                >
                  {t("classes.list.myClassrooms")}
                </Button>
              </div>
            )}
            {isStaff && (
              <Button
                onClick={() => create("assignments")}
                size="lg"
                className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all"
              >
                <PlusCircle className="h-5 w-5" />
                {t("buttons.createAssignment")}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats Row - Adaptive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("assignments.list.stats.total")}
              </p>
              <p className="text-2xl md:text-3xl font-black">
                {isLoading ? "..." : stats.total}
              </p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-green-500/10 text-green-600">
              <CheckCircle2 className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("assignments.list.stats.active")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-green-600">
                {isLoading ? "..." : stats.active}
              </p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-destructive/10 text-destructive">
              <Timer className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("assignments.list.stats.overdue")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-destructive">
                {isLoading ? "..." : stats.overdue}
              </p>
            </div>
          </Card>
        </div>

        {/* Search & Filters Card - Sticky */}
        <Card className="p-2 border-border/40 bg-muted/20 rounded-[1.75rem] md:rounded-3xl backdrop-blur-md sticky top-20 z-30 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors start-4" />
              <Input
                type="text"
                placeholder={t("assignments.list.filters.searchPlaceholder")}
                className="h-12 rounded-2xl border-none bg-background/50 shadow-none font-medium ps-11 pe-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-2xl border border-border/40 shrink-0">
              <Filter className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {t("assignments.list.filters.active")}
              </span>
            </div>
          </div>
        </Card>

        {/* Archive Banner */}
        <AnimatePresence>
          {selectedTerm?.status === "archived" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-6 md:p-8 rounded-[2rem] flex flex-col sm:flex-row items-center sm:items-start gap-5 backdrop-blur-sm text-center sm:text-start"
            >
              <div className="p-3 rounded-[1.25rem] bg-amber-500/20 shrink-0">
                <AlertCircle className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div className="space-y-1">
                <p className="font-black uppercase tracking-[0.15em] text-[10px] opacity-80">
                  {t("dashboard.archiveViewActive")}
                </p>
                <p className="text-base md:text-lg font-bold">
                  {t("dashboard.archiveViewDescription", {
                    termName: selectedTerm.name,
                  })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Assignments List - Global Scroll Behavior */}
        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
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
                title={t("assignments.list.noAssignments")}
                description={
                  isStaff
                    ? t("assignments.list.noAssignmentsDescriptionTeacher")
                    : t("assignments.list.noAssignmentsDescriptionStudent")
                }
                className="border-none bg-transparent min-h-0"
                action={
                  isStaff && selectedTerm?.status === "active"
                    ? {
                        label: t("buttons.createAssignment"),
                        onClick: () => create("assignments"),
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {assignments.map((assignment, index) => {
                  const isPast =
                    assignment.dueDate &&
                    dayjs(assignment.dueDate).isBefore(dayjs());
                  const classColor = assignment.class?.color || "#6366f1";

                  return (
                    <motion.div
                      key={assignment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative flex flex-col md:flex-row items-center p-5 md:p-6 rounded-[2rem] bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer",
                      )}
                      onClick={() => show("assignments", assignment.id)}
                    >
                      {/* Class Color Accent using logical properties */}
                      <div
                        className="absolute start-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-e-full transition-all group-hover:h-20"
                        style={{ backgroundColor: classColor }}
                      />

                      {/* Icon Container */}
                      <div className="relative shrink-0 mb-4 md:mb-0">
                        <div
                          className={cn(
                            "h-20 w-20 rounded-[1.5rem] border-4 border-background flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500",
                            isPast
                              ? "bg-destructive/10 text-destructive"
                              : "bg-primary/10 text-primary",
                          )}
                        >
                          <FileText className="h-8 w-8 md:h-10 md:w-10" />
                        </div>
                      </div>

                      {/* Content Area */}
                      <div
                        className={cn(
                          "flex-1 min-w-0 w-full text-center md:text-start",
                          "md:ms-8",
                        )}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <h3 className="text-xl md:text-2xl font-black tracking-tight truncate group-hover:text-primary transition-colors leading-tight">
                            {assignment.title}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Badge variant="ai" className="h-6">
                              {assignment.class?.name ||
                                t("assignments.list.labels.general")}
                            </Badge>
                            {assignment.hasPeerReview && (
                              <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 font-black px-2.5 py-0.5 rounded-full text-[9px] tracking-widest uppercase shadow-sm">
                                {t("assignments.list.labels.peerReview")}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-4">
                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Due Date
                              </span>
                              <span className="text-[11px] font-black text-foreground">
                                {assignment.dueDate
                                  ? dayjs(assignment.dueDate).format(
                                      "MMM D, YYYY",
                                    )
                                  : t("assignments.list.labels.noDeadline")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Time Remaining
                              </span>
                              <span
                                className={cn(
                                  "text-[11px] font-black uppercase tracking-tight",
                                  isPast ? "text-destructive" : "text-primary",
                                )}
                              >
                                {assignment.dueDate
                                  ? dayjs(assignment.dueDate).fromNow()
                                  : t("assignments.list.labels.open")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                        <div
                          className={cn(
                            "hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ltr:translate-x-4 rtl:-translate-x-4 group-hover:translate-x-0",
                          )}
                        >
                          {isStaff && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5 bg-muted/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  edit("assignments", assignment.id);
                                }}
                              >
                                <Edit3 className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 rounded-2xl text-destructive hover:bg-destructive/10 bg-muted/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(assignment.id);
                                }}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </>
                          )}
                        </div>

                        <Button
                          variant={isPast ? "outline" : "default"}
                          size="lg"
                          className={cn(
                            "w-full md:w-auto rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] transition-all",
                            isPast
                              ? "border-destructive/20 text-destructive hover:bg-destructive/5"
                              : assignment.isEnrolled || isStaff
                                ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20",
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isStaff && !assignment.isEnrolled) {
                              // Navigate to class show to request enrollment
                              show("classes", assignment.classId);
                            } else {
                              show("assignments", assignment.id);
                            }
                          }}
                        >
                          {isStaff
                            ? t("buttons.viewDetails")
                            : assignment.isEnrolled
                              ? t("buttons.viewDetails")
                              : "Request to Join Class"}
                          <ArrowRight
                            className={cn("h-4 w-4", "ms-2 rtl:-scale-x-100")}
                          />
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-12 w-12 rounded-2xl md:hidden lg:flex bg-muted/30"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-64 p-2 rounded-3xl"
                          >
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 px-3 py-3">
                              {t("assignments.list.labels.options")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => show("assignments", assignment.id)}
                              className="rounded-xl gap-3 py-3 cursor-pointer"
                            >
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Eye className="h-4 w-4" />
                              </div>
                              <span className="font-bold">
                                {t("buttons.viewDetails")}
                              </span>
                            </DropdownMenuItem>
                            {isStaff && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    edit("assignments", assignment.id)
                                  }
                                  className="rounded-xl gap-3 py-3 cursor-pointer"
                                >
                                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Edit3 className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold">
                                    {t("buttons.editAssignment")}
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2 opacity-50" />
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget(assignment.id)}
                                  className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:bg-destructive/10"
                                >
                                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold">
                                    {t("buttons.deleteAssignment")}
                                  </span>
                                </DropdownMenuItem>
                              </>
                            )}
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
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader className="space-y-6">
            <div className="p-5 rounded-2xl bg-destructive/10 text-destructive w-fit mx-auto">
              <Trash2 className="h-10 w-10" />
            </div>
            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-3xl font-black tracking-tight">
                {t("assignments.list.deleteDialog.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium px-8 leading-relaxed">
                {t("assignments.list.deleteDialog.description")}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-4 pt-8">
            <AlertDialogCancel className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px]">
              {t("buttons.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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

export default AssignmentsListPage;
