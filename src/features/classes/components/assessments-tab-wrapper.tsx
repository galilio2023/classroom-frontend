import React from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AssignmentList } from "@/features/assignments/pages/list";
import { QuizTab } from "../pages/quiz-tab";
import { ClipboardCheck, FileQuestion } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssessmentsTabWrapperProps {
  classId: string;
  activeSubTab: string;
  setSearchParams: (
    setter: (prev: URLSearchParams) => URLSearchParams,
    options?: { replace: boolean },
  ) => void;
}

export const AssessmentsTabWrapper: React.FC<AssessmentsTabWrapperProps> = ({
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
      id: "assignments",
      label: t("classes.show.tabs.assignments"),
      icon: ClipboardCheck,
    },
    {
      id: "quizzes",
      label: t("classes.show.tabs.quizzes"),
      icon: FileQuestion,
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

        <TabsContent value="assignments" className="mt-8">
          {activeSubTab === "assignments" && (
            <AssignmentList classId={classId} />
          )}
        </TabsContent>

        <TabsContent value="quizzes" className="mt-8">
          {activeSubTab === "quizzes" && <QuizTab classId={classId} />}
        </TabsContent>
      </Tabs>
    </div>
  );
};
