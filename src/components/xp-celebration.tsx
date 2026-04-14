import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Trophy, Star, TrendingUp, Award } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { socket, connectSocket } from "@/lib/socket";
import { useTranslation } from "react-i18next";
import {} from "@/lib/utils";
import { useUserRole } from "@/hooks/use-user-role";

interface XPEvent {
  amount: number;
  reason: string;
  totalXP: number;
  level: number;
}

interface LevelUpEvent {
  level: number;
  message: string;
}

interface BadgeEvent {
  badge: {
    name: string;
    description: string;
    imageUrl?: string;
  };
  message: string;
}

export const XPCelebration = () => {
  const { t } = useTranslation();
  const { width, height } = useWindowSize();
  const { identity } = useUserRole();

  const [activeXP, setActiveXP] = useState<XPEvent | null>(null);
  const [activeLevelUp, setActiveLevelUp] = useState<LevelUpEvent | null>(null);
  const [activeBadge, setActiveBadge] = useState<BadgeEvent | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!identity?.id) return;

    void connectSocket();

    const handleXPGained = (data: XPEvent) => {
      setActiveXP(data);
      setTimeout(() => setActiveXP(null), 4000);
    };

    const handleLevelUp = (data: LevelUpEvent) => {
      setActiveLevelUp(data);
      setShowConfetti(true);
      setTimeout(() => {
        setActiveLevelUp(null);
        setShowConfetti(false);
      }, 6000);
    };

    const handleBadgeEarned = (data: BadgeEvent) => {
      setActiveBadge(data);
      setShowConfetti(true);
      setTimeout(() => {
        setActiveBadge(null);
        setShowConfetti(false);
      }, 6000);
    };

    socket.on("xp_gained", handleXPGained);
    socket.on("level_up", handleLevelUp);
    socket.on("badge_earned", handleBadgeEarned);

    return () => {
      socket.off("xp_gained", handleXPGained);
      socket.off("level_up", handleLevelUp);
      socket.off("badge_earned", handleBadgeEarned);
    };
  }, [identity?.id]);

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={true}
          numberOfPieces={200}
          gravity={0.2}
          colors={["#4f46e5", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"]}
          style={{ zIndex: 20000 }}
        />
      )}

      <div className="fixed bottom-8 right-8 z-[10000] pointer-events-none flex flex-col gap-4 items-end">
        <AnimatePresence>
          {/* XP Gained Toast */}
          {activeXP && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
              className="bg-card/90 backdrop-blur-2xl border-2 border-primary/20 p-4 rounded-3xl shadow-2xl flex items-center gap-4 min-w-[240px]"
            >
              <div className="p-3 rounded-2xl bg-primary/10 text-primary relative">
                <Star className="h-6 w-6 animate-pulse" />
                <motion.div
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -20 }}
                  className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-lg"
                >
                  +{activeXP.amount}
                </motion.div>
              </div>
              <div className="flex flex-col text-start">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                  {activeXP.reason || t("gamification.xpGained", "XP Gained!")}
                </p>
                <p className="text-lg font-black tracking-tight">
                  {t("gamification.currentXP", {
                    count: activeXP.totalXP,
                    defaultValue: "{{count}} Total XP",
                  })}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed inset-0 pointer-events-none z-[10001] flex flex-col items-center justify-center">
        <AnimatePresence>
          {/* Level Up Banner */}
          {activeLevelUp && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1.2 }}
              exit={{ opacity: 0, scale: 2, filter: "blur(10px)" }}
              className="bg-linear-to-br from-indigo-600 to-violet-600 p-8 rounded-[3rem] shadow-[0_0_50px_rgba(79,70,229,0.4)] text-white text-center space-y-4 border-4 border-white/20"
            >
              <div className="relative">
                <Trophy className="h-20 w-20 mx-auto drop-shadow-2xl animate-bounce" />
                <Sparkles className="absolute -top-4 -right-4 h-8 w-8 text-yellow-300 animate-spin-slow" />
              </div>
              <div className="space-y-1">
                <h2 className="text-4xl font-black uppercase tracking-tighter">Level Up!</h2>
                <p className="text-6xl font-black text-yellow-300 drop-shadow-md">
                  {activeLevelUp.level}
                </p>
              </div>
              <p className="text-sm font-bold uppercase tracking-widest opacity-80">
                {activeLevelUp.message}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="fixed top-20 inset-x-0 pointer-events-none z-[10001] flex justify-center">
        <AnimatePresence>
          {/* Badge Earned Card */}
          {activeBadge && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="max-w-sm bg-card/95 backdrop-blur-3xl border-2 border-amber-500/20 p-6 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center space-y-4"
            >
              <div className="p-5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/10 shadow-inner group">
                <Award className="h-16 w-16 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-600">
                  New Badge Unlocked
                </h3>
                <h2 className="text-2xl font-black tracking-tight">{activeBadge.badge.name}</h2>
                <p className="text-xs font-medium text-muted-foreground italic">
                  "{activeBadge.badge.description}"
                </p>
              </div>
              <div className="flex items-center gap-2 bg-amber-500/5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-600">
                <TrendingUp className="h-3 w-3" />
                Achievement Recorded
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
