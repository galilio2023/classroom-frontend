import { useState, useEffect, useMemo } from "react";
import {
  useList,
  HttpError,
  useGetIdentity,
  useCustomMutation,
  useInvalidate,
  useDelete,
  useNavigation,
} from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import {
  User,
  UserRole,
  ClassListItem,
  TeacherApplication,
  Subject,
  Department,
} from "@/types";
import { toast } from "sonner";
import { socket } from "@/lib/socket";
import { useTerm } from "@/contexts/term-context";
import { useTranslation } from "react-i18next";
import { ColumnDef } from "@tanstack/react-table";

const DEFAULT_PAGE_SIZE = 50;

export const useClassList = () => {
  const { t, i18n } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const { create, show, edit } = useNavigation();
  const { selectedTerm } = useTerm();
  const invalidate = useInvalidate();
  const { mutate: deleteClass } = useDelete();

  const isStudent = identity?.role === UserRole.STUDENT;
  const isTeacher = identity?.role === UserRole.TEACHER;
  const isAdmin = identity?.role === UserRole.ADMIN;
  const isAr = i18n.language === "ar";

  const [inviteCode, setInviteCode] = useState("");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [applyTarget, setApplyTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [view, setView] = useState<"discovery" | "my">(
    isStudent ? "discovery" : "my",
  );

  const { mutate: joinClass, mutation: joinMutation } = useCustomMutation();
  const { mutate: enrollRequest, mutation: enrollMutation } =
    useCustomMutation();
  const { mutate: cloneClass, mutation: cloneMutation } = useCustomMutation();

  // --- SOCKET UPDATES ---
  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleLiveUpdate = () =>
      invalidate({ resource: "classes", invalidates: ["list"] });
    const handleEnrollmentApproval = () => {
      toast.success(t("classes.list.toast.enrollmentApproved"));
      invalidate({ resource: "classes", invalidates: ["list"] });
    };

    socket.on("live_session_started", handleLiveUpdate);
    socket.on("live_session_ended", handleLiveUpdate);
    socket.on("enrollment_approved", handleEnrollmentApproval);

    return () => {
      socket.off("live_session_started", handleLiveUpdate);
      socket.off("live_session_ended", handleLiveUpdate);
      socket.off("enrollment_approved", handleEnrollmentApproval);
    };
  }, [invalidate, t]);

  // --- TABLE LOGIC ---
  const columns = useMemo<ColumnDef<ClassListItem>[]>(
    () => [{ id: "id", accessorKey: "id" }],
    [],
  );

  const {
    refineCore: { tableQuery: tableQueryResult, filters, setFilters },
  } = useTable<ClassListItem>({
    columns,
    refineCoreProps: {
      resource: "classes",
      pagination: { mode: "server", pageSize: DEFAULT_PAGE_SIZE },
      sorters: { initial: [{ field: "id", order: "desc" }] },
      meta: {
        populate: [
          "subject",
          "subject.department",
          "teachers",
          "teachers.teacher",
          "_count",
          "schedules",
        ],
      },
      syncWithLocation: true,
      filters: {
        permanent: [
          ...(selectedTerm
            ? [
                {
                  field: "termId",
                  operator: "eq" as const,
                  value: selectedTerm.id,
                },
              ]
            : []),
          ...(isTeacher && identity?.id
            ? [
                {
                  field: "teacherUid",
                  operator: "eq" as const,
                  value: identity.id,
                },
              ]
            : []),
          ...(isStudent && view === "my"
            ? [{ field: "my", operator: "eq" as const, value: "true" }]
            : []),
        ],
      },
    },
  });

  const { query: subjectsQuery } = useList<Subject, HttpError>({
    resource: "subjects",
    pagination: { pageSize: 1000 },
  });
  const { query: departmentsQuery } = useList<Department, HttpError>({
    resource: "departments",
    pagination: { pageSize: 100 },
  });
  const { query: applicationsQuery } = useList<TeacherApplication>({
    resource: "teacher-applications",
    queryOptions: { enabled: isTeacher },
  });

  // --- ACTIONS ---
  const handleJoinByCode = () => {
    if (!inviteCode.trim()) return;
    joinClass(
      { url: "/classes/join", method: "post", values: { inviteCode } },
      {
        onSuccess: (data) => {
          const responseData = data.data as { message?: string };
          toast.success(
            responseData.message || t("classes.list.toast.joinRequestSent"),
          );
          setIsJoinModalOpen(false);
          setInviteCode("");
          // SMART FIX: Force refresh of the class lists
          void invalidate({ resource: "classes", invalidates: ["list"] });
        },
        onError: (err) => {
          const error = err as HttpError;
          toast.error(
            (error?.response?.data as any)?.message ||
              t("classes.list.toast.invalidInviteCode"),
          );
        },
      },
    );
  };

  const handleEnrollRequest = (id: number) => {
    enrollRequest(
      { url: `/classes/${id}/enroll`, method: "post", values: {} },
      {
        onSuccess: (data) => {
          const responseData = data.data as { message?: string };
          toast.success(responseData.message);
          invalidate({ resource: "classes", invalidates: ["list"] });
        },
        onError: (err) => {
          const error = err as HttpError;
          toast.error(
            (error?.response?.data as any)?.message ||
              "Failed to send enrollment request.",
          );
        },
      },
    );
  };

  const handleClone = (id: number) => {
    cloneClass(
      { url: `/classes/${id}/clone`, method: "post", values: {} },
      {
        onSuccess: () => {
          toast.success(t("classes.list.toast.cloned"));
          invalidate({ resource: "classes", invalidates: ["list"] });
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      deleteClass(
        { resource: "classes", id: deleteTarget },
        {
          onSuccess: () => {
            toast.success(t("classes.list.toast.deleted"));
            setDeleteTarget(null);
          },
        },
      );
    }
  };

  return {
    data: {
      classes: tableQueryResult?.data?.data || [],
      total: tableQueryResult?.data?.total || 0,
      subjects: subjectsQuery.data?.data || [],
      departments: departmentsQuery.data?.data || [],
      applications: applicationsQuery.data?.data || [],
      identity,
      selectedTerm,
    },
    status: {
      isLoading: tableQueryResult?.isPending,
      isJoining: joinMutation.isPending,
      isEnrolling: enrollMutation.isPending,
      isCloning: cloneMutation.isPending,
      isAr,
      isStudent,
      isTeacher,
      isAdmin,
    },
    filters: {
      view,
      setView,
      search:
        (filters.find((f) => "field" in f && f.field === "name") as any)
          ?.value || "",
      subject:
        (filters.find((f) => "field" in f && f.field === "subject") as any)
          ?.value || "all",
      department:
        (filters.find((f) => "field" in f && f.field === "departmentId") as any)
          ?.value || "all",
      setSearch: (val: string) =>
        setFilters(
          [{ field: "name", operator: "contains", value: val || undefined }],
          "merge",
        ),
      setSubject: (val: string) =>
        setFilters(
          [
            {
              field: "subject",
              operator: "eq",
              value: val === "all" ? undefined : val,
            },
          ],
          "merge",
        ),
      setDepartment: (val: string) =>
        setFilters(
          [
            {
              field: "departmentId",
              operator: "eq",
              value: val === "all" ? undefined : Number(val),
            },
          ],
          "merge",
        ),
    },
    state: {
      inviteCode,
      setInviteCode,
      isJoinModalOpen,
      setIsJoinModalOpen,
      deleteTarget,
      setDeleteTarget,
      applyTarget,
      setApplyTarget,
    },
    actions: {
      handleJoinByCode,
      handleEnrollRequest,
      handleClone,
      handleConfirmDelete,
      create,
      show,
      edit,
      invalidate,
    },
  };
};
