import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Eye,
  Filter,
  MoreHorizontal,
  QrCode,
  Search,
  UserCheck,
  UserMinus,
  XCircle,
  ScanLine,
  Play,
} from "lucide-react";
import { Input } from "@/components/ui/input.tsx";
import { useCallback, useMemo, useRef, useState } from "react";
import { useList, useNavigation } from "@refinedev/core";
import { useUserRole } from "@/hooks/use-user-role";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QRAttendanceModal } from "@/features/classes/components/qr-attendance-modal";
import { QRScannerSelectorDialog } from "@/features/classes/components/qr-scanner-selector-dialog";
import { QRSessionSelectorDialog } from "@/features/classes/components/qr-session-selector-dialog";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import usePageTitle from "@/hooks/use-page-title";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Skeleton } from "@/components/ui/skeleton";
import { useTerm } from "@/contexts/term-context";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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

  const estimateSize = useCallback(() => 120, []);

  const rowVirtualizer = useVirtualizer({
    count: attendanceSessions.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  // Stats calculation
  const stats = useMemo(() => {
    if (!attendanceSessions.length) return { total: 0, avgPresent: 0, recentAbsence: 0 };

    const totalPresent = attendanceSessions.reduce(
      (acc: number, curr: AttendanceSession) =>
        acc + (curr.presentCount || (curr.status === "present" ? 1 : 0)),
      0
    );
    const totalPossible = attendanceSessions.reduce(
      (acc: number, curr: AttendanceSession) =>
        acc + ((curr.presentCount || 0) + (curr.absentCount || 0) || 1),
      0
    );

    return {
      total: attendanceSessions.length,
      avgPresent: Math.round((totalPresent / totalPossible) * 100) || 0,
      recentAbsence: attendanceSessions.filter((s: AttendanceSession) => s.status === "absent")
        .length,
    };
  }, [attendanceSessions]);

  return (
    <div className="space-y-10 pb-20">
      <ListView>
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-black tracking-tight">
                  {t("classes.attendance.governance.title")}
                </h1>
                <p className="text-muted-foreground font-medium mt-1">
                  {isStaff
                    ? t("classes.attendance.governance.descriptionStaff")
                    : t("classes.attendance.governance.descriptionStudent")}
                </p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                {isStaff ? (
                  <Button
                    onClick={() => setIsSessionSelectorOpen(true)}
                    className="flex-1 md:flex-none rounded-2xl h-14 px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <QrCode className="h-5 w-5" />
                    {t("classes.attendance.governance.startQrSession", "Live QR Session")}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsScannerOpen(true)}
                    className="flex-1 md:flex-none rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <ScanLine className="h-5 w-5" />
                    {t("classes.attendance.scanQR", "Scan to Check-in")}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* QR Action Dialogs */}
          <QRScannerSelectorDialog
            open={isScannerOpen}
            onOpenChange={setIsScannerOpen}
          />
          <QRSessionSelectorDialog
            open={isSessionSelectorOpen}
            onOpenChange={setIsSessionSelectorOpen}
          />

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 border-primary/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-primary/5">
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("classes.attendance.governance.totalSessions")}
                </p>
                <p className="text-2xl font-black">{isLoading ? "..." : stats.total}</p>
              </div>
            </Card>
            <Card className="p-6 border-green-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-green-500/5">
              <div className="p-3 rounded-2xl bg-green-500/10 text-green-600">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("classes.attendance.governance.avgPresence")}
                </p>
                <p className="text-2xl font-black text-green-600">
                  {isLoading ? "..." : `${stats.avgPresent}%`}
                </p>
              </div>
            </Card>
            <Card className="p-6 border-amber-500/10 bg-card/50 backdrop-blur-sm flex items-center gap-4 rounded-4xl shadow-lg shadow-amber-500/5">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-600">
                <UserMinus className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {isStaff
                    ? t("classes.attendance.governance.actionRequired")
                    : t("classes.attendance.governance.totalAbsences")}
                </p>
                <p className="text-2xl font-black text-amber-600">
                  {isLoading ? "..." : isStaff ? "0" : stats.recentAbsence}
                </p>
              </div>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card className="p-4 border-primary/5 bg-muted/30 rounded-4xl backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder={t("classes.attendance.governance.searchPlaceholder")}
                  className="ps-11 h-14 rounded-2xl border-none bg-background shadow-sm font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {t("classes.attendance.governance.historyFilter")}
                </span>
              </div>
            </div>
          </Card>

          <AnimatePresence>
            {selectedTerm?.status === "archived" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-amber-500/10 border border-amber-500/20 text-amber-700 p-6 rounded-4xl shadow-sm flex items-start gap-4 backdrop-blur-sm"
              >
                <div className="p-3 rounded-2xl bg-amber-500/20">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <p className="font-black uppercase tracking-widest text-xs">
                    {t("dashboard.archiveViewActive")}
                  </p>
                  <p className="text-sm font-medium">
                    {t("dashboard.archiveViewDescription", {
                      termName: selectedTerm.name,
                    })}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Virtualized List Container */}
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
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const session = attendanceSessions[virtualItem.index];
                  const sessionDate = dayjs(session.date);

                  return (
                    <div
                      key={virtualItem.key}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: `${virtualItem.size}px`,
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                      className="px-8"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col md:flex-row items-center h-full border-b border-primary/5 hover:bg-primary/2 transition-all group cursor-pointer"
                        onClick={() => handleRowClick(session)}
                      >
                        {/* Icon */}
                        <div className="relative shrink-0 mb-4 md:mb-0">
                          <div className="h-14 w-14 rounded-2xl border-4 border-background flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform bg-primary/10 text-primary">
                            <Calendar className="h-7 w-7" />
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 md:ms-8 text-center md:text-start min-w-0 w-full">
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h3 className="text-xl font-black tracking-tight truncate group-hover:text-primary transition-colors">
                              {session.class?.name}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                              <Badge
                                variant="outline"
                                className="text-[10px] md:text-[11px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-primary/10"
                              >
                                {sessionDate.format("MMM D, YYYY")}
                              </Badge>
                              <Badge className="bg-primary/5 text-primary border-none font-black px-2 py-0.5 rounded-md text-[10px] md:text-[11px] tracking-widest uppercase">
                                {sessionDate.fromNow()}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-3">
                            {isStaff ? (
                              <>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <div className="p-1.5 rounded-lg bg-green-500/5">
                                    <UserCheck className="h-3.5 w-3.5 text-green-600" />
                                  </div>
                                  <span className="text-xs font-bold text-green-600">
                                    {session.presentCount}{" "}
                                    <span className="text-muted-foreground/50 font-medium">
                                      {t("classes.attendance.present")}
                                    </span>
                                  </span>
                                </div>
                                {(session.absentCount || 0) > 0 && (
                                  <div className="flex items-center gap-2 text-muted-foreground">
                                    <div className="p-1.5 rounded-lg bg-destructive/5">
                                      <UserMinus className="h-3.5 w-3.5 text-destructive" />
                                    </div>
                                    <span className="text-xs font-bold text-destructive">
                                      {session.absentCount}{" "}
                                      <span className="text-muted-foreground/50 font-medium">
                                        {t("classes.attendance.absent")}
                                      </span>
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div
                                  className={cn(
                                    "p-1.5 rounded-lg",
                                    session.status === "present"
                                      ? "bg-green-500/5"
                                      : "bg-destructive/5"
                                  )}
                                >
                                  {session.status === "present" ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                  ) : (
                                    <XCircle className="h-3.5 w-3.5 text-destructive" />
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "text-xs font-black uppercase tracking-widest",
                                    session.status === "present"
                                      ? "text-green-600"
                                      : "text-destructive"
                                  )}
                                >
                                  {session.status === "present"
                                    ? t("classes.attendance.present")
                                    : t("classes.attendance.absent")}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                          <div className="hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            {isStaff && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQrTargetClassId(session.classId.toString());
                                }}
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            className="rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            {t("buttons.viewDetails")}
                            <ArrowRight className="h-4 w-4 ms-2" />
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-xl md:hidden lg:flex"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-56 rounded-[1.5rem] p-2 bg-white dark:bg-[#09090b] opacity-100 backdrop-blur-none border border-border/50 shadow-2xl"
                            >
                              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2">
                                {t("classes.attendance.governance.sessionOptions")}
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleRowClick(session)}
                                className="rounded-xl gap-3 py-3 cursor-pointer"
                              >
                                <Eye className="h-4 w-4 text-primary" />
                                <span className="font-bold">
                                  {t("classes.attendance.governance.viewFullReport")}
                                </span>
                              </DropdownMenuItem>
                              {isStaff && (
                                <>
                                  <DropdownMenuSeparator className="my-2" />
                                  <DropdownMenuItem
                                    onClick={() => setQrTargetClassId(session.classId.toString())}
                                    className="rounded-xl gap-3 py-3 cursor-pointer"
                                  >
                                    <QrCode className="h-4 w-4 text-primary" />
                                    <span className="font-bold">
                                      {t("classes.attendance.governance.startQrCheckin")}
                                    </span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
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
