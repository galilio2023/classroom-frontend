import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import {
  Search,
  Library,
  LayoutGrid,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  PlusCircle,
  Filter,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ArrowRight,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef } from "react";
import { useList, useNavigation, useDelete } from "@refinedev/core";
import { Module } from "@/types";
import { SyncStatusBadge } from "@/components/sync-status-badge";
import { useUserRole } from "@/hooks/use-user-role";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { MagicBuilderDialog } from "@/components/classes/curriculum/magic-builder-dialog";
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
import { Sparkles } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

const ModulesListPage = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  usePageTitle(t("modulesPage.title"));
  const { identity, isStaff } = useUserRole();

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [isMagicBuilderOpen, setIsMagicBuilderOpen] = useState(false);

  const { edit, show, create } = useNavigation();
  const { mutate: deleteMutation, mutation } = useDelete();
  const isDeleteLoading = mutation.isPending;

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({
        field: "name",
        operator: "contains" as const,
        value: searchQuery,
      });
    }
    // IMPORTANT: Filter modules by teacherId if the current user is a staff member (teacher)
    if (isStaff && identity?.id) {
      f.push({
        field: "teacherId",
        operator: "eq" as const,
        value: identity.id,
      });
    }
    return f;
  }, [searchQuery, isStaff, identity?.id]); // Added isStaff and identity.id to dependencies

  const { query } = useList<Module>({
    resource: "modules",
    pagination: { pageSize: 50, mode: "server" },
    filters,
    sorters: [{ field: "order", order: "asc" }],
    meta: {
      populate: ["class", "assignments", "resources"],
    },
  });

  const { data: modulesData, isPending: isLoading } = query;

  const modules = modulesData?.data || [];
  const hasData = modules.length > 0;

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation(
        {
          resource: "modules",
          id: deleteTarget,
          mutationMode: "pessimistic",
        },
        {
          onSuccess: () => setDeleteTarget(null),
        }
      );
    }
  };

  const stats = useMemo(() => {
    if (!modules.length) return { total: 0, published: 0, draft: 0 };
    // Placeholder logic for stats
    return {
      total: modules.length,
      published: modules.filter((m: Module) => m.id % 2 === 0).length,
      draft: modules.filter((m: Module) => m.id % 2 !== 0).length,
    };
  }, [modules]);

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
            <div className="space-y-1 text-start">
              <h1 className="page-title mb-0 flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <Library className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                {t("modulesPage.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                {t("modulesPage.description")}
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
            {isStaff && (
              <>
                <Button
                  onClick={() => setIsMagicBuilderOpen(true)}
                  size="lg"
                  variant="outline"
                  className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-8 font-black uppercase tracking-widest text-[10px] gap-2 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-ai-primary/5"
                >
                  <Sparkles className="h-5 w-5" />
                  {t("classes.show.students.actions.magicBuilder", "AI Magic")}
                </Button>
                <Button
                  onClick={() => create("modules")}
                  size="lg"
                  className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all"
                >
                  <PlusCircle className="h-5 w-5" />
                  {t("modulesPage.create")}
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {/* AI Magic Builder Dialog */}
        <MagicBuilderDialog open={isMagicBuilderOpen} onOpenChange={setIsMagicBuilderOpen} />

        {/* Stats Row - Adaptive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
              <Library className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("modulesPage.stats.total")}
              </p>
              <p className="text-2xl md:text-3xl font-black">{isLoading ? "..." : stats.total}</p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-green-500/10 text-green-600">
              <CheckCircle2 className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("modulesPage.stats.published")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-green-600">
                {isLoading ? "..." : stats.published}
              </p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600">
              <Clock className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("modulesPage.stats.drafts")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-amber-600">
                {isLoading ? "..." : stats.draft}
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
                  "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors start-4"
                )}
              />
              <Input
                type="text"
                placeholder={t("modulesPage.searchPlaceholder")}
                className={cn(
                  "h-12 rounded-2xl border-none bg-background/50 shadow-none font-medium ps-11 pe-4"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-background/50 px-4 py-2 rounded-2xl border border-border/40 shrink-0">
              <Filter className="h-3.5 w-3.5 text-muted-foreground/60" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                {t("modulesPage.filter")}
              </span>
            </div>
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
                title={t("modulesPage.empty.title")}
                description={
                  isStaff
                    ? t("modulesPage.empty.desc")
                    : t("classes.curriculum.noModulesDescription")
                }
                className="border-none bg-transparent min-h-0"
                action={
                  isStaff
                    ? {
                        label: t("modulesPage.create"),
                        onClick: () => create("modules"),
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {modules.map((module: any, index: any) => {
                  const isPublished = module.id % 2 === 0;
                  const moduleColor = (module as any).class?.color || "#6366f1";

                  return (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative flex flex-col md:flex-row items-center p-5 md:p-6 rounded-4xl bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
                      )}
                      onClick={() => show("modules", module.id)}
                    >
                      {/* Class Color Accent */}
                      <div
                        className="absolute start-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-e-full transition-all group-hover:h-20"
                        style={{ backgroundColor: moduleColor }}
                      />

                      {/* Icon */}
                      <div className="relative shrink-0 mb-4 md:mb-0">
                        <div className="h-20 w-20 rounded-[1.5rem] border-4 border-background flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500 bg-primary/10 text-primary">
                          <span className="text-xl font-black">#{module.order}</span>
                          <ArrowUpDown className="h-4 w-4 mt-1 opacity-40" />
                        </div>
                      </div>

                      {/* Info Area */}
                      <div
                        className={cn("flex-1 min-w-0 w-full text-center md:text-start", "md:ms-8")}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <h3 className="text-xl md:text-2xl font-black tracking-tight truncate group-hover:text-primary transition-colors leading-tight">
                            {module.name}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Badge
                              variant={isPublished ? "default" : "secondary"}
                              className={cn(
                                "text-[10px] md:text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm border-none",
                                isPublished
                                  ? "bg-green-500/10 text-green-600"
                                  : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                              )}
                            >
                              {isPublished ? t("status.published") : t("status.draft")}
                            </Badge>
                            <SyncStatusBadge resource="modules" id={module.id} />
                            <Badge
                              variant="ai"
                              className="text-[10px] md:text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm"
                            >
                              {module.class?.name || "General"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-4">
                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <BookOpen className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                {t("modulesPage.labels.resources")}
                              </span>
                              <span className="text-[11px] font-black text-foreground">
                                {module.resources?.length || 0}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                {t("modulesPage.labels.tasks")}
                              </span>
                              <span className="text-[11px] font-black text-foreground">
                                {module.assignments?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                        <div
                          className={cn(
                            "hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ltr:translate-x-4 rtl:-translate-x-4 group-hover:translate-x-0"
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
                                  edit("modules", module.id);
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
                                  setDeleteTarget(module.id);
                                }}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="lg"
                          className="w-full md:w-auto rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px] transition-all border-primary/20 text-primary hover:bg-primary/5"
                        >
                          {t("modulesPage.labels.view")}
                          <ArrowRight className={cn("h-4 w-4 ms-2 rtl:-scale-x-100")} />
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
                            className="w-64 p-2 rounded-3xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl"
                          >
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 px-3 py-3">
                              {t("assignments.list.labels.options")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => show("modules", module.id)}
                              className="rounded-xl gap-3 py-3 cursor-pointer"
                            >
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Eye className="h-4 w-4" />
                              </div>
                              <span className="font-bold">{t("buttons.show")}</span>
                            </DropdownMenuItem>
                            {isStaff && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => edit("modules", module.id)}
                                  className="rounded-xl gap-3 py-3 cursor-pointer"
                                >
                                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Pencil className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold">{t("buttons.edit")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2 opacity-50" />
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget(module.id)}
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
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader className="space-y-6">
            <div className="p-5 rounded-2xl bg-destructive/10 text-destructive w-fit mx-auto">
              <Trash2 className="h-10 w-10" />
            </div>
            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-3xl font-black tracking-tight">
                {t("modulesPage.deleteDialog.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium px-8 leading-relaxed">
                {t("modulesPage.deleteDialog.desc")}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-4 pt-8">
            <AlertDialogCancel className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px]">
              {t("buttons.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleteLoading}
              className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-[10px] bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
            >
              {isDeleteLoading ? t("buttons.processing") : t("buttons.confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ListView>
  );
};

export default ModulesListPage;
