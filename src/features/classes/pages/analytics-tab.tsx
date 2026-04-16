import { useCustom } from "@refinedev/core";
import { GradeDistributionChart } from "@/features/dashboard/components/grade-distribution-chart";
import { AtRiskStudents } from "@/features/dashboard/components/at-risk-students";
import { FrictionPointsCard } from "../components/friction-points-card";
import { AssignmentCompletionChart } from "@/features/dashboard/components/assignment-completion-chart";
import { SubmissionTimingHeatmap } from "@/features/dashboard/components/submission-timing-heatmap";
import { StudentTrajectoryCard } from "@/features/dashboard/components/student-trajectory-card";
import { ClassComparisonTable } from "@/features/dashboard/components/class-comparison-table";
import {
  Loader2,
  FileDown,
  Printer,
  Calendar,
  BarChart3,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";

import {
  GradeDistribution,
  AssignmentCompletionTrend,
  SubmissionTiming,
  AtRiskStudent,
  ClassComparison,
} from "@/types";

interface AnalyticsTabProps {
  classId: string;
}

interface StudentTrajectory {
  studentId: string;
  studentName: string;
  currentGrade: number;
  predictedGrade: number;
  trend: { date: string; grade: number }[];
}

interface ClassAnalytics {
  gradeDistribution: GradeDistribution[];
  assignmentCompletionTrend: AssignmentCompletionTrend[];
  submissionTiming: SubmissionTiming[];
  atRiskStudents: AtRiskStudent[];
  classComparison: ClassComparison[];
  studentTrajectories: StudentTrajectory[];
}

export const AnalyticsTab = ({ classId }: AnalyticsTabProps) => {
  const { t, i18n } = useTranslation();
  const { coreData } = useDashboard();
  const [dateRange, setDateRange] = useState("30");

  const isAiEnabled = coreData?.globalConfig?.enableAiFeatures !== false;

  const { result, query } = useCustom<ClassAnalytics>({
    url: `/classes/${classId}/analytics`,
    method: "get",
    config: {
      query: {
        range: dateRange,
      },
    },
  });

  const analytics = result?.data;
  const isLoading = query?.isLoading;
  const isError = query?.isError;

  const { result: frictionResult, query: frictionQuery } = useCustom<any[]>({
    url: `/stats/curriculum-friction/${classId}`,
    method: "get",
  });

  const handleExportPDF = () => {
    window.print();
    toast.success(t("analytics.toast.preparingPrint"));
  };

  const isAr = i18n.language === "ar";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
          {t("analytics.analyzing")}
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black tracking-tight">{t("analytics.failedToLoad")}</h3>
          <p className="text-sm text-muted-foreground font-medium">
            {t("analytics.failedToLoadDescription")}
          </p>
        </div>
        <Button variant="outline" onClick={() => query?.refetch()} className="mt-4">
          {t("buttons.tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 print:space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div className="space-y-1 text-start">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">{t("analytics.title")}</h2>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{t("analytics.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-45 h-11 rounded-xl bg-card/50 backdrop-blur-xl border-black/5 dark:border-white/5 shadow-sm font-bold">
              <Calendar className={cn("h-4 w-4 text-primary/60", "me-2")} />
              <SelectValue placeholder={t("analytics.selectRange")} />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-2xl">
              <SelectItem value="7" className="rounded-lg font-bold text-start">
                {t("analytics.ranges.7")}
              </SelectItem>
              <SelectItem value="30" className="rounded-lg font-bold text-start">
                {t("analytics.ranges.30")}
              </SelectItem>
              <SelectItem value="semester" className="rounded-lg font-bold text-start">
                {t("analytics.ranges.semester")}
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-primary/20 hover:bg-primary/5 transition-all"
          >
            <Printer className="h-4 w-4" />
            {t("buttons.printReport")}
          </Button>
          <Button
            onClick={() => toast.info(t("analytics.toast.exportingCsv"))}
            className="h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <FileDown className="h-4 w-4" />
            {t("buttons.exportData")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Charts Column */}
        <div className="lg:col-span-2 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GradeDistributionChart
              data={analytics?.gradeDistribution ?? []}
              title={t("analytics.charts.gradeDistribution")}
              description={t("analytics.charts.gradeDescription")}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AssignmentCompletionChart data={analytics?.assignmentCompletionTrend ?? []} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SubmissionTimingHeatmap data={analytics?.submissionTiming ?? []} />
          </motion.div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-10 text-start">
          <motion.div
            initial={{ opacity: 0, x: isAr ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AtRiskStudents students={analytics?.atRiskStudents ?? []} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: isAr ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <FrictionPointsCard
              points={frictionResult?.data || []}
              isLoading={frictionQuery?.isLoading}
            />
          </motion.div>

          {analytics?.classComparison && analytics.classComparison.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: isAr ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ClassComparisonTable data={analytics.classComparison} />
            </motion.div>
          )}

          {isAiEnabled &&
            analytics?.studentTrajectories &&
            analytics.studentTrajectories.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: isAr ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black tracking-tight">
                        {t("analytics.ai.predictions")}
                      </h3>
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        {t("analytics.ai.predictedOutcomes")}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-ai-primary/10 text-ai-primary border-none"
                  >
                    {t("analytics.ai.beta")}
                  </Badge>
                </div>
                <div className="space-y-4 max-h-125 overflow-y-auto pe-2 custom-scrollbar">
                  {analytics.studentTrajectories.map((student, idx) => (
                    <motion.div
                      key={student.studentId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.05 }}
                    >
                      <StudentTrajectoryCard student={student} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .print\\:hidden { display: none !important; }
          .class-show .tabs-list { display: none !important; }
          .class-show .show-view-header { margin-bottom: 2rem; }
          body { background: white !important; }
          .card { border: 1px solid #eee !important; box-shadow: none !important; break-inside: avoid; }
          .grid { display: block !important; }
          .lg\\:col-span-2 { width: 100% !important; margin-bottom: 2rem; }
          .space-y-8 > * { margin-bottom: 2rem; }
        }
      `,
        }}
      />
    </div>
  );
};
