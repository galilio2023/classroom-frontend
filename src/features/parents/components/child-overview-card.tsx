import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Flame,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Props {
  child: {
    id: string;
    name: string;
    image?: string;
    xp: number;
    level: number;
    currentStreak: number;
    attendanceRate: number;
    averageGrade: number | null;
    activeRiskLevel: "low" | "medium" | "high" | "critical";
    riskReason?: string | null;
  };
}

export const ChildOverviewCard = ({ child }: Props) => {
  const { t } = useTranslation();

  const riskColors = {
    low: "bg-success/10 text-success border-success/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    high: "bg-destructive/10 text-destructive border-destructive/20",
    critical: "bg-destructive text-white border-none animate-pulse",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden group">
        <CardHeader className="bg-muted/30 pb-8 relative">
          <div className="flex items-center justify-between mb-4">
            <Badge
              className={cn(
                "px-3 py-1 rounded-full font-black uppercase tracking-widest text-[9px]",
                riskColors[child.activeRiskLevel]
              )}
            >
              {child.activeRiskLevel === "low" ? (
                <CheckCircle2 className="h-3 w-3 me-1" />
              ) : (
                <AlertTriangle className="h-3 w-3 me-1" />
              )}
              {t(`guardian.risk.${child.activeRiskLevel}`, { defaultValue: child.activeRiskLevel })}
            </Badge>
            <div className="flex items-center gap-1.5 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-lg border border-border/50">
              <Flame className="h-3 w-3 text-orange-500 fill-orange-500" />
              <span className="text-[10px] font-black">{child.currentStreak}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
              <AvatarImage src={child.image} />
              <AvatarFallback className="bg-primary/5 text-primary text-xl font-black">
                {child.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">{child.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="outline"
                  className="text-[9px] font-black uppercase tracking-tighter"
                >
                  Level {child.level}
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  {child.xp} XP Earned
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">
                <Users className="h-3 w-3" />
                Attendance
              </div>
              <p className="text-2xl font-black">{child.attendanceRate}%</p>
            </div>
            <div className="p-4 rounded-2xl bg-success/5 border border-success/10">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-success/60 mb-1">
                <TrendingUp className="h-3 w-3" />
                Avg. Grade
              </div>
              <p className="text-2xl font-black">
                {child.averageGrade !== null ? `${child.averageGrade}%` : "--"}
              </p>
            </div>
          </div>

          {child.riskReason && (
            <div className="p-4 rounded-2xl bg-destructive/5 border border-dashed border-destructive/20">
              <p className="text-[10px] font-bold text-destructive/80 leading-relaxed">
                <AlertTriangle className="h-3 w-3 inline me-1.5 -mt-0.5" />
                {child.riskReason}
              </p>
            </div>
          )}

          <Button
            asChild
            className="w-full h-12 rounded-xl font-black uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
          >
            <Link to={`/parent/child/${child.id}`}>
              View Full Report
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
