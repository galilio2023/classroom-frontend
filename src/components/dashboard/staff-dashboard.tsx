import { EngagementChart } from "./engagement-chart";
import { PendingGradingList } from "./pending-grading-list";
import { AtRiskStudents } from "./at-risk-students";
import { PlatformOverview } from "./platform-overview";
import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardData } from "@/types/dashboard";

interface StaffDashboardProps {
  data: DashboardData;
  isLoading: boolean;
  onRefresh: () => void;
  show: (resource: string, id: string | number) => void;
}

export const StaffDashboard = ({ data, isLoading, onRefresh, show }: StaffDashboardProps) => {
  return (
    <div className="space-y-12">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          <ErrorBoundary>
            <EngagementChart 
              attendanceData={data.attendanceTrend ?? []} 
              gradeData={data.gradeDistribution ?? []} 
            />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <PendingGradingList 
              submissions={data.pendingSubmissions ?? []} 
              show={show} 
            />
          </ErrorBoundary>
        </div>

        <div className="space-y-10">
          <ErrorBoundary>
            <AtRiskStudents students={data.atRiskStudents ?? []} />
          </ErrorBoundary>
          
          <ErrorBoundary>
            <PlatformOverview 
              stats={data.stats} 
              isLoading={isLoading} 
              onRefresh={onRefresh}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
