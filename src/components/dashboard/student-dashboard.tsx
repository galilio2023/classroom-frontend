import { StudentAcademicJourney } from "./student-academic-journey";
import { UpcomingAssignmentsList } from "./upcoming-assignments-list";
import { ErrorBoundary } from "@/components/error-boundary";
import { DashboardData } from "@/types/dashboard";

interface StudentDashboardProps {
  data: DashboardData;
  list: (resource: string) => void;
  show: (resource: string, id: string | number) => void;
}

export const StudentDashboard = ({ data, list, show }: StudentDashboardProps) => {
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
      </div>
    </div>
  );
};
