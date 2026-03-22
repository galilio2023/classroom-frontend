import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { AttendanceSummary as AttendanceSummaryType } from "@/types/dashboard";
import { useTranslation, Trans } from "react-i18next";

interface AttendanceSummaryProps {
  summary: AttendanceSummaryType;
}

export const AttendanceSummary = ({ summary }: AttendanceSummaryProps) => {
  const { t } = useTranslation();
  const { present, absent, late, total } = summary;
  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return "text-green-500";
    if (rate >= 75) return "text-amber-500";
    return "text-destructive";
  };

  const getStatusBadge = (rate: number) => {
    if (rate >= 90) return <Badge variant="default" className="bg-green-500">{t("dashboard.common.excellent")}</Badge>;
    if (rate >= 75) return <Badge variant="secondary">{t("dashboard.common.good")}</Badge>;
    return <Badge variant="destructive">{t("dashboard.common.atRisk")}</Badge>;
  };

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/10 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{t("dashboard.student.attendanceOverview")}</CardTitle>
          </div>
          {getStatusBadge(attendanceRate)}
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-32 w-32 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                className="text-muted stroke-current"
                strokeWidth="8"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className={`${getStatusColor(attendanceRate)} stroke-current transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * attendanceRate) / 100}
                strokeLinecap="round"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-3xl font-black ${getStatusColor(attendanceRate)}`}>{attendanceRate}%</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("dashboard.common.rate")}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            <Trans
              i18nKey="dashboard.student.attendedXofY_new"
              values={{ present, total }}
              components={[
                <span key="present" className="text-foreground font-bold" />,
                <span key="total" className="text-foreground font-bold" />,
              ]}
            />
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-lg font-black text-green-600">{present}</span>
            <span className="text-[9px] font-black text-green-600/60 uppercase tracking-tighter">{t("classes.attendance.present")}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
            <XCircle className="h-4 w-4 text-destructive" />
            <span className="text-lg font-black text-destructive">{absent}</span>
            <span className="text-[9px] font-black text-destructive/60 uppercase tracking-tighter">{t("classes.attendance.absent")}</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
            <Clock className="h-4 w-4 text-amber-500" />
            <span className="text-lg font-black text-amber-600">{late}</span>
            <span className="text-[9px] font-black text-amber-600/60 uppercase tracking-tighter">{t("classes.attendance.late")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
