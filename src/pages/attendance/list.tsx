import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Calendar } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useList, useNavigation } from "@refinedev/core";
import { useUserRole } from "@/hooks/use-user-role";
import { QRAttendanceModal } from "@/features/classes/components/qr-attendance-modal";
import { QRScannerSelectorDialog } from "@/features/classes/components/qr-scanner-selector-dialog";
import { QRSessionSelectorDialog } from "@/features/classes/components/qr-session-selector-dialog";
import { useNavigate } from "react-router-dom";
import {} from "@/components/ui/card";
import {} from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "@/components/ui/skeleton";
import { useTerm } from "@/contexts/term-context";
import { EmptyState } from "@/components/empty-state";
import { useTranslation } from "react-i18next";

// Sub-components
import { AttendanceListHeader } from "@/features/attendance/components/list/AttendanceListHeader";
import { AttendanceStats } from "@/features/attendance/components/list/AttendanceStats";
import { AttendanceSessionItem } from "@/features/attendance/components/list/AttendanceSessionItem";
import { AttendanceFilters } from "@/features/attendance/components/list/AttendanceFilters"; // I will create this next

dayjs.extend(relativeTime);

interface AttendanceSession {
  id: string;
  classId: number;
  date: string;
  presentCount?: number;
  absentCount?: number;
  status?: "present" | "absent";
  class?: {
    id: number;
    name: string;
  };
}

const AttendanceListPage = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("classes.attendance.governance.title"));
  const { isStaff } = useUserRole();
  const { selectedTerm } = useTerm();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [qrTargetClassId, setQrTargetClassId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSessionSelectorOpen, setIsSessionSelectorOpen] = useState(false);

  const { show } = useNavigation();

  const filters = useMemo(() => {
    const f = [];
    if (searchQuery) {
      f.push({
        field: "class.name",
        operator: "contains" as const,
        value: searchQuery,
      });
    }
    if (selectedTerm) {
      f.push({
        field: "termId",
        operator: "eq" as const,
        value: selectedTerm.id,
      });
    }
    return f;
  }, [searchQuery, selectedTerm]);

  const { query } = useList<AttendanceSession>({
    resource: "attendance",
    pagination: { pageSize: 1000, mode: "server" },
    filters,
    sorters: [{ field: "date", order: "desc" }],
    meta: {
      populate: ["class"],
    },
  });

  const attendanceData = query?.data;
  const isLoading = query?.isLoading;
  const attendanceSessions = attendanceData?.data || [];
  const hasData = attendanceSessions.length > 0;

  const handleRowClick = (record: AttendanceSession) => {
    if (!record) return;
    if (isStaff) {
      navigate(`/classes/show/${record.classId}?tab=attendance&date=${record.date}`);
    } else {
      show("classes", record.classId.toString());
    }
  };

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: attendanceSessions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback(() => 120, []),
    overscan: 5,
  });

  const stats = useMemo(() => {
    if (!attendanceSessions.length) return { total: 0, avgPresent: 0, recentAbsence: 0 };
    const totalPresent = attendanceSessions.reduce(
      (acc, curr) => acc + (curr.presentCount || (curr.status === "present" ? 1 : 0)),
      0
    );
    const totalPossible = attendanceSessions.reduce(
      (acc, curr) => acc + ((curr.presentCount || 0) + (curr.absentCount || 0) || 1),
      0
    );
    return {
      total: attendanceSessions.length,
      avgPresent: Math.round((totalPresent / totalPossible) * 100) || 0,
      recentAbsence: attendanceSessions.filter((s) => s.status === "absent").length,
    };
  }, [attendanceSessions]);

  return (
    <div className="space-y-10 pb-20">
      <ListView>
        <div className="space-y-10">
          <AttendanceListHeader
            isStaff={isStaff}
            onStartQr={() => setIsSessionSelectorOpen(true)}
            onScanQr={() => setIsScannerOpen(true)}
          />

          <QRScannerSelectorDialog open={isScannerOpen} onOpenChange={setIsScannerOpen} />
          <QRSessionSelectorDialog
            open={isSessionSelectorOpen}
            onOpenChange={setIsSessionSelectorOpen}
          />

          <AttendanceStats stats={stats} isLoading={isLoading} isStaff={isStaff} />

          <AttendanceFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTerm={selectedTerm}
          />

          <div
            ref={parentRef}
            className="h-150 overflow-auto pe-2 custom-scrollbar rounded-[2.5rem] border border-primary/5 bg-card/30 backdrop-blur-sm relative"
          >
            {isLoading ? (
              <div className="p-8 space-y-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col md:flex-row items-center gap-6">
                    <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3 w-full">
                      <Skeleton className="h-6 w-62.5" />
                      <Skeleton className="h-4 w-45" />
                    </div>
                    <Skeleton className="h-10 w-24 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : !hasData ? (
              <div className="h-full w-full flex items-center justify-center p-12">
                <EmptyState
                  icon={Calendar}
                  title={t("classes.attendance.noRecords")}
                  description={
                    isStaff
                      ? t("classes.attendance.noRecordsDescription")
                      : t("classes.attendance.personalRecordStudent")
                  }
                  className="border-none bg-transparent min-h-0"
                />
              </div>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => (
                  <AttendanceSessionItem
                    key={virtualItem.key}
                    session={attendanceSessions[virtualItem.index]}
                    isStaff={isStaff}
                    onRowClick={handleRowClick}
                    onQrClick={setQrTargetClassId}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </ListView>

      {qrTargetClassId && (
        <QRAttendanceModal
          isOpen={true}
          onClose={() => setQrTargetClassId(null)}
          classId={qrTargetClassId}
        />
      )}
    </div>
  );
};

export default AttendanceListPage;
