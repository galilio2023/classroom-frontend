import { useState, useMemo } from "react";
import { Users, CheckCircle2, QrCode, ScanLine, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Enrollment, AttendanceStatus } from "@/types";
import { QRAttendanceModal } from "../components/qr-attendance-modal";
import { QRScannerModal } from "../components/qr-scanner-modal";
import { EmptyState } from "@/components/empty-state";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

// Logic & Components
import { useAttendanceDetails } from "../hooks/use-attendance-details";
import {
  AttendanceStats,
  AttendanceMarkTable,
  AttendanceHistoryTable,
} from "../components/attendance-components";

interface AttendanceTabProps {
  classId: string;
  enrollments: Enrollment[];
}

export const AttendanceTab = ({ classId, enrollments }: AttendanceTabProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const [viewMode, setViewMode] = useState<"mark" | "history">("mark");
  const [selectedDate] = useState<Date>(new Date());

  const {
    attendanceData,
    stats,
    isStaff,
    isLoading,
    isUpdating,
    handleMarkAttendance,
    handleValueChange,
    handleBulkMark,
    historyData,
    isQRModalOpen,
    setIsQRModalOpen,
    isScannerModalOpen,
    setIsScannerModalOpen,
  } = useAttendanceDetails(classId, enrollments, selectedDate);

  const activeEnrollments = useMemo(
    () => enrollments.filter((e) => e.status === "approved"),
    [enrollments]
  );

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-start">
        <div className="h-10 w-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
          {(t as any)("common.searching")}
        </p>
      </div>
    );

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-start">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <h3 className="text-xl font-black tracking-tight">
              {(t as any)("classes.attendance.title")}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {format(selectedDate, "EEEE, MMMM do, yyyy", {
              locale: isAr ? ar : undefined,
            })}
          </p>
        </div>

        {isStaff && (
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setIsQRModalOpen(true)}
              className="flex-1 md:flex-none h-11 rounded-xl px-6 font-black uppercase tracking-widest text-[10px] gap-2 border-primary/20 text-primary hover:bg-primary/5 transition-all shadow-sm"
            >
              <QrCode className="h-4 w-4" />
              {(t as any)("classes.attendance.generateQR")}
            </Button>
            <Button
              onClick={() => setIsScannerModalOpen(true)}
              className="flex-1 md:flex-none h-11 rounded-xl px-6 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <ScanLine className="h-4 w-4" />
              {(t as any)("classes.attendance.scanQR")}
            </Button>
          </div>
        )}
      </div>

      {activeEnrollments.length === 0 ? (
        <EmptyState
          icon={Users}
          title={(t as any)("classes.attendance.noStudents")}
          description={(t as any)("classes.attendance.noStudentsDesc")}
        />
      ) : (
        <div className="space-y-10">
          {/* Dashboard Stats */}
          <AttendanceStats stats={stats as any} />

          {/* Main Content Area */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("mark")}
                  className={cn(
                    "h-9 rounded-full px-5 text-[10px] font-black uppercase tracking-widest transition-all",
                    viewMode === "mark"
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-primary/5"
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 me-1.5" />
                  {(t as any)("classes.attendance.markAttendance")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("history")}
                  className={cn(
                    "h-9 rounded-full px-5 text-[10px] font-black uppercase tracking-widest transition-all",
                    viewMode === "history"
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-primary/5"
                  )}
                >
                  <History className="h-3.5 w-3.5 me-1.5" />
                  {(t as any)("classes.attendance.viewHistory")}
                </Button>
              </div>

              {viewMode === "mark" && isStaff && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBulkMark(AttendanceStatus.PRESENT)}
                    className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-500/10"
                  >
                    {(t as any)("classes.attendance.markAllPresent")}
                  </Button>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {viewMode === "mark" ? (
                  <AttendanceMarkTable
                    enrollments={activeEnrollments}
                    attendanceData={attendanceData}
                    onStatusChange={handleMarkAttendance}
                    onValueChange={handleValueChange}
                    isAr={isAr}
                  />
                ) : (
                  <AttendanceHistoryTable
                    historyData={historyData || []}
                    isTeacher={isStaff}
                    isAr={isAr}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Modals */}
      {isStaff && (
        <>
          <QRAttendanceModal
            isOpen={isQRModalOpen}
            onClose={() => setIsQRModalOpen(false)}
            classId={classId}
          />
          <QRScannerModal
            isOpen={isScannerModalOpen}
            onClose={() => setIsScannerModalOpen(false)}
            classId={classId}
          />
        </>
      )}
    </div>
  );
};
