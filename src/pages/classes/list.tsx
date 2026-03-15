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
} from "lucide-react";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
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
import { useVirtualizer } from "@tanstack/react-virtual";
import { ApplyTeacherDialog } from "./apply-teacher-dialog";
import { useTranslation } from "react-i18next";
import { TeacherDiscoveryList } from "@/components/classes/teacher-discovery-list";
import { ColumnDef } from "@tanstack/react-table";

const ClassesList = () => {
  const { t, i18n } = useTranslation();
  usePageTitle(t("classes.list.title"));
  const { data: identity } = useGetIdentity<User>();
  const { create, show, edit } = useNavigation();
  const { selectedTerm } = useTerm();
  const isStudent = identity?.role === UserRole.STUDENT;
  const isTeacher = identity?.role === UserRole.TEACHER;
  const isAdmin = identity?.role === UserRole.ADMIN;

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
  const { mutate: cloneClass, mutation: cloneMutation } = useCustomMutation();
  const { mutate: deleteClass } = useDelete();
  const invalidate = useInvalidate();

  const isJoining = joinMutation.isPending;
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
    pagination: { pageSize: 1000 },
  });

  const subjects = subjectsQuery.data?.data ?? [];

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
      pagination: { mode: "server" },
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

  // Re-apply filters when viewMode or identity changes (for Teacher's "mine" mode)
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

  const parentRef = useRef<HTMLDivElement>(null);

  const estimateSize = useCallback(() => 120, []);

  const rowVirtualizer = useVirtualizer({
    count: classes.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 5,
  });

  const isAr = i18n.language === "ar";

  return (
    <div className="space-y-10 pb-20">
      <ListView>
        <div className="space-y-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
          >
            <div className="space-y-4">
              <Breadcrumb />
              <div>
                <h1 className="text-4xl font-black tracking-tight text-start">
                  {isStudent
                    ? t("classes.list.discover")
                    : viewMode === "mine"
                      ? t("classes.list.myClassrooms")
                      : t("classes.list.browseCatalog")}
                </h1>
                <p className="text-muted-foreground font-medium mt-1 text-start">
                  {isStudent
                    ? t("classes.list.discoverDescription")
                    : viewMode === "mine"
                      ? t("classes.list.myDescription")
                      : t("classes.list.browseDescription")}
                </p>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              {isTeacher && (
                <Tabs
                  value={viewMode}
                  onValueChange={(v) => setViewMode(v as any)}
                  className="bg-muted/20 p-1 rounded-2xl border border-primary/5"
                >
                  <TabsList className="bg-transparent h-12 gap-1">
                    <TabsTrigger
                      value="mine"
                      className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white shadow-sm transition-all"
                    >
                      <Briefcase className="h-3.5 w-3.5" />
                      {t("classes.list.myClassesTab")}
                    </TabsTrigger>
                    <TabsTrigger
                      value="browse"
                      className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 px-6 data-[state=active]:bg-primary data-[state=active]:text-white shadow-sm transition-all"
                    >
                      <Compass className="h-3.5 w-3.5" />
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
                      className="flex-1 md:flex-none gap-2 rounded-2xl h-14 px-8 border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-primary/5 text-primary font-black uppercase tracking-widest text-[10px] shadow-sm"
                    >
                      <Key className="h-4 w-4" />
                      {t("buttons.joinByCode")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-md">
                    <DialogHeader className="space-y-4">
                      <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit">
                        <Key className="h-8 w-8" />
                      </div>
                      <div className="space-y-1 text-start">
                        <DialogTitle className="text-3xl font-black tracking-tight">
                          {t("classes.list.joinModal.title")}
                        </DialogTitle>
                        <DialogDescription className="font-medium text-base">
                          {t("classes.list.joinModal.description")}
                        </DialogDescription>
                      </div>
                    </DialogHeader>
                    <div className="py-10">
                      <div className="relative group">
                        <Input
                          placeholder={t("classes.list.joinModal.placeholder")}
                          value={inviteCode}
                          onChange={(e) =>
                            setInviteCode(e.target.value.toUpperCase())
                          }
                          className="h-24 text-center text-5xl font-black font-mono tracking-[0.3em] rounded-3xl bg-muted/30 border-none focus-visible:ring-primary transition-all shadow-inner"
                          maxLength={8}
                        />
                        <div className="absolute -bottom-8 left-0 w-full text-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                            {t("classes.list.joinModal.required")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="gap-3 pt-6">
                      <Button
                        variant="ghost"
                        className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-6"
                        onClick={() => setIsJoinModalOpen(false)}
                      >
                        {t("buttons.cancel")}
                      </Button>
                      <Button
                        className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-10 shadow-xl shadow-primary/20"
                        onClick={handleJoinByCode}
                        disabled={isJoining || inviteCode.length !== 8}
                      >
                        {isJoining ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <PlusCircle className="h-4 w-4 mr-2" />
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
                  className="flex-1 md:flex-none rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                >
                  <PlusCircle className="h-5 w-5" />
                  {t("buttons.createClass")}
                </Button>
              )}
            </div>
          </motion.div>

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
                <div className="space-y-1 text-start">
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

          {/* Teacher Discovery Catalog (Netflix Style) */}
          {isStudent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TeacherDiscoveryList />
            </motion.div>
          )}

          {/* Filters & Search */}
          <Card className="p-4 border-primary/5 bg-muted/30 rounded-4xl backdrop-blur-sm">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1 group">
                <Search
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors",
                    isAr ? "right-4" : "left-4",
                  )}
                />
                <Input
                  type="text"
                  placeholder={t("classes.list.searchPlaceholder")}
                  className={cn(
                    "h-14 rounded-2xl border-none bg-background shadow-sm font-medium",
                    isAr ? "pr-11 pl-4" : "pl-11 pr-4",
                  )}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-background px-4 rounded-2xl shadow-sm border border-primary/5">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={selectedSubject}
                    onValueChange={setSelectedSubject}
                  >
                    <SelectTrigger className="w-[180px] border-none h-10 focus:ring-0 shadow-none font-black text-[10px] uppercase tracking-widest">
                      <SelectValue
                        placeholder={t("classes.list.allSubjects")}
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      <SelectItem value="all" className="rounded-xl font-bold">
                        {t("classes.list.allSubjects")}
                      </SelectItem>
                      {subjects.map((subject: Subject) => (
                        <SelectItem
                          key={subject.id}
                          value={subject.name}
                          className="rounded-xl font-bold"
                        >
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* List Container */}
          <div
            ref={parentRef}
            className="h-[700px] overflow-auto pr-2 custom-scrollbar rounded-[2.5rem] border border-primary/5 bg-card/30 backdrop-blur-sm relative"
          >
            {isLoading ? (
              <div className="p-8 space-y-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row items-center gap-6"
                  >
                    <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-3 w-full">
                      <Skeleton className="h-6 w-[250px]" />
                      <Skeleton className="h-4 w-[180px]" />
                    </div>
                    <Skeleton className="h-12 w-32 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : !hasData ? (
              <div className="h-full flex items-center justify-center p-10">
                <EmptyState
                  icon={LayoutDashboard}
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
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                  const classItem = classes[virtualItem.index];
                  if (!classItem) return null;

                  const primaryTeacher = classItem.teachers?.find(
                    (t: any) => t.isPrimary,
                  )?.teacher;
                  const classColor = (classItem as any).color || "#3b82f6";

                  const isAssigned = classItem.teachers?.some(
                    (t: any) => t.teacher.id === identity?.id,
                  );
                  const pendingApp = applications.find(
                    (app) =>
                      app.classId === classItem.id && app.status === "pending",
                  );

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
                        initial={{ opacity: 0, x: isAr ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col md:flex-row items-center h-full border-b border-primary/5 hover:bg-primary/[0.02] transition-all group"
                      >
                        {/* Banner/Icon */}
                        <div className="relative shrink-0 mb-4 md:mb-0">
                          {classItem.bannerUrl ? (
                            <img
                              src={classItem.bannerUrl}
                              alt={classItem.name}
                              className="h-20 w-20 rounded-[1.5rem] object-cover border-4 border-background shadow-lg group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div
                              className="h-20 w-20 rounded-[1.5rem] border-4 border-background flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
                              style={{
                                backgroundColor: `${classColor}15`,
                                borderColor: `${classColor}30`,
                              }}
                            >
                              <BookOpen
                                className="h-10 w-10"
                                style={{ color: classColor }}
                              />
                            </div>
                          )}
                          {classItem.isLive && (
                            <div
                              className={cn(
                                "absolute -top-2 bg-red-500 text-white p-1.5 rounded-full border-4 border-background shadow-lg animate-pulse",
                                isAr ? "-left-2" : "-right-2",
                              )}
                            >
                              <Video className="h-3 w-3" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div
                          className={cn(
                            "flex-1 text-center md:text-left min-w-0 w-full",
                            isAr ? "md:mr-8" : "md:ml-8",
                          )}
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h3 className="text-xl font-black tracking-tight truncate group-hover:text-primary transition-colors text-start">
                              {classItem.name}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2">
                              <Badge
                                variant="outline"
                                className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border-primary/10"
                              >
                                {classItem.subject?.name ||
                                  t("classes.list.general")}
                              </Badge>
                              {classItem.isLive && (
                                <div className="flex items-center gap-1.5 bg-red-500/10 px-2 py-0.5 rounded-md">
                                  <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                                  </span>
                                  <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">
                                    {t("classes.list.live")}
                                  </span>
                                </div>
                              )}
                              {isTeacher && pendingApp && (
                                <Badge className="bg-amber-500/10 text-amber-600 border-none text-[9px] font-black uppercase tracking-widest">
                                  {t("classes.list.pendingApproval")}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 mt-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <div className="p-1.5 rounded-lg bg-primary/5">
                                <Users className="h-3.5 w-3.5 text-primary" />
                              </div>
                              <span className="text-xs font-bold">
                                {classItem._count?.enrollments || 0}{" "}
                                <span className="text-muted-foreground/50 font-medium">
                                  / {classItem.capacity || "∞"}{" "}
                                  {t("classes.list.studentsLabel")}
                                </span>
                              </span>
                            </div>

                            {primaryTeacher && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="p-1.5 rounded-lg bg-primary/5">
                                  <Building2 className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-xs font-bold">
                                  {primaryTeacher.name}
                                </span>
                              </div>
                            )}

                            {classItem.schedules?.[0] && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="p-1.5 rounded-lg bg-primary/5">
                                  <Clock className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-tight">
                                  {classItem.schedules[0].day} •{" "}
                                  {classItem.schedules[0].startTime}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-6 md:mt-0 shrink-0">
                          <div
                            className={cn(
                              "hidden lg:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all",
                              isAr
                                ? "-translate-x-4 group-hover:translate-x-0"
                                : "translate-x-4 group-hover:translate-x-0",
                            )}
                          >
                            {((isTeacher && isAssigned) || isAdmin) && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                                  onClick={() =>
                                    handleClone(classItem.id as number)
                                  }
                                  disabled={isCloning}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                  onClick={() =>
                                    setDeleteTarget(classItem.id as number)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>

                          {isTeacher && !isAssigned ? (
                            <Button
                              onClick={() =>
                                setApplyTarget({
                                  id: classItem.id as number,
                                  name: classItem.name,
                                })
                              }
                              disabled={!!pendingApp}
                              className="rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary/20"
                            >
                              <Send className="h-4 w-4 mr-2" />
                              {pendingApp
                                ? t("buttons.applied")
                                : t("buttons.applyToTeach")}
                            </Button>
                          ) : (
                            <Button
                              asChild
                              variant={classItem.isLive ? "default" : "outline"}
                              className={cn(
                                "rounded-2xl px-8 h-12 text-[10px] font-black uppercase tracking-widest transition-all shadow-sm",
                                classItem.isLive
                                  ? "bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-500/20"
                                  : "border-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
                              )}
                            >
                              <Link to={`/classes/show/${classItem.id}`}>
                                {classItem.isLive ? (
                                  <>
                                    <Video className="h-4 w-4 mr-2" />
                                    {t("buttons.joinLive")}
                                  </>
                                ) : (
                                  <>
                                    {t("buttons.enterClass")}
                                    <ArrowRight
                                      className={cn(
                                        "h-4 w-4 ml-2",
                                        isAr && "mr-2 ml-0 rotate-180",
                                      )}
                                    />
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
                                className="h-10 w-10 rounded-xl md:hidden lg:flex"
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-56 rounded-[1.5rem] p-2"
                            >
                              <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-2 text-start">
                                {t("classes.list.classOptions")}
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  show("classes", classItem.id as BaseKey)
                                }
                                className="rounded-xl gap-3 py-3 cursor-pointer justify-start"
                              >
                                <Eye className="h-4 w-4 text-primary" />
                                <span className="font-bold">
                                  {t("buttons.viewDetails")}
                                </span>
                              </DropdownMenuItem>
                              {((isTeacher && isAssigned) || isAdmin) && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      edit("classes", classItem.id as BaseKey)
                                    }
                                    className="rounded-xl gap-3 py-3 cursor-pointer justify-start"
                                  >
                                    <Pencil className="h-4 w-4 text-primary" />
                                    <span className="font-bold">
                                      {t("buttons.editClass")}
                                    </span>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="my-2" />
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleClone(classItem.id as number)
                                    }
                                    className="rounded-xl gap-3 py-3 cursor-pointer justify-start"
                                  >
                                    <Copy className="h-4 w-4 text-primary" />
                                    <span className="font-bold">
                                      {t("buttons.duplicateCurriculum")}
                                    </span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setDeleteTarget(classItem.id as number)
                                    }
                                    className="rounded-xl gap-3 py-3 cursor-pointer text-destructive focus:text-destructive justify-start"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="font-bold">
                                      {t("buttons.deleteClass")}
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

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl">
          <AlertDialogHeader className="space-y-4">
            <div className="p-4 rounded-2xl bg-destructive/10 text-destructive w-fit">
              <Trash2 className="h-8 w-8" />
            </div>
            <div className="space-y-1 text-start">
              <AlertDialogTitle className="text-3xl font-black tracking-tight">
                {t("classes.list.deleteDialog.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="font-medium text-base">
                {t("classes.list.deleteDialog.description")}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-6">
            <AlertDialogCancel className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-6">
              {t("buttons.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-10 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
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
