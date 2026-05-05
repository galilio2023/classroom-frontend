import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Flame,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  MessageSquare,
  Activity,
} from "lucide-react";
import { XPProgressBar } from "@/features/engagement/components/xp-progress-bar";
import { ErrorBoundary } from "@/components/guards/error-boundary";
import { ChildSchedule } from "./ChildSchedule";
import { ChildGuardianPulse } from "./ChildGuardianPulse";
import { cn } from "@/lib/utils";

interface ChildCardProps {
  child: any;
  index: number;
  isAr: boolean;
  show: (resource: string, id: string | number) => void;
  onContact: (id: string) => void;
}

export const ChildCard = ({ child, index, isAr, show, onContact }: ChildCardProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      <Card className="border border-border/40 shadow-2xl bg-card/50 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden group hover:shadow-primary/10 hover:border-primary/20 transition-all duration-500 text-start">
        <CardHeader className="p-8 md:p-10 lg:p-12 pb-4 md:pb-6 flex flex-row items-center gap-6">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-primary/20 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Avatar className="h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 border-4 border-background shadow-xl rounded-[1.5rem] md:rounded-4xl group-hover:scale-105 transition-transform duration-500 relative z-10">
              <AvatarImage src={child.image ?? ""} className="object-cover" />
              <AvatarFallback className="bg-primary/5 text-primary font-black text-2xl md:text-3xl">
                {child.name[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight truncate group-hover:text-primary transition-colors duration-500">
              {child.name}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <Badge
                variant="ai"
                className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm"
              >
                {t("dashboard.student.level")} {child.level || 1}
              </Badge>
              {child.currentStreak > 0 && (
                <div className="flex items-center gap-1.5 text-orange-500 font-black text-[10px] uppercase tracking-widest bg-orange-500/5 px-2.5 py-1 rounded-full border border-orange-500/10">
                  <Flame className="h-3.5 w-3.5 fill-orange-500" />
                  {t("dashboard.parent.dayStreak", {
                    count: child.currentStreak,
                  })}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-2xl h-12 w-12 md:h-14 md:w-14 bg-muted/30 hover:bg-primary hover:text-white transition-all duration-500 shadow-sm shrink-0"
            onClick={() => show("guardian-portal", child.id)}
          >
            <ArrowRight className={cn("h-6 w-6 md:h-7 md:w-7", isAr && "rotate-180")} />
          </Button>
        </CardHeader>
        <CardContent className="p-8 md:p-10 lg:p-12 pt-4 md:pt-6 space-y-8 md:space-y-10">
          <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            <div className="p-5 md:p-6 lg:p-8 rounded-[1.75rem] md:rounded-4xl bg-primary/3 border border-primary/10 space-y-3 group/stat hover:bg-primary/6 transition-colors shadow-inner">
              <div className="flex items-center gap-2.5 text-primary/60">
                <div className="p-1.5 md:p-2 rounded-xl bg-primary/10">
                  <GraduationCap className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                  {t("dashboard.parent.gpaAverage")}
                </span>
              </div>
              <p className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-primary">
                {child.gpa || "88%"}
              </p>
            </div>
            <div className="p-5 md:p-6 lg:p-8 rounded-[1.75rem] md:rounded-4xl bg-emerald-500/3 border border-emerald-500/10 space-y-3 group/stat hover:bg-emerald-500/6 transition-colors shadow-inner">
              <div className="flex items-center gap-2.5 text-emerald-600/60">
                <div className="p-1.5 md:p-2 rounded-xl bg-emerald-500/10">
                  <ShieldCheck className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                  {t("dashboard.parent.attendance")}
                </span>
              </div>
              <p className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter text-emerald-600">
                {child.attendanceRate || "94%"}
              </p>
            </div>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <div className="flex justify-between items-end px-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary/40" />
                <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  {t("dashboard.parent.levelProgress")}
                </span>
              </div>
              <span className="text-xs lg:text-sm font-black text-primary bg-primary/5 px-3 lg:px-4 py-1 lg:py-1.5 rounded-full shadow-sm">
                {t("dashboard.parent.totalXp", {
                  count: child.xp || 0,
                })}
              </span>
            </div>
            <XPProgressBar
              xp={child.xp || 0}
              showLabel={false}
              className="h-3 lg:h-4 rounded-full bg-primary/10 shadow-inner p-0.5 indicatorClassName:shadow-[0_0_10px_rgba(var(--primary),0.5)]"
            />
          </div>

          <ErrorBoundary>
            <ChildSchedule childId={child.id} childName={child.name} show={show} />
          </ErrorBoundary>

          {/* 🛡️ Phase 4: AI Guardian Pulse */}
          <ErrorBoundary>
            <ChildGuardianPulse childId={child.id} childName={child.name} />
          </ErrorBoundary>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 lg:pt-6">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 rounded-[1.25rem] lg:rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] lg:text-[10px] h-14 lg:h-16 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary gap-3 shadow-sm"
              onClick={() => onContact(child.id)}
            >
              <MessageSquare className="h-4.5 w-4.5 lg:h-5 lg:w-5" />
              {t("dashboard.parent.contactTeachers")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="flex-1 rounded-[1.25rem] lg:rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] lg:text-[10px] h-14 lg:h-16 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary gap-3 shadow-sm"
              onClick={() => show("guardian-portal", child.id)}
            >
              <Activity className="h-4.5 w-4.5 lg:h-5 lg:w-5" />
              {t("dashboard.parent.fullReport")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
