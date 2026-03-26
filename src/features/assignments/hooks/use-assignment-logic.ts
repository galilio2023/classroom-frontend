import { useMemo } from "react";
import { Assignment, Submission } from "@/types";

export const useAssignmentLogic = (
  assignment?: Assignment,
  submissions: Submission[] = [],
  userId?: string,
) => {
  const mySubmission = useMemo(() => {
    if (!userId || !submissions.length) return null;
    return submissions.find((s) => s.studentId === userId) || null;
  }, [submissions, userId]);

  const isQuiz = useMemo(() => {
    return assignment?.description?.includes("### Q1:") && assignment?.description?.includes("---");
  }, [assignment]);

  const isPhysicsLab = useMemo(() => {
    return assignment?.title?.toLowerCase().includes("lab") || 
           assignment?.description?.toLowerCase().includes("trajectory");
  }, [assignment]);

  const blendedGrade = useMemo(() => {
    if (!mySubmission?.grade || !assignment?.hasPeerReview) return null;
    // Logic for calculating average from reviews could be here or received from API
    return null; 
  }, [mySubmission, assignment]);

  return {
    mySubmission,
    isQuiz,
    isPhysicsLab,
    blendedGrade,
  };
};
