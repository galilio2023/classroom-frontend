import { Class } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Clock, Globe, Timer, Users, Video } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Fragment, useMemo } from "react";
import { getSubjectIcon } from "@/lib/subject-icons";

interface ClassBannerProps {
  aClass: Class;
  approvedCount: number;
  waitlistedCount: number;
  isLiveIndicator: boolean;
}

export const ClassBanner = ({
  aClass,
  approvedCount,
  waitlistedCount,
  isLiveIndicator,
}: ClassBannerProps) => {
  const { t, i18n } = useTranslation();
  const classColor = aClass.color || "#3b82f6";
  const isFull = aClass.capacity && approvedCount >= aClass.capacity;

  const SubjectIcon = useMemo(
    () => getSubjectIcon(aClass.subject?.name),
    [aClass.subject?.name],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative min-h-64 md:h-80 w-full rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl group text-start flex flex-col justify-end"
      style={{ backgroundColor: classColor }}
    >
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />

      <div className="relative z-10 p-6 md:p-10 lg:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8 w-full">
        <div className="space-y-4 md:space-y-6 max-w-4xl flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-lg border border-white/10 group-hover:scale-110 transition-transform duration-500">
              <SubjectIcon className="h-6 w-6 md:h-8 md:w-8" />
            </div>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border border-white/10 backdrop-blur-md font-black text-[10px] md:text-xs uppercase tracking-widest px-4 py-1.5 md:py-2 rounded-xl shadow-sm"
            >
              {aClass.subject?.department?.name ||
                t("classes.show.banner.academic")}
            </Badge>
            {isFull && (
              <Badge className="bg-orange-500 text-white border-none font-black text-[10px] md:text-xs uppercase tracking-widest px-4 py-1.5 md:py-2 rounded-xl shadow-lg">
                <span className="flex items-center gap-2">
                  <Timer className="w-3.5 h-3.5" />
                  {t("classes.show.banner.waitlistActive")}
                </span>
              </Badge>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-tight md:leading-[0.9] text-balance">
            {aClass.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 md:gap-x-6 gap-y-3 text-white/90 font-black text-[10px] md:text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
              <Globe className="h-4 w-4 text-white/70" />
              <span>{aClass.subject?.name}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
              <Users className="h-4 w-4 text-white/70" />
              <span>
                {t("classes.show.banner.studentsEnrolled", {
                  count: approvedCount,
                })}
              </span>
            </div>
            {waitlistedCount > 0 && (
              <div className="flex items-center gap-2 bg-orange-500/20 backdrop-blur-md text-orange-200 px-3 py-1.5 rounded-full border border-orange-500/30 shadow-inner">
                <Timer className="h-4 w-4" />
                <span>
                  {t("classes.show.banner.onWaitlist", {
                    count: waitlistedCount,
                  })}
                </span>
              </div>
            )}
            {aClass.schedules?.slice(0, 2).map((schedule, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-inner"
              >
                <Clock className="h-4 w-4 text-white/70" />
                <span>
                  {t(`days.${schedule.day.substring(0, 3)}` as any)} •{" "}
                  {schedule.startTime}
                </span>
              </div>
            ))}
          </div>
        </div>

        {isLiveIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-red-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-4xl shadow-2xl shadow-red-500/40 animate-pulse border-2 border-white/20 self-start md:self-end shrink-0"
          >
            <Video className="h-5 w-5 md:h-6 md:w-6" />
            <span className="font-black uppercase tracking-widest text-[10px] md:text-sm whitespace-nowrap">
              {t("classes.show.banner.liveActive")}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
