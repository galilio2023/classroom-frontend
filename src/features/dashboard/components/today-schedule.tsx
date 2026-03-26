import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Sparkles, Calendar, Info } from "lucide-react";
import { ScheduleItem } from "@/types/dashboard";
import { ScheduleItemCard } from "./schedule-item-card";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface TodayScheduleProps {
  schedule: ScheduleItem[];
  show: (resource: string, id: string) => void;
}

export const TodaySchedule = ({ schedule, show }: TodayScheduleProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border border-border/80 dark:border-white/5 shadow-2xl bg-card/50 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] relative group">
        {/* Premium Background Effects */}
        <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-primary/5 rounded-full blur-3xl -mr-16 md:-mr-24 -mt-16 md:-mt-24 pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
        <div className="absolute bottom-0 left-0 w-24 md:w-32 h-24 md:h-32 bg-ai-primary/5 rounded-full blur-3xl -ml-12 md:-ml-16 -mb-12 md:-mb-16 pointer-events-none" />

        <CardHeader className="p-5 md:p-8 pb-3 md:pb-4 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl md:text-2xl font-black flex items-center gap-2 md:gap-3 tracking-tighter">
              <div className="p-2 md:p-2.5 rounded-lg md:rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
                <Clock className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              {t("dashboard.schedule.today")}
            </CardTitle>
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0.5 md:px-3 md:py-1 font-black text-[9px] md:text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-none"
            >
              {t("dashboard.schedule.classesCount", { count: schedule.length })}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 md:p-8 pt-2 md:pt-4 space-y-4 md:space-y-6 relative">
          <AnimatePresence mode="popLayout">
            {schedule.length > 0 ? (
              <div className="grid gap-3 md:gap-4">
                {schedule.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ScheduleItemCard
                      item={item}
                      onClick={(id) => show("classes", id)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10 md:py-16 border-none shadow-inner bg-muted/20 rounded-[1.5rem] md:rounded-[2rem] flex flex-col items-center gap-4 group/empty overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative p-4 md:p-5 rounded-full bg-primary/10 text-primary group-hover/empty:scale-110 transition-transform duration-500">
                    <Calendar className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                </div>
                <div className="space-y-1 relative z-10 px-4">
                  <p className="text-lg md:text-xl font-black tracking-tight text-foreground">
                    {t("dashboard.schedule.freeDay")}
                  </p>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground/60">
                    {t("dashboard.schedule.noClasses")}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-primary/60 relative z-10">
                  <Sparkles className="h-3 w-3" />
                  <span>{t("dashboard.schedule.enjoyTimeOff")}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {schedule.length > 0 && (
            <div className="pt-3 md:pt-4 border-t border-black/[0.03] dark:border-white/[0.03] flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
              <Info className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {t("dashboard.schedule.clickClass")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
