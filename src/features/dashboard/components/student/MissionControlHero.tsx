import { motion } from "framer-motion";
import { Trophy, Star, Zap, Sparkles, Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { XPProgressBar } from "@/components/xp-progress-bar";
import { useTranslation } from "react-i18next";

interface MissionControlHeroProps {
  name: string;
  currentXP: number;
  currentLevel: number;
  xpInCurrentLevel: number;
  xpRequiredForNextLevel: number;
  xpNeeded: number;
  currentStreak: number;
}

export const MissionControlHero = ({
  name,
  currentXP,
  currentLevel,
  xpInCurrentLevel,
  xpRequiredForNextLevel,
  xpNeeded,
  currentStreak,
}: MissionControlHeroProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <Card className="border-none bg-linear-to-br from-primary via-ai-primary to-ai-secondary text-white shadow-2xl overflow-hidden relative rounded-[2.5rem] md:rounded-[3rem] group">
        {/* Animated Background Elements */}
        <div className="absolute top-0 end-0 w-64 md:w-96 lg:w-[500px] h-64 md:h-96 lg:h-[500px] bg-white/10 rounded-full blur-[80px] md:blur-[100px] -me-32 -mt-32 pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 start-0 w-48 md:w-64 lg:w-96 h-48 md:h-64 lg:h-96 bg-black/10 rounded-full blur-[60px] md:blur-[80px] -ms-16 -mb-16 pointer-events-none" />
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shine_3s_infinite] pointer-events-none" />

        <CardContent className="p-8 md:p-12 lg:p-16 xl:p-20 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16">
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse" />
              <div className="w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-xl border-2 border-white/30 shadow-2xl relative z-10 group-hover:scale-110 transition-transform duration-500">
                <Trophy className="h-10 w-10 md:h-16 md:w-16 lg:h-20 lg:w-20 text-gold-primary drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
              </div>
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-2 -end-2 bg-gold-primary text-white font-black text-xs md:text-sm lg:text-base px-3 md:px-4 py-1.5 md:py-2 rounded-full border-4 border-white shadow-xl z-20"
              >
                {t("dashboard.student.level")} {currentLevel}
              </motion.div>
            </div>

            <div className="flex-1 w-full space-y-6 md:space-y-8 lg:space-y-10 text-center lg:text-start">
              <div className="space-y-3 lg:space-y-4 text-start">
                <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-3">
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-white border-none backdrop-blur-md font-black text-[10px] lg:text-xs uppercase tracking-widest px-3 md:px-4 py-1 md:py-1.5 shadow-sm"
                  >
                    {t("dashboard.student.academicJourney")}
                  </Badge>
                  {currentStreak >= 3 && (
                    <div className="flex items-center gap-1.5 text-orange-400 animate-bounce">
                      <Flame className="h-3.5 w-3.5 lg:h-4 lg:w-4 fill-orange-400" />
                      <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest">
                        {t("dashboard.student.onFire")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-gold-primary animate-pulse">
                    <Sparkles className="h-3.5 w-3.5 lg:h-4 lg:w-4 fill-gold-primary" />
                    <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest">
                      {t("dashboard.student.eliteStudent")}
                    </span>
                  </div>
                </div>
                <h2 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-none text-balance">
                  {t("dashboard.student.keepItUp", {
                    name: name.split(" ")[0] || "Student",
                  })}
                </h2>
                <p className="text-white/70 text-sm md:text-lg lg:text-xl font-medium flex items-center justify-center lg:justify-start gap-2 text-balance">
                  <Zap className="h-5 w-5 lg:h-6 lg:w-6 text-gold-primary fill-gold-primary" />
                  {t("dashboard.student.xpToNextLevel", {
                    xp: Math.round(xpNeeded),
                    level: currentLevel + 1,
                  })}
                </p>
              </div>

              <div className="space-y-3 lg:space-y-4 max-w-2xl mx-auto lg:mx-0">
                <XPProgressBar
                  xp={currentXP}
                  showLabel={false}
                  className="h-4 md:h-5 lg:h-6 rounded-full bg-white/10 border border-white/10 p-1 shadow-inner"
                  indicatorClassName="bg-linear-to-r from-gold-primary via-yellow-400 to-gold-secondary shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                />
                <div className="flex justify-between items-center text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] text-white/40 px-2">
                  <span>
                    {t("dashboard.student.level")} {currentLevel}
                  </span>
                  <span className="text-white/60">
                    {Math.floor(xpInCurrentLevel)} / {xpRequiredForNextLevel} XP
                  </span>
                  <span>
                    {t("dashboard.student.level")} {currentLevel + 1}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-4 lg:gap-6 shrink-0 min-w-[250px]">
              <motion.div
                whileHover={{ x: -5 }}
                className="bg-white/10 backdrop-blur-xl rounded-[1.5rem] p-5 lg:p-6 border border-white/10 flex items-center gap-4 shadow-xl text-start"
              >
                <div className="p-3 lg:p-4 rounded-xl bg-orange-500/20 text-orange-400 shadow-inner">
                  <Flame className="h-6 w-6 lg:h-8 lg:w-8 fill-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">
                    {t("dashboard.student.dailyStreak")}
                  </p>
                  <p className="text-xl lg:text-3xl font-black text-white">
                    {currentStreak}{" "}
                    <span className="text-sm lg:text-base font-bold text-white/70">
                      {t("dashboard.student.days")}
                    </span>
                  </p>
                </div>
              </motion.div>
              <motion.div
                whileHover={{ x: -5 }}
                className="bg-white/10 backdrop-blur-xl rounded-[1.5rem] p-5 lg:p-6 border border-white/10 flex items-center gap-4 shadow-xl text-start"
              >
                <div className="p-3 lg:p-4 rounded-2xl bg-success/20 text-success shadow-inner">
                  <Star className="h-6 w-6 lg:h-8 lg:w-8 fill-success" />
                </div>
                <div>
                  <p className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-white/40 mb-0.5">
                    {t("dashboard.student.nextReward")}
                  </p>
                  <p className="text-sm lg:text-lg font-black text-white">
                    {t("dashboard.student.profileBadge")}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
