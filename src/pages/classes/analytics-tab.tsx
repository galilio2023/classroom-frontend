import { useCustom } from "@refinedev/core";
import { GradeDistributionChart } from "@/components/dashboard/grade-distribution-chart";
import { AtRiskStudents } from "@/components/dashboard/at-risk-students";
import { AssignmentCompletionChart } from "@/components/dashboard/assignment-completion-chart";
import { SubmissionTimingHeatmap } from "@/components/dashboard/submission-timing-heatmap";
import { StudentTrajectoryCard } from "@/components/dashboard/student-trajectory-card";
import { ClassComparisonTable } from "@/components/dashboard/class-comparison-table";
import { Loader2, FileDown, Printer, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface AnalyticsTabProps {
  classId: string;
}

export const AnalyticsTab = ({ classId }: AnalyticsTabProps) => {
  const [dateRange, setDateRange] = useState("30"); // Default to last 30 days

  const { query } = useCustom({
    url: `/classes/${classId}/analytics`,
    method: "get",
    config: {
      query: {
        range: dateRange
      }
    }
  });

  const { data, isLoading } = query;
  const analytics = data?.data;

  const handleExportPDF = () => {
    window.print();
    toast.success("Preparing print-friendly report...");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8 print:space-y-4">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Class Analytics</h2>
          <p className="text-muted-foreground">
            Detailed performance and engagement metrics for this class.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="semester">Full Semester</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Report
          </Button>
          <Button onClick={() => toast.info("Exporting CSV...")} className="gap-2">
            <FileDown className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GradeDistributionChart 
            data={analytics?.gradeDistribution ?? []} 
            title="Class Grade Distribution"
            description="Student performance across all assignments in this class."
          />
          
          <AssignmentCompletionChart 
            data={analytics?.assignmentCompletionTrend ?? []} 
          />

          <SubmissionTimingHeatmap 
            data={analytics?.submissionTiming ?? []} 
          />
        </div>
        
        <div className="space-y-8">
          <AtRiskStudents students={analytics?.atRiskStudents ?? []} />
          
          {analytics?.classComparison && analytics.classComparison.length > 0 && (
            <ClassComparisonTable data={analytics.classComparison} />
          )}

          {analytics?.studentTrajectories && analytics.studentTrajectories.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Predicted Outcomes</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {analytics.studentTrajectories.map((student: any) => (
                  <StudentTrajectoryCard key={student.studentId} student={student} />
                ))}
              </div>
            </div>
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
