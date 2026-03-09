import { useCustom } from "@refinedev/core";
import { GradeDistributionChart } from "@/components/dashboard/grade-distribution-chart";
import { AtRiskStudents } from "@/components/dashboard/at-risk-students";
import { AssignmentCompletionChart } from "@/components/dashboard/assignment-completion-chart";
import { SubmissionTimingHeatmap } from "@/components/dashboard/submission-timing-heatmap";
import { StudentTrajectoryCard } from "@/components/dashboard/student-trajectory-card";
import { ClassComparisonTable } from "@/components/dashboard/class-comparison-table";
import { Loader2, FileDown, Printer, Calendar, BarChart3, TrendingUp, AlertCircle, Sparkles, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface AnalyticsTabProps {
  classId: string;
}

export const AnalyticsTab = ({ classId }: AnalyticsTabProps) => {
  const [dateRange, setDateRange] = useState("30");

  const { result, query } = useCustom({
    url: `/classes/${classId}/analytics`,
    method: "get",
    config: {
      query: {
        range: dateRange
      }
    }
  });

  const analytics = result?.data;
  const isLoading = query?.isLoading;
  const isError = query?.isError;

  const handleExportPDF = () => {
    window.print();
    toast.success("Preparing print-friendly report...");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Analyzing Class Data...</p>
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
          <h3 className="text-lg font-black tracking-tight">Failed to load analytics</h3>
          <p className="text-sm text-muted-foreground font-medium">We couldn't fetch the data for this class.</p>
        </div>
        <Button variant="outline" onClick={() => query?.refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20 print:space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 print:hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Class Analytics</h2>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            Detailed performance and engagement metrics for this class.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px] h-11 rounded-xl bg-card/50 backdrop-blur-xl border-black/[0.05] dark:border-white/[0.05] shadow-sm font-bold">
              <Calendar className="mr-2 h-4 w-4 text-primary/60" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-2xl">
              <SelectItem value="7" className="rounded-lg font-bold">Last 7 Days</SelectItem>
              <SelectItem value="30" className="rounded-lg font-bold">Last 30 Days</SelectItem>
              <SelectItem value="semester" className="rounded-lg font-bold">Full Semester</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportPDF} className="h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-primary/20 hover:bg-primary/5 transition-all">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Button onClick={() => toast.info("Exporting CSV...")} className="h-11 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
            <FileDown className="h-4 w-4" />
            Export Data
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
              title="Class Grade Distribution"
              description="Student performance across all assignments in this class."
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AssignmentCompletionChart 
              data={analytics?.assignmentCompletionTrend ?? []} 
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <SubmissionTimingHeatmap 
              data={analytics?.submissionTiming ?? []} 
            />
          </motion.div>
        </div>
        
        {/* Sidebar Column */}
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AtRiskStudents students={analytics?.atRiskStudents ?? []} />
          </motion.div>
          
          {analytics?.classComparison && analytics.classComparison.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ClassComparisonTable data={analytics.classComparison} />
            </motion.div>
          )}

          {analytics?.studentTrajectories && analytics.studentTrajectories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
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
                    <h3 className="text-lg font-black tracking-tight">AI Predictions</h3>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest text-ai-primary/60">Predicted Outcomes</p>
                  </div>
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-ai-primary/10 text-ai-primary border-none">
                  Beta
                </Badge>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {analytics.studentTrajectories.map((student: any, idx: number) => (
                  <motion.div
                    key={student.studentId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (idx * 0.05) }}
                  >
                    <StudentTrajectoryCard student={student} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
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
      `}} />
    </div>
  );
};
