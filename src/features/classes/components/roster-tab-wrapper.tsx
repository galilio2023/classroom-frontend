import React from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StudentsTab } from "@/components/classes/show/students-tab";
import { AttendanceTab } from "../pages/attendance-tab";
import { Users, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Enrollment } from "@/types";

interface RosterTabWrapperProps {
  classId: string;
  approvedEnrollments: Enrollment[];
  pendingEnrollments: Enrollment[];
  isStaff: boolean;
  onInsight: (student: { id: string; name: string }) => void;
  onUnenroll: (id: number) => void;
  onEnrollClick: () => void;
  onMessageAllClick: () => void;
  onEnrollmentAction: (id: number, status: "approved" | "rejected") => void;
  activeSubTab: string;
  setSearchParams: (
    setter: (prev: URLSearchParams) => URLSearchParams,
    options?: { replace: boolean }
  ) => void;
}

export const RosterTabWrapper: React.FC<RosterTabWrapperProps> = ({
  classId,
  approvedEnrollments,
  pendingEnrollments,
  isStaff,
  onInsight,
  onUnenroll,
  onEnrollClick,
  onMessageAllClick,
  onEnrollmentAction,
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
      id: "students",
      label: t("classes.show.tabs.students"),
      icon: Users,
    },
    {
      id: "attendance",
      label: t("classes.show.tabs.attendance"),
      icon: CheckCircle2,
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

        <TabsContent value="students" className="mt-8">
          {activeSubTab === "students" && (
            <StudentsTab
              classId={classId}
              approvedCount={approvedEnrollments.length}
              pendingEnrollments={pendingEnrollments}
              isStaff={isStaff}
              onInsight={onInsight}
              onUnenroll={onUnenroll}
              onEnrollClick={onEnrollClick}
              onMessageAllClick={onMessageAllClick}
              onEnrollmentAction={onEnrollmentAction}
            />
          )}
        </TabsContent>

        <TabsContent value="attendance" className="mt-8">
          {activeSubTab === "attendance" && (
            <AttendanceTab classId={classId} enrollments={approvedEnrollments} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
