import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { 
  Search, 
  GraduationCap, 
  PlusCircle, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Trash2, 
  ArrowRight,
  BookOpen,
  Building2,
  Activity,
  ShieldCheck,
  Loader2,
  Layers,
  Award
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { useList, useSelect, useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
import { Subject, Department, User, UserRole } from "@/types";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import usePageTitle from "@/hooks/use-page-title";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

const SubjectsList = () => {
  usePageTitle("Curriculum Subjects");
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === UserRole.ADMIN;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { edit, show, create } = useNavigation();
  const { mutate: deleteMutation, mutation } = useDelete();
  const isDeleteLoading = mutation.isPending;

  const { options: departmentOptions } = useSelect<Department>({
    resource: "departments",
    optionLabel: "name",
    optionValue: "name",
  });

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "search", operator: "contains" as const, value: searchQuery });
    }
    if (selectedDepartment && selectedDepartment !== "all") {
      f.push({ field: "department", operator: "eq" as const, value: selectedDepartment });
    }
    return f;
  }, [searchQuery, selectedDepartment]);

  const { query } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 1000, mode: "server" },
    filters,
    sorters: [{ field: "id", order: "desc" }],
    meta: {
      populate: ["department"]
    }
  });

  const subjects = useMemo(() => query.data?.data || [], [query.data?.data]);
  const isLoading = query.isLoading;
  const hasData = subjects.length > 0;

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "subjects",
        id: deleteTarget,
        mutationMode: "pessimistic",
      }, {
        onSuccess: () => setDeleteTarget(null),
      });
    }
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 140, []);

  const rowVirtualizer = useVirtualizer({
    count: subjects.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  // Stats calculation
  const stats = useMemo(() => {
    if (!subjects.length) return { total: 0, totalCredits: 0, avgCredits: 0 };
    const totalCredits = subjects.reduce((acc: number, curr: Subject) => acc + (curr.credits || 0), 0);
    return {
      total: subjects.length,
      totalCredits,
      avgCredits: Math.round((totalCredits / subjects.length) * 10) / 10
    };
  }, [subjects]);

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
                <h1 className="text-4xl font-black tracking-tight">Curriculum Catalog</h1>
                <p className="text-muted-foreground font-medium mt-1">Manage academic subjects, credit allocations, and course descriptions.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                {isAdmin && (
                  <Button 
                    onClick={() => create("subjects")}
                    className="flex-1 md:flex-none rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <PlusCircle className="h-5 w-5" />
                    Create Subject
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-[2rem] shadow-lg shadow-primary/5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Subjects</p>
                <p className="text-2xl font-black">{isLoading ? "..." : stats.total}</p>
              </div>
            </Card>
            <Card className="p-6 border-indigo-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-[2rem] shadow-lg shadow-indigo-500/5">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-black text-indigo-600">{isLoading ? "..." : stats.totalCredits}</p>
              </div>
            </Card>
            <Card className="p-6 border-green-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-[2rem] shadow-lg shadow-green-500/5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg. Credits</p>
                <p className="text-2xl font-black text-green-600">{isLoading ? "..." : stats.avgCredits}</p>
              </div>
            </Card>
          </div>
          
          {/* Filters & Search */}
          <Card className="p-4 border-primary/5 bg-muted/30 rounded-[2rem] backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Search by subject name or code..."
                  className="pl-11 h-14 rounded-2xl border-none bg-background shadow-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-[200px] border-none h-10 focus:ring-0 shadow-none font-black text-[10px] uppercase tracking-widest">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="all" className="rounded-xl font-bold">All Departments</SelectItem>
                      {departmentOptions.map(({ value, label }) => (
                        <SelectItem value={String(value)} key={value} className="rounded-xl font-bold">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Virtualized List Container */}
          <div 
            ref={parentRef} 
            className="h-[600px] overflow-auto pr-2 custom-scrollbar rounded-[2.5rem] border border-primary/5 bg-card/30 backdrop-blur-sm relative"
          >
            {isLoading ? (
              <div style={{ height: '100%', width: '100%', position: 'relative' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-center p-8 border-b border-primary/5 gap-6">
                    <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3 w-full">
                      <Skeleton className="h-6 w-[250px]" />
                      <Skeleton className="h-4 w-[180px]" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : !hasData ? (
              <div className="h-full w-full flex items-center justify-center p-12">
                <EmptyState
                  icon={BookOpen}
                  title="No subjects found"
                  description="Create your first academic subject to begin building your curriculum catalog."
                  action={isAdmin ? {
                    label: "Create Subject",
                    onClick: () => create("subjects"),
                  } : undefined}
                  className="border-none bg-transparent min-h-0"
                />
              </div>
            ) : (
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const subject = subjects[virtualItem.index];
                  if (!subject) return null;
                  
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
                      className="px-8 py-4"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col md:flex-row items-center h-full border border-primary/5 bg-background/50 rounded-[1.5rem] px-6 hover:bg-primary/[0.02] transition-all group shadow-sm"
                      >
                        {/* Icon/Code */}
                        <div className="relative shrink-0 mb-4 md:mb-0">
                          <div className="h-14 w-14 rounded-xl border-2 border-background flex flex-col items-center justify-center shadow-md group-hover:scale-110 transition-transform bg-primary/10 text-primary">
                              <BookOpen className="h-6 w-6 mb-1" />
                              <span className="text-[9px] font-black uppercase tracking-tighter">{subject.code}</span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 md:ml-6 text-center md:text-left min-w-0 w-full">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                            <h3 className="text-lg font-black tracking-tight truncate group-hover:text-primary transition-colors">
                              {subject.name}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                              <Badge 
                                  variant="outline" 
                                  className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-primary/10"
                              >
                                  {subject.code}
                              </Badge>
                              <Badge className="bg-primary/5 text-primary border-none font-black px-2 py-0.5 rounded-md text-[8px] tracking-widest uppercase">
                                  {subject.credits} Credits
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 mt-2">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <div className="p-1 rounded-lg bg-primary/5">
                                  <Building2 className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-[11px] font-bold">
                                  {subject.department?.name || "General Department"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <div className="p-1 rounded-lg bg-primary/5">
                                  <GraduationCap className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-[11px] font-bold uppercase tracking-tight">
                                  Academic Subject
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 md:mt-0 shrink-0">
                          <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                              {isAdmin && (
                                  <>
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5"
                                          onClick={() => edit("subjects", subject.id)}
                                      >
                                          <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                          onClick={() => setDeleteTarget(subject.id)}
                                      >
                                          <Trash2 className="h-4 w-4" />
                                      </Button>
                                  </>
                              )}
                          </div>

                          <Button
                            variant="outline"
                            className="rounded-xl px-6 h-10 text-[9px] font-black uppercase tracking-widest transition-all shadow-sm border-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                            onClick={() => show("subjects", subject.id)}
                          >
                            View Details
                            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                          </Button>

                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg md:hidden lg:flex">
                                      <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-xl p-1">
                                  <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1.5">Options</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => show("subjects", subject.id)} className="rounded-lg gap-2 py-2 cursor-pointer">
                                      <Eye className="h-3.5 w-3.5 text-primary" />
                                      <span className="font-bold text-xs">View Details</span>
                                  </DropdownMenuItem>
                                  {isAdmin && (
                                      <>
                                          <DropdownMenuItem onClick={() => edit("subjects", subject.id)} className="rounded-lg gap-2 py-2 cursor-pointer">
                                              <Pencil className="h-3.5 w-3.5 text-primary" />
                                              <span className="font-bold text-xs">Edit Subject</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator className="my-1" />
                                          <DropdownMenuItem 
                                              onClick={() => setDeleteTarget(subject.id)} 
                                              className="rounded-lg gap-2 py-2 cursor-pointer text-destructive focus:text-destructive"
                                          >
                                              <Trash2 className="h-3.5 w-3.5" />
                                              <span className="font-bold text-xs">Delete Subject</span>
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
                <AlertDialogDescription className="font-medium text-base leading-relaxed">
                    This action cannot be undone. This will permanently delete the subject and all associated curriculum data from the system.
                </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8">Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleConfirmDelete} 
                disabled={isDeleteLoading}
                className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
            >
                {isDeleteLoading ? "Deleting..." : "Confirm Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
export default SubjectsList;
