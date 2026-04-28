import { useCreate, useDelete, useGetIdentity, useList, useUpdate } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Activity,
  Archive,
  Calendar,
  CheckCircle,
  Clock,
  History,
  Loader2,
  MoreHorizontal,
  Pencil,
  PlusCircle,
  Trash2,
  Layers,
  TrendingUp,
} from "lucide-react";
import { AcademicYear, User, UserRole } from "@/types";
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
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import { ListView } from "@/components/refine/views/list-view";
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
import { handleError } from "@/providers/utils/api-errors";

dayjs.extend(relativeTime);

export default function AcademicYearsList() {
  const { t, i18n } = useTranslation();

  const yearSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("years.form.nameRequired")),
        startDate: z.string().min(1, t("years.form.startRequired")),
        endDate: z.string().min(1, t("years.form.endRequired")),
      }),
    [t]
  );

  type YearFormValues = z.infer<typeof yearSchema>;

  usePageTitle(t("years.title"));
  const { data: identity } = useGetIdentity<User>();
  const isAdmin = identity?.role === UserRole.ADMIN;

  const { query } = useList<AcademicYear>({
    resource: "academic-years",
    pagination: { pageSize: 50, mode: "server" },
    sorters: [{ field: "startDate", order: "desc" }],
  });

  const years = query.data?.data || [];
  const isLoading = query.isPending;

  const { mutate: update, mutation: updateMutation } = useUpdate();
  const { mutate: create, mutation: createMutation } = useCreate();
  const { mutate: deleteMutation } = useDelete();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<YearFormValues>({
    resolver: zodResolver(yearSchema),
  });

  const handleActivate = (id: number) => {
    update(
      {
        resource: "academic-years",
        id,
        values: { status: "active" },
      },
      {
        onSuccess: () => toast.success(t("years.toasts.updated")),
        onError: async (err) => {
          const httpError = await handleError(err);
          toast.error(httpError.message, {
            description: t("errors.trace_id", {
              defaultValue: `Trace ID: ${httpError.meta?.correlationId || "N/A"}`,
              id: httpError.meta?.correlationId,
            }),
          });
        },
      }
    );
  };

  const handleDelete = (id: number) => {
    if (window.confirm(t("common.deleteConfirm" as any))) {
      deleteMutation(
        {
          resource: "academic-years",
          id,
        },
        {
          onSuccess: () => toast.success(t("years.toasts.deleted")),
          onError: async (err) => {
            const httpError = await handleError(err);
            toast.error(httpError.message, {
              description: t("errors.trace_id", {
                defaultValue: `Trace ID: ${httpError.meta?.correlationId || "N/A"}`,
                id: httpError.meta?.correlationId,
              }),
            });
          },
        }
      );
    }
  };

  const onSubmit = (values: YearFormValues) => {
    create(
      {
        resource: "academic-years",
        values: {
          ...values,
          status: "active",
        },
      },
      {
        onSuccess: () => {
          toast.success(t("years.toasts.created"));
          setIsCreateOpen(false);
          form.reset();
        },
        onError: async (err) => {
          const httpError = await handleError(err);
          toast.error(httpError.message, {
            description: t("errors.trace_id", {
              defaultValue: `Trace ID: ${httpError.meta?.correlationId || "N/A"}`,
              id: httpError.meta?.correlationId,
            }),
          });
        },
      }
    );
  };

  const stats = {
    total: years.length,
    active: years.filter((y) => y.status === "active").length,
    upcoming: years.filter((y) => dayjs(y.startDate).isAfter(dayjs())).length,
  };

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
                  <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                {t("years.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-2xl text-balance">
                {t("years.description")}
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
                    {t("years.create")}
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
                          {t("years.newTitle")}
                        </DialogTitle>
                        <DialogDescription className="font-medium text-base text-muted-foreground">
                          {t("years.newDesc")}
                        </DialogDescription>
                      </div>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2">
                          {t("years.form.name")}
                        </Label>
                        <Input
                          placeholder={t("years.form.namePlaceholder")}
                          {...form.register("name")}
                          className="h-16 rounded-3xl bg-muted/30 border-none shadow-inner px-8 text-lg font-black"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2">
                            {t("years.form.start")}
                          </Label>
                          <Input
                            type="date"
                            {...form.register("startDate")}
                            className="h-16 rounded-3xl bg-muted/30 border-none shadow-inner px-8 font-bold"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2">
                            {t("years.form.end")}
                          </Label>
                          <Input
                            type="date"
                            {...form.register("endDate")}
                            className="h-16 rounded-3xl bg-muted/30 border-none shadow-inner px-8 font-bold"
                          />
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

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
            <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
              <Calendar className="h-6 w-6 md:h-7 md:w-7" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
                {t("years.stats.total")}
              </p>
              <p className="text-2xl md:text-3xl font-black">{isLoading ? "..." : stats.total}</p>
            </div>
          </Card>
          {/* Add more stats if needed */}
        </div>

        <div className="relative min-h-100">
          {isLoading ? (
            <div className="space-y-4 text-start">
              <Skeleton className="h-32 w-full rounded-4xl" />
              <Skeleton className="h-32 w-full rounded-4xl" />
            </div>
          ) : years.length === 0 ? (
            <div className="flex items-center justify-center p-16 bg-card/20 rounded-[2.5rem] border border-dashed border-border/40">
              <EmptyState
                icon={TrendingUp}
                title={t("years.empty.title")}
                description={t("years.empty.desc")}
                className="border-none bg-transparent min-h-0"
                action={
                  isAdmin
                    ? {
                        label: t("years.create"),
                        onClick: () => setIsCreateOpen(true),
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {years.map((year, index) => (
                  <motion.div
                    key={year.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative flex flex-col md:flex-row items-center p-5 md:p-6 rounded-4xl bg-card/50 backdrop-blur-sm border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm"
                  >
                    <div className="flex-1 text-start md:ms-8">
                      <h3 className="text-xl md:text-2xl font-black tracking-tight">{year.name}</h3>
                      <div className="flex gap-4 mt-2 text-sm font-medium text-muted-foreground">
                        <span>{dayjs(year.startDate).format("MMM D, YYYY")}</span>
                        <span>—</span>
                        <span>{dayjs(year.endDate).format("MMM D, YYYY")}</span>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-2xl"
                          onClick={() => handleDelete(year.id as number)}
                        >
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </ListView>
  );
}
