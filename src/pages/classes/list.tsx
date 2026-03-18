import {
  Search,
  Key,
  LayoutGrid,
  Users,
  Building2,
  Copy,
  Trash2,
  Video,
  PlusCircle,
  ArrowRight,
  Clock,
  Filter,
  MoreHorizontal,
  Eye,
  BookOpen,
  Pencil,
  Loader2,
  AlertCircle,
  LayoutDashboard,
  Send,
  Compass,
  Briefcase,
  Layers,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import {
  useList,
  HttpError,
  useGetIdentity,
  useCustomMutation,
  useInvalidate,
  useDelete,
  useNavigation,
  BaseKey,
} from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import { Link } from "react-router-dom";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Subject,
  Department,
  User,
  UserRole,
  ClassListItem,
  TeacherApplication,
} from "@/types";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";
import { socket } from "@/lib/socket";
import { useTerm } from "@/contexts/term-context";
import { motion, AnimatePresence } from "framer-motion";
import usePageTitle from "@/hooks/use-page-title";
import { ApplyTeacherDialog } from "./apply-teacher-dialog";
import { useTranslation } from "react-i18next";
import { TeacherDiscoveryList } from "@/components/classes/teacher-discovery-list";
import { ColumnDef } from "@tanstack/react-table";

const DEFAULT_PAGE_SIZE = 50;
const DEPARTMENTS_PAGE_SIZE = 100;
const SUBJECTS_PAGE_SIZE = 1000;

const ClassesList = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("classes.list.title"));
  const { data: identity } = useGetIdentity<User>();
  const { create, show, edit } = useNavigation();
  const { selectedTerm } = useTerm();
  const isStudent = identity?.role === UserRole.STUDENT;
  const isTeacher = identity?.role === UserRole.TEACHER;
  const isAdmin = identity?.role === UserRole.ADMIN;
  const isAr = i18n.language === 'ar';

  const [inviteCode, setInviteCode] = useState("");
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const [applyTarget, setApplyTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"mine" | "browse">(
    isTeacher ? "mine" : "browse",
  );

  const { mutate: joinClass, mutation: joinMutation } = useCustomMutation();
  const { mutate: enrollRequest, mutation: enrollMutation } = useCustomMutation();
  const { mutate: cloneClass, mutation: cloneMutation } = useCustomMutation();
  const { mutate: deleteClass } = useDelete();
  const invalidate = useInvalidate();

  const isJoining = joinMutation.isPending;
  const isEnrolling = enrollMutation.isPending;
  const isCloning = cloneMutation.isPending;

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const handleLiveUpdate = () => {
      invalidate({ resource: "classes", invalidates: ["list"] });
    };

    socket.on("live_session_started", handleLiveUpdate);
    socket.on("live_session_ended", handleLiveUpdate);

    return () => {
      socket.off("live_session_started", handleLiveUpdate);
      socket.off("live_session_ended", handleLiveUpdate);
    };
  }, [invalidate]);

  const handleJoinByCode = () => {
    if (!inviteCode.trim()) return;

    joinClass(
      {
        url: "/classes/join",
        method: "post",
        values: { inviteCode },
      },
      {
        onSuccess: (data: any) => {
          toast.success(
            data.data.message || t("classes.list.toast.joinRequestSent"),
          );
          setIsJoinModalOpen(false);
          setInviteCode("");
        },
        onError: (error: any) => {
          toast.error(
            error?.data?.message || t("classes.list.toast.invalidInviteCode"),
          );
        },
      },
    );
  };

  const handleEnrollRequest = (id: number) => {
    enrollRequest(
      {
        url: `/classes/${id}/enroll`,
        method: "post",
        values: {},
      },
      {
        onSuccess: (data: any) => {
          toast.success(data.data.message);
          invalidate({ resource: "classes", invalidates: ["list"] });
        },
        onError: (error: any) => {
          toast.error(error?.data?.message || "Failed to send enrollment request.");
        },
      }
    );
  };

  const handleClone = (id: number) => {
    cloneClass(
      {
        url: `/classes/${id}/clone`,
        method: "post",
        values: {},
      },
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
        {
          resource: "classes",
          id: deleteTarget,
        },
        {
          onSuccess: () => {
            toast.success(t("classes.list.toast.deleted"));
            setDeleteTarget(null);
          },
        },
      );
    }
  };

  const { query: subjectsQuery } = useList<Subject, HttpError>({
    resource: "subjects",
    pagination: { pageSize: SUBJECTS_PAGE_SIZE },
  });

  const { query: departmentsQuery } = useList<Department, HttpError>({
    resource: "departments",
    pagination: { pageSize: DEPARTMENTS_PAGE_SIZE },
  });

  const subjects = subjectsQuery.data?.data ?? [];
  const departmentsList = departmentsQuery.data?.data ?? [];

  const columns = useMemo<ColumnDef<ClassListItem>[]>(
    () => [
      {
        id: "id",
        accessorKey: "id",
        header: "ID",
      },
    ],
    []
  );

  const {
    refineCore: {
      tableQuery: tableQueryResult,
      filters,
      setFilters,
    }
  } = useTable<ClassListItem>({
    columns,
    refineCoreProps: {
      resource: "classes",
      pagination: { mode: "server", pageSize: DEFAULT_PAGE_SIZE },
      sorters: { initial: [{ field: "id", order: "desc" }] },
      queryOptions: {
        staleTime: 0,
      },
      meta: {
        populate: [
          "subject",
          "subject.department",
          "teachers",
          "teachers.teacher",
          "_count",
          "schedules"
        ],
      },
      syncWithLocation: true,
      filters: {
        permanent: selectedTerm
          ? [
              {
                field: "termId",
                operator: "eq",
                value: selectedTerm.id,
              },
            ]
          : [],
      },
    }
  });

  const classesData = tableQueryResult?.data;
  const isLoading = tableQueryResult?.isLoading;

  useEffect(() => {
    if (isTeacher) {
      if (viewMode === "mine") {
        setFilters(
          [
            {
              field: "teacherUid",
              operator: "eq",
              value: identity?.id,
            },
          ],
          "merge",
        );
      } else {
        setFilters(
          [
            {
              field: "teacherUid",
              operator: "eq",
              value: undefined,
            },
          ],
          "merge",
        );
      }
    }
  }, [viewMode, identity?.id, isTeacher]);

  const searchQuery =
    (filters.find((f) => "field" in f && f.field === "name") as any)?.value ||
    "";
  const selectedSubject =
    (filters.find((f) => "field" in f && f.field === "subject") as any)
      ?.value || "all";
  const selectedDepartment = 
    (filters.find((f) => "field" in f && f.field === "departmentId") as any)
      ?.value || "all";

  const setSearchQuery = (val: string) => {
    setFilters(
      [{ field: "name", operator: "contains", value: val || undefined }],
      "merge",
    );
  };

  const setSelectedSubject = (val: string) => {
    setFilters(
      [
        {
          field: "subject",
          operator: "eq",
          value: val === "all" ? undefined : val,
        },
      ],
      "merge",
    );
  };

  const setSelectedDepartment = (val: string) => {
    setFilters(
      [
        {
          field: "departmentId",
          operator: "eq",
          value: val === "all" ? undefined : Number(val),
        },
      ],
      "merge",
    );
  };

  const {
    result: { data: applicationsData },
  } = useList<TeacherApplication>({
    resource: "teacher-applications",
    queryOptions: {
      enabled: isTeacher,
    },
  });

  const classes = classesData?.data || [];
  const applications = applicationsData || [];
  const hasData = classes.length > 0;

  return (
    <div className="space-y-8 md:space-y-12 max-w-screen-2xl mx-auto">
      <ListView>
        <div className="space-y-8 md:space-y-12">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
          >
            <div className="space-y-4 flex-1">
              <Breadcrumb />
              <div className="space-y-1">
                <h1 className="page-title mb-0 text-start">
                  {isStudent
                    ? t("classes.list.discover")
                    : viewMode === "mine"
                      ? t("classes.list.myClassrooms")
                      : t("classes.list.browseCatalog")}
                </h1>
                <p className="text-muted-foreground font-medium max-w-2xl text-start text-balance">
                  {isStudent
                    ? t("classes.list.discoverDescription")
                    : viewMode === "mine"
                      ? t("classes.list.myDescription")
                      : t("classes.list.browseDescription")}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {isTeacher && (
                <Tabs
                  value={viewMode}
                  onValueChange={(v) => setViewMode(v as any)}
                  className="bg-muted/30 p-1 rounded-2xl border border-border/40 w-full sm:w-auto"
                >
                  <TabsList className="bg-transparent h-12 gap-1 w-full sm:w-auto">
                    <TabsTrigger
                      value="mine"
                      className="rounded-xl font-black uppercase tracking-wider text-[10px] gap-2 px-6 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex-1 sm:flex-none"
                    >
                      <Briefcase className="h-4 w-4" />
                      {t("classes.list.myClassesTab")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="browse"
                      className="rounded-xl font-black uppercase tracking-wider text-[10px] gap-2 px-6 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all flex-1 sm:flex-none"
                    >
                      <Compass className="h-4 w-4" />
                      {t("classes.list.browseTab")}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}

              {isStudent && (
                <Dialog
                  open={isJoinModalOpen}
                  onOpenChange={setIsJoinModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full md:w-auto gap-2 rounded-2xl border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary font-black uppercase tracking-widest text-[10px] h-12 md:h-14"
                    >
                      <Key className="h-4 w-4" />
                      {t("buttons.joinByCode")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md rounded-[2.5rem] bg-card/95 backdrop-blur-xl border-none shadow-2xl">
                    <DialogHeader className="space-y-4">
                      <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
                        <Key className="h-8 w-8" />
                      </div>
                      <div className="space-y-2 text-center">
                        <DialogTitle className="text-3xl font-black">
                          {t("classes.list.joinModal.title")}
                        </DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground px-4">
                          {t("classes.list.joinModal.description")}
                        </DialogDescription>
                      </div>
                    </DialogHeader>
                    <div className="py-10">
                      <div className="relative group">
                        <Input
                          placeholder="XXXX-XXXX"
                          value={inviteCode}
                          onChange={(e) =>
                            setInviteCode(e.target.value.toUpperCase())
                          }
                          className="h-24 text-center text-4xl sm:text-5xl font-black font-mono tracking-widest rounded-3xl bg-muted/30 border-none focus-visible:ring-primary/20 shadow-inner"
                          maxLength={8}
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <DialogFooter className="sm:justify-center gap-3">
                      <Button
                        variant="ghost"
                        size="lg"
                        className="rounded-xl px-8 font-black uppercase tracking-widest text-[10px] h-14"
                        onClick={() => setIsJoinModalOpen(false)}
                      >
                        {t("buttons.cancel")}
                      </Button>
                      <Button
                        size="lg"
                        className="rounded-xl px-10 shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-[10px] h-14"
                        onClick={handleJoinByCode}
                        disabled={isJoining || inviteCode.length !== 8}
                      >
                        {isJoining ? (
                          <Loader2 className="h-4 w-4 animate-spin me-2" />
                        ) : (
                          <PlusCircle className="h-4 w-4 me-2" />
                        )}
                        {t("buttons.joinClass")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {(isTeacher || isAdmin) && (
                <Button
                  onClick={() => create("classes")}
                  size="lg"
                  className="w-full md:w-auto rounded-2xl h-12 md:h-14 px-10 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/25 hover:translate-y-[-2px] transition-all"
                >
                  <PlusCircle className="h-5 w-5" />
                  {t("buttons.createClass")}
                </Button>
              )}
            </div>
          </motion.div>

          {/* Archive Alert */}
          <AnimatePresence>
            {selectedTerm?.status === "archived" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-5 backdrop-blur-sm text-center sm:text-start"
              >
                <div className="p-3.5 rounded-2xl bg-amber-500/20 shrink-0">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <p className="font-black uppercase tracking-[0.2em] text-[10px]">
                    {t("dashboard.archiveViewActive")}
                  </p>
                  <p className="text-base font-bold opacity-90 text-balance">
                    {t("dashboard.archiveViewDescription", {
                      termName: selectedTerm.name,
                    })}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Teacher Discovery Catalog */}
          {isStudent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-primary/[0.02] border border-primary/5 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8"
            >
               <TeacherDiscoveryList />
            </motion.div>
          )}

          {/* Search & Filters Card */}
          <Card className="p-2 border-border/40 bg-muted/20 rounded-[1.5rem] md:rounded-[2rem] backdrop-blur-xl sticky top-20 z-30 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="relative flex-1 group">
                <Search
                  className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-focus-within:text-primary transition-colors start-4 md:start-6"
                />
                <Input
                  type="text"
                  placeholder={t("classes.list.searchPlaceholder")}
                  className="h-14 md:h-16 rounded-[1.25rem] md:rounded-3xl border-none bg-background/50 shadow-inner font-bold text-base md:text-lg ps-12 md:ps-14 pe-4 md:pe-6"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              
              {/* Department Filter */}
              <div className="flex items-center gap-2 bg-background/50 px-4 md:px-6 py-2 rounded-[1.25rem] md:rounded-3xl border border-border/40 shrink-0 shadow-inner">
                  <Building2 className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground/60" />
                  <Select
                    value={selectedDepartment.toString()}
                    onValueChange={setSelectedDepartment}
                  >
                    <SelectTrigger className="w-[180px] md:w-[220px] border-none h-12 focus:ring-0 shadow-none font-black text-xs uppercase tracking-widest bg-transparent">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 shadow-2xl bg-card/95 backdrop-blur-xl">
                      <SelectItem value="all" className="font-bold py-3">All Departments</SelectItem>
                      {departmentsList.map((dept: Department) => (
                        <SelectItem key={dept.id} value={dept.id.toString()} className="font-bold py-3">
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              {/* Subject Filter */}
              <div className="flex items-center gap-2 bg-background/50 px-4 md:px-6 py-2 rounded-[1.25rem] md:rounded-3xl border border-border/40 shrink-0 shadow-inner">
                  <Filter className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground/60" />
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger className="w-[180px] md:w-[220px] border-none h-12 focus:ring-0 shadow-none font-black text-xs uppercase tracking-widest bg-transparent">
                      <SelectValue placeholder={t("classes.list.allSubjects")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40 shadow-2xl bg-card/95 backdrop-blur-xl">
                      <SelectItem value="all" className="font-bold py-3">{t("classes.list.allSubjects")}</SelectItem>
                      {subjects.map((subject: Subject) => (
                        <SelectItem key={subject.id} value={subject.name} className="font-bold py-3">
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
            </div>
          </Card>

          {/* Class List Main Area */}
          <div className="relative">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-6 md:p-8 flex flex-col gap-6 border-border/20 bg-background/50 rounded-[2rem]">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
                        <div className="flex-1 space-y-3">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-full rounded-xl" />
                        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : !hasData ? (
              <div className="flex items-center justify-center p-12 md:p-20 bg-card/20 rounded-[3rem] border-2 border-dashed border-border/40 text-center">
                <EmptyState
                  icon={Layers}
                  title={t("classes.list.noClasses")}
                  description={
                    isStudent
                      ? t("classes.list.noClassesDescriptionStudent")
                      : viewMode === "mine"
                        ? t("classes.list.noClassesDescriptionTeacher")
                        : t("classes.list.noClassesDescriptionSearch")
                  }
                  className="border-none bg-transparent min-h-0"
                  action={
                    isStudent
                      ? {
                          label: t("buttons.joinClass"),
                          onClick: () => setIsJoinModalOpen(true),
                        }
                      : viewMode === "mine" && isTeacher
                        ? {
                            label: t("buttons.browseCatalog"),
                            onClick: () => setViewMode("browse"),
                          }
                        : {
                            label: t("buttons.createClass"),
                            onClick: () => create("classes"),
                          }
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                <AnimatePresence mode="popLayout">
                {classes.map((classItem, index) => {
                  if (!classItem) return null;

                  const primaryTeacher = classItem.teachers?.find(
                    (t: any) => t.isPrimary,
                  )?.teacher;
                  const classColor = (classItem as any).color || "#6366f1";

                  const isAssigned = classItem.teachers?.some(
                    (t: any) => t.teacher.id === identity?.id,
                  );
                  const isEnrolled = classItem.enrollments?.some(
                    (e: any) => e.studentId === identity?.id
                  );
                  
                  const pendingApp = applications.find(
                    (app) =>
                      app.classId === classItem.id && app.status === "pending",
                  );

                  const firstSchedule = classItem.schedules?.[0];

                  return (
                      <motion.div
                        key={classItem.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative flex flex-col h-full p-6 md:p-8 rounded-[2.5rem] bg-card/50 backdrop-blur-3xl border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 cursor-pointer"
                        onClick={() => show("classes", classItem.id)}
                      >
                        {/* Status Line Accent */}
                        <div 
                           className="absolute start-0 top-1/2 -translate-y-1/2 w-1.5 h-16 rounded-e-full transition-all group-hover:h-24"
                           style={{ backgroundColor: classColor }}
                        />

                        {/* Live Indicator Overlay */}
                        {classItem.isLive && (
                          <div className="absolute top-6 end-6 z-10">
                            <Badge className="bg-red-500 hover:bg-red-600 text-white border-none px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-500/20 animate-pulse">
                              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                              <Video className="h-3 w-3" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Live Now</span>
                            </Badge>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 md:gap-6 mb-6">
                            <div className="relative shrink-0">
                            {classItem.bannerUrl ? (
                                <div className="relative p-1 rounded-[1.75rem] bg-background shadow-md group-hover:scale-105 transition-transform duration-500 overflow-hidden">
                                    <img
                                        src={classItem.bannerUrl}
                                        alt={classItem.name}
                                        className="h-20 w-20 md:h-24 md:w-24 rounded-[1.5rem] object-cover"
                                    />
                                </div>
                            ) : (
                                <div
                                className="h-20 w-20 md:h-24 md:w-24 rounded-[1.75rem] bg-muted/30 border-2 border-dashed border-border/40 flex items-center justify-center group-hover:scale-105 transition-transform duration-500"
                                style={{
                                    backgroundColor: `${classColor}10`,
                                    borderColor: `${classColor}30`,
                                }}
                                >
                                <BookOpen
                                    className="h-8 w-8 md:h-10 md:w-10 transition-colors duration-500"
                                    style={{ color: classColor }}
                                />
                                </div>
                            )}
                            </div>

                            <div className="flex-1 min-w-0 space-y-2.5 w-full">
                                <h3 className="text-xl md:text-2xl font-black tracking-tight truncate group-hover:text-primary transition-colors">
                                    {classItem.name}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="ai" className="h-6 text-[9px] md:text-[10px]">
                                        {classItem.subject?.name || t("classes.list.general")}
                                    </Badge>
                                    <Badge variant="secondary" className="h-6 text-[9px] md:text-[10px] bg-muted/50 border-none font-bold">
                                        {classItem.subject?.department?.name || "No Dept"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Meta Info Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6 md:mb-8 mt-auto flex-1 content-end">
                            <div className="flex items-center gap-3 bg-background/50 p-3 rounded-2xl border border-border/40 shadow-sm">
                                <div className="p-2 rounded-xl bg-primary/5 text-primary shrink-0">
                                    <Users className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider truncate">
                                        {t("classes.list.studentsLabel")}
                                    </span>
                                    <span className="text-xs md:text-sm font-black text-foreground">
                                        {classItem._count?.enrollments || 0}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-background/50 p-3 rounded-2xl border border-border/40 shadow-sm">
                                <div className="p-2 rounded-xl bg-primary/5 text-primary shrink-0">
                                    {primaryTeacher ? <GraduationCap className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[9px] uppercase font-bold text-muted-foreground/60 tracking-wider truncate">
                                        {primaryTeacher ? "Teacher" : "Schedule"}
                                    </span>
                                    <span className="text-xs md:text-sm font-black text-foreground truncate">
                                        {primaryTeacher 
                                          ? primaryTeacher.name.split(' ')[0] 
                                          : firstSchedule 
                                            ? `${firstSchedule.day.substring(0,3)} ${firstSchedule.startTime}`
                                            : "Staff"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Area */}
                        <div className="flex items-center gap-3 pt-4 border-t border-border/40 w-full mt-auto">
                          {isTeacher && !isAssigned ? (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                setApplyTarget({
                                  id: classItem.id as number,
                                  name: classItem.name,
                                });
                              }}
                              disabled={!!pendingApp}
                              size="lg"
                              className="w-full rounded-2xl h-12 md:h-14 font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-xl shadow-primary/20"
                            >
                              <Send className="h-4 w-4 me-2 rtl:-scale-x-100" />
                              {pendingApp ? t("buttons.applied") : t("buttons.applyToTeach")}
                            </Button>
                          ) : isStudent && !isEnrolled ? (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEnrollRequest(classItem.id);
                              }}
                              disabled={isEnrolling}
                              size="lg"
                              className="w-full rounded-2xl h-12 md:h-14 font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-xl shadow-primary/20 bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                              {isEnrolling ? (
                                <Loader2 className="h-4 w-4 animate-spin me-2" />
                              ) : (
                                <PlusCircle className="h-4 w-4 me-2" />
                              )}
                              Request to Join
                            </Button>
                          ) : (
                            <Button
                              asChild
                              size="lg"
                              variant={classItem.isLive ? "default" : "outline"}
                              className={cn(
                                "flex-1 rounded-2xl h-12 md:h-14 font-black uppercase tracking-widest text-[10px] md:text-xs transition-all",
                                classItem.isLive
                                  ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 border-none text-white"
                                  : "border-primary/20 hover:bg-primary/5 text-primary",
                              )}
                            >
                              <Link to={`/classes/show/${classItem.id}`} onClick={(e) => e.stopPropagation()}>
                                {classItem.isLive ? (
                                  <>
                                    <Video className="h-4 w-4 me-2" />
                                    {t("buttons.joinLive")}
                                  </>
                                ) : (
                                  <>
                                    {t("buttons.enterClass")}
                                    <ArrowRight className={cn("h-4 w-4 ms-2 rtl:-scale-x-100")} />
                                  </>
                                )}
                              </Link>
                            </Button>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-muted/30 hover:bg-muted/50 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 md:w-64 p-2 rounded-3xl">
                              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/50 px-3 py-3">
                                {t("classes.list.classOptions")}
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); show("classes", classItem.id as BaseKey); }}
                                className="rounded-xl gap-3 py-3 cursor-pointer"
                              >
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Eye className="h-4 w-4" />
                                </div>
                                <span className="font-bold text-sm">{t("buttons.viewDetails")}</span>
                              </DropdownMenuItem>
                              
                              {((isTeacher && isAssigned) || isAdmin) && (
                                <>
                                  <DropdownMenuItem
                                    onClick={(e) => { e.stopPropagation(); edit("classes", classItem.id as BaseKey); }}
                                    className="rounded-xl gap-3 py-3 cursor-pointer"
                                  >
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Pencil className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold text-sm">{t("buttons.editClass")}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="my-2 opacity-50" />
                                  <DropdownMenuItem
                                    onClick={(e) => { e.stopPropagation(); handleClone(classItem.id as number); }}
                                    className="rounded-xl gap-3 py-3 cursor-pointer"
                                  >
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <Copy className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold text-sm">{t("buttons.duplicateCurriculum")}</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(classItem.id as number); }}
                                    className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:bg-destructive/10"
                                  >
                                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold text-sm">{t("buttons.deleteClass")}</span>
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                  );
                })}
              </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </ListView>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader className="space-y-4">
            <div className="p-5 rounded-2xl bg-destructive/10 text-destructive w-fit mx-auto">
              <Trash2 className="h-8 w-8" />
            </div>
            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-3xl font-black">
                {t("classes.list.deleteDialog.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium px-4">
                {t("classes.list.deleteDialog.description")}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-3 pt-6">
            <AlertDialogCancel className="rounded-xl px-8">
              {t("buttons.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-xl px-10 bg-destructive hover:bg-destructive/90 shadow-xl shadow-destructive/20"
            >
              {t("buttons.deleteClass")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ApplyTeacherDialog
        isOpen={applyTarget !== null}
        onOpenChange={(open) => !open && setApplyTarget(null)}
        classId={applyTarget?.id || 0}
        className={applyTarget?.name || ""}
        onSuccess={() =>
          invalidate({
            resource: "teacher-applications",
            invalidates: ["list"],
          })
        }
      />
    </div>
  );
};

export default ClassesList;
