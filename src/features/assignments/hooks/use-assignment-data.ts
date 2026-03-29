import { useShow, useList, HttpError, useCustom } from "@refinedev/core";
import { Assignment, Submission, PeerReview } from "@/types";
import { UserRole } from "@/types";
import { BACKEND_URL } from "@/config";

export const useAssignmentData = (id?: string, userId?: string, userRole?: UserRole) => {
  const { query: assignmentQuery } = useShow<Assignment, HttpError>({
    resource: "assignments",
    id,
    meta: {
      populate: ["class", "class.subject"],
    },
  });

  const assignment = assignmentQuery.data?.data;

  const submissionsList = useList<Submission, HttpError>({
    resource: "submissions",
    filters: id ? [{ field: "assignmentId", operator: "eq", value: id }] : [],
    queryOptions: { enabled: !!assignment },
  });

  const submissions = submissionsList.result.data ?? [];

  const assignedReviewsResult = useCustom<PeerReview[]>({
    url: `${BACKEND_URL}/peer-reviews/assigned`,
    method: "get",
    queryOptions: {
      enabled: !!userId && userRole === UserRole.STUDENT && !!assignment,
    },
  });

  return {
    assignment,
    submissions,
    assignedReviews: assignedReviewsResult.result.data || [],
    isLoading:
      assignmentQuery.isLoading ||
      submissionsList.query.isLoading ||
      assignedReviewsResult.query.isLoading,
    isError: assignmentQuery.isError || submissionsList.query.isError,
    refetchSubmissions: submissionsList.query.refetch,
    refetchAssignedReviews: assignedReviewsResult.query.refetch,
  };
};
