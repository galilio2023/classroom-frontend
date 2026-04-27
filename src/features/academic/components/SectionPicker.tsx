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
import { useList, useCustomMutation, useGo, type HttpError } from "@refinedev/core";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { handleError } from "@/providers/utils/api-errors";
import { DAYS_SHORT } from "@/constants/calendar";
import { useTranslation } from "react-i18next";
import { formatTime } from "@/lib/date-utils";

export interface Section {
  id: string;
  classId: string;
  className: string;
  subjectId: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  roomId?: string;
}

interface SectionSelectionResponse {
  success: boolean;
  data?: any;
}

interface SectionPickerProps {
  subjectId: string;
  enrollmentId: string;
  onSuccess?: () => void;
}

export const SectionPicker: React.FC<SectionPickerProps> = ({
  subjectId,
  enrollmentId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [selectedClassId, setSelectedClassId] = React.useState<string | null>(null);
  const go = useGo();

  // 🚀 RULE 4: Use useList to leverage Dexie/IndexedDB offline cache
  const listResult = useList<Section, HttpError>({
    resource: `timetable/available-sections/${subjectId}`,
    queryOptions: {
      staleTime: 10 * 60 * 1000, // 10 mins cache
    },
  }) as any;

  const sections = listResult?.data?.data || [];
  const isLoading = listResult?.isLoading;

  const mutationResult = useCustomMutation<SectionSelectionResponse, HttpError>() as any;
  const updateSection = mutationResult.mutate;
  const isUpdating = mutationResult.isLoading;

  const handleConfirm = async () => {
    if (!selectedClassId) return;

    updateSection(
      {
        url: `timetable/enrollment/${enrollmentId}/select-section`,
        method: "post",
        values: { classId: selectedClassId },
      },
      {
        onSuccess: () => {
          toast.success(t("timetable.section_picker.success", "Lecture section selected successfully!"));
          onSuccess?.();
          // Programmatic navigation to dashboard
          go({ to: "/dashboard" });
        },
        onError: async (err: any) => {
          const httpError = await handleError(err);
          // 🚀 RULE 8: Surface Trace ID for high-stakes errors
          toast.error(httpError.message, {
            description: t("errors.trace_id", { 
              defaultValue: `Trace ID: ${httpError.meta?.correlationId || "N/A"}`,
              id: httpError.meta?.correlationId 
            }),
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          {t("timetable.section_picker.loading", "Fetching Available Sections...")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-start">
      <div className="space-y-1">
        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          {t("timetable.section_picker.title", "Choose Your Section")}
        </h3>
        <p className="text-sm text-muted-foreground font-medium">
          {t("timetable.section_picker.description", "Select a preferred timeframe and location for your lectures.")}
        </p>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {sections.length > 0 ? (
            sections.map((section: Section, idx: number) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card
                  onClick={() => setSelectedClassId(section.classId)}
                  className={cn(
                    "cursor-pointer transition-all duration-300 border-2 rounded-3xl overflow-hidden group relative",
                    selectedClassId === section.classId
                      ? "border-purple-500 bg-purple-500/5 ring-1 ring-purple-500/10 shadow-lg"
                      : "border-border/40 hover:border-purple-500/20 bg-background/40 hover:bg-background/60"
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "p-3 rounded-2xl border transition-colors",
                            selectedClassId === section.classId
                              ? "bg-purple-500 text-white border-purple-400"
                              : "bg-muted/10 text-muted-foreground border-border/40 group-hover:bg-purple-500/10 group-hover:text-purple-500"
                          )}
                        >
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-lg">{section.className}</h4>
                          <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {(DAYS_SHORT[section.dayOfWeek] || t("common.unknown", "Unknown"))} • {formatTime(section.startTime)} - {formatTime(section.endTime)}
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

                        {selectedClassId === section.classId && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <CheckCircle2 className="w-6 h-6 text-purple-500" />
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-muted/5 rounded-[2.5rem] border border-dashed border-border/60">
              <div className="p-4 rounded-full bg-muted/10">
                <Layers className="w-12 h-12 text-muted-foreground/20" />
              </div>
              <div className="space-y-1">
                <h3 className="font-black uppercase tracking-tight">{t("timetable.section_picker.empty_title", "No Sections Available")}</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {t("timetable.section_picker.empty_description", "This course currently has no active lecture slots. Please contact the registrar.")}
                </p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="pt-4 border-t border-border/40 flex justify-end gap-3">
        <Button
          onClick={handleConfirm}
          disabled={!selectedClassId || isUpdating}
          className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-2 shadow-xl shadow-purple-500/20 bg-purple-600 hover:bg-purple-700"
        >
          {isUpdating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              {t("timetable.section_picker.confirm", "Confirm Selection")}
              <CheckCircle2 className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
