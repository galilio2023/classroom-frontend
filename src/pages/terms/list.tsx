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
  Layers,
} from "lucide-react";
import { AcademicTerm, User, UserRole } from "@/types";
import { useMemo, useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
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

  const termSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("terms.form.nameRequired")),
        startDate: z.string().min(1, t("terms.form.startRequired")),
        endDate: z.string().min(1, t("terms.form.endRequired")),
      }),
    [t],
  );

  type TermFormValues = z.infer<typeof termSchema>;

  usePageTitle(t("terms.title"));
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === UserRole.ADMIN;

  const { query } = useList<AcademicTerm>({
    resource: "academic-terms",
    pagination: { pageSize: 50, mode: "server" },
    sorters: [{ field: "startDate", order: "desc" }],
  });

  const terms = query.data?.data || [];
  const isLoading = query.isPending;

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
      window.confirm(
        t("terms.deleteDialog.title") +
          " " +
          t("terms.deleteDialog.description"),
      )
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

  const stats = useMemo(() => {
    if (!terms.length) return { total: 0, active: 0, upcoming: 0 };
    return {
      total: terms.length,
      active: terms.filter((term) => term.status === "active").length,
      upcoming: terms.filter((term) => term.status === "upcoming").length,
    };
  }, [terms]);

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
                  <Calendar className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                {t("terms.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                {t("terms.description")}
              </p>
            </div>
          </div>
          <div className="w-full md:w-auto">
            {isAdmin && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/25 hover:-translate-y-0.5 transition-all"
                  >
                    <PlusCircle className="h-5 w-5" />
                    {t("terms.create")}
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-lg p-0 overflow-hidden text-start">
                  <div className="p-8 md:p-12 space-y-8">
                    <DialogHeader className="space-y-4 text-start">
                      <div className="p-5 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
                        <Calendar className="h-10 w-10" />
                      </div>
                      <div className="space-y-2 text-center">
                        <DialogTitle className="text-3xl font-black tracking-tight">
                          {t("terms.newTitle")}
                        </DialogTitle>
                        <DialogDescription className="font-medium text-base text-muted-foreground">
                          {t("terms.newDesc")}
                        </DialogDescription>
                      </div>
                    </DialogHeader>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-8"
                    >
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2">
                          {t("terms.form.name")}
                        </Label>
                        <Input
                          placeholder={t("terms.form.namePlaceholder")}
                          {...form.register("name")}
                          className="h-16 rounded-3xl bg-muted/30 border-none shadow-inner px-8 text-lg font-black"
                        />
                        {form.formState.errors.name && (
                          <p className="text-xs font-bold text-destructive ms-2">
                            {form.formState.errors.name.message}
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2">
                            {t("terms.form.start")}
                          </Label>
                          <Input
                            type="date"
                            {...form.register("startDate")}
                            className="h-16 rounded-3xl bg-muted/30 border-none shadow-inner px-8 font-bold"
                          />
                          {form.formState.errors.startDate && (
                            <p className="text-xs font-bold text-destructive ms-2">
                              {form.formState.errors.startDate.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2">
                            {t("terms.form.end")}
                          </Label>
                          <Input
                            type="date"
                            {...form.register("endDate")}
                            className="h-16 rounded-3xl bg-muted/30 border-none shadow-inner px-8 font-bold"
                          />
                          {form.formState.errors.endDate && (
                            <p className="text-xs font-bold text-destructive ms-2">
                              {form.formState.errors.endDate.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <DialogFooter className="flex-col sm:flex-row gap-3 pt-4">
                        <Button
                          variant="ghost"
                          type="button"
                          className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8 order-2 sm:order-1"
                          onClick={() => setIsCreateOpen(false)}
                        >
                          {t("buttons.cancel")}
                        </Button>
                        <Button
                          type="submit"
                          size="lg"
                          className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 shadow-xl shadow-primary/20 order-1 sm:order-2"
                          disabled={createMutation.isPending}
                        >
                          {createMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin me-3" />
                          ) : (
                            <PlusCircle className="h-5 w-5 me-3" />
                          )}
                          {t("buttons.create")}
                        </Button>
                      </DialogFooter>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </motion.div>

        {/* Stats Row - Adaptive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
              <Calendar className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("terms.stats.total")}
              </p>
              <p className="text-2xl md:text-3xl font-black">
                {isLoading
                  ? "..."
                  : new Intl.NumberFormat(i18n.language).format(stats.total)}
              </p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-green-500/10 text-green-600">
              <Activity className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("terms.stats.active")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-green-600">
                {isLoading
                  ? "..."
                  : new Intl.NumberFormat(i18n.language).format(stats.active)}
              </p>
            </div>
          </Card>
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-600">
              <Clock className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("terms.stats.upcoming")}
              </p>
              <p className="text-2xl md:text-3xl font-black text-indigo-600">
                {isLoading
                  ? "..."
                  : new Intl.NumberFormat(i18n.language).format(stats.upcoming)}
              </p>
            </div>
          </Card>
        </div>

        {/* List Container - Global Scroll */}
        <div className="relative min-h-100">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card
                  key={i}
                  className="p-6 flex flex-col md:flex-row items-center gap-6 border-border/20 bg-background/50"
                >
                  <Skeleton className="h-20 w-20 rounded-3xl shrink-0" />
                  <div className="flex-1 space-y-4 w-full">
                    <Skeleton className="h-8 w-87.5 max-w-full" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-36 rounded-2xl" />
                </Card>
              ))}
            </div>
          ) : terms.length === 0 ? (
            <div className="flex items-center justify-center p-16 bg-card/20 rounded-[2.5rem] border border-dashed border-border/40">
              <EmptyState
                icon={Layers}
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
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {terms.map((term, index) => {
                  const startDate = dayjs(term.startDate);
                  const endDate = dayjs(term.endDate);

                  return (
                    <motion.div
                      key={term.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative flex flex-col md:flex-row items-center p-5 md:p-6 rounded-4xl bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer",
                      )}
                    >
                      {/* Status Color Accent using logical properties */}
                      <div
                        className={cn(
                          "absolute start-0 top-1/2 -translate-y-1/2 w-1.5 h-12 rounded-e-full transition-all group-hover:h-20",
                          term.status === "active"
                            ? "bg-green-500"
                            : term.status === "upcoming"
                              ? "bg-indigo-500"
                              : "bg-muted-foreground/40",
                        )}
                      />

                      {/* Icon */}
                      <div className="relative shrink-0 mb-4 md:mb-0">
                        <div
                          className={cn(
                            "h-20 w-20 rounded-[1.5rem] border-4 border-background flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-500",
                            term.status === "active"
                              ? "bg-green-500/10 text-green-600"
                              : term.status === "upcoming"
                                ? "bg-indigo-500/10 text-indigo-600"
                                : "bg-muted/40 text-muted-foreground/60",
                          )}
                        >
                          {term.status === "archived" ? (
                            <History className="h-8 w-8" />
                          ) : (
                            <Calendar className="h-8 w-8" />
                          )}
                        </div>
                      </div>

                      {/* Info Area */}
                      <div
                        className={cn(
                          "flex-1 min-w-0 w-full text-start",
                          "md:ms-8",
                        )}
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                          <h3 className="text-xl md:text-2xl font-black tracking-tight truncate group-hover:text-primary transition-colors leading-tight">
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
                              className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border-none shadow-sm"
                            >
                              {t(`status.${term.status.toLowerCase()}` as any)}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-4">
                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Duration
                              </span>
                              <span className="text-[11px] font-black text-foreground">
                                {startDate
                                  .locale(i18n.language)
                                  .format("MMM D, YYYY")}{" "}
                                —{" "}
                                {endDate
                                  .locale(i18n.language)
                                  .format("MMM D, YYYY")}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 bg-background/40 px-3 py-1.5 rounded-full border border-border/20 shadow-sm">
                            <div className="p-1.5 rounded-lg bg-primary/5 shrink-0">
                              <Clock className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <div className="flex flex-col text-start">
                              <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                                Timeline
                              </span>
                              <span className="text-[11px] font-black uppercase tracking-tight">
                                {term.status === "active"
                                  ? t("terms.relative.ends", {
                                      time: endDate
                                        .locale(i18n.language)
                                        .fromNow(),
                                    })
                                  : term.status === "upcoming"
                                    ? t("terms.relative.starts", {
                                        time: startDate
                                          .locale(i18n.language)
                                          .fromNow(),
                                      })
                                    : t("terms.relative.completed")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Area */}
                      <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                        {isAdmin && term.status !== "archived" && (
                          <div
                            className={cn(
                              "hidden lg:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0",
                              "ltr:translate-x-4 rtl:-translate-x-4",
                            )}
                          >
                            {term.status === "upcoming" && (
                              <Button
                                variant="outline"
                                size="lg"
                                className="rounded-2xl px-6 h-12 font-black uppercase tracking-widest text-[10px] border-green-500/20 text-green-600 bg-green-500/5 hover:bg-green-500/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleActivate(term.id);
                                }}
                                disabled={updateMutation.isPending}
                              >
                                <CheckCircle
                                  className={cn("h-4 w-4", "me-2")}
                                />
                                {t("buttons.activate")}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="lg"
                              className="rounded-2xl px-6 h-12 font-black uppercase tracking-widest text-[10px] border-amber-500/20 text-amber-600 bg-amber-500/5 hover:bg-amber-500/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchive(term.id);
                              }}
                              disabled={updateMutation.isPending}
                            >
                              <Archive className={cn("h-4 w-4", "me-2")} />
                              {t("buttons.archive")}
                            </Button>
                          </div>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-12 w-12 rounded-2xl bg-muted/30 hover:bg-muted/50"
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
                            <DropdownMenuItem className="rounded-xl gap-3 py-3 cursor-pointer">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Eye className="h-4 w-4" />
                              </div>
                              <span className="font-bold text-xs">
                                {t("buttons.viewClasses")}
                              </span>
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem className="rounded-xl gap-3 py-3 cursor-pointer">
                                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Pencil className="h-4 w-4" />
                                  </div>
                                  <span className="font-bold text-xs">
                                    {t("buttons.editTimeline")}
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="my-2 opacity-50" />
                                <DropdownMenuItem
                                  className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:bg-destructive/10"
                                  onClick={() => handleDelete(term.id)}
                                >
                                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </div>
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
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </ListView>
  );
}
