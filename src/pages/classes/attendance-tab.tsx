import { useState, useMemo, useEffect } from "react";
import {
  useCustom,
  useCustomMutation,
  useNotification,
  useGetIdentity,
} from "@refinedev/core";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Enrollment,
  AttendanceStatus,
  Attendance,
  User,
  UserRole,
} from "@/types";
import {
  Loader2,
  Save,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  History,
  ClipboardCheck,
  QrCode,
  Camera,
  LayoutDashboard,
  Info,
  ArrowRight,
  Sparkles,
  Timer,
  Zap
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { EmptyState } from "@/components/empty-state";
import { QRAttendanceModal } from "./qr-attendance-modal";
import { QRScannerModal } from "./qr-scanner-modal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface AttendanceTabProps {
  classId: string;
  enrollments: Enrollment[];
}

interface AttendanceHistoryGroup {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  records: Attendance[];
}

export const AttendanceTab = ({ classId, enrollments }: AttendanceTabProps) => {
  const { t, i18n } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const isTeacher =
    identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;
  const [searchParams] = useSearchParams();

  const { open } = useNotification();
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get("date") || format(new Date(), "yyyy-MM-dd"),
  );
  const [attendanceData, setAttendanceData] = useState<
    Record<string, { status: AttendanceStatus; remarks: string; minutesPresent: number; participationScore: number }>
  >({});

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  const { query: dailyQuery } = useCustom<Attendance[]>({
    url: `/attendance`,
    method: "get",
    config: {
      query: {
        classId,
        date: selectedDate,
      },
    },
  });

  const existingAttendance = dailyQuery.data;
  const isFetching = dailyQuery.isLoading;
  const refetchDaily = dailyQuery.refetch;

  const { query: historyQuery } = useCustom<AttendanceHistoryGroup[]>({
    url: `/attendance/history/${classId}`,
    method: "get",
  });
  const historyData = historyQuery.data;
  const isHistoryLoading = historyQuery.isLoading;
  const refetchHistory = historyQuery.refetch;

  const { query: statsQuery } = useCustom<Record<AttendanceStatus, number>>({
    url: `/attendance/stats/${classId}`,
    method: "get",
    config: {
      query: { date: selectedDate },
    },
  });
  const statsData = statsQuery.data;
  const refetchStats = statsQuery.refetch;

  useEffect(() => {
    const initialData: Record<
      string,
      { status: AttendanceStatus; remarks: string; minutesPresent: number; participationScore: number }
    > = {};

    enrollments.forEach((e) => {
      initialData[e.studentId] = {
        status: AttendanceStatus.ABSENT,
        remarks: "",
        minutesPresent: 0,
        participationScore: 0,
      };
    });

    if (existingAttendance?.data) {
      existingAttendance.data.forEach((record: Attendance) => {
        const recordDateStr =
          typeof record.date === "string"
            ? record.date.split("T")[0]
            : format(new Date(record.date), "yyyy-MM-dd");

        if (recordDateStr === selectedDate) {
          initialData[record.studentId] = {
            status: record.status,
            remarks: record.remarks || "",
            minutesPresent: record.minutesPresent || 0,
            participationScore: record.participationScore || 0,
          };
        }
      });
    }
    setAttendanceData(initialData);
  }, [existingAttendance, enrollments, selectedDate]);

  const { mutate: saveAttendance, mutation } = useCustomMutation() as any;

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleValueChange = (studentId: string, field: "minutesPresent" | "participationScore" | "remarks", value: any) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleSave = () => {
    const records = Object.entries(attendanceData).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks,
      minutesPresent: data.minutesPresent,
      participationScore: data.participationScore,
    }));

    saveAttendance(
      {
        url: "/attendance/bulk",
        method: "post",
        values: {
          classId,
          records,
          date: selectedDate,
        },
      },
      {
        onSuccess: () => {
          open?.({
            type: "success",
            message: t("classes.attendance.toast.saved"),
            description: t("classes.attendance.toast.savedDescription", { date: selectedDate }),
          });
          void refetchDaily();
          void refetchHistory();
          void refetchStats();
        },
      },
    );
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case AttendanceStatus.ABSENT:
        return <XCircle className="h-4 w-4 text-destructive" />;
      case AttendanceStatus.LATE:
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case AttendanceStatus.EXCUSED:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return (
          <Badge className="bg-success/10 text-success border-none font-black text-[9px] uppercase tracking-widest">
            {t("classes.attendance.present")}
          </Badge>
        );
      case AttendanceStatus.ABSENT:
        return (
          <Badge
            variant="destructive"
            className="bg-destructive/10 text-destructive border-none font-black text-[9px] uppercase tracking-widest"
          >
            {t("classes.attendance.absent")}
          </Badge>
        );
      case AttendanceStatus.LATE:
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-none font-black text-[9px] uppercase tracking-widest">
            {t("classes.attendance.late")}
          </Badge>
        );
      case AttendanceStatus.EXCUSED:
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-none font-black text-[9px] uppercase tracking-widest">
            {t("classes.attendance.excused")}
          </Badge>
        );
    }
  };

  const isAr = i18n.language === 'ar';

  return (
    <div className="space-y-10 pb-20">
      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-4">
        {[
          {
            label: t("classes.attendance.present"),
            value: statsData?.data?.present || 0,
            icon: CheckCircle2,
            color: "text-success",
            bg: "bg-success/10",
            border: "border-success/20",
          },
          {
            label: t("classes.attendance.absent"),
            value: statsData?.data?.absent || 0,
            icon: XCircle,
            color: "text-destructive",
            bg: "bg-destructive/10",
            border: "border-destructive/20",
          },
          {
            label: t("classes.attendance.late"),
            value: statsData?.data?.late || 0,
            icon: Clock,
            color: "text-yellow-600",
            bg: "bg-yellow-500/10",
            border: "border-yellow-500/20",
          },
          {
            label: t("classes.attendance.excused"),
            value: statsData?.data?.excused || 0,
            icon: AlertCircle,
            color: "text-blue-600",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
          },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card
              className={cn(
                "border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-[1.5rem] overflow-hidden group hover:shadow-2xl transition-all",
                stat.bg,
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 text-start">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">
                      {stat.label}
                    </p>
                    <p
                      className={cn(
                        "text-4xl font-black tracking-tighter",
                        stat.color,
                      )}
                    >
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "p-3 rounded-2xl transition-transform group-hover:scale-110",
                      stat.bg,
                    )}
                  >
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-8">
        <Tabs
          defaultValue={isTeacher ? "mark" : "history"}
          className="w-full space-y-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <TabsList className="bg-card/50 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.05] p-1.5 rounded-2xl h-12 shadow-sm">
              {isTeacher && (
                <TabsTrigger
                  value="mark"
                  className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {t("classes.attendance.markAttendance")}
                </TabsTrigger>
              )}
              <TabsTrigger
                value="history"
                className="rounded-xl font-black uppercase tracking-widest text-[10px] px-6 gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <History className="h-3.5 w-3.5" />
                {t("classes.attendance.history")}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-3">
              {isTeacher ? (
                <Button
                  variant="outline"
                  className="h-12 rounded-2xl px-6 font-black uppercase tracking-widest text-[10px] gap-2 border-primary/20 hover:bg-primary/5 text-primary relative overflow-hidden group shadow-sm"
                  onClick={() => setIsQRModalOpen(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none" />
                  <QrCode className="h-4 w-4" />
                  {t("buttons.startQrAttendance")}
                </Button>
              ) : (
                <Button
                  className="h-12 rounded-2xl px-6 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  onClick={() => setIsScannerModalOpen(true)}
                >
                  <Camera className="h-4 w-4" />
                  {t("buttons.scanToMark")}
                </Button>
              )}
            </div>
          </div>

          {isTeacher && (
            <TabsContent value="mark" className="mt-0">
              <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden text-start">
                <CardHeader className="p-8 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-black/[0.03] dark:border-white/[0.03]">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <ClipboardCheck className="h-6 w-6" />
                      </div>
                      {t("classes.attendance.dailyAttendance")}
                    </CardTitle>
                    <CardDescription className="font-medium">
                      {t("classes.attendance.markFor", { date: format(new Date(selectedDate), "PPP", { locale: isAr ? ar : undefined }) })}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 bg-muted/30 px-4 py-2 rounded-2xl border border-black/[0.03] dark:border-white/[0.03]">
                      <CalendarIcon className="h-4 w-4 text-primary/60" />
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border-none bg-transparent h-8 focus-visible:ring-0 w-36 font-bold p-0"
                      />
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={mutation.isPending}
                      className="h-12 rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20"
                    >
                      {mutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {t("buttons.saveChanges")}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isFetching ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                        {t("classes.attendance.fetching")}
                      </p>
                    </div>
                  ) : enrollments.length > 0 ? (
                    <div className="px-4 pb-4 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="hover:bg-transparent border-none text-start">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">
                              {t("classes.attendance.table.student")}
                            </TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">
                              {t("classes.attendance.table.status")}
                            </TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">
                              {t("classes.attendance.table.minutes")}
                            </TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">
                              {t("classes.attendance.table.participation")}
                            </TableHead>
                            <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">
                              {t("classes.attendance.table.remarks")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {enrollments.map((enrollment) => {
                            const student = enrollment.student;
                            const data = attendanceData[student.id] || {
                              status: AttendanceStatus.ABSENT,
                              remarks: "",
                              minutesPresent: 0,
                              participationScore: 0,
                            };

                            return (
                              <motion.tr
                                key={student.id}
                                initial={{ opacity: 0, x: isAr ? 5 : -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.15 }}
                                className="group hover:bg-primary/[0.02] transition-colors border-b border-black/[0.03] dark:border-white/[0.03] text-start"
                              >
                                <TableCell className="py-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:scale-110 transition-transform text-xs">
                                      <AvatarImage
                                        src={student.image || ""}
                                        className="object-cover"
                                      />
                                      <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                        {student.name[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="font-black text-sm tracking-tight group-hover:text-primary transition-colors">
                                        {student.name}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                        {student.email}
                                      </span>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <Select
                                    value={data.status}
                                    onValueChange={(value) =>
                                      handleStatusChange(
                                        student.id,
                                        value as AttendanceStatus,
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-[130px] h-11 rounded-xl bg-muted/20 border-none focus:ring-primary transition-all font-bold text-xs">
                                      <div className="flex items-center gap-2">
                                        {getStatusIcon(data.status)}
                                        <SelectValue />
                                      </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-2xl">
                                      <SelectItem
                                        value={AttendanceStatus.PRESENT}
                                        className="rounded-lg font-bold text-start"
                                      >
                                        {t("classes.attendance.present")}
                                      </SelectItem>
                                      <SelectItem
                                        value={AttendanceStatus.ABSENT}
                                        className="rounded-lg font-bold text-start"
                                      >
                                        {t("classes.attendance.absent")}
                                      </SelectItem>
                                      <SelectItem
                                        value={AttendanceStatus.LATE}
                                        className="rounded-lg font-bold text-start"
                                      >
                                        {t("classes.attendance.late")}
                                      </SelectItem>
                                      <SelectItem
                                        value={AttendanceStatus.EXCUSED}
                                        className="rounded-lg font-bold text-start"
                                      >
                                        {t("classes.attendance.excused")}
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="relative w-24">
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={data.minutesPresent}
                                      onChange={(e) => handleValueChange(student.id, "minutesPresent", Number(e.target.value))}
                                      className={cn("h-11 rounded-xl bg-muted/10 border-none focus-visible:ring-primary transition-all font-black text-center", isAr ? "pl-8" : "pr-8")}
                                    />
                                    <Timer className={cn("absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40", isAr ? "left-2.5" : "right-2.5")} />
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="relative w-24">
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      min={0}
                                      max={10}
                                      value={data.participationScore}
                                      onChange={(e) => handleValueChange(student.id, "participationScore", Number(e.target.value))}
                                      className={cn("h-11 rounded-xl bg-muted/10 border-none focus-visible:ring-primary transition-all font-black text-center", isAr ? "pl-8" : "pr-8")}
                                    />
                                    <Zap className={cn("absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-yellow-500/40", isAr ? "left-2.5" : "right-2.5")} />
                                  </div>
                                </TableCell>
                                <TableCell className="py-4">
                                  <div className="relative group/input">
                                    <Input
                                      placeholder={t("classes.attendance.table.remarksPlaceholder")}
                                      value={data.remarks}
                                      onChange={(e) =>
                                        handleValueChange(
                                          student.id,
                                          "remarks",
                                          e.target.value,
                                        )
                                      }
                                      className="h-11 rounded-xl bg-muted/10 border-none focus-visible:ring-primary transition-all font-medium min-w-[150px]"
                                    />
                                    <div className={cn("absolute top-1/2 -translate-y-1/2 opacity-0 group-focus-within/input:opacity-20 transition-opacity", isAr ? "left-3" : "right-3")}>
                                      <Sparkles className="h-4 w-4" />
                                    </div>
                                  </div>
                                </TableCell>
                              </motion.tr>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="py-20">
                      <EmptyState
                        icon={ClipboardCheck}
                        title={t("classes.attendance.noEnrollments")}
                        description={t("classes.attendance.noEnrollmentsDescription")}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="history" className="mt-0">
            <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden text-start">
              <CardHeader className="p-8 pb-4 border-b border-black/[0.03] dark:border-white/[0.03]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <History className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black tracking-tight">
                      {t("classes.attendance.history")}
                    </CardTitle>
                    <CardDescription className="font-medium">
                      {isTeacher
                        ? t("classes.attendance.dailySummaryTeacher")
                        : t("classes.attendance.personalRecordStudent")}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isHistoryLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                      {t("classes.attendance.loadingHistory")}
                    </p>
                  </div>
                ) : (historyData?.data?.length ?? 0) > 0 ? (
                  <div className="px-4 pb-4">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-none text-start">
                          <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">
                            {t("classes.attendance.table.date")}
                          </TableHead>
                          {isTeacher ? (
                            <>
                              <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">
                                {t("classes.attendance.present")}
                              </TableHead>
                              <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">
                                {t("classes.attendance.absent")}
                              </TableHead>
                              <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">
                                {t("classes.attendance.late")}
                              </TableHead>
                              <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">
                                {t("classes.attendance.excused")}
                              </TableHead>
                            </>
                          ) : (
                            <>
                              <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">
                                {t("classes.attendance.table.status")}
                              </TableHead>
                              <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">
                                {t("classes.attendance.table.participation")}
                              </TableHead>
                              <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">
                                {t("classes.attendance.table.remarks")}
                              </TableHead>
                            </>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyData?.data?.map(
                          (group: AttendanceHistoryGroup) => (
                            <motion.tr
                              key={group.date}
                              initial={{ opacity: 0, x: isAr ? 5 : -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.15 }}
                              className="group hover:bg-primary/[0.02] transition-colors border-b border-black/[0.03] dark:border-white/[0.03] text-start"
                            >
                              <TableCell className="py-6 font-black text-sm tracking-tight">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                    <CalendarIcon className="h-4 w-4" />
                                  </div>
                                  {format(new Date(group.date), "PPP", { locale: isAr ? ar : undefined })}
                                </div>
                              </TableCell>
                              {isTeacher ? (
                                <>
                                  <TableCell className="py-6">
                                    <Badge
                                      variant="outline"
                                      className="font-black text-[10px] uppercase tracking-widest text-success border-success/20 bg-success/5 h-6 px-3 rounded-full"
                                    >
                                      {group.present}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-6">
                                    <Badge
                                      variant="outline"
                                      className="font-black text-[10px] uppercase tracking-widest text-destructive border-destructive/20 bg-destructive/5 h-6 px-3 rounded-full"
                                    >
                                      {group.absent}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-6">
                                    <Badge
                                      variant="outline"
                                      className="font-black text-[10px] uppercase tracking-widest text-yellow-600 border-yellow-500/20 bg-yellow-500/5 h-6 px-3 rounded-full"
                                    >
                                      {group.late}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="py-6">
                                    <Badge
                                      variant="outline"
                                      className="font-black text-[10px] uppercase tracking-widest text-blue-600 border-blue-500/20 bg-blue-500/5 h-6 px-3 rounded-full"
                                    >
                                      {group.excused}
                                    </Badge>
                                  </TableCell>
                                </>
                              ) : (
                                <>
                                  <TableCell className="py-6">
                                    {getStatusBadge(group.records[0].status)}
                                  </TableCell>
                                  <TableCell className="py-6">
                                    <div className="flex items-center gap-2">
                                      <Zap className="h-3 w-3 text-yellow-500" />
                                      <span className="font-black text-xs">{group.records[0].participationScore}/10</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="py-6">
                                    <div className="flex items-center gap-2 text-muted-foreground/60 italic text-xs font-medium">
                                      <Info className="h-3.5 w-3.5 opacity-40" />
                                      {group.records[0].remarks || t("classes.attendance.noRemarks")}
                                    </div>
                                  </TableCell>
                                </>
                              )}
                            </motion.tr>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-20">
                    <EmptyState
                      icon={History}
                      title={t("classes.attendance.noRecords")}
                      description={t("classes.attendance.noRecordsDescription")}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Modals */}
      <QRAttendanceModal
        isOpen={isQRModalOpen}
        onClose={() => {
          setIsQRModalOpen(false);
          void refetchDaily();
          void refetchHistory();
          void refetchStats();
        }}
        classId={classId}
      />

      <QRScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => {
          setIsScannerModalOpen(false);
          void refetchDaily();
          void refetchHistory();
          void refetchStats();
        }}
        classId={classId}
      />
    </div>
  );
};
