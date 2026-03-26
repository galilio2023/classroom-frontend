import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Info,
  BookText,
  GraduationCap,
  Sparkles,
  UserRound,
  Activity,
} from "lucide-react";

interface ClassTabNavigationProps {
  activePrimaryTab: string;
  isLiveIndicator: boolean;
  isStaff: boolean;
  pendingCount: number;
  classColor: string;
}

export const ClassTabNavigation: React.FC<ClassTabNavigationProps> = ({
  activePrimaryTab,
  isLiveIndicator,
  isStaff,
  pendingCount,
  classColor,
}) => {
  const { t } = useTranslation();

  const primaryTabs = useMemo(
    () =>
      [
        {
          id: "content",
          label: t("classes.show.tabs.content"),
          icon: BookText,
        },
        {
          id: "assessments",
          label: t("classes.show.tabs.assessments"),
          icon: GraduationCap,
        },
        {
          id: "engagement",
          label: t("classes.show.tabs.engagement"),
          icon: Sparkles,
          indicator: isLiveIndicator,
        },
        {
          id: "roster",
          label: t("classes.show.tabs.roster"),
          icon: UserRound,
          badge: isStaff && pendingCount > 0 ? pendingCount : null,
        },
        {
          id: "progress",
          label: t("classes.show.tabs.progress"),
          icon: Activity,
          staffOnly: true,
        },
        { id: "info", label: t("classes.show.tabs.info"), icon: Info },
      ].filter((t) => !t.staffOnly || isStaff),
    [isLiveIndicator, isStaff, pendingCount, t],
  );

  return (
    <div className="sticky top-16 md:top-20 z-40">
      <div className="bg-background/80 backdrop-blur-3xl border border-border/40 rounded-[2rem] md:rounded-[2.5rem] p-1.5 md:p-2 shadow-2xl shadow-black/5 mx-auto w-full overflow-hidden">
        <ScrollArea className="w-full whitespace-nowrap scrollbar-hide">
          <TabsList className="flex h-auto md:h-14 items-center justify-start rounded-full p-1 bg-muted/20 gap-1">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activePrimaryTab === tab.id;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "px-4 md:px-8 py-2 md:py-2.5 rounded-full font-black uppercase tracking-widest text-[9px] md:text-[10px] transition-all duration-300 gap-2 md:gap-3 h-10 md:h-12 whitespace-nowrap overflow-hidden",
                    isActive
                      ? "text-white !text-white shadow-xl"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                  )}
                  style={
                    isActive
                      ? {
                          backgroundColor: classColor,
                          boxShadow: `0 8px 25px -5px ${classColor}60`,
                        }
                      : {}
                  }
                >
                  <Icon
                    className={cn(
                      "h-3.5 w-3.5 md:h-4 md:w-4 shrink-0",
                      isActive && "animate-pulse",
                    )}
                  />
                  <span className="shrink-0">{tab.label}</span>
                  {tab.indicator && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-white animate-pulse shrink-0" />
                  )}
                  {tab.badge && (
                    <Badge
                      className="h-4 md:h-5 min-w-[1rem] md:min-w-[1.25rem] p-0 flex items-center justify-center text-[8px] md:text-[9px] rounded-full border-none bg-white text-primary font-black ms-1 shrink-0"
                      style={{ color: isActive ? classColor : "inherit" }}
                    >
                      {tab.badge}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>
    </div>
  );
};
