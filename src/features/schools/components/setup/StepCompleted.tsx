import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface StepCompletedProps {
  onComplete: () => void;
}

export const StepCompleted = ({ onComplete }: StepCompletedProps) => {
  const { t } = useTranslation();

  return (
    <div className="text-center space-y-6 pt-8">
      <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-black">{t("schools.setup.completed.title")}</h3>
        <p className="text-sm text-muted-foreground">{t("schools.setup.completed.desc")}</p>
      </div>
      <Button
        onClick={onComplete}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl"
      >
        {t("schools.setup.completed.cta")}
      </Button>
    </div>
  );
};
