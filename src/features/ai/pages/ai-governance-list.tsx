import React, { useMemo, useState } from "react";
import { HttpError } from "@refinedev/core";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { useCustomMutation } from "@refinedev/core";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { SparkleLoader } from "@/components/ai/sparkle-loader";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Activity,
  Heart,
  AlertTriangle,
  Calendar,
  ChevronRight,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import usePageTitle from "@/hooks/use-page-title";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SystemHealthReport } from "../types";

const AIGovernanceList = () => {
  const { t, i18n } = useTranslation();
  const {
    coreData,
    navigation: { refetchCore },
  } = useDashboard();
  const { mutate: mutateSettings } = useCustomMutation();

  usePageTitle(t("aiHub.governance.title"));
  const isAr = i18n.language === "ar";
  const [selectedReport, setSelectedReport] = useState<SystemHealthReport | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  // --- ADMIN HANDLERS ---
  const handleToggleAi = (val: boolean) => {
    setIsMutating(true);
    mutateSettings(
      {
        url: "/settings/global-settings",
        method: "patch",
        values: { enableAiFeatures: val },
        successNotification: () => ({
          type: "success",
          message: t("settings.toasts.success"),
          description: val ? "AI Services Online" : "AI Services Suspended",
        }),
      },
      {
        onSettled: () => {
          setIsMutating(false);
          void refetchCore();
        },
      }
    );
  };

  const handleToggleDryRun = (val: boolean) => {
    setIsMutating(true);
    mutateSettings(
      {
        url: "/settings/global-settings",
        method: "patch",
        values: { isDryRun: val },
        successNotification: () => ({
          type: "success",
          message: t("settings.toasts.success"),
          description: val ? "Mock Mode Active" : "Live API Active",
        }),
      },
      {
        onSettled: () => {
          setIsMutating(false);
          void refetchCore();
        },
      }
    );
  };

  const handleResetCircuit = () => {
    setIsMutating(true);
    mutateSettings(
      {
        url: "/settings/global-settings",
        method: "patch",
        values: { errorCount: 0, lastErrorAt: null, enableAiFeatures: true },
        successNotification: () => ({
          type: "success",
          message: "Circuit Breaker Reset",
          description: "System recovered. Error counts cleared.",
        }),
      },
      {
        onSettled: () => {
          setIsMutating(false);
          void refetchCore();
        },
      }
    );
  };

  const columns = useMemo<ColumnDef<SystemHealthReport>[]>(
    () => [
      {
        accessorKey: "reportDate",
        header: () => (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("common.date")}
          </p>
        ),
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 font-bold text-xs">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground/40" />
            {dayjs(getValue<string>()).format("MMM DD, YYYY")}
          </div>
        ),
      },
      {
        accessorKey: "severity",
        header: () => (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("aiHub.governance.severity")}
          </p>
        ),
        cell: ({ getValue }) => {
          const severity = getValue<string>();
          return (
            <Badge
              className={cn(
                "h-6 px-2 text-[9px] font-black uppercase tracking-tighter border-none",
                severity === "critical"
                  ? "bg-destructive text-destructive-foreground"
                  : severity === "warning"
                    ? "bg-orange-500 text-white"
                    : "bg-blue-500 text-white"
              )}
            >
              {severity}
            </Badge>
          );
        },
      },
      {
        id: "happiness",
        header: () => (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("aiHub.governance.happinessScore")}
          </p>
        ),
        cell: ({ row }) => {
          const score = row.original.metadata?.happinessScore;
          // If score is null or undefined, we show a neutral gray badge instead of assuming 100%
          const hasData = score !== undefined && score !== null;

          return (
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "border-none shadow-sm gap-1.5 h-7 px-3",
                  !hasData
                    ? "bg-muted text-muted-foreground"
                    : score > 80
                      ? "bg-green-500/10 text-green-600"
                      : "bg-orange-500/10 text-orange-600"
                )}
              >
                <Heart className={cn("h-3 w-3", hasData && score > 80 && "fill-green-600")} />
                {hasData ? `${score}%` : "---"}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "statusCount",
        header: () => (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("aiHub.governance.techFailures")}
          </p>
        ),
        cell: ({ getValue }) => {
          const count = getValue<number>();
          return (
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  "h-7 px-3 border-border/40 font-bold",
                  count > 0 ? "text-destructive border-destructive/20" : "text-muted-foreground"
                )}
              >
                {count} {t("common.cases", { count })}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: "diagnosis",
        header: () => (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("aiHub.governance.aiDiagnosis")}
          </p>
        ),
        cell: ({ getValue }) => (
          <p className="text-xs font-medium leading-relaxed max-w-md line-clamp-2 text-muted-foreground group-hover:text-foreground transition-colors">
            {getValue<string>()}
          </p>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: () => (
          <div className="flex justify-end">
            <div className="p-2 rounded-full bg-muted/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all">
              <ChevronRight className={cn("h-4 w-4", isAr && "rotate-180")} />
            </div>
          </div>
        ),
      },
    ],
    [t, isAr]
  );

  const table = useTable<SystemHealthReport, HttpError>({
    columns,
    refineCoreProps: {
      resource: "ai-health-reports",
      syncWithLocation: false,
    },
  });

  const {
    refineCore: { tableQuery },
  } = table;

  const isLoading = tableQuery?.isLoading;

  return (
    <div className="space-y-10 md:space-y-16 pb-20 max-w-7xl mx-auto px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 text-start"
      >
        <Breadcrumb />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 lg:p-4 rounded-2xl lg:rounded-3xl bg-ai-primary/10 text-ai-primary border border-ai-primary/5 shadow-sm">
              <BrainCircuit className="h-6 w-6 lg:h-8 lg:w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-balance">
                {t("aiHub.governance.title")}
              </h1>
              <p className="text-muted-foreground font-medium max-w-xl text-balance mt-1">
                {t("aiHub.governance.description")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="h-12 px-6 rounded-2xl border-ai-primary/20 text-ai-primary font-black uppercase tracking-widest text-[10px] gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              {t("aiHub.governance.integrityActive")}
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Control Center */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="rounded-4xl border-border/40 shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">{t("settings.form.title")}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/30 border border-border/20">
                    <div className="space-y-1">
                      <Label className="font-black text-sm">
                        {t("settings.form.enableAiFeatures.label")}
                      </Label>
                      <p className="text-[10px] text-muted-foreground font-medium max-w-[200px]">
                        {t("settings.form.enableAiFeatures.description")}
                      </p>
                    </div>
                    <Switch
                      checked={coreData?.globalConfig?.enableAiFeatures !== false}
                      onCheckedChange={handleToggleAi}
                      disabled={isMutating}
                    />
                  </div>

                  <div className="flex items-center justify-between p-6 rounded-2xl bg-muted/30 border border-border/20">
                    <div className="space-y-1">
                      <Label className="font-black text-sm text-orange-600 flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {t("aiHub.assistant.mockMode")}
                      </Label>
                      <p className="text-[10px] text-muted-foreground font-medium max-w-[200px]">
                        {t("aiHub.assistant.mockModeDesc")}
                      </p>
                    </div>
                    <Switch
                      checked={coreData?.globalConfig?.isDryRun === true}
                      onCheckedChange={handleToggleDryRun}
                      disabled={isMutating}
                    />
                  </div>
                </div>
              </div>

              <div className="lg:ps-10 lg:border-l border-border/40 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
                  Emergency Actions
                </p>
                <Button
                  variant="destructive"
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 shadow-lg shadow-destructive/20"
                  onClick={handleResetCircuit}
                  disabled={isMutating}
                >
                  <BrainCircuit className="h-4 w-4" />
                  Reset Circuit Breaker
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-2xl font-bold text-xs gap-2 border-border/40"
                  onClick={() => void tableQuery?.refetch()}
                  disabled={isMutating || isLoading}
                >
                  <Activity className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  Force Audit Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative"
      >
        <div className="rounded-4xl md:rounded-[2.5rem] border border-border/40 shadow-3xl shadow-black/5 overflow-hidden bg-card/50 backdrop-blur-3xl group min-h-[400px]">
          <div className="p-8 md:p-10 border-b border-border/40 bg-muted/20 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                <Activity className="h-4 w-4 text-ai-primary" />
                {t("aiHub.governance.evolutionHistory")}
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                {t("aiHub.governance.evolutionDesc")}
              </p>
            </div>
          </div>

          <div className="p-0 overflow-x-auto relative min-h-[300px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card/40 backdrop-blur-sm"
                >
                  <SparkleLoader message={t("aiHub.governance.auditingSystems")} />
                </motion.div>
              ) : (
                <motion.div
                  key="table"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <DataTable table={table} onRowClick={(row) => setSelectedReport(row)} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Evolutionary Safeguards Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="p-8 rounded-4xl bg-ai-primary/5 border border-ai-primary/10 space-y-4">
          <div className="flex items-center gap-3 text-ai-primary">
            <Sparkles className="h-5 w-5" />
            <h4 className="font-black uppercase tracking-widest text-xs">
              {t("aiHub.governance.selfHealingTitle")}
            </h4>
          </div>
          <p className="text-xs font-medium leading-relaxed text-muted-foreground">
            {t("aiHub.governance.selfHealingDesc")}
          </p>
        </div>
        <div className="p-8 rounded-4xl bg-primary/5 border border-primary/10 space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <Activity className="h-5 w-5" />
            <h4 className="font-black uppercase tracking-widest text-xs">
              {t("aiHub.governance.recursiveTitle")}
            </h4>
          </div>
          <p className="text-xs font-medium leading-relaxed text-muted-foreground">
            {t("aiHub.governance.recursiveDesc")}
          </p>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
        <DialogContent className="max-w-3xl rounded-4xl md:rounded-[3rem] border-none shadow-3xl bg-card/80 backdrop-blur-3xl p-0 overflow-hidden">
          {selectedReport && (
            <div className="flex flex-col h-full max-h-[85vh]">
              <div className="p-8 md:p-12 bg-ai-primary/5 border-b border-border/40 relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-2xl bg-ai-primary text-white shadow-lg shadow-ai-primary/20">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight">
                      {t("aiHub.governance.auditReport")}
                    </DialogTitle>
                    <DialogDescription className="font-bold text-ai-primary/60 uppercase tracking-widest text-[10px]">
                      {dayjs(selectedReport.reportDate).format("MMMM DD, YYYY")}
                    </DialogDescription>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-border/40">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                      {t("aiHub.governance.happinessScore")}
                    </p>
                    <p className="text-2xl font-black text-ai-primary">
                      {selectedReport.metadata.happinessScore}%
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-border/40">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                      {t("aiHub.governance.techFailures")}
                    </p>
                    <p className="text-2xl font-black text-destructive">
                      {selectedReport.statusCount}
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-border/40">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                      {t("aiHub.governance.userFeedback")}
                    </p>
                    <p className="text-2xl font-black text-blue-600">
                      {selectedReport.feedbackCount}
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-8 md:p-12">
                <div className="space-y-10">
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
                      <MessageSquare className="h-4 w-4 text-ai-primary" />
                      {t("aiHub.governance.aiDiagnosis")}
                    </h4>
                    <div className="p-6 rounded-3xl bg-muted/30 border border-border/20">
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
                        {selectedReport.diagnosis}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pb-8">
                    <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
                      <Wrench className="h-4 w-4 text-ai-primary" />
                      {t("aiHub.governance.suggestedFixes")}
                    </h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedReport.suggestedFixes.map((fix, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-4 rounded-2xl bg-ai-primary/5 border border-ai-primary/10"
                        >
                          <div className="h-5 w-5 rounded-full bg-ai-primary/20 text-ai-primary flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-black">{idx + 1}</span>
                          </div>
                          <p className="text-xs font-bold leading-relaxed">{fix}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIGovernanceList;
