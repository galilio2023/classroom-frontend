import React from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DetailsTab } from "@/components/classes/show/details-tab";
import { StaffTab } from "@/components/classes/show/staff-tab";
import { Info, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Class } from "@/types";

interface InfoTabWrapperProps {
  aClass: Class;
  isOwner: boolean;
  isStaff: boolean;
  teacherNotes: string;
  isLoadingNotes: boolean;
  handleNoteChange: (val: string) => void;
  handleCopyInviteCode: () => void;
  copied: boolean;
  onInviteClick: () => void;
  activeSubTab: string;
  setSearchParams: (
    setter: (prev: URLSearchParams) => URLSearchParams,
    options?: { replace: boolean }
  ) => void;
}

export const InfoTabWrapper: React.FC<InfoTabWrapperProps> = ({
  aClass,
  isOwner,
  isStaff,
  teacherNotes,
  isLoadingNotes,
  handleNoteChange,
  handleCopyInviteCode,
  copied,
  onInviteClick,
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
      id: "details",
      label: t("classes.show.tabs.details"),
      icon: Info,
    },
    {
      id: "staff",
      label: "Staff",
      icon: Users,
      show: isOwner,
    },
  ];

  const visibleSubTabs = subTabs.filter((tab) => tab.show !== false);

  return (
    <div className="space-y-8 md:space-y-12">
      <Tabs value={activeSubTab} onValueChange={handleSubTabChange}>
        <div className="flex justify-center">
          <TabsList className="h-auto md:h-12 items-center justify-center rounded-full p-1 bg-muted/20 gap-1">
            {visibleSubTabs.map((tab) => {
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

        <TabsContent value="details" className="mt-8">
          {activeSubTab === "details" && (
            <DetailsTab
              aClass={aClass}
              isOwner={isOwner}
              isStaff={isStaff}
              teacherNotes={teacherNotes}
              isLoadingNotes={isLoadingNotes}
              handleNoteChange={handleNoteChange}
              handleCopyInviteCode={handleCopyInviteCode}
              copied={copied}
              onInviteClick={onInviteClick}
            />
          )}
        </TabsContent>

        <TabsContent value="staff" className="mt-8">
          {activeSubTab === "staff" && (
            <StaffTab classId={aClass.id.toString()} isOwner={isOwner} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
