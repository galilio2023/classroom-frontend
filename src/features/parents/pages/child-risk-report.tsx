import { useList, useOne } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  History,
  Info,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const ChildRiskReport = () => {
  const { id: studentId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { query } = useList({
    resource: `child-risk-reports/${studentId}/risk-assessment`,
  });

  const { data, isLoading } = query;
  const reports = data?.data || [];

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Analyzing Academic Profile...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-start pb-20">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 -ms-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Family Dashboard
      </Button>

      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight uppercase">Academic Risk Reports</h1>
        <p className="text-muted-foreground font-medium">
          Detailed AI analysis of potential performance dips and suggested interventions.
        </p>
      </div>

      <div className="grid gap-8">
        {reports.length > 0 ? (
          reports.map((report: any) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-muted/30 border-b p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] font-black uppercase tracking-widest mb-2 border-primary/20 text-primary"
                      >
                        {report.class?.subject?.name}
                      </Badge>
                      <CardTitle className="text-2xl font-black">{report.class?.name}</CardTitle>
                    </div>
                    <Badge
                      className={cn(
                        "px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs h-fit self-start md:self-center",
                        report.riskLevel === "low"
                          ? "bg-success text-white"
                          : report.riskLevel === "medium"
                            ? "bg-amber-500 text-white"
                            : "bg-destructive text-white shadow-lg shadow-destructive/20 animate-pulse"
                      )}
                    >
                      {t(`guardian.risk.${report.riskLevel}` as any)} Risk
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {/* Summary */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
                      <BrainCircuit className="h-4 w-4" />
                      AI Diagnosis
                    </div>
                    <p className="text-lg font-medium leading-relaxed italic text-foreground/80">
                      "{report.aiAnalysis?.summary || "No automated summary available."}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Factors */}
                    <div className="space-y-4 p-6 rounded-3xl bg-destructive/5 border border-destructive/10">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-destructive/70">
                        <AlertTriangle className="h-4 w-4" />
                        Risk Factors
                      </div>
                      <ul className="space-y-3">
                        {report.riskFactors?.map((f: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-xs font-bold">
                            <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvement Plan */}
                    <div className="space-y-4 p-6 rounded-3xl bg-success/5 border border-success/10">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-success/70">
                        <CheckCircle2 className="h-4 w-4" />
                        Action Plan
                      </div>
                      <ul className="space-y-3">
                        {report.aiAnalysis?.improvementPlan?.map((p: string, i: number) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-xs font-bold text-success/80"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-success" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Suggested Resources */}
                  {report.suggestedResources?.length > 0 && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        <Info className="h-4 w-4" />
                        Recommended Support Materials
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {report.suggestedResources.map((res: any, i: number) => (
                          <a
                            key={i}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border hover:bg-primary/5 hover:border-primary/20 transition-all group"
                          >
                            <span className="text-[10px] font-black uppercase tracking-tight">
                              {res.title}
                            </span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="p-20 rounded-[3rem] bg-muted/20 border-2 border-dashed flex flex-col items-center justify-center text-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-success opacity-20" />
            <div className="space-y-1">
              <h3 className="font-black uppercase tracking-widest text-sm">No Risk Detected</h3>
              <p className="text-xs font-medium text-muted-foreground max-w-xs">
                Your child is currently performing at or above academic expectations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
