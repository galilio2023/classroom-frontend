import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  LucideIcon,
  Award,
  Star,
  Zap,
  Target,
  Flame,
  Trophy,
  GraduationCap,
  Medal,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export interface BadgeData {
  id: string | number;
  name: string;
  description: string;
  icon?: LucideIcon | any;
  iconUrl?: string;
  color?: string;
  unlocked: boolean;
  progress?: number;
  threshold?: number;
}

interface BadgeCardProps {
  badge: BadgeData;
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  Target,
  Star,
  Flame,
  Award,
  Zap,
  GraduationCap,
  Medal,
  Trophy,
};

export function BadgeCard({ badge, className }: BadgeCardProps) {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  // Resolve Icon: Priority 1: Lucide Component, Priority 2: Mapped Name, Priority 3: Default
  let Icon = badge.icon;
  if (typeof Icon === "string" && ICON_MAP[Icon]) {
    Icon = ICON_MAP[Icon];
  } else if (!Icon) {
    Icon = Medal;
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US").format(num);
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 group h-full",
        badge.unlocked
          ? "border-primary/20 bg-primary/5"
          : "border-muted bg-muted/20 grayscale opacity-60",
        className
      )}
    >
      <CardContent className="p-4 flex flex-col items-center text-center gap-2 h-full">
        <div
          className={cn(
            "p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110 shrink-0",
            badge.unlocked
              ? badge.color || "bg-primary text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          {badge.iconUrl && badge.unlocked ? (
            <img src={badge.iconUrl} alt={badge.name} className="h-6 w-6 object-contain" />
          ) : (
            <Icon className="h-6 w-6" />
          )}
        </div>

        <div className="space-y-1 flex-1 flex flex-col justify-center">
          <h4 className="text-[11px] font-black uppercase tracking-tight leading-tight">
            {t(`badges.${badge.id}.name`, { defaultValue: badge.name })}
          </h4>
          <p className="text-[9px] text-muted-foreground font-medium leading-tight line-clamp-2">
            {t(`badges.${badge.id}.desc`, { defaultValue: badge.description })}
          </p>
        </div>

        {!badge.unlocked && badge.progress !== undefined && badge.threshold !== undefined && (
          <div className="w-full mt-2 space-y-1">
            <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>{t("common.progress")}</span>
              <span>
                {formatNumber(badge.progress)} / {formatNumber(badge.threshold)}
              </span>
            </div>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${(badge.progress / badge.threshold) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {badge.unlocked && (
          <div className="absolute top-1 end-1">
            <Trophy className="h-3 w-3 text-gold-primary fill-gold-primary animate-pulse" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const MOCK_BADGES: BadgeData[] = [
  {
    id: "first-submission",
    name: "First Step",
    description: "Submit your first assignment",
    icon: Target,
    color: "bg-badge-blue text-white",
    unlocked: true,
  },
  {
    id: "perfect-score",
    name: "Perfectionist",
    description: "Get 100% on any quiz",
    icon: Star,
    color: "bg-gold-primary text-white",
    unlocked: true,
  },
  {
    id: "streak-5",
    name: "Consistent",
    description: "5-day login streak",
    icon: Flame,
    color: "bg-badge-orange text-white",
    unlocked: false,
    progress: 3,
    threshold: 5,
  },
  {
    id: "top-10",
    name: "Elite",
    description: "Reach top 10 in leaderboard",
    icon: Award,
    color: "bg-badge-purple text-white",
    unlocked: false,
  },
  {
    id: "fast-learner",
    name: "Speedster",
    description: "Complete a module in one day",
    icon: Zap,
    color: "bg-badge-yellow text-black",
    unlocked: false,
  },
];
