import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import {
  Search,
  Building2,
  UserCircle,
  PlusCircle,
  Filter,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowRight,
  BookOpen,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState, useRef, useCallback } from "react";
import { useList, useNavigation, useDelete, useGetIdentity } from "@refinedev/core";
import { Department, User, UserRole } from "@/types";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
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
import usePageTitle from "@/hooks/use-page-title";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface DepartmentWithHead extends Department {
  headOfDepartment?: User;
}

const DepartmentsList = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  usePageTitle(t("departments.title"));
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === UserRole.ADMIN;

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { edit, create } = useNavigation();
  const { mutate: deleteMutation } = useDelete();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({
        field: "search",
        operator: "contains" as const,
        value: searchQuery,
      });
    }
    return f;
  }, [searchQuery]);

  const { query } = useList<DepartmentWithHead>({
    resource: "departments",
    pagination: { pageSize: 50, mode: "server" },
    filters,
    sorters: [{ field: "id", order: "desc" }],
    meta: {
      populate: ["head"],
    },
  });

  const departments = useMemo(() => query.data?.data || [], [query.data?.data]);
  const isLoading = query.isLoading;
  const hasData = departments.length > 0;

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation({
        resource: "departments",
        id: deleteTarget,
        mutationMode: "pessimistic",
      });
      setDeleteTarget(null);
    }
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 140, []);

  const rowVirtualizer = useVirtualizer({
    count: departments.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  // Stats calculation
  const stats = useMemo(() => {
    if (!departments.length) return { total: 0, withHead: 0, active: 0 };
    return {
      total: departments.length,
      withHead: departments.filter((d) => d.headOfDepartmentId).length,
      active: departments.length,
    };
  }, [departments]);

  return (
    <div className="space-y-10 pb-20 text-start">
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
                <h1 className="text-4xl font-black tracking-tight">{t("departments.title")}</h1>
                <p className="text-muted-foreground font-medium mt-1">
                  {t("departments.description")}
                </p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                {isAdmin && (
                  <Button
                    onClick={() => create("departments")}
                    className="flex-1 md:flex-none rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <PlusCircle className="h-5 w-5" />
                    {t("departments.create")}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-primary/5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("departments.stats.total")}
                </p>
                <p className="text-2xl font-black">
                  {isLoading ? "..." : new Intl.NumberFormat(i18n.language).format(stats.total)}
                </p>
              </div>
            </Card>
            <Card className="p-6 border-indigo-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-indigo-500/5">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("departments.stats.withHead")}
                </p>
                <p className="text-2xl font-black text-indigo-600">
                  {isLoading ? "..." : new Intl.NumberFormat(i18n.language).format(stats.withHead)}
                </p>
              </div>
            </Card>
            <Card className="p-6 border-green-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-green-500/5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("departments.stats.active")}
                </p>
                <p className="text-2xl font-black text-green-600">
                  {isLoading ? "..." : new Intl.NumberFormat(i18n.language).format(stats.active)}
                </p>
              </div>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card className="p-4 border-primary/5 bg-muted/30 rounded-4xl backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors",
                    "start-4"
                  )}
                />
                <Input
                  type="text"
                  placeholder={t("departments.filters.searchPlaceholder")}
                  className={cn(
                    "h-14 rounded-2xl border-none bg-background shadow-sm font-medium",
                    isAr ? "pe-11" : "ps-11"
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("departments.filters.structure")}
                </span>
              </div>
            </div>
          </Card>

          {/* Virtualized List Container */}
          <div
            ref={parentRef}
            className="h-[600px] overflow-auto pe-2 custom-scrollbar rounded-[2.5rem] border border-primary/5 bg-card/30 backdrop-blur-sm relative"
          >
            {isLoading ? (
              <div style={{ height: "100%", width: "100%", position: "relative" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row items-center p-8 border-b border-primary/5 gap-6"
                  >
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
                  icon={Building2}
                  title={t("departments.empty.title")}
                  description={t("departments.empty.desc")}
                  action={
                    isAdmin
                      ? {
                          label: t("departments.create"),
                          onClick: () => create("departments"),
                        }
                      : undefined
                  }
                  className="border-none bg-transparent min-h-0"
                />
              </div>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const department = departments[virtualItem.index];
                  if (!department) return null;

                  return (
                    <div
                      key={virtualItem.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      className="px-8 py-4"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col md:flex-row items-center h-full border border-primary/5 bg-background/50 rounded-[1.5rem] px-6 hover:bg-primary/2 transition-all group shadow-sm"
                      >
                        {/* Icon/Code */}
                        <div className="relative shrink-0 mb-4 md:mb-0">
                          <div className="h-14 w-14 rounded-2xl border border-primary/10 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform bg-primary/5 text-primary">
                            <Building2 className="h-6 w-6" />
                          </div>
                        </div>

                        {/* Info */}
                        <div
                          className={cn(
                            "flex-1 text-start min-w-0 w-full",
                            isAr ? "md:me-6" : "md:ms-6"
                          )}
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 overflow-hidden">
                            <h3 className="text-lg font-black tracking-tight truncate group-hover:text-primary transition-colors max-w-[70%]">
                              {department.name}
                            </h3>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge
                                variant="outline"
                                className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border-primary/10 bg-primary/2 text-primary truncate max-w-[120px]"
                              >
                                {department.code}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                            {department.headOfDepartment ? (
                              <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                                <Avatar className="h-5 w-5 border border-border/50">
                                  <AvatarImage
                                    src={department.headOfDepartment.image ?? undefined}
                                  />
                                  <AvatarFallback className="bg-primary/5 text-primary font-black text-[7px]">
                                    {department.headOfDepartment.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-[11px] font-bold truncate max-w-[150px]">
                                  {t("departments.head")}:{" "}
                                  <span className="text-foreground/80">
                                    {department.headOfDepartment.name}
                                  </span>
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-muted-foreground/40 italic shrink-0">
                                <UserCircle className="h-3.5 w-3.5" />
                                <span className="text-[11px] font-medium">
                                  {t("departments.noHead")}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                              <div className="p-1 rounded-md bg-primary/5">
                                <BookOpen className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                                {t("departments.unit")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div
                          className={cn("flex items-center gap-2 mt-4 md:mt-0 shrink-0", "ms-4")}
                        >
                          <div
                            className={cn(
                              "hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0",
                              isAr ? "-translate-x-2" : "translate-x-2"
                            )}
                          >
                            {isAdmin && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5"
                                  onClick={() => edit("departments", department.id)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                  onClick={() => setDeleteTarget(department.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            className="rounded-xl px-6 h-10 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all shadow-sm border-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                            onClick={() => edit("departments", department.id)}
                          >
                            {t("buttons.manage")}
                            <ArrowRight
                              className={cn("h-3.5 w-3.5 ms-1.5", isAr && "rotate-180")}
                            />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg md:hidden lg:flex"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 rounded-xl p-1 bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl"
                            >
                              <DropdownMenuLabel className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                                {t("assignments.list.labels.options")}
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => edit("departments", department.id)}
                                className="rounded-lg gap-2 py-2 cursor-pointer"
                              >
                                <Pencil className="h-3.5 w-3.5 text-primary" />
                                <span className="font-bold text-xs">
                                  {t("buttons.editDetails")}
                                </span>
                              </DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuSeparator className="my-1" />
                                  <DropdownMenuItem
                                    onClick={() => setDeleteTarget(department.id)}
                                    className="rounded-lg gap-2 py-2 cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span className="font-bold text-xs">
                                      {t("buttons.deleteDept")}
                                    </span>
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
        <AlertDialogContent className="rounded-[2.5rem] border border-border/50 shadow-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none text-start">
          <AlertDialogHeader className="space-y-4 text-start">
            <div className="p-4 rounded-2xl bg-destructive/10 text-destructive w-fit">
              <Trash2 className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-3xl font-black tracking-tight">
                {t("assignments.list.deleteDialog.title")}
              </AlertDialogTitle>
              <div className="font-medium text-base leading-relaxed text-muted-foreground">
                <p>{t("assignments.list.deleteDialog.description")}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="font-black text-destructive uppercase tracking-widest text-[10px] bg-destructive/5 px-2 py-1 rounded">
                    {t("departments.delete.warning")}
                  </span>
                  <span className="text-sm">{t("departments.delete.warningDesc")}</span>
                </div>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8">
              {t("buttons.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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
export default DepartmentsList;
