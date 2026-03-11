import { useShow, useDelete, useGetIdentity, useUpdate, useCreate, useList, useOne } from "@refinedev/core";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { useMemo, useState, useEffect, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";

import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Class, Enrollment, User, UserRole, Announcement } from "@/types";
import {
  Loader2,
  PlusCircle,
  Trash2,
  ClipboardCheck,
  MessageSquare,
  Library,
  FileQuestion,
  Sparkles,
  LayoutGrid,
  Megaphone,
  CheckCircle2,
  XCircle,
  Users,
  Info,
  Copy,
  Check,
  Video,
  Trophy,
  BarChart3,
  StickyNote,
  Send,
  UserPlus,
  Pin,
  X,
  Paperclip,
  LayoutDashboard,
  Clock,
  ShieldCheck,
  BookOpen,
  Building2,
  Pencil,
  Share2,
  Globe,
  Timer,
  Calendar
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
import { io } from "socket.io-client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { SOCKET_URL } from "@/config";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import debounce from "lodash/debounce";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import usePageTitle from "@/hooks/use-page-title";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";

const ClassesShow = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const classId = id ?? "";
  const { data: identity } = useGetIdentity<User>();

  const [activeTab, setActiveTab] = useState<string>(() => {
    return searchParams.get("tab") || "curriculum";
  });
  
  const [unenrollTarget, setUnenrollTarget] = useState<number | null>(null);
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLiveIndicator, setIsLiveIndicator] = useState(false);

  const [teacherNotes, setTeacherNotes] = useState("");
  const [isMessageAllOpen, setIsMessageAllOpen] = useState(false);
  const [bulkMessage, setBulkMessage] = useState({ title: "", message: "" });

  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<number[]>(
    [],
  );

  const [insightTarget, setInsightTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Sync state with URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", value);
      return newParams;
    }, { replace: true });
  };

  const showResult = useShow<Class>({
    resource: "classes",
    id: classId,
    meta: {
        syncWithLocation: false
    }
  });

  const query = showResult?.query;
  const aClassData = query?.data ?? (showResult as any)?.data;
  const isLoading = query?.isLoading ?? (showResult as any)?.isLoading;
  const isError = query?.isError ?? (showResult as any)?.isError;
  const refetch = query?.refetch ?? (showResult as any)?.refetch;

  const aClass = aClassData?.data;
  usePageTitle(aClass?.name ? `${aClass.name} Classroom` : "Classroom");

  const isAdmin = identity?.role === UserRole.ADMIN;
  const isTeacher = identity?.role === UserRole.TEACHER;
  const isStaff = isAdmin || isTeacher;
  const isOwner = isAdmin || aClass?.teachers?.find((t: any) => t.teacher.id === identity?.id)?.isPrimary;

  const { result: notesResult, query: notesQuery } = useOne({
    resource: `classes/${classId}/notes`,
    id: "current",
    queryOptions: {
      enabled: !!classId && isStaff,
    }
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
    [classId, updateNote]
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
    }
  });

  const announcements = announcementsResult?.data ?? [];

  useEffect(() => {
    if (aClass) {
      setIsLiveIndicator(!!aClass.isLive);
    }
  }, [aClass]);

  useEffect(() => {
    if (identity?.id) {
      const dismissed = localStorage.getItem(`dismissed_announcements_${identity.id}`);
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

  useEffect(() => {
    if (!identity?.id || !classId) return;

    const socket = io(SOCKET_URL, {
      query: { userId: identity.id },
      withCredentials: true,
    });

    socket.on("live_session_started", (data: any) => {
      if (Number(data.classId) === Number(classId)) {
        setIsLiveIndicator(true);
      }
    });

    socket.on("live_session_ended", (data: any) => {
      if (Number(data.classId) === Number(classId)) {
        setIsLiveIndicator(false);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [identity?.id, classId]);

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
  const { mutate: createMutation } = useCreate();

  const handleCopyInviteCode = () => {
    if (aClass?.inviteCode) {
      void navigator.clipboard.writeText(aClass.inviteCode);
      setCopied(true);
      toast.success("Invite code copied to clipboard");
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
          toast.success(`Student enrollment ${status}`);
          void refetch?.();
        },
        onError: (error: any) => {
          toast.error(error?.data?.message || "Failed to update enrollment");
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
          toast.success("Bulk message processing started in background");
          setIsMessageAllOpen(false);
          setBulkMessage({ title: "", message: "" });
        },
        onError: (error: any) => {
          toast.error(error?.data?.message || "Failed to send message");
        },
      },
    );
  };

  const columns = useMemo<ColumnDef<Enrollment>[]>(
    () => [
      {
        id: "student",
        header: () => <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Student</p>,
        accessorKey: "student",
        cell: ({ getValue, row }) => {
          const student = getValue<User>();
          const isWaitlisted = row.original.status === "waitlisted";
          return (
            <div className="flex items-center gap-3 py-1">
              <Avatar className="size-10 border-2 border-background shadow-sm rounded-xl">
                {student.image && (
                  <AvatarImage src={student.image} alt={student.name} className="object-cover" />
                )}
                <AvatarFallback className="bg-primary/5 text-primary font-black text-xs">
                  {student.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm tracking-tight">{student.name}</span>
                  {isWaitlisted && (
                    <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-none text-[8px] font-black uppercase tracking-tighter px-2 py-0 h-4">
                      Waitlist #{row.original.waitlistPosition}
                    </Badge>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground font-bold truncate">
                  {student.email}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: () => <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Enrolled On</p>,
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 opacity-40" />
            <span>{new Date(getValue<string>()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            {isStaff && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 border-ai-primary/20 hover:bg-ai-primary/5 text-ai-primary transition-all shadow-sm"
                onClick={() =>
                  setInsightTarget({
                    id: row.original.student.id,
                    name: row.original.student.name,
                  })
                }
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Insight
              </Button>
            )}
            {isStaff && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                onClick={() => setUnenrollTarget(row.original.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [isStaff],
  );

  const enrollmentsTable = useTable<Enrollment>({
    columns,
    data: [...approvedEnrollments, ...waitlistedEnrollments],
  });

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
        { onSuccess: () => setUnenrollTarget(null) },
      );
    }
  };

  const tabs = useMemo(() => [
    { id: "curriculum", label: "Curriculum", icon: LayoutGrid },
    { id: "analytics", label: "Analytics", icon: BarChart3, staffOnly: true },
    { id: "live", label: "Live", icon: Video, indicator: isLiveIndicator },
    { id: "leaderboard", label: "Leaderboard", icon: Trophy },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "resources", label: "Resources", icon: Library },
    { id: "students", label: "Students", icon: Users, badge: isStaff && (pendingEnrollments.length + waitlistedEnrollments.length) > 0 ? (pendingEnrollments.length + waitlistedEnrollments.length) : null },
    { id: "assignments", label: "Assignments", icon: ClipboardCheck },
    { id: "quizzes", label: "Quizzes", icon: FileQuestion },
    { id: "attendance", label: "Attendance", icon: CheckCircle2 },
    { id: "details", label: "Details", icon: Info, staffOnly: true },
  ].filter(t => !t.staffOnly || isStaff), [isLiveIndicator, isStaff, pendingEnrollments.length, waitlistedEnrollments.length]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
            <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary/40" />
            </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Assembling Classroom...</p>
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
            <h2 className="text-3xl font-black tracking-tight">Classroom not found</h2>
            <p className="text-muted-foreground font-medium max-w-md mx-auto">The classroom you are looking for does not exist or has been removed from the system.</p>
        </div>
        <Button asChild className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">
            <Link to="/classes">Back to Classes</Link>
        </Button>
      </div>
    );
  }

  const classColor = (aClass as any).color || "#3b82f6";

  const pinnedAnnouncements = announcements.filter(
    (a: Announcement) => a.isPinned && !dismissedAnnouncements.includes(a.id),
  );

  const isFull = aClass.capacity && approvedEnrollments.length >= aClass.capacity;

  return (
    <>
      <div className="container mx-auto py-10 max-w-7xl space-y-10">
        {/* Header & Breadcrumb */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            <Breadcrumb />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm">
                        <LayoutDashboard className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">Classroom Hub</h1>
                        <p className="text-muted-foreground font-medium">Manage curriculum, students, and live sessions.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6 gap-2 border-primary/10 bg-card/50 backdrop-blur-sm"
                        onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            toast.success("Classroom link copied!");
                        }}
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </Button>
                    {isOwner && (
                        <Button 
                            className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl shadow-primary/20"
                            asChild
                        >
                            <Link to={`/classes/edit/${aClass.id}`}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Edit Class
                            </Link>
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>

        {/* Pinned Announcements Section */}
        <AnimatePresence>
          {pinnedAnnouncements.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {pinnedAnnouncements.map((announcement: Announcement) => (
                <div
                  key={announcement.id}
                  className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/5 backdrop-blur-xl p-8 pr-16 shadow-xl shadow-primary/5 group"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <Pin className="h-4 w-4" />
                    </div>
                    <span className="font-black text-[10px] text-primary uppercase tracking-widest">
                      Priority Announcement
                    </span>
                  </div>
                  <h4 className="font-black text-2xl tracking-tight">{announcement.title}</h4>
                  <p className="text-base mt-3 text-muted-foreground leading-relaxed line-clamp-2 font-medium">{announcement.content}</p>
                  {announcement.fileUrl && (
                    <Button variant="link" className="p-0 h-auto mt-4 text-sm font-black text-primary gap-2 uppercase tracking-widest" asChild>
                      <a href={announcement.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Paperclip className="h-4 w-4" />
                        View Attachment
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-6 right-6 h-12 w-12 rounded-full hover:bg-primary/10 text-primary/40 hover:text-primary transition-all"
                    onClick={() => handleDismissAnnouncement(announcement.id)}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Premium Class Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative h-64 w-full rounded-[3rem] overflow-hidden shadow-2xl group"
          style={{ backgroundColor: classColor }}
        >
          {/* Background Patterns */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          
          <div className="absolute bottom-0 left-0 w-full p-10 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-lg">
                  <BookOpen className="h-8 w-8" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-none backdrop-blur-md font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl">
                  {aClass.subject?.department?.name || "Academic"}
                </Badge>
                {isFull && (
                  <Badge className="bg-orange-500 text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-xl shadow-lg">
                    <Timer className="w-3 h-3 mr-1" />
                    Waitlist Active
                  </Badge>
                )}
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">{aClass.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-white/80 font-black text-xs uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>{aClass.subject?.name}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{approvedEnrollments.length} Students Enrolled</span>
                </div>
                {waitlistedEnrollments.length > 0 && (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4" />
                      <span>{waitlistedEnrollments.length} on Waitlist</span>
                    </div>
                  </>
                )}
                {aClass.schedules?.[0] && (
                    <>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{aClass.schedules[0].day} • {aClass.schedules[0].startTime}</span>
                        </div>
                    </>
                )}
              </div>
            </div>

            {isLiveIndicator && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 bg-red-500 text-white px-8 py-4 rounded-[2rem] shadow-2xl shadow-red-500/40 animate-pulse border-4 border-white/20"
              >
                <Video className="h-6 w-6" />
                <span className="font-black uppercase tracking-widest text-sm">Live Session Active</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-10">
          <div className="sticky top-6 z-40">
            <ScrollArea className="w-full whitespace-nowrap rounded-[2rem] border border-black/[0.05] dark:border-white/[0.05] bg-card/80 backdrop-blur-2xl p-2 shadow-2xl">
              <TabsList className="flex h-14 items-center justify-start rounded-2xl p-1 text-muted-foreground bg-transparent">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className={cn(
                        "px-8 py-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all gap-3 h-11",
                        isActive ? "text-white shadow-xl" : "hover:bg-primary/5 hover:text-primary"
                      )}
                      style={isActive ? { backgroundColor: classColor, boxShadow: `0 10px 25px -5px ${classColor}50` } : {}}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                      {tab.indicator && (
                        <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
                      )}
                      {tab.badge && (
                        <Badge variant="destructive" className="h-5 min-w-5 p-0 flex items-center justify-center text-[9px] rounded-full border-none font-black">
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
                  {activeTab === "curriculum" && <CurriculumTab classId={classId} />}
                </TabsContent>

                {isStaff && (
                  <TabsContent value="analytics" className="mt-0">
                    {activeTab === "analytics" && <AnalyticsTab classId={classId} />}
                  </TabsContent>
                )}

                <TabsContent value="live" className="mt-0">
                  {activeTab === "live" && <LiveClassroom classId={classId} className="w-full" />}
                </TabsContent>

                <TabsContent value="leaderboard" className="mt-0">
                  {activeTab === "leaderboard" && <LeaderboardTab classId={classId} />}
                </TabsContent>

                <TabsContent value="announcements" className="mt-0">
                  {activeTab === "announcements" && <AnnouncementTab classId={classId} />}
                </TabsContent>

                <TabsContent value="discussions" className="mt-0">
                  {activeTab === "discussions" && <DiscussionTab classId={classId} />}
                </TabsContent>

                <TabsContent value="resources" className="mt-0">
                  {activeTab === "resources" && <ResourceTab classId={classId} />}
                </TabsContent>

                <TabsContent value="students" className="mt-0 space-y-10">
                  {activeTab === "students" && (
                    <>
                      {isStaff && (pendingEnrollments.length > 0 || waitlistedEnrollments.length > 0) && (
                        <Card className="border-none shadow-2xl bg-primary/5 rounded-[2.5rem] overflow-hidden">
                          <CardHeader className="p-10 pb-6">
                            <div className="flex items-center gap-4">
                              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                <Users className="h-8 w-8" />
                              </div>
                              <div>
                                <CardTitle className="text-2xl font-black tracking-tight">Pending & Waitlisted</CardTitle>
                                <CardDescription className="font-medium text-base">Students waiting for approval or a spot to open.</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-10 pt-4">
                            <div className="grid gap-4">
                              {[...pendingEnrollments, ...waitlistedEnrollments].map((enrollment: any) => (
                                <div
                                  key={enrollment.id}
                                  className="flex items-center justify-between p-6 bg-card rounded-[1.5rem] border border-black/[0.03] dark:border-white/[0.03] shadow-sm group hover:border-primary/20 transition-all"
                                >
                                  <div className="flex items-center gap-5">
                                    <Avatar className="h-14 w-14 border-4 border-background shadow-lg rounded-2xl">
                                      <AvatarImage src={enrollment.student.image ?? ""} className="object-cover" />
                                      <AvatarFallback className="bg-primary/5 text-primary font-black text-lg">{enrollment.student.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-black text-lg tracking-tight">{enrollment.student.name}</p>
                                        <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                                          {enrollment.status}
                                          {enrollment.status === "waitlisted" && ` #${enrollment.waitlistPosition}`}
                                        </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground font-bold">{enrollment.student.email}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <Button
                                      size="lg"
                                      variant="ghost"
                                      className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] text-destructive hover:bg-destructive/5 px-6"
                                      onClick={() => handleEnrollmentAction(enrollment.id, "rejected")}
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button
                                      size="lg"
                                      className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] px-8 shadow-xl shadow-primary/20"
                                      onClick={() => handleEnrollmentAction(enrollment.id, "approved")}
                                      style={{ backgroundColor: classColor }}
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Approve Student
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-10 pb-6 flex flex-col md:flex-row md:items-center justify-between border-b border-black/[0.03] dark:border-white/[0.03] gap-6">
                          <div className="space-y-2">
                            <CardTitle className="text-2xl font-black tracking-tight">Enrolled Students</CardTitle>
                            <CardDescription className="font-bold flex items-center gap-2 text-primary">
                              <Users className="h-4 w-4" />
                              {approvedEnrollments.length} of {aClass.capacity} spots filled
                            </CardDescription>
                          </div>
                          {isStaff && (
                            <div className="flex flex-wrap items-center gap-3">
                              <Dialog open={isMessageAllOpen} onOpenChange={setIsMessageAllOpen}>
                                <DialogTrigger asChild>
                                  <Button variant="outline" className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] px-6 border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-primary/5 text-primary">
                                    <Send className="h-4 w-4 mr-2" />
                                    Message All
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-lg">
                                  <DialogHeader className="space-y-4">
                                    <div className="p-4 rounded-2xl bg-primary/10 text-primary w-fit">
                                      <Send className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <DialogTitle className="text-3xl font-black tracking-tight">Broadcast Message</DialogTitle>
                                        <DialogDescription className="font-medium text-base">Send a priority notification to all enrolled students.</DialogDescription>
                                    </div>
                                  </DialogHeader>
                                  <div className="space-y-8 py-8">
                                    <div className="space-y-3">
                                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Notification Title</Label>
                                      <Input
                                        placeholder="e.g., Important Update Regarding Tomorrow's Lesson"
                                        value={bulkMessage.title}
                                        onChange={(e) => setBulkMessage({ ...bulkMessage, title: e.target.value })}
                                        className="h-14 rounded-2xl bg-muted/30 border-none focus-visible:ring-primary font-black text-sm"
                                      />
                                    </div>
                                    <div className="space-y-3">
                                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message Content</Label>
                                      <Textarea
                                        placeholder="Type your message here..."
                                        value={bulkMessage.message}
                                        onChange={(e) => setBulkMessage({ ...bulkMessage, message: e.target.value })}
                                        className="min-h-[200px] rounded-[2rem] bg-muted/30 border-none focus-visible:ring-primary p-6 text-base leading-relaxed font-medium resize-none"
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter className="gap-3">
                                    <Button variant="ghost" className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8" onClick={() => setIsMessageAllOpen(false)}>Cancel</Button>
                                    <Button 
                                      className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 shadow-xl shadow-primary/20" 
                                      onClick={handleMessageAll} 
                                      disabled={!bulkMessage.title || !bulkMessage.message}
                                      style={{ backgroundColor: classColor }}
                                    >
                                      Send Broadcast
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                              <Button
                                onClick={() => setIsEnrollDialogOpen(true)}
                                className="h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] px-8 shadow-xl shadow-primary/20"
                                style={{ backgroundColor: classColor }}
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Enroll Student
                              </Button>
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="p-10">
                          <DataTable table={enrollmentsTable} />
                        </CardContent>
                      </Card>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="assignments" className="mt-0">
                  {activeTab === "assignments" && <AssignmentList classId={classId} assignments={assignments} />}
                </TabsContent>

                <TabsContent value="quizzes" className="mt-0">
                  {activeTab === "quizzes" && <QuizTab classId={classId} />}
                </TabsContent>

                <TabsContent value="attendance" className="mt-0">
                  {activeTab === "attendance" && <AttendanceTab
                    classId={classId}
                    enrollments={approvedEnrollments}
                  />}
                </TabsContent>

                {isStaff && (
                  <TabsContent value="details" className="mt-0">
                    {activeTab === "details" && (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-10">
                          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-10 pb-6 border-b border-black/[0.03] dark:border-white/[0.03]">
                              <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                  <Info className="h-6 w-6" />
                                </div>
                                Class Information
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="p-10 space-y-8">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-3">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Subject Area</Label>
                                  <div className="p-5 rounded-[1.5rem] bg-muted/30 flex items-center gap-4 border border-primary/5">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></div>
                                    <span className="font-black text-base">{aClass?.subject?.name ?? "N/A"}</span>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Class Status</Label>
                                  <div className="p-5 rounded-[1.5rem] bg-muted/30 flex items-center gap-4 border border-primary/5">
                                    <div className="p-2 rounded-xl bg-green-500/10 text-green-600"><ShieldCheck className="h-5 w-5" /></div>
                                    <Badge
                                      variant="default"
                                      className="capitalize font-black text-[10px] uppercase tracking-widest border-none px-4 py-1 rounded-lg"
                                      style={{ backgroundColor: classColor }}
                                    >
                                      {aClass.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Student Capacity</Label>
                                  <div className="p-5 rounded-[1.5rem] bg-muted/30 flex items-center gap-4 border border-primary/5">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary"><Users className="h-5 w-5" /></div>
                                    <span className="font-black text-base">{aClass.capacity} Students Max</span>
                                  </div>
                                </div>
                                <div className="space-y-3">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Department</Label>
                                  <div className="p-5 rounded-[1.5rem] bg-muted/30 flex items-center gap-4 border border-primary/5">
                                    <div className="p-2 rounded-xl bg-primary/10 text-primary"><Building2 className="h-5 w-5" /></div>
                                    <span className="font-black text-base">{aClass.subject?.department?.name || "Academic"}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-none shadow-2xl bg-ai-primary/[0.02] backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-ai-primary/10">
                            <CardHeader className="p-10 pb-6 border-b border-ai-primary/10">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-4 text-ai-primary">
                                    <div className="p-3 rounded-2xl bg-ai-primary/10">
                                      <StickyNote className="h-8 w-8" />
                                    </div>
                                    Teacher Notes (Shared)
                                  </CardTitle>
                                  <CardDescription className="font-bold text-ai-primary/60">Private scratchpad for staff. Visible to all teachers in this class.</CardDescription>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-ai-primary/60 bg-ai-primary/5 px-4 py-2 rounded-full border border-ai-primary/10 animate-pulse">
                                  <Sparkles className="h-4 w-4" />
                                  Auto-saving
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="p-10">
                              {isLoadingNotes ? (
                                <div className="flex justify-center py-20">
                                  <Loader2 className="h-12 w-12 animate-spin text-ai-primary/20" />
                                </div>
                              ) : (
                                <div className="relative group">
                                  <Textarea
                                    placeholder="Jot down reminders, lesson ideas, or student observations..."
                                    className="min-h-[400px] rounded-[2rem] bg-white/50 dark:bg-zinc-950/50 border-none focus-visible:ring-ai-primary p-8 text-base leading-relaxed shadow-inner transition-all font-medium resize-none"
                                    value={teacherNotes}
                                    onChange={(e) => handleNoteChange(e.target.value)}
                                  />
                                  <div className="absolute bottom-8 right-8 opacity-10 group-focus-within:opacity-40 transition-opacity">
                                    <StickyNote className="h-12 w-12 text-ai-primary" />
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        <div className="space-y-10">
                          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                            <CardHeader className="p-10 pb-6 border-b border-black/[0.03] dark:border-white/[0.03]">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-4">
                                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                    <Megaphone className="h-8 w-8" />
                                  </div>
                                  Access Control
                                </CardTitle>
                                {isOwner && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] border-primary/10 text-primary hover:bg-primary/5 px-4"
                                    onClick={() => setIsInviteDialogOpen(true)}
                                  >
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Invite
                                  </Button>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="p-10 space-y-10">
                              <div
                                className="flex flex-col items-center justify-center p-10 rounded-[2.5rem] border-4 border-dashed transition-all group hover:bg-primary/[0.02] text-center space-y-4"
                                style={{
                                  backgroundColor: `${classColor}05`,
                                  borderColor: `${classColor}20`,
                                }}
                              >
                                <div className="space-y-1">
                                  <p
                                    className="text-[10px] font-black uppercase tracking-widest opacity-60"
                                    style={{ color: classColor }}
                                  >
                                    Class Invite Code
                                  </p>
                                  <p className="text-5xl font-black font-mono tracking-[0.3em] ml-[0.3em]">
                                    {aClass.inviteCode}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="lg"
                                  className="rounded-2xl border-none bg-white dark:bg-zinc-900 shadow-xl group-hover:scale-105 transition-transform font-black uppercase tracking-widest text-[10px] h-12 px-8 gap-2"
                                  onClick={handleCopyInviteCode}
                                >
                                  {copied ? (
                                    <>
                                      <Check className="h-4 w-4 text-success" />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-4 w-4 text-primary" />
                                      Copy Code
                                    </>
                                  )}
                                </Button>
                              </div>

                              <div className="space-y-6">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Teaching Staff</Label>
                                <div className="grid gap-4">
                                  {aClass.teachers?.map((tc: any) => (
                                    <div
                                      key={tc.teacher.id}
                                      className="flex items-center gap-5 p-5 rounded-[1.5rem] bg-muted/30 border border-transparent hover:border-primary/10 transition-all group"
                                    >
                                      <Avatar className="h-12 w-12 border-4 border-background shadow-lg group-hover:scale-110 transition-transform rounded-2xl">
                                        <AvatarImage src={tc.teacher.image ?? ""} className="object-cover" />
                                        <AvatarFallback className="bg-primary/5 text-primary font-black">
                                          {tc.teacher.name?.[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <p className="text-base font-black tracking-tight">
                                          {tc.teacher.name}
                                        </p>
                                        <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">
                                          {tc.isPrimary
                                            ? "Primary Instructor"
                                            : "Co-Instructor"}
                                        </p>
                                      </div>
                                      {tc.isPrimary && (
                                        <Badge
                                          variant="secondary"
                                          className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none px-3 py-1 rounded-lg"
                                        >
                                          Lead
                                        </Badge>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                )}
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
            <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl">
              <AlertDialogHeader className="space-y-4">
                <div className="p-4 rounded-2xl bg-destructive/10 text-destructive w-fit">
                  <Trash2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                    <AlertDialogTitle className="text-3xl font-black tracking-tight">Confirm Unenrollment</AlertDialogTitle>
                    <AlertDialogDescription className="font-medium text-base">
                    This will permanently remove the student from this classroom. They will lose access to all curriculum, assignments, and grades.
                    </AlertDialogDescription>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-3 pt-6">
                <AlertDialogCancel className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmUnenroll}
                  disabled={isDeleting}
                  className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-12 bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
                >
                  {isDeleting ? "Processing..." : "Confirm Unenroll"}
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
