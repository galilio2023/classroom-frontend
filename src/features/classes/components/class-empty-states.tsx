import React from "react";
import { EmptyState } from "@/components/empty-state";
import { LayoutGrid, ClipboardCheck, Library, FileQuestion } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ClassEmptyStateProps {
  isTeacher: boolean;
  onMagicClick?: () => void;
  onAddClick?: () => void;
}

export const CurriculumEmptyState: React.FC<ClassEmptyStateProps> = ({
  isTeacher,
  onAddClick,
}) => {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={LayoutGrid}
      title={t("classes.curriculum.noModules")}
      description={t("classes.curriculum.noModulesDescription")}
      action={isTeacher && onAddClick ? {
        label: t("buttons.addModule"),
        onClick: onAddClick
      } : undefined}
    />
  );
};

export const AssessmentsEmptyState: React.FC<ClassEmptyStateProps & { type: 'assignments' | 'quizzes' }> = ({
  isTeacher,
  onAddClick,
  type
}) => {
  const { t } = useTranslation();
  const isQuiz = type === 'quizzes';
  
  return (
    <EmptyState
      icon={isQuiz ? FileQuestion : ClipboardCheck}
      title={isQuiz ? t("classes.quiz.noQuizzes") : t("assignments.list.noAssignments")}
      description={isQuiz ? t("classes.quiz.noQuizzesDescriptionStudent") : t("assignments.list.noAssignmentsDescriptionStudent")}
      action={isTeacher && onAddClick ? {
        label: t(isQuiz ? "buttons.createQuiz" : "buttons.addAssignment"),
        onClick: onAddClick
      } : undefined}
    />
  );
};

export const ResourcesEmptyState: React.FC<ClassEmptyStateProps> = ({
  isTeacher,
  onAddClick
}) => {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={Library}
      title={t("classes.resource.noMaterials")}
      description={t("classes.resource.noMaterialsDescription")}
      action={isTeacher && onAddClick ? {
        label: t("buttons.addResource"),
        onClick: onAddClick
      } : undefined}
    />
  );
};
