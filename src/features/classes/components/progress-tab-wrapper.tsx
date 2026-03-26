import React from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AnalyticsTab } from "../pages/analytics-tab";
import { LeaderboardTab } from "../pages/leaderboard-tab";
import { BarChart3, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressTabWrapperProps {
  classId: string;
  activeSubTab: string;
  setSearchParams: (
    setter: (prev: URLSearchParams) => URLSearchParams,
    options?: { replace: boolean },
  ) => void;
}

export const ProgressTabWrapper: React.FC<ProgressTabWrapperProps> = ({
  classId,
  activeSubTab,
  setSearchParams,
}) => {
  const { t } = useTranslation();

  const handleSubTabChange = (value: string) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("subtab", value);
        return newParams;
      },
      { replace: true },
    );
  };

  const subTabs = [
    {
      id: "analytics",
      label: t("classes.show.tabs.analytics"),
      icon: BarChart3,
    },
    {
      id: "leaderboard",
      label: t("classes.show.tabs.leaderboard"),
      icon: Trophy,
    },
  ];

  return (
    <div className="space-y-8 md:space-y-12">
      <Tabs value={activeSubTab} onValueChange={handleSubTabChange}>
        <div className="flex justify-center">
          <TabsList className="h-auto md:h-12 items-center justify-center rounded-full p-1 bg-muted/20 gap-1">
            {subTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "px-4 md:px-6 py-2 md:py-2.5 rounded-full font-bold text-xs transition-all duration-300 gap-2 h-9 md:h-10",
                    isActive
                      ? "bg-background shadow-sm text-primary"
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="analytics" className="mt-8">
          {activeSubTab === "analytics" && <AnalyticsTab classId={classId} />}
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-8">
          {activeSubTab === "leaderboard" && (
            <LeaderboardTab classId={classId} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
