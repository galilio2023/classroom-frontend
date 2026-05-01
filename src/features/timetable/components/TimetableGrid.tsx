import React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { TimetableSlot } from "../hooks/useTimetable";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, User, Radio, BookOpen, Layers, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import dayjs from "dayjs";

interface TimetableGridProps {
  slots: TimetableSlot[];
  isLoading?: boolean;
  onAction?: (slot: TimetableSlot) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

const DAYS = [
  "common:days.Sunday",
  "common:days.Monday",
  "common:days.Tuesday",
  "common:days.Wednesday",
  "common:days.Thursday",
  "common:days.Friday",
  "common:days.Saturday",
];

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  slots,
  isLoading,
  onAction,
  onDelete,
  isAdmin,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const today = dayjs().get("day");

  // Group slots by day
  const slotsByDay = React.useMemo(() => {
    const grouped: Record<number, TimetableSlot[]> = {};
    for (let i = 0; i < 7; i++) grouped[i] = [];
    slots.forEach((slot) => {
      grouped[slot.dayOfWeek].push(slot);
    });
    // Sort each day by startTime
    Object.values(grouped).forEach((daySlots) => {
      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });
    return grouped;
  }, [slots]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="h-8 bg-muted/20 rounded-xl animate-pulse" />
            <div className="h-32 bg-muted/10 rounded-3xl animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-7 gap-6", isRtl && "rtl")}>
      {DAYS.map((dayKey, dayIndex) => {
        const isToday = today === dayIndex;
        const daySlots = slotsByDay[dayIndex];

        return (
          <div
            key={dayIndex}
            className={cn(
              "space-y-4 p-2 rounded-[2rem] transition-all duration-500",
              isToday ? "bg-primary/5 ring-1 ring-primary/10 shadow-inner" : ""
            )}
          >
            <div
              className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] text-center py-3 border-b border-border/40 mb-4 flex flex-col items-center gap-1.5",
                isToday ? "text-primary" : "text-muted-foreground/60"
              )}
            >
              {t(dayKey as any)}
              {isToday && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
            </div>

            <div className="space-y-3 min-h-[150px]">
              {daySlots.length > 0 ? (
                daySlots.map((slot) => (
                  <Card
                    key={slot.id}
                    className={cn(
                      "p-4 rounded-3xl border-border/40 bg-card/60 backdrop-blur-xl hover:shadow-xl hover:scale-[1.02] transition-all group relative overflow-hidden border-l-4",
                      slot.isLive ? "border-l-destructive bg-destructive/5" : "border-l-primary/40"
                    )}
                  >
                    <div className="flex flex-col items-start gap-2">
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-black tracking-tighter text-primary">
                          {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                        </span>
                        {slot.isLive && (
                          <Badge
                            variant="destructive"
                            className="h-4 px-1 rounded-full text-[8px] animate-pulse font-black uppercase tracking-widest"
                          >
                            <Radio className="w-2 h-2 mr-1" /> LIVE
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 w-full">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <h4 className="text-xs font-black truncate tracking-tight">
                            {slot.subject?.name || slot.section?.name || "No Subject"}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-60">
                          <Layers className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="text-[9px] font-bold truncate">
                            {slot.section?.name || "General Section"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold">
                          <User className="w-3 h-3 opacity-40" />
                          <span className="truncate">T. {slot.teacher?.name}</span>
                        </div>
                        {slot.roomId && (
                          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-bold">
                            <MapPin className="w-3 h-3 opacity-40" />
                            <span>{slot.roomId}</span>
                          </div>
                        )}
                      </div>

                      {onAction && (
                        <Button
                          size="sm"
                          variant={slot.isLive ? "destructive" : "outline"}
                          className="w-full h-8 rounded-xl text-[8px] font-black uppercase tracking-widest gap-1.5 mt-2 border-primary/20 hover:bg-primary hover:text-primary-foreground group"
                          onClick={() => onAction(slot)}
                        >
                          {slot.isLive ? (
                            <>
                              <Play className="w-2.5 h-2.5 fill-current" />
                              Join Now
                            </>
                          ) : (
                            "Details"
                          )}
                        </Button>
                      )}

                      {isAdmin && onDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute -top-1 -right-1 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(slot.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="h-24 flex items-center justify-center rounded-3xl border border-dashed border-border/20 p-8 transition-opacity hover:opacity-100 opacity-30 group">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 text-center">
                    {t("common:empty.no_slots", "Free")}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
