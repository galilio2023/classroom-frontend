import { motion } from "framer-motion";
import { StudentAcademicJourney } from "./student-academic-journey";
import { UpcomingAssignmentsList } from "./upcoming-assignments-list";
import {} from "./recent-activity";
import { ErrorBoundary } from "@/components/guards/error-boundary";
import { User, DashboardData } from "@/types";
import { usePWAInstall } from "@/hooks/use-pwa-install";
import { useTranslation } from "react-i18next";
import { useOne, useCustom, useNavigation } from "@refinedev/core";
import { MissionControlHero } from "./mission-control-hero";
import { QuickActions } from "./quick-actions";
import { Calendar, Rocket, Sparkles, Trophy, Tv, Brain } from "lucide-react";
import { useOfflineSync } from "@/features/engagement/hooks/use-offline-sync";
import React, { useState, useEffect } from "react";
import { useCapabilities } from "@/hooks/use-capabilities";
import { TodayLessonsWidget } from "./TodayLessonsWidget";
import { TodayLecturesWidget } from "./TodayLecturesWidget";
import { GpaPreviewWidget } from "./GpaPreviewWidget";

interface Props {
  identity: User | undefined;
  data: DashboardData;
  isLoading: boolean;
  list: (resource: string) => void;
  show: (resource: string, id: string) => void;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: () => void;
  variant?: "default" | "outline" | "ghost" | "ai";
}

export const StudentDashboard = ({ identity, data, isLoading, list, show }: Props) => {
  const { t } = useTranslation();
  const { push } = useNavigation() as any;
  const { isSchoolSuite, isFacultySuite } = useCapabilities();
  const { isInstallable, isStandalone, handleInstallClick } = usePWAInstall();
  const { isOnline, getNextOfflineMission } = useOfflineSync();
  const [offlineMission, setOfflineMission] = useState<any>(null);

  // 🚀 SRS: Fetch due reviews for nudge
  const { query: dueReviewsQuery } = useCustom<any[]>({
    url: `${import.meta.env.VITE_API_URL}/quizzes/due-reviews`,
    method: "get",
    queryOptions: {
      enabled: !!identity?.id && isOnline,
    },
  });

  const dueReviewsCount = (dueReviewsQuery.data?.data as any[])?.length || 0;

  // 🚀 MISSION CONTROL: Fetch personalized next action and readiness score
  const { query: missionQuery } = useOne({
    resource: "dashboard/mission",
    id: identity?.id || "me",
    queryOptions: {
      enabled: !!identity?.id && isOnline,
    },
  });

  const nextMission = isOnline ? missionQuery.data?.data : offlineMission;

  useEffect(() => {
    if (!isOnline) {
      getNextOfflineMission().then(setOfflineMission);
    }
  }, [isOnline]);

  const currentXP = identity?.xp || 0;
  const level = identity?.level || 1;
  const xpRequiredForNextLevel = level * 1000;
  const xpInCurrentLevel = currentXP % 1000;
  const xpNeeded = xpRequiredForNextLevel - xpInCurrentLevel;

  const hasClasses = (identity?.enrollments?.length || 0) > 0;
  const currentStreak = identity?.currentStreak || 0;

  // Generate Action Items dynamically based on data
  const actions: ActionItem[] = [];

  // PWA Install Prompt - Higher priority if not installed
  if (isInstallable && !isStandalone) {
    actions.push({
      id: "pwa-install",
      title: t("common.installAppTitle", "Tablawy OS on Mobile"),
      description: t(
        "common.installAppDesc",
        "Install Tablawy on your home screen for a better experience and offline access."
      ),
      icon: Rocket,
      action: handleInstallClick,
      variant: "ai",
    });
  }

  // 🧠 SRS Nudge
  if (dueReviewsCount > 0) {
    actions.push({
      id: "due-reviews",
      title: t("dashboard.student.actions.srs.title", "Memory Review"),
      description: t("dashboard.student.actions.srs.description", {
        count: dueReviewsCount,
        defaultValue: `You have ${dueReviewsCount} cognitive retention tasks due today.`,
      }),
      icon: Brain,
      action: () => push("/quizzes/due-reviews"),
      variant: "ai",
    });
  }

  // Study Buddy Prompt
  actions.push({
    id: "study-buddy",
    title: t("dashboard.student.actions.aiStudy.title"),
    description: t("dashboard.student.actions.aiStudy.description"),
    icon: Sparkles,
    action: () => list("ai-study-lab"),
    variant: "ai",
  });

  // Calendar Check
  actions.push({
    id: "calendar",
    title: t("dashboard.cards.calendar"),
    description: t("dashboard.cards.importantDates"),
    icon: Calendar,
    action: () => list("calendar"),
    variant: "outline",
  });

  // Teacher TV
  actions.push({
    id: "teacher-tv",
    title: t("discovery.label"),
    description: t("discovery.description", "Explore educational channels and live sessions."),
    icon: Tv,
    action: () => list("discovery"),
    variant: "outline",
  });

  return (
    <div className="space-y-10 md:space-y-16 pb-20">
      {/* 🛡️ HUB TODAY SECTION */}
      <div className="">
        {isFacultySuite ? (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TodayLecturesWidget />
            </div>
            <div className="lg:col-span-1">
              <GpaPreviewWidget />
            </div>
          </div>
        ) : isSchoolSuite ? (
          <div className="max-w-4xl">
            <TodayLessonsWidget />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16">
        {/* Left Column: Mission Control & Academic Journey (8/12) */}
        <div className="lg:col-span-8 space-y-10 md:space-y-16">
          <ErrorBoundary>
            <MissionControlHero
              mission={nextMission as any}
              isLoading={isLoading}
              streak={currentStreak}
              dailyLearningTime={data.dailyLearningTime}
              dailyGoalMinutes={(identity as any)?.dailyGoalMinutes}
            />
          </ErrorBoundary>

          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                {t("dashboard.student.academicJourney")}
              </h2>
            </div>
            <ErrorBoundary>
              <StudentAcademicJourney
                gradeTrends={data.gradeTrends ?? []}
                subjectMastery={data.subjectMastery ?? []}
                attendanceSummary={data.attendanceSummary}
              />
            </ErrorBoundary>
          </div>
        </div>

        {/* Right Column: Quick Actions & Upcoming (4/12) */}
        <div className="lg:col-span-4 space-y-10 md:space-y-16">
          <div className="space-y-8">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                {t("common.quickActions")}
              </h2>
            </div>
            <ErrorBoundary>
              <QuickActions
                cards={actions.map((a) => ({
                  title: a.title,
                  heading: a.title,
                  description: a.description,
                  icon: a.icon,
                  resource: a.id,
                  variant: a.variant,
                }))}
                list={(id) => {
                  const action = actions.find((a) => a.id === id);
                  action?.action();
                }}
              />
            </ErrorBoundary>
          </div>

          <ErrorBoundary>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <UpcomingAssignmentsList
                assignments={data.upcomingAssignments ?? []}
                list={list}
                show={show}
              />
            </motion.div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};
