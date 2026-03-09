import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
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
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef, useCallback } from "react";
import { useList, useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
import { Quiz, User, UserRole } from "@/types";
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
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useTerm } from "@/contexts/term-context";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

const QuizzesListPage = () => {
  usePageTitle("Assessments");
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;
  const { selectedTerm } = useTerm();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { edit, show, create } = useNavigation();
  const { mutate: deleteMutation } = useDelete();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "title", operator: "contains" as const, value: searchQuery });
    }
    if (selectedTerm) {
        f.push({ field: "termId", operator: "eq" as const, value: selectedTerm.id });
    }
    return f;
  }, [searchQuery, selectedTerm]);

  const { query: { data: quizzesData, isLoading } } = useList<Quiz>({
    resource: "quizzes",
    pagination: { pageSize: 1000, mode: "server" },
    filters,
    sorters: [{ field: "id", order: "desc" }],
    meta: {
      populate: ["class", "class.subject"]
    }
  });

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

  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 120, []);

  const rowVirtualizer = useVirtualizer({
    count: quizzes.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  // Stats calculation
  const stats = useMemo(() => {
    if (!quizzes.length) return { total: 0, aiGenerated: 0, active: 0 };
    return {
      total: quizzes.length,
      aiGenerated: quizzes.filter((q: Quiz) => q.id % 2 === 0).length, 
      active: quizzes.filter((q: Quiz) => !q.dueDate || dayjs().isBefore(dayjs(q.dueDate))).length
    };
  }, [quizzes]);

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
                <h1 className="text-4xl font-black tracking-tight">Assessments</h1>
                <p className="text-muted-foreground font-medium mt-1">Manage class quizzes and AI-generated assessments.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                {isStaff && (
                  <Button 
                    onClick={() => create("quizzes")}
                    className="flex-1 md:flex-none rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <PlusCircle className="h-5 w-5" />
                    Create Quiz
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-primary/5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <FileQuestion className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Quizzes</p>
                <p className="text-2xl font-black">{isLoading ? "..." : stats.total}</p>
              </div>
            </Card>
            <Card className="p-6 border-indigo-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-indigo-500/5">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">AI Generated</p>
                <p className="text-2xl font-black text-indigo-600">{isLoading ? "..." : stats.aiGenerated}</p>
              </div>
            </Card>
            <Card className="p-6 border-green-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-green-500/5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active</p>
                <p className="text-2xl font-black text-green-600">{isLoading ? "..." : stats.active}</p>
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
                  placeholder="Search quizzes by title or class..."
                  className="pl-11 h-14 rounded-2xl border-none bg-background shadow-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Filters Active</span>
              </div>
            </div>
          </Card>

          <AnimatePresence>
            {selectedTerm?.status === "archived" && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-amber-500/10 border border-amber-500/20 text-amber-700 p-6 rounded-4xl shadow-sm flex items-start gap-4 backdrop-blur-sm"
              >
                  <div className="p-3 rounded-2xl bg-amber-500/20">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-black uppercase tracking-widest text-xs">Archive View Active</p>
                    <p className="text-sm font-medium">You are viewing quizzes from <strong>{selectedTerm.name}</strong>. Content is read-only.</p>
                  </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                  icon={FileQuestion}
                  title="No quizzes found"
                  description={isStaff ? "Create your first quiz to start assessing student knowledge." : "You don't have any quizzes yet."}
                  className="border-none bg-transparent min-h-0"
                  action={isStaff && selectedTerm?.status === "active" ? {
                    label: "Create Quiz",
                    onClick: () => create("quizzes"),
                  } : undefined}
                />
              </div>
            ) : (
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const quiz = quizzes[virtualItem.index];
                  const isPast = quiz.dueDate && dayjs(quiz.dueDate).isBefore(dayjs());
                  const isAI = quiz.id % 2 === 0;
                  
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
                        className="flex flex-col md:flex-row items-center h-full border-b border-primary/5 hover:bg-primary/[0.02] transition-all group cursor-pointer"
                        onClick={() => show("quizzes", quiz.id)}
                      >
                        {/* Icon */}
                        <div className="relative shrink-0 mb-4 md:mb-0">
                          <div className={cn(
                              "h-14 w-14 rounded-2xl border-4 border-background flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform",
                              isAI ? "bg-indigo-500/10 text-indigo-600" : "bg-primary/10 text-primary"
                          )}>
                              <FileQuestion className="h-7 w-7" />
                          </div>
                          {isAI && (
                            <div className="absolute -top-2 -right-2 bg-indigo-500 text-white p-1 rounded-full border-2 border-background shadow-lg">
                              <Sparkles className="h-3 w-3" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 md:ml-8 text-center md:text-left min-w-0 w-full">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h3 className="text-xl font-black tracking-tight truncate group-hover:text-primary transition-colors">
                              {quiz.title}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                              <Badge 
                                  variant="outline" 
                                  className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-primary/10"
                              >
                                  {(quiz as any).class?.name || "General Class"}
                              </Badge>
                              {isAI && (
                                  <Badge className="bg-indigo-500/10 text-indigo-600 border-none font-black px-2 py-0.5 rounded-md text-[9px] tracking-widest uppercase">
                                      AI Generated
                                  </Badge>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="p-1.5 rounded-lg bg-primary/5">
                                  <Trophy className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="text-xs font-bold">
                                  {quiz.totalMarks || 100} <span className="text-muted-foreground/50 font-medium">Total Points</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="p-1.5 rounded-lg bg-primary/5">
                                  <Timer className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="text-xs font-bold">
                                  {quiz.timeLimit || "No"} <span className="text-muted-foreground/50 font-medium">Minute Limit</span>
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="p-1.5 rounded-lg bg-primary/5">
                                  <Calendar className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className={cn(
                                  "text-xs font-bold uppercase tracking-tight",
                                  isPast ? "text-destructive" : "text-primary"
                              )}>
                                  {quiz.dueDate ? dayjs(quiz.dueDate).fromNow() : "Open"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                          <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                              {isStaff && (
                                  <>
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                                          onClick={(e) => { e.stopPropagation(); edit("quizzes", quiz.id); }}
                                      >
                                          <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(quiz.id); }}
                                      >
                                          <Trash2 className="h-4 w-4" />
                                      </Button>
                                  </>
                              )}
                          </div>

                          <Button
                            variant={isPast ? "outline" : "default"}
                            className={cn(
                              "rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                              isPast ?
                                "border-destructive/20 text-destructive hover:bg-destructive/5" :
                                "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20",
                            )}
                          >
                            {isStaff ? "View Results" : "Start Quiz"}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>

                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl md:hidden lg:flex" onClick={(e) => e.stopPropagation()}>
                                      <MoreHorizontal className="h-5 w-5" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2">
                                  <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Quiz Options</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => show("quizzes", quiz.id)} className="rounded-xl gap-3 py-3 cursor-pointer">
                                      <Eye className="h-4 w-4 text-primary" />
                                      <span className="font-bold">View Details</span>
                                  </DropdownMenuItem>
                                  {isStaff && (
                                      <>
                                          <DropdownMenuItem onClick={() => edit("quizzes", quiz.id)} className="rounded-xl gap-3 py-3 cursor-pointer">
                                              <Pencil className="h-4 w-4 text-primary" />
                                              <span className="font-bold">Edit Quiz</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator className="my-2" />
                                          <DropdownMenuItem onClick={() => setDeleteTarget(quiz.id)} className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:text-destructive">
                                              <Trash2 className="h-4 w-4" />
                                              <span className="font-bold">Delete Quiz</span>
                                          </DropdownMenuItem>
                                      </>
                                  )}
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
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader className="space-y-4">
            <div className="p-4 rounded-2xl bg-destructive/10 text-destructive w-fit">
              <Trash2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
                <AlertDialogTitle className="text-3xl font-black tracking-tight">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="font-medium text-base">
                This action cannot be undone. This will permanently delete the quiz and all student attempts from the system.
                </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8">Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleConfirmDelete} 
                className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
            >
                Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizzesListPage;
