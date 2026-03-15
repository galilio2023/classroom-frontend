import {
  useShow,
  useDelete,
  useGetIdentity,
  useUpdate,
  useCreate,
  useList,
  useOne,
} from "@refinedev/core";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Class, Enrollment, User, UserRole, Announcement } from "@/types";
import {
  Loader2,
  Trash2,
  MessageSquare,
  Library,
  FileQuestion,
  LayoutGrid,
  Megaphone,
  CheckCircle2,
  XCircle,
  Users,
  Info,
  Video,
  Trophy,
  BarChart3,
  BookOpen,
} from "lucide-react";
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
import { EnrollStudentDialog } from "./enroll-student-dialog";
import { InviteTeacherDialog } from "./invite-teacher-dialog";
import { AssignmentList } from "../assignments/list";
import { AttendanceTab } from "./attendance-tab";
import { AIStudyBuddy } from "@/components/ai-study-buddy";
import { DiscussionTab } from "./discussion-tab";
import { ResourceTab } from "./resource-tab";
import { QuizTab } from "./quiz-tab";
import { CurriculumTab } from "./curriculum-tab";
import { AnnouncementTab } from "./announcement-tab";
import { AIStudentInsightModal } from "@/components/ai-student-insight-modal";
import { LiveClassroom } from "@/components/classes/live-classroom";
import { LeaderboardTab } from "./leaderboard-tab";
import { AnalyticsTab } from "./analytics-tab";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import usePageTitle from "@/hooks/use-page-title";
import { useTranslation } from "react-i18next";

import { ClassBanner } from "@/components/classes/show/class-banner";
import { PinnedAnnouncements } from "@/components/classes/show/pinned-announcements";
import { ClassHeader } from "@/components/classes/show/class-header";
import { StudentsTab } from "@/components/classes/show/students-tab";
import { useClassRealtime } from "@/hooks/use-class-realtime";
import { DetailsTab } from "@/components/classes/show/details-tab";

const ClassesShow = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const classId = id ?? "";
  const { data: identity } = useGetIdentity<User>();

  const activeTab = useMemo(() => {
    return searchParams.get("tab") || "curriculum";
  }, [searchParams]);

  const [unenrollTarget, setUnenrollTarget] = useState<number | null>(null);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isLiveIndicator, setIsLiveIndicator } = useClassRealtime(
    identity?.id,
    classId,
  );

  const [teacherNotes, setTeacherNotes] = useState("");
  const [isMessageAllOpen, setIsMessageAllOpen] = useState(false);
  const [bulkMessage, setBulkMessage] = useState({ title: "", message: "" });

  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<
    number[]
  >([]);

  const [insightTarget, setInsightTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleTabChange = (value: string) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set("tab", value);
        // Clear pagination when switching tabs to prevent state leakage
        newParams.delete("pageSize");
        newParams.delete("currentPage");
        return newParams;
      },
      { replace: true },
    );
  };

  const showResult = useShow<Class>({
    resource: "classes",
    id: classId,
    meta: {
      syncWithLocation: false,
    },
  });

  const query = showResult?.query;
  const aClassData = query?.data ?? (showResult as any)?.data;
  const isLoading = query?.isLoading ?? (showResult as any)?.isLoading;
  const isError = query?.isError ?? (showResult as any)?.isError;
  const refetch = query?.refetch ?? (showResult as any)?.refetch;

  const aClass = aClassData?.data;
  usePageTitle(
    aClass?.name ? `${aClass.name} Classroom` : t("classes.list.title"),
  );

  const isAdmin = identity?.role === UserRole.ADMIN;
  const isTeacher = identity?.role === UserRole.TEACHER;
  const isStaff = isAdmin || isTeacher;
  const isOwner =
    isAdmin ||
    aClass?.teachers?.find((t: any) => t.teacher.id === identity?.id)
      ?.isPrimary;

  const { result: notesResult, query: notesQuery } = useOne({
    resource: `classes/${classId}/notes`,
    id: "current",
    queryOptions: {
      enabled: !!classId && isStaff,
    },
  });

  const notesData = notesResult?.data;
  const isLoadingNotes = notesQuery?.isLoading;

  const { mutate: updateNote } = useUpdate();

  useEffect(() => {
    if ((notesData as any)?.content !== undefined) {
      setTeacherNotes((notesData as any).content);
    }
  }, [notesData]);

  const debouncedSaveNotes = useCallback(
    debounce((content: string) => {
      updateNote({
        resource: `classes/${classId}/notes`,
        id: "current",
        values: { content },
      });
    }, 1000),
    [classId, updateNote],
  );

  const handleNoteChange = (val: string) => {
    setTeacherNotes(val);
    debouncedSaveNotes(val);
  };

  const { result: announcementsResult } = useList<Announcement>({
    resource: "announcements",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    sorters: [{ field: "isPinned", order: "desc" }],
    queryOptions: {
      enabled: !!classId,
    },
  });

  const announcements = announcementsResult?.data ?? [];

  useEffect(() => {
    if (aClass) {
      setIsLiveIndicator(!!aClass.isLive);
    }
  }, [aClass, setIsLiveIndicator]);

  useEffect(() => {
    if (identity?.id) {
      const dismissed = localStorage.getItem(
        `dismissed_announcements_${identity.id}`,
      );
      if (dismissed) setDismissedAnnouncements(JSON.parse(dismissed));
    }
  }, [identity?.id]);

  const handleDismissAnnouncement = (id: number) => {
    const updated = [...dismissedAnnouncements, id];
    setDismissedAnnouncements(updated);
    localStorage.setItem(
      `dismissed_announcements_${identity?.id}`,
      JSON.stringify(updated),
    );
  };

  const allEnrollments = aClass?.enrollments ?? [];
  const approvedEnrollments = allEnrollments.filter(
    (e: any) => e.status === "approved",
  );
  const pendingEnrollments = allEnrollments.filter(
    (e: any) => e.status === "pending",
  );
  const waitlistedEnrollments = allEnrollments.filter(
    (e: any) => e.status === "waitlisted",
  );
  const assignments = aClass?.assignments ?? [];

  const { mutate: deleteMutation, mutation: deleteMutationResult } =
    useDelete();
  const isDeleting = deleteMutationResult?.isPending;
  const { mutate: updateEnrollment } = useUpdate();
  const { mutate: createMutation, mutation: createMutationResult } =
    useCreate();
  const isMessaging = createMutationResult.isPending;

  const handleCopyInviteCode = () => {
    if (aClass?.inviteCode) {
      void navigator.clipboard.writeText(aClass.inviteCode);
      setCopied(true);
      toast.success(t("classes.show.toast.inviteCodeCopied"));
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEnrollmentAction = (
    id: number,
    status: "approved" | "rejected",
  ) => {
    updateEnrollment(
      {
        resource: "enrollments",
        id: `${id}/status`,
        values: { status },
      },
      {
        onSuccess: () => {
          toast.success(
            t("classes.show.toast.enrollmentStatus", {
              status:
                status === "approved"
                  ? t("classes.show.toast.approved")
                  : t("classes.show.toast.rejected"),
            }),
          );
          void refetch?.();
        },
        onError: (error: any) => {
          toast.error(
            error?.data?.message || t("classes.show.toast.enrollmentError"),
          );
        },
      },
    );
  };

  const handleMessageAll = () => {
    createMutation(
      {
        resource: `classes/${classId}/message-all`,
        values: bulkMessage,
      },
      {
        onSuccess: () => {
          toast.success(t("classes.show.toast.bulkProcessing"));
          setIsMessageAllOpen(false);
          setBulkMessage({ title: "", message: "" });
        },
        onError: (error: any) => {
          toast.error(
            error?.data?.message || t("classes.show.toast.bulkError"),
          );
        },
      },
    );
  };

  const isAr = i18n.language === "ar";

  const enrolledStudentIds = useMemo(
    () => approvedEnrollments.map((e: Enrollment) => e.student.id),
    [approvedEnrollments],
  );

  const existingTeacherIds = useMemo(
    () => aClass?.teachers?.map((t: any) => t.teacher.id) ?? [],
    [aClass?.teachers],
  );

  const handleConfirmUnenroll = () => {
    if (unenrollTarget) {
      deleteMutation(
        { resource: "enrollments", id: unenrollTarget },
        { onSuccess: () => {
            setUnenrollTarget(null);
            void refetch?.();
          } 
        },
      );
    }
  };

  const tabs = useMemo(
    () =>
      [
        {
          id: "curriculum",
          label: t("classes.show.tabs.curriculum"),
          icon: LayoutGrid,
        },
        {
          id: "analytics",
          label: t("classes.show.tabs.analytics"),
          icon: BarChart3,
          staffOnly: true,
        },
        {
          id: "live",
          label: t("classes.show.tabs.live"),
          icon: Video,
          indicator: isLiveIndicator,
        },
        {
          id: "leaderboard",
          label: t("classes.show.tabs.leaderboard"),
          icon: Trophy,
        },
        {
          id: "announcements",
          label: t("classes.show.tabs.announcements"),
          icon: Megaphone,
        },
        {
          id: "discussions",
          label: t("classes.show.tabs.discussions"),
          icon: MessageSquare,
        },
        {
          id: "resources",
          label: t("classes.show.tabs.resources"),
          icon: Library,
        },
        {
          id: "students",
          label: t("classes.show.tabs.students"),
          icon: Users,
          badge:
            isStaff &&
            pendingEnrollments.length + waitlistedEnrollments.length > 0
              ? pendingEnrollments.length + waitlistedEnrollments.length
              : null,
        },
        {
          id: "assignments",
          label: t("classes.show.tabs.assignments"),
          icon: ClipboardCheck,
        },
        {
          id: "quizzes",
          label: t("classes.show.tabs.quizzes"),
          icon: FileQuestion,
        },
        {
          id: "attendance",
          label: t("classes.show.tabs.attendance"),
          icon: CheckCircle2,
        },
        {
          id: "details",
          label: t("classes.show.tabs.details"),
          icon: Info,
        },
      ].filter((t) => !t.staffOnly || isStaff),
    [
      isLiveIndicator,
      isStaff,
      pendingEnrollments.length,
      waitlistedEnrollments.length,
      t,
    ],
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-primary/40" />
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          {t("classes.show.assembling")}
        </p>
      </div>
    );
  }

  if (isError || !aClass) {
    return (
      <div className="container mx-auto py-20 text-center space-y-6">
        <div className="p-6 rounded-full bg-destructive/10 text-destructive w-fit mx-auto">
          <XCircle className="h-16 w-16" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black tracking-tight">
            {t("classes.show.notFound")}
          </h2>
          <p className="text-muted-foreground font-medium max-w-md mx-auto">
            {t("classes.show.notFoundDescription")}
          </p>
        </div>
        <Button
          asChild
          className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]"
        >
          <Link to="/classes">{t("buttons.goBack")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto py-10 max-w-7xl space-y-10">
        <ClassHeader classId={classId} isOwner={isOwner} />

        <PinnedAnnouncements
          announcements={announcements}
          dismissedAnnouncements={dismissedAnnouncements}
          handleDismissAnnouncement={handleDismissAnnouncement}
        />

        <ClassBanner
          aClass={aClass}
          approvedCount={approvedEnrollments.length}
          waitlistedCount={waitlistedEnrollments.length}
          isLiveIndicator={isLiveIndicator}
        />

        {/* Main Navigation Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full space-y-10"
        >
          <div className="sticky top-6 z-40">
            <ScrollArea className="w-full whitespace-nowrap rounded-4xl border border-black/5 dark:border-white/5 bg-card/80 backdrop-blur-2xl p-2 shadow-2xl">
              <TabsList
                className={cn(
                  "flex h-14 items-center justify-start rounded-2xl p-1 text-muted-foreground bg-transparent",
                  isAr && "flex-row-reverse",
                )}
              >
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        "px-8 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all gap-3 h-11",
                        isActive
                          ? "text-white shadow-xl"
                          : "hover:bg-primary/5 hover:text-primary",
                      )}
                      style={
                        isActive
                          ? {
                              backgroundColor: aClass.color || "#3b82f6",
                              boxShadow: `0 10px 25px -5px ${aClass.color || "#3b82f6"}50`,
                            }
                          : {}
                      }
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {tab.indicator && (
                        <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
                      )}
                      {tab.badge && (
                        <Badge
                          variant="destructive"
                          className="h-5 min-w-5 p-0 flex items-center justify-center text-[9px] rounded-full border-none font-black"
                        >
                          {tab.badge}
                        </Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
          </div>

          <div className="mt-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="curriculum" className="mt-0">
                  {activeTab === "curriculum" && (
                    <CurriculumTab classId={classId} />
                  )}
                </TabsContent>

                {isStaff && (
                  <TabsContent value="analytics" className="mt-0">
                    {activeTab === "analytics" && (
                      <AnalyticsTab classId={classId} />
                    )}
                  </TabsContent>
                )}

                <TabsContent value="live" className="mt-0">
                  {activeTab === "live" && (
                    <LiveClassroom classId={classId} className="w-full" />
                  )}
                </TabsContent>

                <TabsContent value="leaderboard" className="mt-0">
                  {activeTab === "leaderboard" && (
                    <LeaderboardTab classId={classId} />
                  )}
                </TabsContent>

                <TabsContent value="announcements" className="mt-0">
                  {activeTab === "announcements" && (
                    <AnnouncementTab classId={classId} />
                  )}
                </TabsContent>

                <TabsContent value="discussions" className="mt-0">
                  {activeTab === "discussions" && (
                    <DiscussionTab classId={classId} />
                  )}
                </TabsContent>

                <TabsContent value="resources" className="mt-0">
                  {activeTab === "resources" && (
                    <ResourceTab classId={classId} />
                  )}
                </TabsContent>

                <TabsContent value="students" className="mt-0 space-y-10">
                  {activeTab === "students" && (
                    <StudentsTab
                      classId={classId}
                      approvedCount={approvedEnrollments.length}
                      pendingEnrollments={pendingEnrollments}
                      isStaff={isStaff}
                      onInsight={(s) => setInsightTarget(s)}
                      onUnenroll={(id) => setUnenrollTarget(id)}
                      onEnrollClick={() => setIsEnrollDialogOpen(true)}
                      onMessageAllClick={() => setIsMessageAllOpen(true)}
                      onEnrollmentAction={handleEnrollmentAction}
                    />
                  )}
                </TabsContent>

                <TabsContent value="assignments" className="mt-0">
                  {activeTab === "assignments" && (
                    <AssignmentList
                      classId={classId}
                      assignments={assignments}
                    />
                  )}
                </TabsContent>

                <TabsContent value="quizzes" className="mt-0">
                  {activeTab === "quizzes" && <QuizTab classId={classId} />}
                </TabsContent>

                <TabsContent value="attendance" className="mt-0">
                  {activeTab === "attendance" && (
                    <AttendanceTab
                      classId={classId}
                      enrollments={approvedEnrollments}
                    />
                  )}
                </TabsContent>

                <TabsContent value="details" className="mt-0">
                  {activeTab === "details" && (
                    <DetailsTab
                      aClass={aClass}
                      isOwner={isOwner}
                      isStaff={isStaff}
                      teacherNotes={teacherNotes}
                      isLoadingNotes={isLoadingNotes}
                      handleNoteChange={handleNoteChange}
                      handleCopyInviteCode={handleCopyInviteCode}
                      copied={copied}
                      onInviteClick={() => setIsInviteDialogOpen(true)}
                    />
                  )}
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </div>
        </Tabs>
      </div>

      {isStaff && (
        <>
          <AlertDialog
            open={unenrollTarget !== null}
            onOpenChange={() => setUnenrollTarget(null)}
          >
            <AlertDialogContent className="rounded-4xl border-none shadow-2xl bg-card/95 backdrop-blur-xl text-start">
              <AlertDialogHeader className="space-y-4">
                <div className="p-4 rounded-2xl bg-destructive/10 text-destructive w-fit">
                  <Trash2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <AlertDialogTitle className="text-3xl font-black tracking-tight">
                    {t("classes.show.unenrollDialog.title")}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="font-medium text-base">
                    {t("classes.show.unenrollDialog.description")}
                  </AlertDialogDescription>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3 pt-6">
                <AlertDialogCancel className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8">
                  {t("buttons.cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmUnenroll}
                  disabled={isDeleting}
                  className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
                >
                  {isDeleting
                    ? t("buttons.processing")
                    : t("buttons.confirmUnenroll")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <EnrollStudentDialog
            classId={classId}
            isOpen={isEnrollDialogOpen}
            onOpenChange={setIsEnrollDialogOpen}
            enrolledStudentIds={enrolledStudentIds}
          />

          <InviteTeacherDialog
            classId={classId}
            isOpen={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
            existingTeacherIds={existingTeacherIds}
          />

          <AIStudentInsightModal
            isOpen={insightTarget !== null}
            onClose={() => setInsightTarget(null)}
            studentId={insightTarget?.id || ""}
            studentName={insightTarget?.name || ""}
            classId={classId}
          />

          <Dialog
            open={isMessageAllOpen}
            onOpenChange={setIsMessageAllOpen}
          >
            <DialogContent className="rounded-4xl border-none shadow-2xl bg-card/95 backdrop-blur-xl text-start max-w-2xl">
              <DialogHeader className="space-y-4">
                <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-3xl font-black tracking-tight">
                    {t("classes.show.messageAllDialog.title")}
                  </DialogTitle>
                  <DialogDescription className="font-medium text-base">
                    {t("classes.show.messageAllDialog.description", {
                      count: approvedEnrollments.length,
                    })}
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {t("classes.show.messageAllDialog.subject")}
                  </Label>
                  <Input
                    value={bulkMessage.title}
                    onChange={(e) =>
                      setBulkMessage({ ...bulkMessage, title: e.target.value })
                    }
                    placeholder={t(
                      "classes.show.messageAllDialog.subjectPlaceholder",
                    )}
                    className="h-14 rounded-2xl text-base px-6"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {t("classes.show.messageAllDialog.message")}
                  </Label>
                  <Textarea
                    value={bulkMessage.message}
                    onChange={(e) =>
                      setBulkMessage({
                        ...bulkMessage,
                        message: e.target.value,
                      })
                    }
                    placeholder={t(
                      "classes.show.messageAllDialog.messagePlaceholder",
                    )}
                    className="min-h-50 rounded-3xl p-6 text-base"
                  />
                </div>
              </div>
              <DialogFooter className="gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setIsMessageAllOpen(false)}
                  className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8"
                >
                  {t("buttons.cancel")}
                </Button>
                <Button
                  onClick={handleMessageAll}
                  disabled={
                    isMessaging || !bulkMessage.title || !bulkMessage.message
                  }
                  className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 shadow-xl shadow-primary/20"
                >
                  {isMessaging ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t("buttons.processing")}
                    </>
                  ) : (
                    t("buttons.sendMessage")
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      <AIStudyBuddy
        subject={aClass.subject?.name}
        topic={aClass.name}
        classId={classId}
      />
    </>
  );
};

export default ClassesShow;
