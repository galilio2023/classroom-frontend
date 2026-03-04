import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, ArrowRight, Radio } from "lucide-react";
import { ScheduleItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { isWithinInterval, parse } from "date-fns";

interface ScheduleItemCardProps {
  item: ScheduleItem;
  onClick: (id: string) => void;
}

export const ScheduleItemCard: React.FC<ScheduleItemCardProps> = ({ item, onClick }) => {
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
    <div
      className={cn(
        "relative pl-4 border-l-2 py-2 group transition-all duration-300 hover:bg-primary/5 rounded-r-xl cursor-pointer",
        isLive ? "border-primary bg-primary/5" : "border-primary/20"
      )}
      onClick={() => onClick(item.id.toString())}
    >
      <div className="flex items-start justify-between gap-2 pr-2">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "text-sm font-black leading-none transition-colors",
                isLive ? "text-primary" : "group-hover:text-primary"
              )}
            >
              {item.name}
            </p>
            {isLive && (
              <Badge
                variant="default"
                className="h-4 px-1.5 text-[8px] uppercase font-black animate-pulse bg-primary text-primary-foreground"
              >
                <Radio className="h-2 w-2 mr-1" /> Live
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.todaySchedule?.startTime} - {item.todaySchedule?.endTime}
            </span>
            {item.todaySchedule?.room && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {item.todaySchedule.room}
              </span>
            )}
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "h-8 w-8 rounded-full transition-all",
            isLive
              ? "opacity-100 bg-primary text-primary-foreground"
              : "opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground"
          )}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
