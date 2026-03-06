import { useCustom } from "@refinedev/core";
import { GradeDistributionChart } from "@/components/dashboard/grade-distribution-chart";
import { AtRiskStudents } from "@/components/dashboard/at-risk-students";
import { Loader2, FileDown, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AnalyticsTabProps {
  classId: string;
}

export const AnalyticsTab = ({ classId }: AnalyticsTabProps) => {
  const { query } = useCustom({
    url: `/classes/${classId}/analytics`,
    method: "get",
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
        <div className="flex gap-2">
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
        <div className="lg:col-span-2">
          <GradeDistributionChart 
            data={analytics?.gradeDistribution ?? []} 
            title="Class Grade Distribution"
            description="Student performance across all assignments in this class."
          />
        </div>
        <div className="space-y-8">
          <AtRiskStudents students={analytics?.atRiskStudents ?? []} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .print\\:hidden { display: none !important; }
          .class-show .tabs-list { display: none !important; }
          .class-show .show-view-header { margin-bottom: 2rem; }
          body { background: white !important; }
          .card { border: 1px solid #eee !important; box-shadow: none !important; }
        }
      `}} />
    </div>
  );
};
