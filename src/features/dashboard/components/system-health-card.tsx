import React from "react";
import { useCustom } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, ShieldCheck, Activity, AlertTriangle, ArrowRight, Loader2, Heart, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export const SystemHealthCard: React.FC = () => {
  const { t } = useTranslation();

  const { data: result, isLoading } = useCustom<any>({
    url: "/ai/health-report",
    method: "get",
  }) as any;

  const report = result?.data;

  if (isLoading) {
    return (
      <Card className="h-full border-none shadow-none bg-muted/20 flex items-center justify-center min-h-[200px] rounded-3xl">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
      </Card>
    );
  }

  if (!report) return null;

  const happinessScore = report.metadata?.happinessScore || 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full"
    >
      <Card className="ai-card-premium h-full overflow-hidden border-2 border-transparent hover:border-ai-primary/20 transition-all duration-500 shadow-xl group">
        <div className="ai-glow" />
        <CardHeader className="p-6 pb-2 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary border border-ai-primary/10">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-ai-primary">
                {t("aiHub.governance.title")}
              </CardTitle>
            </div>
            <Badge className={cn(
                "border-none shadow-sm gap-1.5",
                happinessScore > 80 ? "bg-green-500/10 text-green-600" : "bg-orange-500/10 text-orange-600"
            )}>
                <Heart className={cn("h-3 w-3", happinessScore > 80 && "fill-green-600")} />
                {happinessScore}% {t("common.happy")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-4 space-y-6 relative z-10 text-start">
          <div className="space-y-2">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-3 w-3" />
                {t("aiHub.governance.aiDiagnosis")}
            </Label>
            <p className="text-sm font-bold leading-relaxed tracking-tight line-clamp-3">
              {report.diagnosis}
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                {t("dashboard.staff.atRiskStudents.plan")}
            </Label>
            <div className="grid gap-2">
              {report.suggestedFixes?.slice(0, 2).map((fix: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-ai-primary/[0.03] border border-ai-primary/5 group-hover:bg-ai-primary/[0.06] transition-colors">
                  <div className="h-1.5 w-1.5 rounded-full bg-ai-primary shrink-0" />
                  <span className="text-xs font-medium truncate">{fix}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border flex items-center", className)}>
        {children}
    </div>
);

const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span className={cn("block", className)}>
        {children}
    </span>
);
