import React from "react";
import { useTranslation } from "react-i18next";
import { TimetableGrid } from "../components/TimetableGrid";
import { useTimetable } from "../hooks/useTimetable";
import { useCapabilities } from "@/hooks/use-capabilities";
import { ListView } from "@/components/refine/views/list-view";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const WeeklySchedulePage: React.FC = () => {
  const { t } = useTranslation();
  const { identity, isAdmin } = useCapabilities();

  const { slots, isLoading } = useTimetable({
    teacherId: identity?.role === "teacher" ? identity.id : undefined,
    studentId: identity?.role === "student" ? identity.id : undefined,
  });

  return (
    <ListView
      title={t("timetable:title", "Weekly Timetable")}
      breadcrumb={null}
      headerProps={{
        subtitle: t("timetable:description", "Overview of all academic sessions across the week."),
      }}
      headerButtons={
        isAdmin && (
          <Button className="h-11 rounded-2xl font-black uppercase tracking-widest text-[9px] gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            {t("buttons.addTimeSlot", "Add Time Slot")}
          </Button>
        )
      }
    >
      <div className="mt-8">
        <TimetableGrid slots={slots} isLoading={isLoading} />
      </div>
    </ListView>
  );
};

export default WeeklySchedulePage;
