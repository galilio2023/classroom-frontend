import { motion } from "framer-motion";
import { Tv, Eye, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { ChannelStats } from "@/types/dashboard";

interface TeacherTvStatsProps {
  stats: ChannelStats;
  onManageClick: () => void;
}

export const TeacherTvStats = ({ stats, onManageClick }: TeacherTvStatsProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="grid gap-6 md:grid-cols-3"
    >
      <div className="md:col-span-3 flex items-center gap-3 mb-2 px-2 text-start">
        <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary">
          <Tv className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-black tracking-tight">
          {t("dashboard.staff.teacherTvStats")}
        </h2>
        <div className="h-px flex-1 bg-linear-to-r from-ai-primary/20 to-transparent" />
      </div>

      <Card className="rounded-4xl border-black/5 dark:border-white/5 bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden group text-start">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            {t("dashboard.staff.channelViews")}
          </CardTitle>
          <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
            <Eye className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black">{stats.totalViews?.toLocaleString() || 0}</div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {t("dashboard.staff.lifetimeViews")}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-4xl border-black/5 dark:border-white/5 bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden group text-start">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            {t("dashboard.staff.conversionRate")}
          </CardTitle>
          <div className="p-2 rounded-xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black">{(stats.conversionRate * 100).toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {t("dashboard.staff.enrollmentSuccess")}
          </p>
        </CardContent>
      </Card>

      <Card
        className="rounded-4xl border-black/5 dark:border-white/5 bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden group cursor-pointer text-start"
        onClick={onManageClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
            {t("dashboard.staff.channelStatus")}
          </CardTitle>
          <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary group-hover:scale-110 transition-transform">
            <Tv className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-black flex items-center gap-2">
            {t("dashboard.staff.active")}
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            {t("dashboard.staff.manageChannel")}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
