import React from "react";
import { GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatEmptyStateProps {
  subject?: string;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ subject }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full py-16 md:py-24 text-center space-y-6 md:space-y-8">
      <div className="relative">
        <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="relative p-6 md:p-8 bg-primary/5 rounded-full border border-primary/10 shadow-sm">
          <GraduationCap className="h-12 w-12 md:h-16 md:w-16 text-primary opacity-40" />
        </div>
      </div>
      <div className="space-y-2 md:space-y-3">
        <p className="text-xl md:text-2xl font-black tracking-tight text-foreground">
          {t("aiHub.studyLab.studyBuddy.personalTutor")}
        </p>
        <p className="text-sm md:text-base font-medium text-muted-foreground px-6 md:px-12 leading-relaxed max-w-sm mx-auto text-balance">
          {t("aiHub.studyLab.studyBuddy.masterSubject", {
            subject: subject || t("aiHub.studyLab.studyBuddy.masterGeneral"),
          })}
        </p>
      </div>
    </div>
  );
};
