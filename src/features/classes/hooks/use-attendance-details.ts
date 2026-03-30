import { useState, useEffect } from "react";
import { useCustom, useCustomMutation, useNotification } from "@refinedev/core";
import { useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Enrollment, AttendanceStatus, Attendance } from "@/types";
import { useTranslation } from "react-i18next";
import { useUserRole } from "@/hooks/use-user-role";

interface AttendanceHistoryGroup {
  date: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  records: Attendance[];
}

export const useAttendanceDetails = (classId: string, enrollments: Enrollment[], date?: Date) => {
  const { t } = useTranslation();
  const { isStaff } = useUserRole();
  const [searchParams] = useSearchParams();
  const { open } = useNotification();

  const [selectedDate, setSelectedDate] = useState(
    date ? format(date, "yyyy-MM-dd") : searchParams.get("date") || format(new Date(), "yyyy-MM-dd")
  );

  useEffect(() => {
    if (date) {
      setSelectedDate(format(date, "yyyy-MM-dd"));
    }
  }, [date]);

  const [attendanceData, setAttendanceData] = useState<
    Record<
      string,
      {
        status: AttendanceStatus;
        remarks: string;
        minutesPresent: number;
        participationScore: number;
      }
    >
  >({});

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  // --- Daily Records ---
  const { query: dailyQuery } = useCustom<Attendance[]>({
    url: `/attendance`,
    method: "get",
    config: { query: { classId, date: selectedDate } },
  });

  const isLoading = dailyQuery.isLoading;

  // --- History ---
  const { query: historyQuery } = useCustom<AttendanceHistoryGroup[]>({
    url: `/attendance/history/${classId}`,
    method: "get",
  });

  // --- Stats ---
  const { query: statsQuery } = useCustom<Record<AttendanceStatus, number>>({
    url: `/attendance/stats/${classId}`,
    method: "get",
    config: { query: { date: selectedDate } },
  });

  const refetch = () => {
    void dailyQuery.refetch();
    void historyQuery.refetch();
    void statsQuery.refetch();
  };

  useEffect(() => {
    const initialData: Record<
      string,
      {
        status: AttendanceStatus;
        remarks: string;
        minutesPresent: number;
        participationScore: number;
      }
    > = {};
    enrollments.forEach((e) => {
      initialData[e.studentId] = {
        status: AttendanceStatus.ABSENT,
        remarks: "",
        minutesPresent: 0,
        participationScore: 0,
      };
    });

    if (dailyQuery.data?.data) {
      dailyQuery.data.data.forEach((record: Attendance) => {
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
  }, [dailyQuery.data, enrollments, selectedDate]);

  const { mutate: saveAttendance, mutation } = useCustomMutation();

  const handleMarkAttendance = (studentId: string, status: AttendanceStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleValueChange = (studentId: string, field: string, value: string | number) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const handleBulkMark = (status: AttendanceStatus) => {
    const newData = { ...attendanceData };
    enrollments.forEach((e) => {
      newData[e.studentId] = { ...newData[e.studentId], status };
    });
    setAttendanceData(newData);
  };

  const handleSave = (customRecords?: any[]) => {
    const records =
      customRecords ||
      Object.entries(attendanceData).map(([studentId, data]) => ({
        studentId,
        ...data,
      }));

    saveAttendance(
      {
        url: "/attendance/bulk",
        method: "post",
        values: { classId, records, date: selectedDate },
      },
      {
        onSuccess: () => {
          open?.({
            type: "success",
            message: t("classes.attendance.toast.saved"),
            description: t("classes.attendance.toast.savedDescription", {
              date: selectedDate,
            }),
          });
          refetch();
        },
      }
    );
  };

  return {
    isStaff,
    selectedDate,
    setSelectedDate,
    attendanceData,
    isLoading,
    historyData: historyQuery.data?.data,
    isHistoryLoading: historyQuery.isLoading,
    stats: statsQuery.data?.data,
    isUpdating: mutation.isPending,
    isQRModalOpen,
    setIsQRModalOpen,
    isScannerModalOpen,
    setIsScannerModalOpen,
    handleMarkAttendance,
    handleValueChange,
    handleBulkMark,
    handleSave,
    refetch,
  };
};
