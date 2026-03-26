import { useCustom } from "@refinedev/core";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Medal,
  Crown,
  Zap,
  Loader2,
  Star,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLevelProgress } from "@/lib/xp";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface LeaderboardTabProps {
  classId: string;
}

export function LeaderboardTab({ classId }: LeaderboardTabProps) {
  const { t, i18n } = useTranslation();

  // Use the new optimized custom endpoint
  const { query } = useCustom<User[]>({
    url: `classes/${classId}/leaderboard`,
    method: "get",
  });

  const { data, isLoading } = query;
  const rankedStudents = data?.data || [];

  const isAr = i18n.language === "ar";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
          {t("classes.leaderboard.calculating")}
        </p>
      </div>
    );
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return (
          <Crown className="h-8 w-8 text-yellow-500 fill-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
        );
      case 1:
        return (
          <Medal className="h-8 w-8 text-slate-400 fill-slate-400 drop-shadow-[0_0_10px_rgba(148,163,184,0.5)]" />
        );
      case 2:
        return (
          <Medal className="h-8 w-8 text-amber-600 fill-amber-600 drop-shadow-[0_0_10_rgba(217,119,6,0.5)]" />
        );
      default:
        return (
          <span className="text-lg font-black text-muted-foreground/20">
            #{index + 1}
          </span>
        );
    }
  };

  const topThree = rankedStudents.slice(0, 3);
  // Reorder for podium: [2nd, 1st, 3rd]
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);

  return (
    <div className="space-y-12 pb-10">
      {/* Podium Section */}
      <div className="relative pt-10">
        <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent rounded-[3rem] -z-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto px-4">
          <AnimatePresence mode="popLayout">
            {podiumOrder.map((student, pIndex) => {
              const originalIndex = rankedStudents.findIndex(
                (s: User) => s.id === student.id,
              );
              const { currentLevel } = getLevelProgress(student.xp || 0);
              const isFirst = originalIndex === 0;

              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className={cn(
                    "relative group",
                    isFirst
                      ? "order-1 md:order-2"
                      : pIndex === 0
                        ? "order-2 md:order-1"
                        : "order-3",
                  )}
                >
                  <Card
                    className={cn(
                      "relative overflow-hidden border-none shadow-2xl transition-all duration-500 rounded-[2.5rem]",
                      isFirst
                        ? "bg-card/80 backdrop-blur-2xl md:scale-110 z-20 border-2 border-yellow-500/20"
                        : "bg-card/40 backdrop-blur-xl z-10",
                    )}
                  >
                    {isFirst && (
                      <div className="absolute top-0 start-0 w-full h-1.5 bg-linear-to-r from-yellow-400 via-yellow-600 to-yellow-400 animate-[shine_3s_infinite]" />
                    )}
                    <CardContent className="p-8 flex flex-col items-center text-center gap-6">
                      <div className="relative">
                        <div
                          className={cn(
                            "absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse",
                            isFirst
                              ? "bg-yellow-500"
                              : originalIndex === 1
                                ? "bg-slate-400"
                                : "bg-amber-600",
                          )}
                        />
                        <Avatar
                          className={cn(
                            "h-24 w-24 border-4 relative z-10 transition-transform group-hover:scale-110 duration-500",
                            isFirst
                              ? "border-yellow-500 shadow-2xl shadow-yellow-500/40"
                              : originalIndex === 1
                                ? "border-slate-400 shadow-xl shadow-slate-400/20"
                                : "border-amber-600 shadow-xl shadow-amber-600/20",
                          )}
                        >
                          <AvatarImage
                            src={student.image || ""}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-2xl font-black bg-muted">
                            {student.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            delay: 0.2,
                            type: "spring",
                            stiffness: 200,
                          }}
                          className={cn(
                            "absolute -top-6 z-20",
                            isAr ? "-start-6" : "-end-6",
                          )}
                        >
                          {getRankIcon(originalIndex)}
                        </motion.div>
                      </div>

                      <div className="space-y-2 relative z-10">
                        <h3
                          className={cn(
                            "font-black tracking-tighter text-xl line-clamp-1",
                            isFirst ? "text-foreground" : "text-foreground/80",
                          )}
                        >
                          {student.name}
                        </h3>
                        <div className="flex flex-col items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="font-black text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-none px-3"
                          >
                            {t("classes.leaderboard.levelLabel", {
                              level: currentLevel,
                            })}
                          </Badge>
                          <div className="flex items-center gap-1.5 text-gold-primary">
                            <Zap className="h-4 w-4 fill-gold-primary animate-pulse" />
                            <span className="text-lg font-black tracking-tight">
                              {student.xp || 0} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Full Rankings List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Trophy className="h-5 w-5" />
            </div>
            <div className="text-start">
              <h2 className="text-xl font-black tracking-tight">
                {t("classes.leaderboard.classRankings")}
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                {t("classes.leaderboard.basedOnXp")}
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="rounded-full px-4 py-1 font-black text-[10px] uppercase tracking-widest border-primary/20 text-primary"
          >
            {t("classes.leaderboard.studentsCount", {
              count: rankedStudents.length,
            })}
          </Badge>
        </div>

        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden text-start">
          <CardContent className="p-4">
            <div className="grid gap-2">
              <AnimatePresence mode="popLayout">
                {rankedStudents.map((student: User, index: number) => {
                  const { currentLevel } = getLevelProgress(student.xp || 0);
                  const isTopThree = index < 3;

                  return (
                    <motion.div
                      key={student.id}
                      initial={{ opacity: 0, x: isAr ? 5 : -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-2xl transition-all group cursor-pointer",
                        isTopThree
                          ? "bg-primary/5 border border-primary/10"
                          : "hover:bg-muted/50 border border-transparent hover:border-black/3 dark:hover:border-white/3",
                      )}
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-10 flex justify-center items-center">
                          {isTopThree ? (
                            <div className="scale-75">{getRankIcon(index)}</div>
                          ) : (
                            <span className="text-sm font-black text-muted-foreground/40 group-hover:text-primary transition-colors">
                              #{index + 1}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Avatar className="h-12 w-12 border-2 border-background shadow-sm group-hover:scale-110 transition-transform">
                              <AvatarImage
                                src={student.image || ""}
                                className="object-cover"
                              />
                              <AvatarFallback className="font-black bg-muted">
                                {student.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            {isTopThree && (
                              <div
                                className={cn(
                                  "absolute -bottom-1 size-4 bg-success rounded-full border-2 border-background flex items-center justify-center",
                                  isAr ? "-start-1" : "-end-1",
                                )}
                              >
                                <Star className="h-2 w-2 text-white fill-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-black text-sm tracking-tight group-hover:text-primary transition-colors">
                              {student.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge
                                variant="outline"
                                className="text-[9px] font-black uppercase tracking-tighter h-4 px-1.5 border-primary/20 text-primary/60"
                              >
                                {t("classes.leaderboard.levelLabel", {
                                  level: currentLevel,
                                })}
                              </Badge>
                              <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                                <TrendingUp className="h-2.5 w-2.5" />
                                {t("classes.leaderboard.topPercent", {
                                  percent: Math.round(
                                    ((index + 1) / rankedStudents.length) * 100,
                                  ),
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gold-primary/10 px-4 py-2 rounded-2xl border border-gold-primary/20 shadow-sm group-hover:bg-gold-primary/20 transition-all">
                          <Zap className="h-4 w-4 text-gold-primary fill-gold-primary animate-pulse" />
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-black text-gold-primary tracking-tight">
                              {student.xp || 0}
                            </span>
                            <span className="text-[8px] font-black text-gold-primary/60 uppercase tracking-tighter -mt-1">
                              {t("classes.leaderboard.points")}
                            </span>
                          </div>
                        </div>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-muted-foreground/20 group-hover:text-primary transition-colors",
                            isAr && "rotate-180",
                          )}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
