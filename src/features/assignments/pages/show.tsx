import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useList, useGetIdentity, useCustom } from "@refinedev/core";
import { Assignment, Submission, User, PeerReview } from "@/types";
import { AssignmentBanner } from "../components/assignment-banner";
import { useAssignmentLogic } from "../hooks/use-assignment-logic";
import { useAssignmentSocket } from "../hooks/use-assignment-socket";
import { useState } from "react";
import { AssignmentHeader } from "../components/assignment-header";
import usePageTitle from "@/hooks/use-page-title";

// New sub-components
import { SubmissionContainer } from "../components/show/SubmissionContainer";
import { PeerReviewSection } from "../components/show/PeerReviewSection";
import { AssignmentStatusCard } from "../components/show/AssignmentStatusCard";

const AssignmentShow = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: identity } = useGetIdentity<User>();

  // --- UI State ---
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // --- Data Fetching ---
  const { query: assignmentQuery } = useCustom<Assignment>({
    url: `assignments/${id}`,
    method: "get",
  });

  const assignment = assignmentQuery.data?.data;
  const isAssignmentLoading = assignmentQuery.isLoading;

  const { query: submissionsQuery } = useList<Submission>({
    resource: "submissions",
    filters: [{ field: "assignmentId", operator: "eq", value: id }],
    queryOptions: { enabled: !!id },
  });

  const submissions = submissionsQuery.data?.data || [];

  // --- Peer Review Data ---
  const { query: reviewsQuery } = useList<PeerReview>({
    resource: "peer-reviews/assigned",
    filters: [{ field: "assignmentId", operator: "eq", value: id }],
    queryOptions: { enabled: !!id && identity?.role === "student" },
  });

  const assignedReviews = reviewsQuery.data?.data || [];
  const refetchReviews = reviewsQuery.refetch;

  // --- Real-time & Logic ---
  useAssignmentSocket(id || "");
  const { mySubmission } = useAssignmentLogic(assignment, submissions, identity?.id);

  usePageTitle(assignment?.title || (t("assignments.list.title" as any) as string));

  if (isAssignmentLoading || !assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin opacity-20" />
      </div>
    );
  }

  const isStaff = identity?.role === "admin" || identity?.role === "teacher";

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <AssignmentHeader assignment={assignment} isStaff={isStaff} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <AssignmentBanner
            assignment={assignment}
            submissions={submissions}
            isStaff={isStaff}
            isQuiz={false}
            isPhysicsLab={false}
            isMonitoring={isMonitoring}
            setIsMonitoring={setIsMonitoring}
          />

          <SubmissionContainer
            isStaff={isStaff}
            assignment={assignment}
            submissions={submissions}
            mySubmission={mySubmission || undefined}
            isResubmitting={isResubmitting}
            setIsResubmitting={setIsResubmitting}
          />

          {assignment.hasPeerReview && !isStaff && (
            <PeerReviewSection
              assignment={assignment}
              assignedReviews={assignedReviews}
              onSuccess={() => refetchReviews()}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
          <AssignmentStatusCard assignment={assignment} />
        </div>
      </div>
    </div>
  );
};

export default AssignmentShow;
