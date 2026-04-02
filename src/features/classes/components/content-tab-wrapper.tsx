import React from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CurriculumTab } from "../pages/curriculum-tab";
import { ResourceTab } from "../pages/resource-tab";
import { LayoutGrid, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { Class } from "@/types";

interface ContentTabWrapperProps {
  classId: string;
  aClass?: Class;
  activeSubTab: string;
  setSearchParams: (
    setter: (prev: URLSearchParams) => URLSearchParams,
    options?: { replace: boolean }
  ) => void;
}

export const ContentTabWrapper: React.FC<ContentTabWrapperProps> = ({
  classId,
  aClass,
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
      { replace: true }
    );
  };

  const subTabs = [
    {
      id: "curriculum",
      label: t("classes.show.tabs.curriculum"),
      icon: LayoutGrid,
    },
    {
      id: "resources",
      label: t("classes.show.tabs.resources"),
      icon: Library,
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
                      : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="curriculum" className="mt-8">
          {activeSubTab === "curriculum" && <CurriculumTab classId={classId} aClass={aClass} />}
        </TabsContent>

        <TabsContent value="resources" className="mt-8">
          {activeSubTab === "resources" && <ResourceTab classId={classId} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};
