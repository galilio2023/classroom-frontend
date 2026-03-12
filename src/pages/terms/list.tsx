import {
  useCreate,
  useDelete,
  useGetIdentity,
  useList,
  useUpdate,
} from "@refinedev/core";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Activity,
  Archive,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  History,
  Loader2,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { AcademicTerm, User, UserRole } from "@/types";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/empty-state";
import { useTranslation } from "react-i18next";

dayjs.extend(relativeTime);

export default function TermsList() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';

  const termSchema = useMemo(() => z.object({
    name: z.string().min(1, t("terms.form.nameRequired")),
    startDate: z.string().min(1, t("terms.form.startRequired")),
    endDate: z.string().min(1, t("terms.form.endRequired")),
  }), [t]);

  type TermFormValues = z.infer<typeof termSchema>;

  usePageTitle(t("terms.title"));
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === UserRole.ADMIN;

  const { query } = useList<AcademicTerm>({
    resource: "academic-terms",
    sorters: [{ field: "startDate", order: "desc" }],
  });

  const terms = useMemo(() => query.data?.data || [], [query.data?.data]);
  const isLoading = query.isLoading;

  const { mutate: update, mutation: updateMutation } = useUpdate();
  const { mutate: create, mutation: createMutation } = useCreate();
  const { mutate: deleteMutation } = useDelete();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<TermFormValues>({
    resolver: zodResolver(termSchema),
  });

  const handleActivate = (id: number) => {
    update(
      {
        resource: "academic-terms",
        id,
        values: { status: "active" },
      },
      {
        onSuccess: () => toast.success(t("terms.toasts.activated")),
        onError: () => toast.error(t("terms.toasts.error")),
      },
    );
  };

  const handleArchive = (id: number) => {
    update(
      {
        resource: "academic-terms",
        id,
        values: { status: "archived" },
      },
      {
        onSuccess: () => toast.success(t("terms.toasts.archived")),
        onError: () => toast.error(t("terms.toasts.error")),
      },
    );
  };

  const handleDelete = (id: number) => {
    if (
      window.confirm(t("terms.deleteDialog.title") + " " + t("terms.deleteDialog.description"))
    ) {
      deleteMutation(
        {
          resource: "academic-terms",
          id,
        },
        {
          onSuccess: () => toast.success(t("terms.toasts.deleted")),
          onError: () => toast.error(t("terms.toasts.error")),
        },
      );
    }
  };

  const onSubmit = (values: TermFormValues) => {
    create(
      {
        resource: "academic-terms",
        values: {
          ...values,
          status: "upcoming",
        },
      },
      {
        onSuccess: () => {
          toast.success(t("terms.toasts.created"));
          setIsCreateOpen(false);
          form.reset();
        },
        onError: () => toast.error(t("terms.toasts.error")),
      },
    );
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 140, []);

  const rowVirtualizer = useVirtualizer({
    count: terms.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  const stats = useMemo(() => {
    if (!terms.length) return { total: 0, active: 0, upcoming: 0 };
    return {
      total: terms.length,
      active: terms.filter((t: AcademicTerm) => t.status === "active").length,
      upcoming: terms.filter((t: AcademicTerm) => t.status === "upcoming")
        .length,
    };
  }, [terms]);

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
                <h1 className="text-4xl font-black tracking-tight">
                  {t("terms.title")}
                </h1>
                <p className="text-muted-foreground font-medium mt-1">
                  {t("terms.description")}
                </p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                {isAdmin && (
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex-1 md:flex-none rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                        <PlusCircle className="h-5 w-5" />
                        {t("terms.create")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-lg text-start">
                      <DialogHeader className="space-y-4 text-start">
                        <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit">
                          <Calendar className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                          <DialogTitle className="text-3xl font-black tracking-tight">
                            {t("terms.newTitle")}
                          </DialogTitle>
                          <DialogDescription className="font-medium text-base">
                            {t("terms.newDesc")}
                          </DialogDescription>
                        </div>
                      </DialogHeader>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8 py-8"
                      >
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                            {t("terms.form.name")}
                          </Label>
                          <Input
                            placeholder={t("terms.form.namePlaceholder")}
                            {...form.register("name")}
                            className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary font-black text-sm"
                          />
                          {form.formState.errors.name && (
                            <p className="text-xs font-bold text-destructive ml-1">
                              {form.formState.errors.name.message}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              {t("terms.form.start")}
                            </Label>
                            <Input
                              type="date"
                              {...form.register("startDate")}
                              className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary font-bold"
                            />
                            {form.formState.errors.startDate && (
                              <p className="text-xs font-bold text-destructive ml-1">
                                {form.formState.errors.startDate.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              {t("terms.form.end")}
                            </Label>
                            <Input
                              type="date"
                              {...form.register("endDate")}
                              className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary font-bold"
                            />
                            {form.formState.errors.endDate && (
                              <p className="text-xs font-bold text-destructive ml-1">
                                {form.formState.errors.endDate.message}
                              </p>
                            )}
                          </div>
                        </div>
                        <DialogFooter className="gap-3 pt-4">
                          <Button
                            variant="ghost"
                            type="button"
                            className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8"
                            onClick={() => setIsCreateOpen(false)}
                          >
                            {t("buttons.cancel")}
                          </Button>
                          <Button
                            type="submit"
                            className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 shadow-xl shadow-primary/20"
                            disabled={createMutation.isPending}
                          >
                            {createMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <PlusCircle className="h-4 w-4 mr-2" />
                            )}
                            {t("buttons.create")}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-primary/5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("terms.stats.total")}
                </p>
                <p className="text-2xl font-black">
                  {isLoading ? "..." : new Intl.NumberFormat(i18n.language).format(stats.total)}
                </p>
              </div>
            </Card>
            <Card className="p-6 border-green-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-green-500/5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("terms.stats.active")}
                </p>
                <p className="text-2xl font-black text-green-600">
                  {isLoading ? "..." : new Intl.NumberFormat(i18n.language).format(stats.active)}
                </p>
              </div>
            </Card>
            <Card className="p-6 border-indigo-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-indigo-500/5">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("terms.stats.upcoming")}
                </p>
                <p className="text-2xl font-black text-indigo-600">
                  {isLoading ? "..." : new Intl.NumberFormat(i18n.language).format(stats.upcoming)}
                </p>
              </div>
            </Card>
          </div>

          {/* Virtualized List Container */}
          <div
            ref={parentRef}
            className="h-175 overflow-auto pr-2 custom-scrollbar rounded-[2.5rem] border border-primary/5 bg-card/30 backdrop-blur-sm relative"
          >
            {isLoading ? (
              <div className="p-8 space-y-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row items-center gap-6"
                  >
                    <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3 w-full">
                      <Skeleton className="h-6 w-75" />
                      <Skeleton className="h-4 w-50" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : terms.length === 0 ? (
              <div className="h-full flex items-center justify-center p-10">
                <EmptyState
                  icon={Calendar}
                  title={t("terms.empty.title")}
                  description={t("terms.empty.desc")}
                  className="border-none bg-transparent min-h-0"
                  action={
                    isAdmin
                      ? {
                          label: t("terms.create"),
                          onClick: () => setIsCreateOpen(true),
                        }
                      : undefined
                  }
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
                  const term = terms[virtualItem.index];
                  if (!term) return null;

                  const startDate = dayjs(term.startDate);
                  const endDate = dayjs(term.endDate);

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
                      className="px-8"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col md:flex-row items-center h-full border-b border-primary/5 hover:bg-primary/2 transition-all group shadow-sm"
                      >
                        {/* Icon */}
                        <div className="relative shrink-0 mb-4 md:mb-0">
                          <div
                            className={cn(
                              "h-14 w-14 rounded-xl border-2 border-background flex items-center justify-center shadow-md group-hover:scale-110 transition-transform",
                              term.status === "active"
                                ? "bg-green-500/10 text-green-600"
                                : term.status === "upcoming"
                                  ? "bg-indigo-500/10 text-indigo-600"
                                  : "bg-muted text-muted-foreground",
                            )}
                          >
                            {term.status === "archived" ? (
                              <History className="h-6 w-6" />
                            ) : (
                              <Calendar className="h-6 w-6" />
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className={cn("flex-1 text-center min-w-0 w-full", isAr ? "md:mr-6 md:text-right" : "md:ml-6 md:text-left")}>
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                            <h3 className="text-lg font-black tracking-tight truncate group-hover:text-primary transition-colors">
                              {term.name}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                              <Badge
                                variant={
                                  term.status === "active"
                                    ? "default"
                                    : term.status === "upcoming"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-none"
                              >
                                {t(`status.${term.status.toLowerCase()}` as any)}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 mt-2">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Calendar className="h-3 w-3 text-primary" />
                              <span className="text-[11px] font-bold">
                                {startDate.locale(i18n.language).format("MMM D, YYYY")} —{" "}
                                {endDate.locale(i18n.language).format("MMM D, YYYY")}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="h-3 w-3 text-primary" />
                              <span className="text-[11px] font-bold uppercase tracking-tight">
                                {term.status === "active"
                                  ? t("terms.relative.ends", { time: endDate.locale(i18n.language).fromNow() })
                                  : term.status === "upcoming"
                                    ? t("terms.relative.starts", { time: startDate.locale(i18n.language).fromNow() })
                                    : t("terms.relative.completed")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className={cn("flex items-center gap-2 mt-4 md:mt-0 shrink-0", isAr ? "mr-4" : "ml-4")}>
                          {isAdmin && term.status !== "archived" && (
                            <div className="flex items-center gap-2">
                              {term.status === "upcoming" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-9 rounded-lg font-black uppercase tracking-widest text-[9px] border-green-500/20 text-green-600 bg-green-500/5 hover:bg-green-500/10 px-3"
                                  onClick={() => handleActivate(term.id)}
                                  disabled={updateMutation.isPending}
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                                  {t("buttons.activate")}
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 rounded-lg font-black uppercase tracking-widest text-[9px] border-amber-500/20 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10 px-3"
                                onClick={() => handleArchive(term.id)}
                                disabled={updateMutation.isPending}
                              >
                                <Archive className="h-3.5 w-3.5 mr-1.5" />
                                {t("buttons.archive")}
                              </Button>
                            </div>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 rounded-xl p-1"
                            >
                              <DropdownMenuLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                                {t("assignments.list.labels.options")}
                              </DropdownMenuLabel>
                              <DropdownMenuItem className="rounded-lg gap-2 py-2 cursor-pointer">
                                <Eye className="h-3.5 w-3.5 text-primary" />
                                <span className="font-bold text-xs">
                                  {t("buttons.viewClasses")}
                                </span>
                              </DropdownMenuItem>
                              {isAdmin && (
                                <>
                                  <DropdownMenuItem className="rounded-lg gap-2 py-2 cursor-pointer">
                                    <Pencil className="h-3.5 w-3.5 text-primary" />
                                    <span className="font-bold text-xs">
                                      {t("buttons.editTimeline")}
                                    </span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="my-1" />
                                  <DropdownMenuItem
                                    className="rounded-lg gap-2 py-2 cursor-pointer text-destructive focus:text-destructive"
                                    onClick={() => handleDelete(term.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span className="font-bold text-xs">
                                      {t("buttons.deleteTerm")}
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
    </div>
  );
}
