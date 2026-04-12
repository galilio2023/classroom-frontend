import { useCustom, useGetIdentity, useList } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Award,
  Flame,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  Star,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { User as UserType } from "@/types";
import { XPProgressBar } from "@/components/xp-progress-bar";
import { getLevelProgress } from "@/lib/xp";
import { BadgeCard, BadgeData } from "@/components/ui/badge-card";
import { StudentAcademicJourney } from "@/features/dashboard/components/student-academic-journey";
import { SubmissionHeatmap } from "@/features/dashboard/components/submission-heatmap";
import { motion } from "framer-motion";
import usePageTitle from "@/hooks/use-page-title";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useMemo } from "react";

const StudentPortfolio = () => {
  const { id } = useParams();
  const { data: identity } = useGetIdentity<UserType>();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const studentId = id || identity?.id;

  const { query: userQuery } = useCustom<UserType>({
    url: `/users/${studentId}`,
    method: "get",
  });

  const { data: userData, isLoading: isUserLoading } = userQuery;

  const { query: analyticsQuery } = useCustom<any>({
    url: `/users/${studentId}/portfolio-analytics`,
    method: "get",
    queryOptions: {
      enabled: !!studentId,
    },
  });

  const { data: analyticsData, isLoading: isAnalyticsLoading } = analyticsQuery;

  // Fetch All Available Badges
  const { result: allBadgesResult, query: badgesQuery } = useList<any>({
    resource: "badges",
    pagination: { mode: "off" },
  });

  const isBadgesLoading = badgesQuery.isLoading;

  const user = userData?.data;
  const analytics = analyticsData?.data;
  const allBadges = allBadgesResult?.data || [];

  const combinedBadges = useMemo(() => {
    if (!allBadges.length) return [];
    const earnedIds = new Set(analytics?.badges?.map((b: any) => b.id) || []);

    return allBadges.map((b: any) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      iconUrl: b.iconUrl,
      unlocked: earnedIds.has(b.id),
    }));
  }, [allBadges, analytics?.badges]);

  usePageTitle(
    user?.name
      ? t("portfolioPage.pageTitle", { name: user.name })
      : t("portfolioPage.fallbackPageTitle")
  );

  if (isUserLoading || isAnalyticsLoading || isBadgesLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] gap-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div className="absolute -inset-5 rounded-full bg-primary/5 animate-ping duration-3000" />
          <Loader2 className="h-20 w-20 animate-spin text-primary/10 stroke-1" />
          <div className="absolute inset-0 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary/30" />
          </div>
        </motion.div>
        <div className="text-center space-y-2">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse">
            {t("portfolioPage.loading")}
          </h2>
          <p className="text-xs font-medium text-muted-foreground/60 italic">
            Mapping academic achievements...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-32 text-center space-y-8">
        <div className="p-8 rounded-[2.5rem] bg-destructive/5 text-destructive w-fit mx-auto border border-destructive/10">
          <GraduationCap className="h-20 w-20 opacity-20" />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black tracking-tight">{t("portfolioPage.notFound")}</h2>
          <p className="text-muted-foreground font-medium max-w-md mx-auto text-lg">
            {t("portfolioPage.notFoundDesc")}
          </p>
        </div>
      </div>
    );
  }

  const { currentLevel } = getLevelProgress(user.xp || 0);

  return (
    <div className="space-y-10 md:space-y-16 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 md:space-y-6 text-start"
      >
        <Breadcrumb />
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
            <GraduationCap className="h-6 w-6 md:h-8 md:w-8" />
          </div>
          <div>
            <h1 className="page-title mb-0">{t("portfolioPage.title")}</h1>
            <p className="text-muted-foreground font-medium max-w-2xl text-balance">
              {t("portfolioPage.description")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Hero Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4"
        >
          <Card className="overflow-hidden border-border/40 shadow-2xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl">
            <div className="h-32 bg-linear-to-br from-primary/20 via-primary/10 to-transparent relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            </div>
            <CardContent className="relative pt-0 flex flex-col items-center text-center px-6 md:px-8 pb-10 md:pb-12">
              <Avatar className="h-32 w-32 md:h-40 md:w-40 border-8 border-background -mt-16 shadow-2xl rounded-4xl md:rounded-[2.5rem]">
                <AvatarImage src={user.image ?? ""} className="object-cover" />
                <AvatarFallback className="text-4xl md:text-5xl font-black bg-primary text-primary-foreground">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>

              <div className="mt-6 space-y-3">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight text-balance">
                  {user.name}
                </h2>
                <div className="flex items-center justify-center gap-2">
                  <Badge
                    variant="secondary"
                    className="capitalize font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest shadow-sm"
                  >
                    {t("portfolioPage.level", { level: currentLevel })}
                  </Badge>
                  <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1.5 rounded-full text-[10px] tracking-widest uppercase shadow-sm">
                    {t("portfolioPage.xp", { xp: user.xp || 0 })}
                  </Badge>
                </div>
              </div>

              <div className="w-full mt-8 space-y-4">
                <div className="flex justify-between items-end px-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                    {t("portfolioPage.progressToLevel", {
                      level: currentLevel + 1,
                    })}
                  </span>
                  <span className="text-xs font-black text-primary">
                    {Math.round(((user.xp || 0) % 1000) / 10)}%
                  </span>
                </div>
                <XPProgressBar xp={user.xp || 0} />
              </div>

              <Separator className="my-10 opacity-50" />

              <div className="w-full space-y-4 text-start">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40 shadow-sm">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">
                      {t("portfolioPage.email")}
                    </span>
                    <span className="font-bold truncate text-sm md:text-base">{user.email}</span>
                  </div>
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-border/40 shadow-sm">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-muted-foreground/60 tracking-widest">
                        {t("portfolioPage.phone")}
                      </span>
                      <span className="font-bold text-sm md:text-base">{user.phoneNumber}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-8 space-y-8 md:space-y-12"
        >
          {/* Stats Grid - Mobile Optimized (2x2) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                label: t("portfolioPage.stats.badges"),
                value: analytics?.totalBadges || 0,
                icon: Trophy,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
              {
                label: t("portfolioPage.stats.avgGrade"),
                value: `${analytics?.avgGrade || 0}%`,
                icon: Target,
                color: "text-primary",
                bg: "bg-primary/10",
              },
              {
                label: t("portfolioPage.stats.dayStreak"),
                value: analytics?.streak || 0,
                icon: Flame,
                color: "text-orange-500",
                bg: "bg-orange-500/10",
              },
              {
                label: t("portfolioPage.stats.globalRank"),
                value: analytics?.rank || "N/A",
                icon: Star,
                color: "text-yellow-500",
                bg: "bg-yellow-500/10",
              },
            ].map((stat, i) => (
              <Card
                key={i}
                className="p-6 flex flex-col items-center justify-center text-center border-border/40 bg-card/50 backdrop-blur-3xl rounded-4xl shadow-sm hover:shadow-xl transition-all duration-500 group"
              >
                <div
                  className={cn(
                    "p-3.5 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500",
                    stat.bg,
                    stat.color
                  )}
                >
                  <stat.icon className="h-6 w-6 md:h-7 md:w-7" />
                </div>
                <span className="text-3xl md:text-4xl font-black tracking-tighter">
                  {stat.value}
                </span>
                <span className="text-[10px] md:text-[11px] uppercase font-black text-muted-foreground/60 tracking-[0.2em] mt-2">
                  {stat.label}
                </span>
              </Card>
            ))}
          </div>

          {/* Learning Consistency (Heatmap) */}
          <Card className="border-border/40 shadow-2xl rounded-[2.5rem] md:rounded-[3rem] bg-card/50 backdrop-blur-3xl overflow-hidden">
            <CardHeader className="p-8 md:p-10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <Activity className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-black tracking-tight">
                  {t("portfolioPage.learningConsistency")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 md:p-10 pt-4 overflow-x-auto">
              <SubmissionHeatmap data={analytics?.submissionHeatmap || []} />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Analytics Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-8 md:space-y-12"
      >
        <div className="flex items-center gap-4 px-2">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
            <TrendingUp className="h-6 w-6 md:h-8 md:w-8" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-2xl md:text-4xl font-black tracking-tight">
              {t("portfolioPage.academicJourney")}
            </h3>
            <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5">
              Outcomes & Growth
            </span>
          </div>
          <div className="hidden sm:block h-px flex-1 bg-linear-to-r from-primary/10 to-transparent ms-6" />
        </div>

        <StudentAcademicJourney
          gradeTrends={analytics?.gradeTrends || []}
          subjectMastery={analytics?.subjectMastery || []}
          attendanceSummary={analytics?.attendanceSummary || {}}
        />
      </motion.div>

      {/* Badges Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-8 md:space-y-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-2 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm">
              <Award className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <div className="flex flex-col">
              <h3 className="text-2xl md:text-4xl font-black tracking-tight">
                {t("portfolioPage.unlockedAchievements")}
              </h3>
              <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5">
                Badges & Accomplishments
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="w-fit rounded-full border-primary/20 font-black text-[10px] uppercase tracking-[0.2em] px-6 py-2 shadow-sm bg-background/40 backdrop-blur-xl"
          >
            {t("portfolioPage.badgesEarned", {
              earned: analytics?.totalBadges || 0,
              total: allBadges.length,
            })}
          </Badge>
        </div>
        <Card className="p-8 md:p-12 lg:p-16 border-border/40 shadow-2xl rounded-[3rem] bg-card/50 backdrop-blur-3xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 md:gap-10">
            {combinedBadges.map((badge: any) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentPortfolio;
