import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  MapPin,
  ArrowRight,
  Radio,
  Video,
  Sparkles,
} from "lucide-react";
import { ScheduleItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { isWithinInterval, parse } from "date-fns";
import { motion } from "framer-motion";

interface ScheduleItemCardProps {
  item: ScheduleItem;
  onClick: (id: string) => void;
}

export const ScheduleItemCard: React.FC<ScheduleItemCardProps> = ({
  item,
  onClick,
}) => {
  const now = new Date();
  let isLive = false;

  try {
    const startTime = parse(item.todaySchedule?.startTime || "", "HH:mm", now);
    const endTime = parse(item.todaySchedule?.endTime || "", "HH:mm", now);
    isLive = isWithinInterval(now, { start: startTime, end: endTime });
  } catch (e) {
    /* ignore parse errors */
  }

  return (
    <motion.div whileHover={{ x: 5 }} className="w-full">
      <div
        className={cn(
          "relative p-5 rounded-2xl border transition-all duration-500 cursor-pointer group overflow-hidden",
          isLive
            ? "bg-primary/3 border-primary/30 shadow-lg shadow-primary/5"
            : "bg-background/50 border-black/3 dark:border-white/3 hover:border-primary/20 hover:bg-primary/2",
        )}
        onClick={() => onClick(item.id.toString())}
      >
        {/* Left Accent Bar */}
        <div
          className={cn(
            "absolute start-0 top-0 w-1 h-full transition-all duration-500",
            isLive
              ? "bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              : "bg-muted-foreground/10 group-hover:bg-primary/40",
          )}
        />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div
              className={cn(
                "p-3 rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                isLive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
              )}
            >
              {isLive ? (
                <Video className="h-5 w-5" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className={cn(
                    "text-sm font-black tracking-tight transition-colors truncate",
                    isLive
                      ? "text-primary"
                      : "text-foreground group-hover:text-primary",
                  )}
                >
                  {item.name}
                </p>
                {isLive && (
                  <Badge
                    variant="default"
                    className="h-5 px-2 text-[9px] uppercase font-black animate-pulse bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20"
                  >
                    <Radio className="h-2.5 w-2.5 me-1" /> Live Now
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 opacity-40" />
                  <span>
                    {item.todaySchedule?.startTime} -{" "}
                    {item.todaySchedule?.endTime}
                  </span>
                </div>
                {item.todaySchedule?.room && (
                  <>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 opacity-40" />
                      <span>{item.todaySchedule.room}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isLive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-primary/60"
              >
                <Sparkles className="h-3 w-3" />
                <span>Join Now</span>
              </motion.div>
            )}
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-10 w-10 rounded-xl transition-all duration-500 shadow-sm",
                isLive
                  ? "bg-primary text-primary-foreground shadow-primary/20"
                  : "bg-muted/50 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground",
              )}
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
