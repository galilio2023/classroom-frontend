import { Card } from "@/components/ui/card";
import { Activity, UserCheck, UserMinus } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AttendanceStatsProps {
  stats: {
    total: number;
    avgPresent: number;
    recentAbsence: number;
  };
  isLoading: boolean;
  isStaff: boolean;
}

export const AttendanceStats = ({ stats, isLoading, isStaff }: AttendanceStatsProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-start">
      <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-primary/5">
        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("classes.attendance.governance.totalSessions")}
          </p>
          <p className="text-2xl font-black">{isLoading ? "..." : stats.total}</p>
        </div>
      </Card>
      <Card className="p-6 border-green-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-green-500/5">
        <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
          <UserCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("classes.attendance.governance.avgPresence")}
          </p>
          <p className="text-2xl font-black text-green-600">
            {isLoading ? "..." : `${stats.avgPresent}%`}
          </p>
        </div>
      </Card>
      <Card className="p-6 border-amber-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-amber-500/5">
        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
          <UserMinus className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {isStaff
              ? t("classes.attendance.governance.actionRequired")
              : t("classes.attendance.governance.totalAbsences")}
          </p>
          <p className="text-2xl font-black text-amber-600">
            {isLoading ? "..." : isStaff ? "0" : stats.recentAbsence}
          </p>
        </div>
      </Card>
    </div>
  );
};
