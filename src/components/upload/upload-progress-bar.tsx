import React from "react";
import { Progress } from "@/components/ui/progress";
import { Wifi, Zap, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UploadProgressBarProps {
  progress: number;
  timeRemaining: string | null;
  isResumable?: boolean;
}

export const UploadProgressBar: React.FC<UploadProgressBarProps> = ({
  progress,
  timeRemaining,
  isResumable,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between overline">
        <div className="flex items-center gap-2 text-primary">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>{Math.round(progress)}%</span>
        </div>
        {timeRemaining && (
          <div className="text-muted-foreground">
            {t("common.upload.eta", "ETA")}: {timeRemaining}
          </div>
        )}
      </div>

      <Progress value={progress} className="h-1.5 shadow-inner" />

      {isResumable && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-[9px] font-black uppercase tracking-widest w-fit border border-success/20 animate-pulse">
          <Zap className="h-2.5 w-2.5" />
          <Wifi className="h-2.5 w-2.5" />
          {t("common.upload.resumable", "Resumable Upload Active")}
        </div>
      )}
    </div>
  );
};
