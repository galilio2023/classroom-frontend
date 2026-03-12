import React from "react";
import { GraduationCap } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ChatEmptyStateProps {
  subject?: string;
}

export const ChatEmptyState: React.FC<ChatEmptyStateProps> = ({ subject }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-6">
      <div className="relative">
        <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="relative p-5 bg-primary/5 rounded-full border border-primary/10">
          <GraduationCap className="h-12 w-12 text-primary opacity-40" />
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-base font-bold text-foreground">{t("aiHub.studyLab.studyBuddy.personalTutor")}</p>
        <p className="text-xs text-muted-foreground px-10 leading-relaxed">
          {t("aiHub.studyLab.studyBuddy.masterSubject", { subject: subject || t("aiHub.studyLab.studyBuddy.masterGeneral") })}
        </p>
      </div>
    </div>
  );
};
