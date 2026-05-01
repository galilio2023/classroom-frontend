import { useCustom } from "@refinedev/core";
import { useCapabilities } from "@/hooks/use-capabilities";

export interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subjectId?: string;
  classId?: string;
  teacherId: string;
  roomId?: string;
  subject?: {
    name: string;
    color?: string;
  };
  teacher?: {
    name: string;
    image?: string;
  };
  section?: {
    name: string;
  };
  isLive?: boolean;
  sessionId?: string;
}

export const useTimetable = (params: { teacherId?: string; studentId?: string } = {}) => {
  const { isSchoolSuite, isFacultySuite } = useCapabilities();

  let url = `${import.meta.env.VITE_API_URL}/timetable`;

  if (params.teacherId) {
    url = `${import.meta.env.VITE_API_URL}/timetable/${isSchoolSuite ? "teacher-weekly" : "lecturer-weekly"}`;
  } else if (params.studentId) {
    // Note: Weekly for students might need a specific endpoint or generic filter
    url = `${import.meta.env.VITE_API_URL}/timetable`;
  }

  const { query } = useCustom<TimetableSlot[]>({
    url,
    method: "get",
  });

  return {
    slots: query.data?.data || [],
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
};
