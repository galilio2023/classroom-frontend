import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AnnouncementTab } from "../pages/announcement-tab";
import { DiscussionTab } from "../pages/discussion-tab";
import {} from "@/components/classes/live-classroom";
import { usePersistentLive } from "@/hooks/use-persistent-live";
import { Button } from "@/components/ui/button";
import { Megaphone, MessageSquare, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import { Announcement } from "@/types";

interface EngagementTabWrapperProps {
  classId: string;
  announcements: Announcement[];
  dismissedAnnouncements: number[];
  handleDismissAnnouncement: (id: number) => void;
  isLiveIndicator: boolean;
  activeSubTab: string;
  setSearchParams: (
    setter: (prev: URLSearchParams) => URLSearchParams,
    options?: { replace: boolean }
  ) => void;
}

export const EngagementTabWrapper: React.FC<EngagementTabWrapperProps> = ({
  classId,
  announcements,
  dismissedAnnouncements,
  handleDismissAnnouncement,
  isLiveIndicator,
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
      id: "announcements",
      label: t("classes.show.tabs.announcements"),
      icon: Megaphone,
    },
    {
      id: "discussions",
      label: t("classes.show.tabs.discussions"),
      icon: MessageSquare,
    },
    {
      id: "live",
      label: t("classes.show.tabs.live"),
      icon: Video,
      indicator: isLiveIndicator,
    },
  ];

  const {
    isJoined,
    activeClassId: activeClassId,
    setActiveClassId,
    setIsJoined,
  } = usePersistentLive();

  // 🚀 AUTO-JOIN LOGIC: If tab is active and class is live, ensure store knows we are joining
  useEffect(() => {
    if (activeSubTab === "live" && isLiveIndicator && !isJoined) {
      console.log("[EngagementTab] Auto-activating live session for class:", classId);
      setActiveClassId(classId);
      setIsJoined(true);
    }
  }, [activeSubTab, isLiveIndicator, isJoined, classId, setActiveClassId, setIsJoined]);

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
                  {tab.indicator && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="announcements" className="mt-8">
          {activeSubTab === "announcements" && (
            <AnnouncementTab
              classId={classId}
              announcements={announcements}
              dismissedAnnouncements={dismissedAnnouncements}
              handleDismissAnnouncement={handleDismissAnnouncement}
            />
          )}
        </TabsContent>

        <TabsContent value="discussions" className="mt-8">
          {activeSubTab === "discussions" && <DiscussionTab classId={classId} />}
        </TabsContent>

        <TabsContent value="live" className="mt-8">
          {activeSubTab === "live" && (
            <div
              id="live-session-container"
              className="w-full h-[600px] bg-slate-950 rounded-3xl border-2 border-white/5 flex flex-col items-center justify-center gap-4 shadow-inner"
            >
              <div className="p-4 bg-live-primary/20 rounded-full animate-pulse">
                <Video className="h-8 w-8 text-live-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-slate-400 font-bold tracking-tighter uppercase text-xs">
                  {isJoined ? "Initializing Session..." : "Session Ready"}
                </p>
                {!isJoined && (
                  <Button
                    size="lg"
                    onClick={() => {
                      setActiveClassId(classId);
                      setIsJoined(true);
                    }}
                    className="mt-6 bg-live-primary hover:bg-live-primary/90 text-white font-black uppercase tracking-widest text-xs rounded-2xl px-10 shadow-2xl shadow-live-primary/40 border-none"
                  >
                    Join Live Session
                  </Button>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
