import React from "react";
import { BrainCircuit } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AIFeatureDisabledProps {
  title?: string;
  description?: string;
}

/**
 * Reusable placeholder for when AI features are disabled via global kill-switch.
 * Adheres to Tablawy OS Rule #3 regarding visual identity.
 */
export const AIFeatureDisabled: React.FC<AIFeatureDisabledProps> = ({ title, description }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border/40 text-center p-8 space-y-4">
      <div className="bg-destructive/10 p-4 rounded-full">
        <BrainCircuit className="w-10 h-10 text-destructive grayscale" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold">
          {title || t("aiHub.errors.serviceOffline", "AI Service Offline")}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          {description ||
            t(
              "aiHub.errors.adminDisabled",
              "AI features are currently disabled by the administrator."
            )}
        </p>
      </div>
    </div>
  );
};
