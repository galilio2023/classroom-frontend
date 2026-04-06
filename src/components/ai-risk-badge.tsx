import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, ShieldAlert, ShieldCheck, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { AiFeatureGuard } from "@/components/ai/AiFeatureGuard";
import { useMemo, memo } from "react";

export type AIRiskLevel = "low" | "medium" | "high" | "critical";

interface AIRiskBadgeProps {
  riskLevel?: AIRiskLevel;
  className?: string;
  showText?: boolean;
}

const getRiskConfig = (t: TFunction) => ({
  low: {
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: ShieldCheck,
    label: t("classes.risk.low", "Low Risk"),
    desc: t("classes.risk.lowDesc", "Student is performing well and meeting expectations."),
  },
  medium: {
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: ShieldQuestion,
    label: t("classes.risk.medium", "Medium Risk"),
    desc: t("classes.risk.mediumDesc", "Slight dip in performance or attendance detected."),
  },
  high: {
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    icon: AlertTriangle,
    label: t("classes.risk.high", "High Risk"),
    desc: t("classes.risk.highDesc", "Significant struggle detected. Intervention recommended."),
  },
  critical: {
    color: "bg-destructive/10 text-destructive border-destructive/20",
    icon: ShieldAlert,
    label: t("classes.risk.critical", "Critical Risk"),
    desc: t("classes.risk.criticalDesc", "Urgent: Student is at risk of failing this class."),
  },
});

export const AIRiskBadge = memo(({ riskLevel, className, showText = false }: AIRiskBadgeProps) => {
  const { t } = useTranslation();

  const config = useMemo(() => getRiskConfig(t), [t]);

  if (!riskLevel) return null;

  const active = config[riskLevel];
  const Icon = active.icon;

  return (
    <AiFeatureGuard silent>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={cn(
              "px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter text-[10px] flex items-center gap-1.5 transition-all hover:scale-105 border-none",
              active.color,
              className
            )}
          >
            <Icon className="h-3 w-3" />
            {(showText || riskLevel === "critical" || riskLevel === "high") && active.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="rounded-xl p-3 max-w-[200px] border-none shadow-2xl bg-card/95 backdrop-blur-xl">
          <div className="space-y-1">
            <p className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <Icon className="h-3 w-3" />
              {active.label}
            </p>
            <p className="text-[10px] font-medium leading-relaxed opacity-70">{active.desc}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </AiFeatureGuard>
  );
});

AIRiskBadge.displayName = "AIRiskBadge";
