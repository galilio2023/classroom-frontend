import React from "react";
import { EmptyState } from "@/components/empty-state";
import {
  LayoutGrid,
  ClipboardCheck,
  Library,
  FileQuestion,
  Wand2,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";

interface ClassEmptyStateProps {
  isTeacher: boolean;
  onMagicClick?: () => void;
  onAddClick?: () => void;
}

export const CurriculumEmptyState: React.FC<ClassEmptyStateProps> = ({
  isTeacher,
  onAddClick,
  onMagicClick,
}) => {
  const { t, i18n } = useTranslation();
  const { coreData } = useDashboard();
  const isAr = i18n.language === "ar";
  const isAiEnabled = coreData?.globalConfig?.enableAiFeatures !== false;

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="flex flex-col items-center justify-center w-full min-h-[400px] p-8 text-center border-2 border-dashed rounded-[2.5rem] bg-muted/5 border-primary/10 text-muted-foreground animate-in fade-in zoom-in duration-500"
    >
      <div className="p-6 rounded-3xl bg-primary/5 mb-6">
        <LayoutGrid className="h-12 w-12 text-primary/40" />
      </div>
      <h3 className="text-2xl font-black tracking-tight text-foreground mb-2">
        {t("classes.curriculum.noModules")}
      </h3>
      <p className="text-sm font-medium max-w-sm px-4 leading-relaxed">
        {t("classes.curriculum.noModulesDescription")}
      </p>

      {isTeacher && (
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          {onAddClick && (
            <Button
              onClick={onAddClick}
              className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              {t("buttons.addModule")}
            </Button>
          )}

          {isAiEnabled && onMagicClick && (
            <Button
              variant="outline"
              onClick={onMagicClick}
              className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 transition-all hover:scale-105 active:scale-95 gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none" />
              <Wand2 className="h-4 w-4" />
              {t("buttons.magicBuilder")}
              <Sparkles className="h-3 w-3 animate-pulse" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export const AssessmentsEmptyState: React.FC<
  ClassEmptyStateProps & { type: "assignments" | "quizzes" }
> = ({ isTeacher, onAddClick, type }) => {
  const { t } = useTranslation();
  const isQuiz = type === "quizzes";

  return (
    <EmptyState
      icon={isQuiz ? FileQuestion : ClipboardCheck}
      title={
        isQuiz
          ? t("classes.quiz.noQuizzes")
          : t("assignments.list.noAssignments")
      }
      description={
        isQuiz
          ? t("classes.quiz.noQuizzesDescriptionStudent")
          : t("assignments.list.noAssignmentsDescriptionStudent")
      }
      action={
        isTeacher && onAddClick
          ? {
              label: t(isQuiz ? "buttons.createQuiz" : "buttons.addAssignment"),
              onClick: onAddClick,
            }
          : undefined
      }
    />
  );
};

export const ResourcesEmptyState: React.FC<ClassEmptyStateProps> = ({
  isTeacher,
  onAddClick,
}) => {
  const { t } = useTranslation();
  return (
    <EmptyState
      icon={Library}
      title={t("classes.resource.noMaterials")}
      description={t("classes.resource.noMaterialsDescription")}
      action={
        isTeacher && onAddClick
          ? {
              label: t("buttons.addResource"),
              onClick: onAddClick,
            }
          : undefined
      }
    />
  );
};
