import { useState, useCallback, useEffect } from "react";
import {
  useCustomMutation,
  useOne,
  useList,
  useGetIdentity,
  BaseRecord,
  HttpError,
} from "@refinedev/core";
import { User, UserRole, Class } from "@/types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { usePersistentLive } from "@/features/classes/hooks/use-persistent-live";
import { useCapabilities } from "@/features/users/hooks/use-capabilities";
import { handleError } from "@/providers/utils/api-errors";

interface UseLiveSessionReturn {
  identity: User | undefined;
  isTeacher: boolean;
  classData: Class | undefined;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  studentCount: number;
  setStudentCount: React.Dispatch<React.SetStateAction<number>>;
  isBreakoutActive: boolean;
  setIsBreakoutActive: React.Dispatch<React.SetStateAction<boolean>>;
  currentGroupId: number | null;
  setCurrentGroupId: React.Dispatch<React.SetStateAction<number | null>>;
  myGroup: any;
  groups: any[];
  generateRoadmap: boolean;
  setGenerateRoadmap: React.Dispatch<React.SetStateAction<boolean>>;
  handleStartLiveSession: () => void;
  handleToggleBreakout: () => void;
  handleEndSession: () => Promise<void>;
  markLiveAttendance: any;
  refetchClass: () => void;
  isJoined: boolean;
  setIsJoined: (joined: boolean) => void;
  setActiveClassId: (id: string | null) => void;
}

export const useLiveSession = (classIdString: string): UseLiveSessionReturn => {
  const { t, i18n } = useTranslation();
  const { identity, isStaff: isTeacher } = useCapabilities();
  const { isJoined, setIsJoined, setActiveClassId } = usePersistentLive();
  const [isLoading, setIsLoading] = useState(false);
  const [studentCount, setStudentCount] = useState(0);
  const [isBreakoutActive, setIsBreakoutActive] = useState(false);
  const [currentGroupId, setCurrentGroupId] = useState<number | null>(null);
  const [myGroup, setMyGroup] = useState<any>(null);
  const [generateRoadmap, setGenerateRoadmap] = useState(true);

  const numericClassId = Number(classIdString);

  const { mutate: markLiveAttendance } = useCustomMutation<BaseRecord, HttpError>();
  const { mutate: endLiveSession } = useCustomMutation<BaseRecord, HttpError>();
  const { mutate: manageBreakout } = useCustomMutation<BaseRecord, HttpError>();
  const { mutate: startLiveSession } = useCustomMutation<BaseRecord, HttpError>();

  const { query: classQuery } = useOne<Class>({
    resource: "classes",
    id: classIdString,
    queryOptions: { enabled: !!numericClassId },
  });

  const classData = classQuery.data?.data;

  useEffect(() => {
    if (classData?.isBreakoutActive) {
      setIsBreakoutActive(true);
    }
  }, [classData]);

  const { query: groupsQuery } = useList<any>({
    resource: "project-groups",
    filters: [{ field: "classId", operator: "eq", value: numericClassId }],
    queryOptions: { enabled: !!numericClassId },
    pagination: { mode: "off" },
  });

  const groups = groupsQuery.data?.data || [];

  useEffect(() => {
    if (groups.length > 0 && identity && !isTeacher) {
      const group = groups.find((g: any) =>
        g.members?.some((m: any) => m.studentId === identity.id)
      );
      setMyGroup(group);
    }
  }, [groups, identity, isTeacher]);

  const handleStartLiveSession = useCallback(() => {
    setIsLoading(true);
    startLiveSession(
      {
        url: "/live-session/start",
        method: "post",
        values: { classId: numericClassId, generateRoadmap },
      },
      {
        onSuccess: () => {
          toast.success(t("classes.live.toasts.sessionStartedTeacher"));
          setActiveClassId(classIdString);
          setIsJoined(true);
        },
        onError: (error: HttpError) => {
          setIsLoading(false);
          toast.error(error.message);
        },
      }
    );
  }, [
    numericClassId,
    generateRoadmap,
    startLiveSession,
    t,
    setActiveClassId,
    setIsJoined,
    classIdString,
  ]);

  const handleToggleBreakout = useCallback(() => {
    const endpoint = isBreakoutActive ? "/breakout/end" : "/breakout/start";
    manageBreakout(
      {
        url: `/live-session${endpoint}`,
        method: "post",
        values: { classId: numericClassId },
      },
      {
        onSuccess: () => {
          toast.success(
            isBreakoutActive
              ? t("classes.live.toasts.breakoutEnded")
              : t("classes.live.toasts.breakoutStarted")
          );
          setIsBreakoutActive(!isBreakoutActive);
        },
        onError: async (error: HttpError) => {
          const refinedError = await handleError(error as any);
          toast.error(refinedError.message);
        },
      }
    );
  }, [isBreakoutActive, manageBreakout, numericClassId, t]);

  const handleEndSession = useCallback(async () => {
    const confirmMsg = "Are you sure you want to end the class for everyone?";
    if (!window.confirm(confirmMsg)) return;

    setIsLoading(true);
    endLiveSession(
      {
        url: "/live-session/end",
        method: "post",
        values: { classId: numericClassId },
      },
      {
        onSuccess: () => {
          setIsJoined(false);
          setActiveClassId(null);
          setIsLoading(false);
          toast.success("Session terminated.");
        },
        onError: (error: HttpError) => {
          setIsLoading(false);
          toast.error(error.message);
        },
      }
    );
  }, [endLiveSession, numericClassId, setIsJoined, setActiveClassId]);

  return {
    identity,
    isTeacher,
    classData,
    isLoading,
    setIsLoading,
    studentCount,
    setStudentCount,
    isBreakoutActive,
    setIsBreakoutActive,
    currentGroupId,
    setCurrentGroupId,
    myGroup,
    groups,
    generateRoadmap,
    setGenerateRoadmap,
    handleStartLiveSession,
    handleToggleBreakout,
    handleEndSession,
    markLiveAttendance,
    refetchClass: classQuery.refetch,
    isJoined,
    setIsJoined,
    setActiveClassId,
  };
};
