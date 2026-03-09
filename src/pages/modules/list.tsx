import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { 
  Search, 
  Library, 
  LayoutGrid, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpDown,
  PlusCircle,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef, useCallback } from "react";
import { useList, useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
import { Module, User, UserRole } from "@/types";
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
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { useVirtualizer } from "@tanstack/react-virtual";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

const ModulesListPage = () => {
  usePageTitle("Course Modules");
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { edit, show, create } = useNavigation();
  const { mutate: deleteMutation } = useDelete();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({ field: "name", operator: "contains" as const, value: searchQuery });
    }
    return f;
  }, [searchQuery]);

  const { query: { data: modulesData, isLoading } } = useList<Module>({
    resource: "modules",
    pagination: { pageSize: 1000, mode: "server" },
    filters,
    sorters: [{ field: "order", order: "asc" }],
    meta: {
      populate: ["class", "assignments", "resources"]
    }
  });

  const modules = modulesData?.data || [];
  const hasData = modules.length > 0;

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "modules",
        id: deleteTarget,
        mutationMode: "pessimistic",
      });
      setDeleteTarget(null);
    }
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 120, []);

  const rowVirtualizer = useVirtualizer({
    count: modules.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  // Stats calculation
  const stats = useMemo(() => {
    if (!modules.length) return { total: 0, published: 0, draft: 0 };
    return {
      total: modules.length,
      published: modules.filter((m: Module) => m.id % 2 === 0).length, // Mock logic
      draft: modules.filter((m: Module) => m.id % 2 !== 0).length
    };
  }, [modules]);

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
                <h1 className="text-4xl font-black tracking-tight">Curriculum Modules</h1>
                <p className="text-muted-foreground font-medium mt-1">Organize course content into structured learning pathways.</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                {isStaff && (
                  <Button 
                    onClick={() => create("modules")}
                    className="flex-1 md:flex-none rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <PlusCircle className="h-5 w-5" />
                    Create Module
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-primary/5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Library className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Modules</p>
                <p className="text-2xl font-black">{isLoading ? "..." : stats.total}</p>
              </div>
            </Card>
            <Card className="p-6 border-green-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-green-500/5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Published</p>
                <p className="text-2xl font-black text-green-600">{isLoading ? "..." : stats.published}</p>
              </div>
            </Card>
            <Card className="p-6 border-amber-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-amber-500/5">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Drafts</p>
                <p className="text-2xl font-black text-amber-600">{isLoading ? "..." : stats.draft}</p>
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
                  placeholder="Search modules by title..."
                  className="pl-11 h-14 rounded-2xl border-none bg-background shadow-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Module Filter</span>
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
                  icon={Library}
                  title="No modules found"
                  description={isStaff ? "Create your first module to begin organizing your course curriculum." : "There are no modules available for this course yet."}
                  className="border-none bg-transparent min-h-0"
                  action={isStaff ? {
                    label: "Create Module",
                    onClick: () => create("modules"),
                  } : undefined}
                />
              </div>
            ) : (
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const module = modules[virtualItem.index];
                  const isPublished = module.id % 2 === 0;
                  
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
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: virtualItem.index * 0.03 }}
                        className="flex flex-col md:flex-row items-center h-full border-b border-primary/5 hover:bg-primary/[0.02] transition-all group"
                      >
                        {/* Order Icon */}
                        <div className="relative shrink-0 mb-4 md:mb-0">
                          <div className="h-14 w-14 rounded-2xl border-4 border-background flex flex-col items-center justify-center shadow-lg group-hover:scale-110 transition-transform bg-primary/10 text-primary">
                                <span className="text-xs font-black">#{module.order}</span>
                                <ArrowUpDown className="h-3 w-3 mt-0.5 opacity-40" />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 md:ml-8 text-center md:text-left min-w-0 w-full">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h3 className="text-xl font-black tracking-tight truncate group-hover:text-primary transition-colors">
                              {module.name}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                              <Badge 
                                  variant={isPublished ? 'default' : 'secondary'}
                                  className={cn(
                                      "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none",
                                      isPublished ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                                    )}
                                >
                                    {isPublished ? 'Published' : 'Draft'}
                                </Badge>
                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-primary/10">
                                    {module.class?.name || "General"}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-3">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="p-1.5 rounded-lg bg-primary/5">
                                    <BookOpen className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-xs font-bold">
                                    {module.resources?.length || 0} <span className="text-muted-foreground/50 font-medium">Resources</span>
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="p-1.5 rounded-lg bg-primary/5">
                                    <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-xs font-bold">
                                    {module.assignments?.length || 0} <span className="text-muted-foreground/50 font-medium">Tasks</span>
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
                                            onClick={() => edit("modules", module.id)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                            onClick={() => setDeleteTarget(module.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>

                            <Button
                              variant="outline"
                              className="rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                              onClick={() => show("modules", module.id)}
                            >
                              View Module
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl md:hidden lg:flex">
                                        <MoreHorizontal className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2">
                                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">Module Options</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => show("modules", module.id)} className="rounded-xl gap-3 py-3 cursor-pointer">
                                        <Eye className="h-4 w-4 text-primary" />
                                        <span className="font-bold">View Details</span>
                                    </DropdownMenuItem>
                                    {isStaff && (
                                        <>
                                            <DropdownMenuItem onClick={() => edit("modules", module.id)} className="rounded-xl gap-3 py-3 cursor-pointer">
                                                <Pencil className="h-4 w-4 text-primary" />
                                                <span className="font-bold">Edit Module</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="my-2" />
                                            <DropdownMenuItem 
                                                onClick={() => setDeleteTarget(module.id)} 
                                                className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="font-bold">Delete Module</span>
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
                    This action cannot be undone. This will permanently delete the module and all its content associations from the curriculum.
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

export default ModulesListPage;
