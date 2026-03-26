import React from "react";
import { useCustom } from "@refinedev/core";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Clock,
  ArrowRight,
  Loader2,
  Trophy,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

interface SpacedRepetition {
  id: number;
  topic: string;
  masteryLevel: number;
  nextReviewAt: string;
  interval: number;
}

interface MemoryBoosterListProps {
  onSelectTopic: (topic: string) => void;
}

export const MemoryBoosterList: React.FC<MemoryBoosterListProps> = ({
  onSelectTopic,
}) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const { result, query } = useCustom<SpacedRepetition[]>({
    url: "/ai/memory-boosters",
    method: "get",
  });

  const boosters = result?.data || [];
  const isLoading = query.isLoading;
  const dueItems = boosters.filter((b: SpacedRepetition) =>
    dayjs(b.nextReviewAt).isBefore(dayjs().add(1, "hour")),
  );
  const upcomingItems = boosters.filter((b: SpacedRepetition) =>
    dayjs(b.nextReviewAt).isAfter(dayjs().add(1, "hour")),
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
      </div>
    );
  }

  if (boosters.length === 0) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 border border-orange-500/5 shadow-sm">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">
              {t("aiHub.studyLab.memoryBooster.title", "Daily Memory Missions")}
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {t(
                "aiHub.studyLab.memoryBooster.subtitle",
                "Based on Spaced Repetition (SM-2)",
              )}
            </p>
          </div>
        </div>
        {dueItems.length > 0 && (
          <div className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-orange-500 text-white border-none animate-pulse">
            {dueItems.length}{" "}
            {t("aiHub.studyLab.memoryBooster.dueToday", "Due Today")}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dueItems.map((item: SpacedRepetition, idx: number) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: idx * 0.1,
            }}
          >
            <Card
              className="ai-card-premium group relative overflow-hidden cursor-pointer border-2 border-transparent hover:border-ai-primary/30 transition-all duration-500 animate-ai-pulse"
              onClick={() => onSelectTopic(item.topic)}
            >
              <div className="ai-glow" />
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Brain className="w-12 h-12 text-ai-primary" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3 flex-1 text-left rtl:text-right">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3 h-3 text-orange-500 fill-orange-500" />
                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em]">
                        Priority Review
                      </span>
                    </div>
                    <h3 className="text-xl font-black leading-tight group-hover:text-ai-primary transition-colors tracking-tight">
                      {item.topic}
                    </h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-ai-primary" />
                        {t("aiHub.studyLab.memoryBooster.due", "Due Now")}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-ai-primary" />
                        Mastery: {item.masteryLevel}%
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-2xl bg-ai-primary/10 text-ai-primary group-hover:bg-ai-primary group-hover:text-white transition-all shadow-lg shadow-ai-primary/10">
                    <ArrowRight
                      className={cn("w-5 h-5", isAr && "rotate-180")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {upcomingItems.slice(0, 2).map((item: SpacedRepetition) => (
          <Card
            key={item.id}
            className="bg-muted/30 border-border/40 opacity-60"
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-bold truncate max-w-[150px]">
                  {item.topic}
                </h3>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">
                  Next: {dayjs(item.nextReviewAt).fromNow()}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
