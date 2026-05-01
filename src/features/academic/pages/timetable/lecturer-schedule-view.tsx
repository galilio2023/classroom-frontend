import { useGetIdentity, useList, useNavigation } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Radio,
  ChevronRight,
  Play,
  TrendingUp,
  MapPin,
  Layers,
  BookOpen,
} from "lucide-react";
import { User, UserRole } from "@/types";
import { TimetableSlot } from "@/features/timetable/hooks/useTimetable";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import usePageTitle from "@/hooks/use-page-title";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import { ListView } from "@/components/refine/views/list-view";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useCapabilities } from "@/hooks/use-capabilities";
import { TimetableGrid } from "@/features/timetable/components/TimetableGrid";
import { useNavigate } from "react-router-dom";

export default function LecturerScheduleViewPage() {
  const { t } = useTranslation();
  const { isTeacher, isAdmin } = useCapabilities();
  const navigate = useNavigate();

  usePageTitle(t("timetable.lecturer.weeklyTitle", "My Lecture Schedule"));

  const { query } = useList<TimetableSlot>({
    resource: "timetable/lecturer-weekly",
    queryOptions: {
      enabled: isTeacher || isAdmin,
    },
  });

  const slots = (query.data?.data || []) as any[];
  const isLoading = query.isLoading;

  return (
    <ListView>
      <div className="space-y-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 text-start"
        >
          <Breadcrumb />
          <h1 className="page-title mb-0 flex items-center gap-3 text-3xl md:text-5xl font-black">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/5 shadow-sm">
              <Calendar className="h-8 w-8" />
            </div>
            {t("timetable.lecturer.weeklyTitle", "My Lecture Schedule")}
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl">
            A comprehensive view of your scheduled course sections for the current semester.
          </p>
        </motion.div>

        <div className="mt-8">
          <TimetableGrid
            slots={slots}
            isLoading={isLoading}
            onAction={(slot) =>
              navigate(`/classes/show/${slot.classId}${slot.isLive ? "?subtab=live" : ""}`)
            }
          />
        </div>
      </div>
    </ListView>
  );
}
