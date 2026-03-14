import { useGetIdentity, useCustom } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  Trophy, 
  Award, 
  Star, 
  Flame, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin,
  Sparkles,
  Zap,
  Activity,
  GraduationCap
} from "lucide-react";
import { User as UserType, UserRole } from "@/types";
import { XPProgressBar } from "@/components/xp-progress-bar";
import { getLevelProgress } from "@/lib/xp";
import { BadgeCard, MOCK_BADGES } from "@/components/badge-card";
import { StudentAcademicJourney } from "@/components/dashboard/student-academic-journey";
import { SubmissionHeatmap } from "@/components/dashboard/submission-heatmap";
import { motion } from "framer-motion";
import usePageTitle from "@/hooks/use-page-title";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const StudentPortfolio = () => {
  const { id } = useParams();
  const { data: identity } = useGetIdentity<UserType>();
  const { t } = useTranslation();
  
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
    }
  });

  const { data: analyticsData, isLoading: isAnalyticsLoading } = analyticsQuery;

  const user = userData?.data;
  const analytics = analyticsData?.data;

  usePageTitle(user?.name ? t("portfolioPage.pageTitle", { name: user.name }) : t("portfolioPage.fallbackPageTitle"));

  if (isUserLoading || isAnalyticsLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">{t("portfolioPage.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-black">{t("portfolioPage.notFound")}</h2>
        <p className="text-muted-foreground">{t("portfolioPage.notFoundDesc")}</p>
      </div>
    );
  }

  const { currentLevel } = getLevelProgress(user.xp || 0);

  return (
    <div className="container mx-auto py-10 max-w-6xl space-y-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Breadcrumb />
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">{t("portfolioPage.title")}</h1>
            <p className="text-muted-foreground font-medium">{t("portfolioPage.description")}</p>
          </div>
        </div>
      </motion.div>

      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4"
        >
          <Card className="overflow-hidden border-primary/10 shadow-2xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
            <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            </div>
            <CardContent className="relative pt-0 flex flex-col items-center text-center px-8 pb-10">
              <Avatar className="h-32 w-32 border-8 border-background -mt-16 shadow-2xl rounded-[2rem]">
                <AvatarImage src={user.image ?? ""} className="object-cover" />
                <AvatarFallback className="text-4xl font-black bg-primary text-primary-foreground">
                  {user.name[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="mt-6 space-y-3">
                <h2 className="text-3xl font-black tracking-tight">{user.name}</h2>
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="font-black px-4 py-1 rounded-lg text-[10px] tracking-widest uppercase">
                    {t("portfolioPage.level", { level: currentLevel })}
                  </Badge>
                  <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1 rounded-lg text-[10px] tracking-widest uppercase">
                    {t("portfolioPage.xp", { xp: user.xp || 0 })}
                  </Badge>
                </div>
              </div>
              
              <div className="w-full mt-8 space-y-4">
                <div className="flex justify-between items-end px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("portfolioPage.progressToLevel", { level: currentLevel + 1 })}</span>
                    <span className="text-xs font-black text-primary">{Math.round(((user.xp || 0) % 1000) / 10)}%</span>
                </div>
                <XPProgressBar xp={user.xp || 0} />
              </div>
              
              <Separator className="my-8 opacity-50" />
              
              <div className="w-full space-y-4 text-left">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-primary/5">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Mail className="h-5 w-5" /></div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t("portfolioPage.email")}</span>
                    <span className="font-bold truncate text-sm">{user.email}</span>
                  </div>
                </div>
                {user.phoneNumber && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-background/50 border border-primary/5">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><Phone className="h-5 w-5" /></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{t("portfolioPage.phone")}</span>
                      <span className="font-bold text-sm">{user.phoneNumber}</span>
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
          className="lg:col-span-8 space-y-8"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
                { label: t("portfolioPage.stats.badges"), value: analytics?.totalBadges || 0, icon: Trophy, color: "text-amber-500", bg: "bg-amber-500/10" },
                { label: t("portfolioPage.stats.avgGrade"), value: `${analytics?.avgGrade || 0}%`, icon: Target, color: "text-primary", bg: "bg-primary/10" },
                { label: t("portfolioPage.stats.dayStreak"), value: analytics?.streak || 0, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
                { label: t("portfolioPage.stats.globalRank"), value: analytics?.rank || "N/A", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
            ].map((stat, i) => (
                <Card key={i} className="p-6 flex flex-col items-center justify-center text-center border-primary/5 bg-card/50 backdrop-blur-sm rounded-[2rem] shadow-lg shadow-primary/5">
                    <div className={cn("p-3 rounded-2xl mb-3", stat.bg, stat.color)}>
                        <stat.icon className="h-6 w-6" />
                    </div>
                    <span className="text-3xl font-black tracking-tight">{stat.value}</span>
                    <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest mt-1">{stat.label}</span>
                </Card>
            ))}
          </div>

          <Card className="border-primary/10 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Activity className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-2xl font-black tracking-tight">{t("portfolioPage.learningConsistency")}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-8 pt-4">
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
        className="space-y-8"
      >
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-3xl font-black tracking-tight">{t("portfolioPage.academicJourney")}</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent ml-4" />
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
        className="space-y-8"
      >
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                <Award className="h-6 w-6" />
            </div>
            <h3 className="text-3xl font-black tracking-tight">{t("portfolioPage.unlockedAchievements")}</h3>
          </div>
          <Badge variant="outline" className="font-black text-[10px] uppercase tracking-widest px-4 py-2 rounded-xl border-primary/10">
            {t("portfolioPage.badgesEarned", { earned: MOCK_BADGES.filter(b => b.unlocked).length, total: MOCK_BADGES.length })}
          </Badge>
        </div>
        <Card className="p-10 border-primary/10 shadow-xl rounded-[3rem] bg-card/50 backdrop-blur-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
            {MOCK_BADGES.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} />
            ))}
            </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default StudentPortfolio;
