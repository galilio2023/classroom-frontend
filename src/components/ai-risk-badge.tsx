import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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

const RISK_CONFIG = {
  low: {
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    icon: ShieldCheck,
    labelKey: "classes.risk.low",
    defaultLabel: "Low Risk",
    descKey: "classes.risk.lowDesc",
    defaultDesc: "Student is performing well and meeting expectations.",
    alwaysShowLabel: false,
  },
  medium: {
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: ShieldQuestion,
    labelKey: "classes.risk.medium",
    defaultLabel: "Medium Risk",
    descKey: "classes.risk.mediumDesc",
    defaultDesc: "Slight dip in performance or attendance detected.",
    alwaysShowLabel: false,
  },
  high: {
    color:
      "bg-orange-500/10 text-orange-600 border-orange-500/20 ai-gradient-border shadow-[0_0_10px_rgba(var(--ai-primary-rgb),0.1)]",
    icon: AlertTriangle,
    labelKey: "classes.risk.high",
    defaultLabel: "High Risk",
    descKey: "classes.risk.highDesc",
    defaultDesc: "Significant struggle detected. Intervention recommended.",
    alwaysShowLabel: true,
  },
  critical: {
    color:
      "bg-destructive/10 text-destructive border-destructive/20 ai-gradient-border shadow-[0_0_15px_rgba(var(--ai-primary-rgb),0.15)]",
    icon: ShieldAlert,
    labelKey: "classes.risk.critical",
    defaultLabel: "Critical Risk",
    descKey: "classes.risk.criticalDesc",
    defaultDesc: "Urgent: Student is at risk of failing this class.",
    alwaysShowLabel: true,
  },
};

export const AIRiskBadge = memo(({ riskLevel, className, showText = false }: AIRiskBadgeProps) => {
  const { t } = useTranslation();

  if (!riskLevel) return null;

  const config = RISK_CONFIG[riskLevel];
  const Icon = config.icon;
  const label = t(config.labelKey, config.defaultLabel);
  const desc = t(config.descKey, config.defaultDesc);

  return (
    <AiFeatureGuard silent>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                "px-2 py-0.5 rounded-lg font-black uppercase tracking-tighter text-[10px] flex items-center gap-1.5 transition-all hover:scale-105 border-transparent",
                config.color,
                className
              )}
            >
              <Icon className="h-3 w-3" />
              {(showText || config.alwaysShowLabel) && label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="rounded-xl p-3 max-w-[200px] border-none shadow-2xl bg-card/95 backdrop-blur-xl">
            <div className="space-y-1">
              <p className="font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Icon className="h-3 w-3" />
                {label}
              </p>
              <p className="text-[10px] font-medium leading-relaxed opacity-70">{desc}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </AiFeatureGuard>
  );
});

AIRiskBadge.displayName = "AIRiskBadge";
