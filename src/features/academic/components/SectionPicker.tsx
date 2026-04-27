import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  MapPin,
  User as UserIcon,
  CheckCircle2,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCustom, useUpdate } from "@refinedev/core";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SectionPickerProps {
  subjectId: string;
  enrollmentId: string;
  onSuccess?: () => void;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const SectionPicker: React.FC<SectionPickerProps> = ({
  subjectId,
  enrollmentId,
  onSuccess,
}) => {
  const [selectedClassId, setSelectedClassId] = React.useState<string | null>(null);

  const { data: queryData, isLoading } = useCustom({
    url: `${import.meta.env.VITE_API_URL}/timetable/available-sections/${subjectId}`,
    method: "get",
  } as any) as any;

  const sections = (queryData?.data as any[]) || [];

  const { mutate: updateSection, isPending: isUpdating } = useUpdate() as any;

  const handleConfirm = () => {
    if (!selectedClassId) return;

    updateSection(
      {
        resource: `timetable/enrollment/${enrollmentId}/select-section`,
        id: "", // Not needed for custom route
        values: { classId: selectedClassId },
      },
      {
        onSuccess: () => {
          toast.success("Lecture section selected successfully!");
          onSuccess?.();
        },
        onError: (err: any) => toast.error(err?.message || "Selection failed."),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Fetching Available Sections...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-start">
      <div className="space-y-1">
        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          Choose Your Section
        </h3>
        <p className="text-sm text-muted-foreground font-medium">
          Select a preferred timeframe and location for your lectures.
        </p>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {sections.length > 0 ? (
            sections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-300 border-2 rounded-3xl overflow-hidden group relative",
                    selectedClassId === section.classId
                      ? "border-purple-500 bg-purple-500/5 ring-1 ring-purple-500/10 shadow-lg"
                      : "border-border/40 hover:border-purple-500/20 bg-background/40 hover:bg-background/60"
                  )}
                  onClick={() => setSelectedClassId(section.classId)}
                >
                  <CardContent className="p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className="bg-muted/10 p-3 rounded-2xl shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <Calendar
                          className={cn(
                            "w-5 h-5",
                            selectedClassId === section.classId
                              ? "text-purple-500"
                              : "text-muted-foreground"
                          )}
                        />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-base truncate">
                            Section {section.section?.name || "A"}
                          </h4>
                          <Badge
                            variant="secondary"
                            className="h-5 px-2 rounded-full text-[8px] font-black uppercase bg-purple-500/10 text-purple-500 border-none"
                          >
                            {DAYS[section.dayOfWeek]}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground font-medium text-[10px]">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 opacity-40" />
                            <span>
                              {section.startTime.slice(0, 5)} - {section.endTime.slice(0, 5)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 opacity-40" />
                            <span>{section.roomId || "Main Hall"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UserIcon className="w-3 h-3 opacity-40" />
                            <span className="truncate">{section.teacher?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedClassId === section.classId && (
                      <div className="shrink-0 animate-in zoom-in duration-300">
                        <CheckCircle2 className="w-6 h-6 text-purple-500" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="p-12 text-center border-2 border-dashed border-border/40 rounded-[2.5rem] opacity-60">
              <p className="text-xs font-bold text-muted-foreground italic uppercase">
                No active sections found for this course.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-4">
        <Button
          onClick={handleConfirm}
          disabled={!selectedClassId || isUpdating}
          className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-purple-500/20 bg-purple-600 hover:bg-purple-700 transition-all active:scale-95"
        >
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <CheckCircle2 className="w-4 h-4 mr-2" />
          )}
          Confirm Section Selection
        </Button>
      </div>
    </div>
  );
};
