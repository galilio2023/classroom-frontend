import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, CheckCircle2, User as UserIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/date-utils";
import { DAYS_SHORT } from "@/constants/calendar";
import { TFunction } from "i18next";

export interface Section {
  id: string;
  classId: string;
  className: string;
  teacherName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomId?: string;
}

interface SectionCardProps {
  section: Section;
  idx: number;
  isSelected: boolean;
  primaryColor?: string;
  onSelect: (classId: string) => void;
  t: TFunction<"translation", undefined>;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  idx,
  isSelected,
  primaryColor,
  onSelect,
  t,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
    >
      <Card
        onClick={() => onSelect(section.classId)}
        className={cn(
          "cursor-pointer transition-all duration-300 border-2 rounded-3xl overflow-hidden group relative",
          isSelected
            ? "bg-primary/5 ring-1 ring-primary/10 shadow-lg"
            : "border-border/40 hover:border-primary/20 bg-background/40 hover:bg-background/60"
        )}
        style={{
          borderColor: isSelected ? primaryColor : undefined,
        }}
      >
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-3 rounded-2xl border transition-colors",
                  isSelected
                    ? "text-white border-transparent"
                    : "bg-muted/10 text-muted-foreground border-border/40 group-hover:bg-primary/10 group-hover:text-primary"
                )}
                style={{
                  backgroundColor: isSelected ? primaryColor : undefined,
                  borderColor: isSelected ? primaryColor : undefined,
                }}
              >
                <Calendar className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-lg">{section.className}</h4>
                <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {DAYS_SHORT[section.dayOfWeek] || t("common.unknown", "Unknown")} •{" "}
                    {formatTime(section.startTime)} - {formatTime(section.endTime)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {section.roomId || t("timetable.section_picker.hall_fallback", "Global Hall")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-end hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground opacity-50 mb-1">
                  {t("timetable.section_picker.lecturer", "Lecturer")}
                </p>
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-sm font-black">{section.teacherName}</span>
                  <UserIcon className="w-4 h-4 text-primary" />
                </div>
              </div>

              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <CheckCircle2 className="w-6 h-6" style={{ color: primaryColor }} />
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
