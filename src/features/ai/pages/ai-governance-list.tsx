import React, { useMemo } from "react";
import { ListResponse } from "@/types";
import { HttpError } from "@refinedev/core";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Activity, 
  Heart, 
  AlertTriangle, 
  Calendar, 
  ChevronRight, 
  ShieldCheck,
  BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import usePageTitle from "@/hooks/use-page-title";

interface SystemHealthReport {
  id: number;
  reportDate: string;
  statusCount: number;
  feedbackCount: number;
  diagnosis: string;
  suggestedFixes: string[];
  metadata: {
    happinessScore: number;
    posCount: number;
    negCount: number;
  };
}

const AIGovernanceList = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("aiHub.governance.title"));
  const isAr = i18n.language === "ar";

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
        id: "happiness",
        header: () => (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("aiHub.governance.happinessScore")}
          </p>
        ),
        cell: ({ row }) => {
          const score = row.original.metadata?.happinessScore || 100;
          return (
            <div className="flex items-center gap-2">
                <Badge className={cn(
                    "border-none shadow-sm gap-1.5 h-7 px-3",
                    score > 80 ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"
                )}>
                    <Heart className={cn("h-3 w-3", score > 80 && "fill-green-600")} />
                    {score}%
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
                    <Badge variant="outline" className={cn(
                        "h-7 px-3 border-border/40 font-bold",
                        count > 0 ? "text-destructive border-destructive/20" : "text-muted-foreground"
                    )}>
                        {count} {count === 1 ? t("common.cases").slice(0, -1) : t("common.cases")}
                    </Badge>
                </div>
            )
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
        )
      }
    ],
    [t, isAr],
  );

  const table = useTable<SystemHealthReport, HttpError>({
    columns,
    refineCoreProps: {
      resource: "ai-health-reports",
      syncWithLocation: false,
    },
  });

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
                <Badge variant="outline" className="h-12 px-6 rounded-2xl border-ai-primary/20 text-ai-primary font-black uppercase tracking-widest text-[10px] gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    {t("aiHub.governance.integrityActive")}
                </Badge>
            </div>
        </div>
      </motion.div>

      {/* Main Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="rounded-4xl md:rounded-[2.5rem] border border-border/40 shadow-3xl shadow-black/5 overflow-hidden bg-card/50 backdrop-blur-3xl group">
            <div className="p-8 md:p-10 border-b border-border/40 bg-muted/20 flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                        <Activity className="h-4 w-4 text-ai-primary" />
                        {t("aiHub.governance.evolutionHistory")}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium">{t("aiHub.governance.evolutionDesc")}</p>
                </div>
            </div>
            <div className="p-0 overflow-x-auto relative">
                <DataTable table={table} />
            </div>
        </div>
      </motion.div>

      {/* Evolutionary Safeguards Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="p-8 rounded-[2rem] bg-ai-primary/5 border border-ai-primary/10 space-y-4">
              <div className="flex items-center gap-3 text-ai-primary">
                  <Sparkles className="h-5 w-5" />
                  <h4 className="font-black uppercase tracking-widest text-xs">{t("aiHub.governance.selfHealingTitle")}</h4>
              </div>
              <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                  {t("aiHub.governance.selfHealingDesc")}
              </p>
          </div>
          <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 space-y-4">
              <div className="flex items-center gap-3 text-primary">
                  <Activity className="h-5 w-5" />
                  <h4 className="font-black uppercase tracking-widest text-xs">{t("aiHub.governance.recursiveTitle")}</h4>
              </div>
              <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                  {t("aiHub.governance.recursiveDesc")}
              </p>
          </div>
      </div>
    </div>
  );
};

export default AIGovernanceList;
