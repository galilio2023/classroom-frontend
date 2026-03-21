import React from "react";
import { EmptyState } from "@/components/empty-state";
import { LayoutGrid, ClipboardCheck, Library, Wand2, PlusCircle, FileQuestion } from "lucide-react";
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
      title={t("classes.curriculum.noModules" as any)}
      description={t("classes.curriculum.noModulesDescription" as any)}
      action={isTeacher && onAddClick ? {
        label: t("buttons.addModule" as any),
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
      title={t((isQuiz ? "classes.quiz.noQuizzes" : "classes.assignments.noAssignments") as any)}
      description={t((isQuiz ? "classes.quiz.noQuizzesDescription" : "classes.assignments.noAssignmentsDescription") as any)}
      action={isTeacher && onAddClick ? {
        label: t((isQuiz ? "buttons.createQuiz" : "buttons.addAssignment") as any),
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
      title={t("classes.resource.noMaterials" as any)}
      description={t("classes.resource.noMaterialsDescription" as any)}
      action={isTeacher && onAddClick ? {
        label: t("buttons.addResource" as any),
        onClick: onAddClick
      } : undefined}
    />
  );
};
