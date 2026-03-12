import { Progress } from "@/components/ui/progress";
import { getLevelProgress } from "@/lib/xp";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

interface XPProgressBarProps {
  xp: number;
  showLabel?: boolean;
  className?: string;
  indicatorClassName?: string;
}

export function XPProgressBar({ xp, showLabel = true, className, indicatorClassName }: XPProgressBarProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { currentLevel, xpInCurrentLevel, xpRequiredForNextLevel, progressPercentage } = getLevelProgress(xp);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US').format(Math.floor(num));
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-gold-primary fill-gold-primary" />
            <span>{t("dashboard.student.level")} {formatNumber(currentLevel)}</span>
          </div>
          <span>{formatNumber(xpInCurrentLevel)} / {formatNumber(xpRequiredForNextLevel)} XP</span>
        </div>
      )}
      <Progress 
        value={progressPercentage} 
        className="h-2 bg-muted/50 border border-border/50" 
        indicatorClassName={cn("bg-gradient-to-r from-gold-primary to-gold-secondary", indicatorClassName)} 
      />
    </div>
  );
}
