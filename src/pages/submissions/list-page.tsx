import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { 
  Search, 
  User, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Eye, 
  BrainCircuit,
  Filter,
  MoreHorizontal,
  ArrowRight,
  Activity,
  CheckSquare,
  LayoutGrid,
  Timer
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef, useCallback } from "react";
import { useList, useNavigation, useGetIdentity } from "@refinedev/core";
import { Submission, User as UserType, UserRole } from "@/types";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GradingDialog } from "@/pages/assignments/grading-dialog";
import { useTerm } from "@/contexts/term-context";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

dayjs.extend(relativeTime);

const SubmissionsListPage = () => {
  usePageTitle("Student Submissions");
  const { data: identity } = useGetIdentity<UserType>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;
  const { selectedTerm } = useTerm();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isGradingOpen, setIsGradingOpen] = useState(false);

  const { show } = useNavigation();

  const handleGradeClick = (submission: Submission) => {
    if (!isStaff) return;
    setSelectedSubmission(submission);
    setIsGradingOpen(true);
  };

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "assignment.title", operator: "contains" as const, value: searchQuery });
    }
    return f;
  }, [searchQuery]);

  const { query: { data: submissionsData, isLoading } } = useList<Submission>({
    resource: "submissions",
    pagination: { pageSize: 1000, mode: "server" },
    filters,
    sorters: [{ field: "updatedAt", order: "desc" }],
    meta: {
      populate: ["student", "assignment", "assignment.class"]
    }
  });

  const submissions = submissionsData?.data || [];
  const hasData = submissions.length > 0;

  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 120, []);

  const rowVirtualizer = useVirtualizer({
    count: submissions.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  // Stats calculation
  const stats = useMemo(() => {
    if (!submissions.length) return { total: 0, graded: 0, pending: 0 };
    return {
      total: submissions.length,
      graded: submissions.filter((s: Submission) => s.grade !== null).length,
      pending: submissions.filter((s: Submission) => s.grade === null).length
    };
  }, [submissions]);

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
                <h1 className="text-4xl font-black tracking-tight">Submissions & Grading</h1>
                <p className="text-muted-foreground font-medium mt-1">Review student work, provide feedback, and manage academic performance.</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-primary/5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-black">{isLoading ? "..." : stats.total}</p>
              </div>
            </Card>
            <Card className="p-6 border-green-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-green-500/5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                <CheckSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Graded</p>
                <p className="text-2xl font-black text-green-600">{isLoading ? "..." : stats.graded}</p>
              </div>
            </Card>
            <Card className="p-6 border-amber-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-amber-500/5">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-black text-amber-600">{isLoading ? "..." : stats.pending}</p>
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
                  placeholder="Search by assignment title or student name..."
                  className="pl-11 h-14 rounded-2xl border-none bg-background shadow-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Grading Filter</span>
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
                    <p className="text-sm font-medium">You are viewing submissions from <strong>{selectedTerm.name}</strong>. Content is read-only.</p>
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
                  icon={FileText}
                  title="No submissions found"
                  description="There are no student submissions to review at this time."
                  className="border-none bg-transparent min-h-0"
                />
              </div>
            ) : (
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const submission = submissions[virtualItem.index];
                  const submissionDate = dayjs(submission.updatedAt);
                  const isGraded = submission.grade !== null;
                  
                  return (
                    <motion.div
                      key={virtualItem.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      className="flex flex-col md:flex-row items-center px-8 py-6 border-b border-primary/5 hover:bg-primary/[0.02] transition-all group cursor-pointer"
                      onClick={() => handleGradeClick(submission)}
                    >
                      {/* Student Avatar */}
                      <div className="relative shrink-0 mb-4 md:mb-0">
                        <Avatar className="h-16 w-16 rounded-2xl border-4 border-background shadow-lg group-hover:scale-110 transition-transform">
                          <AvatarImage src={submission.student?.image ?? undefined} className="object-cover" />
                          <AvatarFallback className="bg-primary/5 text-primary font-black text-xl">
                            {submission.student?.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {submission.isLate && (
                          <div className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-lg border-2 border-background shadow-lg">
                            <Timer className="h-3 w-3" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 md:ml-8 text-center md:text-left min-w-0 w-full">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                          <h3 className="text-xl font-black tracking-tight truncate group-hover:text-primary transition-colors">
                            {submission.student?.name}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Badge 
                                variant={isGraded ? 'default' : 'secondary'}
                                className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none",
                                    isGraded ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                                )}
                            >
                                {isGraded ? 'Graded' : 'Pending'}
                            </Badge>
                            {submission.isLate && (
                                <Badge variant="destructive" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                                    Late
                                </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="p-1.5 rounded-lg bg-primary/5">
                                <FileText className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-xs font-bold truncate max-w-[200px]">
                                {submission.assignment?.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="p-1.5 rounded-lg bg-primary/5">
                                <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-xs font-bold">
                                {submission.assignment?.class?.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <div className="p-1.5 rounded-lg bg-primary/5">
                                <Clock className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-tight">
                                {submissionDate.fromNow()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                        <div className="flex flex-col items-end mr-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Current Grade</p>
                            <p className={cn(
                                "text-2xl font-black",
                                isGraded ? "text-primary" : "text-muted-foreground/20"
                            )}>
                                {isGraded ? `${submission.grade}%` : '--'}
                            </p>
                        </div>

                        <Button
                          variant={isGraded ? "outline" : "default"}
                          className={cn(
                            "rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                            isGraded ?
                              "border-primary/10 text-primary hover:bg-primary hover:text-primary-foreground" :
                              "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20",
                          )}
                          onClick={() => handleGradeClick(submission)}
                        >
                          {isGraded ? "Review Grade" : "Grade Now"}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl md:hidden lg:flex" onClick={(e) => e.stopPropagation()}>
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2">
                                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Submission Options</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleGradeClick(submission)} className="rounded-xl gap-3 py-3 cursor-pointer">
                                    <Eye className="h-4 w-4 text-primary" />
                                    <span className="font-bold">View Submission</span>
                                </DropdownMenuItem>
                                {!isGraded && (
                                    <DropdownMenuItem onClick={() => handleGradeClick(submission)} className="rounded-xl gap-3 py-3 cursor-pointer">
                                        <BrainCircuit className="h-4 w-4 text-primary" />
                                        <span className="font-bold">AI Grading Assist</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="my-2" />
                                {submission.student && (
                                    <DropdownMenuItem onClick={() => show("users", submission.student!.id)} className="rounded-xl gap-3 py-3 cursor-pointer">
                                        <User className="h-4 w-4 text-primary" />
                                        <span className="font-bold">Student Profile</span>
                                    </DropdownMenuItem>
                                )}
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

      {isStaff && (
        <GradingDialog
            isOpen={isGradingOpen}
            onOpenChange={setIsGradingOpen}
            submission={selectedSubmission}
            readOnly={selectedTerm?.status === "archived"}
        />
      )}
    </div>
  );
};

export default SubmissionsListPage;
