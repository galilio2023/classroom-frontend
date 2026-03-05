import { StudentAcademicJourney } from "./student-academic-journey";
import { UpcomingAssignmentsList } from "./upcoming-assignments-list";
import { RecentActivity } from "./recent-activity";
import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardData } from "@/types/dashboard";
import { StatsSkeleton } from "./dashboard-skeletons";

interface StudentDashboardProps {
  data: DashboardData;
  isLoading?: boolean;
  list: (resource: string) => void;
  show: (resource: string, id: string | number) => void;
}

export const StudentDashboard = ({ data, isLoading, list, show }: StudentDashboardProps) => {
  // Use isLoading to show a skeleton while analytics are fetching in the background
  if (isLoading && (!data.gradeTrends || data.gradeTrends.length === 0)) {
    return (
      <div className="space-y-12">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-12">
            <StatsSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-12">
          <ErrorBoundary>
            <StudentAcademicJourney 
              gradeTrends={data.gradeTrends ?? []} 
              subjectMastery={data.subjectMastery ?? []} 
              attendanceSummary={data.attendanceSummary ?? { present: 0, absent: 0, late: 0, total: 0 }} 
            />
          </ErrorBoundary>

          <ErrorBoundary>
            <UpcomingAssignmentsList 
              assignments={data.upcomingAssignments ?? []} 
              list={list} 
              show={show} 
            />
          </ErrorBoundary>
        </div>

        <div className="space-y-10">
          <ErrorBoundary>
            <RecentActivity limit={5} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
