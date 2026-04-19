import { ListView } from "@/components/refine/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb.tsx";
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
  Layers,
  Award,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useMemo, useState } from "react";
import { useSelect, useNavigation, useDelete, useGetIdentity, HttpError } from "@refinedev/core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTable } from "@refinedev/react-table";
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
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import usePageTitle from "@/hooks/use-page-title";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ColumnDef } from "@tanstack/react-table";

interface SubjectListItem extends Omit<Subject, "department"> {
  department?: Department;
}

const SubjectsList = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  usePageTitle(t("subjects.title"));
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === UserRole.ADMIN;

  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { edit, show, create } = useNavigation();
  const { mutate: deleteMutation, mutation: deleteMutationObj } = useDelete();
  const isDeleteLoading = deleteMutationObj.isPending;

  const { options: departmentOptions } = useSelect<Department>({
    resource: "departments",
    optionLabel: "name",
    optionValue: "name",
  });

  const columns = useMemo<ColumnDef<SubjectListItem>[]>(() => [], []);

  const {
    refineCore: { tableQuery: query, filters, setFilters },
  } = useTable<SubjectListItem, HttpError>({
    columns,
    refineCoreProps: {
      resource: "subjects",
      pagination: { pageSize: 50, mode: "server" },
      sorters: { initial: [{ field: "id", order: "desc" }] },
      meta: {
        populate: ["department"],
      },
      syncWithLocation: true,
    },
  });

  const searchQuery =
    (filters.find((f) => "field" in f && f.field === "search") as any)?.value || "";
  const selectedDepartment =
    (filters.find((f) => "field" in f && f.field === "department") as any)?.value || "all";

  const setSearchQuery = (val: string) => {
    setFilters([{ field: "search", operator: "contains", value: val || undefined }], "merge");
  };

  const setSelectedDepartment = (val: string) => {
    setFilters(
      [
        {
          field: "department",
          operator: "eq",
          value: val === "all" ? undefined : val,
        },
      ],
      "merge"
    );
  };

  const subjects = useMemo(() => query.data?.data || [], [query.data?.data]);
  const isLoading = query.isPending;
  const hasData = subjects.length > 0;

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteMutation(
        {
          resource: "subjects",
          id: deleteTarget,
          mutationMode: "pessimistic",
        },
        {
          onSuccess: () => setDeleteTarget(null),
        }
      );
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    if (!subjects.length) return { total: 0, totalCredits: 0, avgCredits: 0 };
    const totalCredits = subjects.reduce(
      (acc: number, curr: SubjectListItem) => acc + (curr.credits || 0),
      0
    );
    return {
      total: subjects.length,
      totalCredits,
      avgCredits: Math.round((totalCredits / subjects.length) * 10) / 10,
    };
  }, [subjects]);

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
                  <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                {t("subjects.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                {t("subjects.description")}
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto">
            {isAdmin && (
              <Button
                onClick={() => create("subjects")}
                size="lg"
                className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all"
              >
                <PlusCircle className="h-5 w-5" />
                {t("subjects.create")}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats Row - Adaptive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
              <BookOpen className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("subjects.stats.total")}
              </p>
              <p className="text-2xl md:text-3xl font-black">
                {isLoading ? "..." : new Intl.NumberFormat(i18n.language).format(stats.total)}
              </p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600">
              <Award className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("subjects.stats.weighted")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-indigo-600">
                {isLoading
                  ? "..."
                  : new Intl.NumberFormat(i18n.language).format(stats.totalCredits)}
              </p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-green-500/10 text-green-600">
              <Layers className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("subjects.stats.archived")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-green-600">
                {isLoading ? "..." : new Intl.NumberFormat(i18n.language).format(stats.avgCredits)}
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
                placeholder={t("subjects.filters.searchPlaceholder")}
                className={cn(
                  "h-12 rounded-2xl border-none bg-background/50 shadow-none font-medium",
                  "ps-11 pe-4"
                )}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 bg-background/50 px-3 py-1 rounded-2xl border border-border/40">
              <Filter className="h-3.5 w-3.5 text-muted-foreground/60" />
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px] border-none h-10 focus:ring-0 shadow-none font-bold text-[10px] uppercase tracking-wider bg-transparent">
                  <SelectValue placeholder={t("departments.filters.allDepartments")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl">
                  <SelectItem value="all" className="font-bold">
                    {t("departments.filters.allDepartments")}
                  </SelectItem>
                  {departmentOptions.map(({ value, label }) => (
                    <SelectItem value={String(value)} key={value} className="font-bold">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Subjects List - Global Scroll */}
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
                title={t("subjects.empty.title")}
                description={t("subjects.empty.desc")}
                action={
                  isAdmin
                    ? {
                        label: t("subjects.create"),
                        onClick: () => create("subjects"),
                      }
                    : undefined
                }
                className="border-none bg-transparent min-h-0"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {subjects.map((subject, index) => {
                  return (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative flex flex-col md:flex-row items-center p-5 md:p-6 rounded-4xl bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
                      )}
                      onClick={() => show("subjects", subject.id)}
                    >
                      {/* Status Line Accent */}
                      <div className="absolute start-0 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-primary rounded-e-full transition-all group-hover:h-20" />

                      {/* Icon/Code */}
                      <div className="relative shrink-0 mb-4 md:mb-0">
                        <div className="h-20 w-20 rounded-[1.5rem] border-4 border-background flex flex-col items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500 bg-primary/10 text-primary">
                          <BookOpen className="h-8 w-8 mb-1" />
                          <span className="text-[10px] font-black uppercase tracking-tighter">
                            {subject.code}
                          </span>
                        </div>
                      </div>

                      {/* Info Area */}
                      <div
                        className={cn(
                          "flex-1 min-w-0 w-full text-start",
                          isAr ? "md:me-8 md:text-end" : "md:ms-8 md:text-start"
                        )}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <h3 className="text-xl md:text-2xl font-black tracking-tight truncate group-hover:text-primary transition-colors leading-tight">
                            {subject.name}
                          </h3>
                          <div className="flex items-center justify-center md:justify-start gap-2">
                            <Badge
                              variant="outline"
                              className="text-[10px] md:text-[11px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border-primary/10 shadow-sm"
                            >
                              {subject.code}
                            </Badge>
                            <Badge className="bg-primary/10 text-primary border-none font-black px-3 py-0.5 rounded-full text-[10px] md:text-[11px] tracking-widest uppercase shadow-sm">
                              {new Intl.NumberFormat(i18n.language).format(subject.credits || 0)}{" "}
                              {t("classes.form.studentsUnit")}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-4">
                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <Building2 className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Department
                              </span>
                              <span className="text-[11px] font-black text-foreground truncate max-w-[150px]">
                                {subject.department?.name ||
                                  t("subjects.filters.generalDepartment")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <GraduationCap className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] md:text-[11px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Category
                              </span>
                              <span className="text-[11px] font-black text-foreground uppercase tracking-tight">
                                {t("subjects.academicSubject")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                        <div
                          className={cn(
                            "hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300",
                            isAr
                              ? "-translate-x-4 group-hover:translate-x-0"
                              : "translate-x-4 group-hover:translate-x-0"
                          )}
                        >
                          {isAdmin && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-11 w-11 rounded-2xl text-muted-foreground hover:text-primary hover:bg-primary/5 bg-muted/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  edit("subjects", subject.id);
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
                                  setDeleteTarget(subject.id);
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
                          {t("buttons.viewDetails")}
                          <ArrowRight
                            className={cn("h-4 w-4 ms-2", isAr && "rotate-180 me-2 ms-0")}
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
                            className="w-64 p-2 rounded-3xl bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl"
                          >
                            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/40 px-3 py-3">
                              {t("assignments.list.labels.options")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => show("subjects", subject.id)}
                              className="rounded-xl gap-3 py-3 cursor-pointer"
                            >
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Eye className="h-4 w-4" />
                              </div>
                              <span className="font-bold">{t("buttons.viewDetails")}</span>
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => edit("subjects", subject.id)}
                                  className="rounded-xl gap-3 py-3 cursor-pointer"
                                >
                                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Pencil className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold">{t("buttons.editAssignment")}</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2 opacity-50" />
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget(subject.id)}
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
export default SubjectsList;
