import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, WifiOff } from "lucide-react";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import { useTranslation } from "react-i18next";
import { BackgroundJob } from "@/contexts/job-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StudyPlannerHeaderProps {
  onGenerate: () => void;
  isGenerating: boolean;
  activeJob?: BackgroundJob;
  isOnline: boolean;
}

export const StudyPlannerHeader = React.memo(
  ({ onGenerate, isGenerating, activeJob, isOnline }: StudyPlannerHeaderProps) => {
    const { t } = useTranslation();

    const isDisabled = isGenerating || !!activeJob || !isOnline;

    const buttonContent = (
      <Button
        size="lg"
        onClick={onGenerate}
        disabled={isDisabled}
        className="h-16 px-8 rounded-2xl bg-ai-primary hover:opacity-90 transition-all group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {isGenerating || activeJob ? (
          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
        ) : !isOnline ? (
          <WifiOff className="mr-3 h-6 w-6" />
        ) : (
          <Sparkles className="mr-3 h-6 w-6" />
        )}
        <span className="font-black uppercase tracking-widest">
          {isGenerating || activeJob
            ? t("studyPlanner.buttons.generating")
            : !isOnline
              ? t("common.offline")
              : t("studyPlanner.buttons.generate")}
        </span>
      </Button>
    );

    return (
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
        <div className="space-y-4">
          <Breadcrumb />
          <div className="space-y-1 text-start">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              {t("studyPlanner.title")}
            </h1>
            <p className="text-muted-foreground font-medium max-w-xl text-lg">
              {t("studyPlanner.description")}
            </p>
          </div>
        </div>

        {!isOnline ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
              <TooltipContent side="top" className="bg-destructive text-destructive-foreground">
                <p className="font-bold text-xs uppercase tracking-widest">
                  {t("studyPlanner.notifications.offlineGenerateError", {
                    defaultValue: "Internet connection required to generate AI plans.",
                  })}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          buttonContent
        )}
      </div>
    );
  }
);
