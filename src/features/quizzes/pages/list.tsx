import { ListView } from "@/components/refine-ui/views/list-view";
import {} from "@/components/refine-ui/layout/breadcrumb";
import {
  Search,
  FileQuestion,
  Calendar,
  CheckCircle2,
  Sparkles,
  Trophy,
  PlusCircle,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ArrowRight,
  Timer,
  AlertCircle,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { useList, useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
import { Quiz, User, UserRole } from "@/types";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import usePageTitle from "@/hooks/use-page-title";
import { useTerm } from "@/contexts/term-context";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

const QuizzesListPage = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("classes.quiz.classQuizzes"));
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;
  const { selectedTerm } = useTerm();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [view, setView] = useState<"discovery" | "my">(
    identity?.role === UserRole.STUDENT ? "discovery" : "my"
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
    // IMPORTANT: Filter quizzes by teacherId if the current user is a staff member (teacher)
    if (isStaff && identity?.id) {
      f.push({
        field: "teacherId",
        operator: "eq" as const,
        value: identity.id,
      });
    }
    return f;
  }, [searchQuery, selectedTerm, isStaff, identity?.id, view]); // Added isStaff and identity.id to dependencies

  const { query } = useList<Quiz>({
    resource: "quizzes",
    pagination: { pageSize: 50, mode: "server" }, // Reduced page size for better performance on global scroll
    filters,
    sorters: [{ field: "id", order: "desc" }],
    meta: {
      populate: ["class", "class.subject"],
    },
  });

  const { data: quizzesData, isLoading } = query;

  const quizzes = quizzesData?.data || [];
  const hasData = quizzes.length > 0;

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "quizzes",
        id: deleteTarget,
        mutationMode: "pessimistic",
      });
      setDeleteTarget(null);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    if (!quizzes.length) return { total: 0, aiGenerated: 0, active: 0 };
    return {
      total: quizzes.length,
      aiGenerated: quizzes.filter((q: Quiz) => q.id % 2 === 0).length,
      active: quizzes.filter((q: Quiz) => !q.dueDate || dayjs().isBefore(dayjs(q.dueDate))).length,
    };
  }, [quizzes]);

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
                  <FileQuestion className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                {t("classes.quiz.classQuizzes")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                {t("classes.quiz.description", { count: quizzes.length })}
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
                onClick={() => create("quizzes")}
                size="lg"
                className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all"
              >
                <PlusCircle className="h-5 w-5" />
                {t("buttons.createQuiz")}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats Row - Adaptive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
              <FileQuestion className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("dashboard.platform.stats.totalAssignments")}
              </p>
              <p className="text-2xl md:text-3xl font-black">{isLoading ? "..." : stats.total}</p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600">
              <Sparkles className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("dashboard.charts.aiInsights")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-indigo-600">
                {isLoading ? "..." : stats.aiGenerated}
              </p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-green-500/10 text-green-600">
              <CheckCircle2 className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("status.active")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-green-600">
                {isLoading ? "..." : stats.active}
              </p>
            </div>
          </Card>
        </div>

        {/* Search & Filters Card - Sticky */}
        <Card className="p-2 border-border/40 bg-muted/20 rounded-[1.75rem] md:rounded-3xl backdrop-blur-md sticky top-20 z-30 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-2">
            <div className="relative flex-1 group">
              <Search
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors",
                  "start-4"
                )}
              />
              <Input
                type="text"
                placeholder={t("assignments.list.filters.searchPlaceholder")}
                className={cn(
                  "h-12 rounded-2xl border-none bg-background/50 shadow-none font-medium",
                  "ps-11 pe-4"
                )}
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
              className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-6 md:p-8 rounded-4xl flex flex-col sm:flex-row items-center sm:items-start gap-5 backdrop-blur-sm text-center sm:text-start"
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

        {/* Quizzes List - Global Scroll Behavior */}
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
                title={t("classes.quiz.noQuizzes")}
                description={
                  isStaff
                    ? t("classes.quiz.noQuizzesDescriptionTeacher")
                    : t("classes.quiz.noQuizzesDescriptionStudent")
                }
                className="border-none bg-transparent min-h-0"
                action={
                  isStaff && selectedTerm?.status === "active"
                    ? {
                        label: t("buttons.createQuiz"),
                        onClick: () => create("quizzes"),
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {quizzes.map((quiz: any, index: any) => {
                  const isPast = quiz.dueDate && dayjs(quiz.dueDate).isBefore(dayjs());
                  const isAI = quiz.id % 2 === 0; // Placeholder for AI generated
                  const quizColor = (quiz as any).class?.color || "#6366f1";

                  return (
                    <motion.div
                      key={quiz.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative flex flex-col md:flex-row items-center p-5 md:p-6 rounded-4xl bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
                      )}
                      onClick={() => show("quizzes", quiz.id)}
                    >
                      {/* Class Color Accent using logical properties */}
                      <div
                        className="absolute start-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-e-full transition-all group-hover:h-20"
                        style={{ backgroundColor: quizColor }}
                      />

                      {/* Icon Container */}
                      <div className="relative shrink-0 mb-4 md:mb-0">
                        <div
                          className={cn(
                            "h-20 w-20 rounded-[1.5rem] border-4 border-background flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500",
                            isAI ? "bg-indigo-500/10 text-indigo-600" : "bg-primary/10 text-primary"
                          )}
                        >
                          <FileQuestion className="h-8 w-8 md:h-10 md:w-10" />
                        </div>
                        {isAI && (
                          <div className="absolute -top-3 -end-3 p-1.5 rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 border-4 border-background animate-pulse">
                            <Sparkles className="h-4 w-4" />
                          </div>
                        )}
                      </div>

                      {/* Content Area */}
                      <div
                        className={cn("flex-1 min-w-0 w-full text-center md:text-start", "md:ms-8")}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <h3 className="text-xl md:text-2xl font-black tracking-tight truncate group-hover:text-primary transition-colors leading-tight">
                            {quiz.title}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Badge variant="ai" className="h-6">
                              {(quiz as any).class?.name || t("assignments.list.labels.general")}
                            </Badge>
                            {isAI && (
                              <Badge className="bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 font-black px-2.5 py-0.5 rounded-full text-[10px] md:text-[11px] tracking-widest uppercase shadow-sm">
                                AI Generated
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-4">
                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <Trophy className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Max Points
                              </span>
                              <span className="text-[11px] font-black text-foreground">
                                {quiz.totalMarks || 100}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <Timer className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Time Limit
                              </span>
                              <span className="text-[11px] font-black text-foreground">
                                {quiz.timeLimit
                                  ? `${quiz.timeLimit} ${t("classes.quiz.minsUnit")}`
                                  : t("assignments.list.labels.open")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Due Date
                              </span>
                              <span
                                className={cn(
                                  "text-[11px] font-black",
                                  isPast ? "text-destructive" : "text-foreground"
                                )}
                              >
                                {quiz.dueDate
                                  ? dayjs(quiz.dueDate).format("MMM D, YYYY")
                                  : t("assignments.list.labels.noDeadline")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                        <div
                          className={cn(
                            "hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0",
                            "ltr:translate-x-4 rtl:-translate-x-4"
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
                                  edit("quizzes", quiz.id);
                                }}
                              >
                                <Pencil className="h-5 w-5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 rounded-2xl text-destructive hover:bg-destructive/10 bg-muted/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(quiz.id);
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
                              : (quiz as any).isEnrolled || isStaff
                                ? "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20"
                                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isStaff && !(quiz as any).isEnrolled) {
                              show("classes", (quiz as any).classId);
                            } else {
                              show("quizzes", quiz.id);
                            }
                          }}
                        >
                          {isStaff
                            ? t("buttons.results")
                            : (quiz as any).isEnrolled
                              ? t("buttons.takeQuiz")
                              : "Request to Join Class"}
                          <ArrowRight className={cn("h-4 w-4", "ms-2 rtl:-scale-x-100")} />
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
                          <DropdownMenuContent align="end" className="w-64 p-2 rounded-3xl">
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 px-3 py-3">
                              {t("assignments.list.labels.options")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => show("quizzes", quiz.id)}
                              className="rounded-xl gap-3 py-3 cursor-pointer"
                            >
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Eye className="h-4 w-4" />
                              </div>
                              <span className="font-bold">{t("buttons.viewDetails")}</span>
                            </DropdownMenuItem>
                            {isStaff && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => edit("quizzes", quiz.id)}
                                  className="rounded-xl gap-3 py-3 cursor-pointer"
                                >
                                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Pencil className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold">{t("buttons.edit")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2 opacity-50" />
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget(quiz.id)}
                                  className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:bg-destructive/10"
                                >
                                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold">{t("buttons.delete")}</span>
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

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
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

export default QuizzesListPage;
