import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import React from "react";

/**
 * 🚀 useStudyPlanToast
 * Listens for global AI_STUDY_PLAN_READY event (from SocketProvider)
 * and shows a high-fidelity toast with action capability.
 */
export const useStudyPlanToast = () => {
  const { push } = useNavigation() as any;
  const { t } = useTranslation();

  useEffect(() => {
    const handleStudyPlanReady = () => {
      toast.success(
        t("studyPlanner.notifications.readyTitle", { defaultValue: "Your study plan is ready" }),
        {
          description: t("studyPlanner.notifications.readyDescription", {
            defaultValue: "Your personalized AI study journey has been generated.",
          }),
          icon: <Sparkles className="h-4 w-4 text-ai-primary" />,
          duration: 10000, // Show for 10 seconds to ensure they see it
          action: {
            label: t("studyPlanner.buttons.viewPlan", { defaultValue: "View Plan" }),
            onClick: () => push("/ai-study-lab"),
          },
        }
      );
    };

    window.addEventListener("AI_STUDY_PLAN_READY", handleStudyPlanReady);
    return () => {
      window.removeEventListener("AI_STUDY_PLAN_READY", handleStudyPlanReady);
    };
  }, [push, t]);
};
