import { useState, useCallback } from "react";
import { useGetIdentity } from "@refinedev/core";
import { User, UserRole } from "@/types";
import { useAssignmentData } from "./use-assignment-data";
import { useAssignmentSocket } from "./use-assignment-socket";
import { useAssignmentLogic } from "./use-assignment-logic";
import { useTranslation } from "react-i18next";

export const useAssignment = (id?: string) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<User>();
  
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const {
    assignment,
    submissions,
    assignedReviews,
    isLoading: isDataLoading,
    isError,
    refetchSubmissions,
    refetchAssignedReviews
  } = useAssignmentData(id, identity?.id, identity?.role);

  const onAlert = useCallback(() => {
    void refetchSubmissions();
  }, [refetchSubmissions]);

  useAssignmentSocket(identity?.id, identity?.role, assignment?.classId, onAlert);

  const { mySubmission, isQuiz, isPhysicsLab, blendedGrade } = useAssignmentLogic(
    assignment,
    submissions,
    identity?.id
  );

  const isStaff = identity?.role === UserRole.ADMIN || identity?.role === UserRole.TEACHER;

  return {
    assignment,
    submissions,
    identity,
    assignedReviews,
    mySubmission,
    blendedGrade,
    isStaff,
    isQuiz,
    isPhysicsLab,
    isAr,
    isLoading: isIdentityLoading || isDataLoading,
    isError,
    state: { isResubmitting, setIsResubmitting, isMonitoring, setIsMonitoring },
    refetch: { submissions: refetchSubmissions, assignedReviews: refetchAssignedReviews }
  };
};
