import { Class } from "@/types";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Clock, 
  Globe, 
  Timer, 
  Users, 
  Video,
  Calculator,
  FlaskConical,
  Languages,
  Palette,
  Music,
  Dumbbell,
  Code,
  Landmark,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Fragment, useMemo } from "react";

interface ClassBannerProps {
  aClass: Class;
  approvedCount: number;
  waitlistedCount: number;
  isLiveIndicator: boolean;
}

const getSubjectIcon = (subjectName?: string | null) => {
  const name = (subjectName || "").toLowerCase();
  
  // High Priority / Specific matches
  if (name.includes("tech") || name.includes("code") || name.includes("computer") || name.includes("web") || name.includes("software") || name.includes("ai")) return Code;
  if (name.includes("science") || name.includes("bio") || name.includes("chem") || name.includes("phys") || name.includes("lab")) return FlaskConical;
  if (name.includes("math") || name.includes("calc") || name.includes("algebra")) return Calculator;
  if (name.includes("lang") || name.includes("english") || name.includes("arabic") || name.includes("french") || name.includes("spanish") || name.includes("linguistics")) return Languages;
  if (name.includes("art") || name.includes("design") || name.includes("draw") || name.includes("paint")) return Palette;
  if (name.includes("music") || name.includes("band") || name.includes("choir")) return Music;
  if (name.includes("sport") || name.includes("gym") || name.includes("physical") || name.includes("health") || name.includes("athletic")) return Dumbbell;
  if (name.includes("hist") || name.includes("geog") || name.includes("social") || name.includes("civics") || name.includes("politi")) return Landmark;
  if (name.includes("writ") || name.includes("lit") || name.includes("journalism")) return FileText;
  
  return BookOpen;
};

export const ClassBanner = ({
  aClass,
  approvedCount,
  waitlistedCount,
  isLiveIndicator,
}: ClassBannerProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const classColor = aClass.color || "#3b82f6";
  const isFull =
    aClass.capacity && approvedCount >= aClass.capacity;

  const SubjectIcon = useMemo(() => 
    getSubjectIcon(aClass.subject?.name), 
    [aClass.subject?.name]
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative h-64 w-full rounded-[3rem] overflow-hidden shadow-2xl group text-start"
      style={{ backgroundColor: classColor }}
    >
      {/* Background Patterns */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="absolute inset-0 bg-dot-pattern opacity-10" />

      <div className="absolute bottom-0 left-0 w-full p-10 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-lg">
              <SubjectIcon className="h-8 w-8" />
            </div>
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-none backdrop-blur-md font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl"
            >
              {aClass.subject?.department?.name ||
                t("classes.show.banner.academic")}
            </Badge>
            {isFull && (
              <Badge className="bg-orange-500 text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-lg">
                <span className="flex items-center gap-1.5">
                    <Timer className="w-3 h-3" />
                    {t("classes.show.banner.waitlistActive")}
                </span>
              </Badge>
            )}
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
            {aClass.name}
          </h1>
          <div className="flex flex-wrap items-center gap-6 text-white/80 font-black text-xs uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>{aClass.subject?.name}</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {t("classes.show.banner.studentsEnrolled", {
                  count: approvedCount,
                })}
              </span>
            </div>
            {waitlistedCount > 0 && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4" />
                  <span>
                    {t("classes.show.banner.onWaitlist", {
                      count: waitlistedCount,
                    })}
                  </span>
                </div>
              </>
            )}
            {aClass.schedules?.map((schedule, index) => (
              <Fragment key={index}>
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>
                    {t(`days.${schedule.day}`)} • {schedule.startTime}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>

        {isLiveIndicator && (
          <motion.div
            initial={{ opacity: 0, x: isAr ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 bg-red-500 text-white px-8 py-4 rounded-[2rem] shadow-2xl shadow-red-500/40 animate-pulse border-4 border-white/20"
          >
            <Video className="h-6 w-6" />
            <span className="font-black uppercase tracking-widest text-sm">
              {t("classes.show.banner.liveActive")}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
