import { useShow, useGetIdentity, useList, HttpError, useCustom } from "@refinedev/core";
import { useParams, Link } from "react-router-dom";
import { useMemo, useEffect, useState } from "react";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BrainCircuit, 
  Users, 
  CheckCircle2, 
  Star, 
  MessageSquare, 
  Calendar, 
  Trophy, 
  Sparkles, 
  LayoutDashboard, 
  ArrowRight, 
  Clock, 
  FileText, 
  AlertCircle, 
  ChevronRight, 
  Paperclip, 
  ShieldCheck, 
  GraduationCap, 
  Loader2,
  Share2,
  Pencil,
  Timer,
  AlertTriangle,
  RotateCcw,
  XCircle,
  FlaskConical,
  Activity
} from "lucide-react";
import { Assignment, User, Submission, UserRole, PeerReview } from "@/types";
import { SubmissionForm } from "./submission-form";
import { SubmissionList } from "./submission-list";
import { Badge } from "@/components/ui/badge";
import { InteractiveQuiz } from "@/components/interactive-quiz";
import { cn } from "@/lib/utils";
import { io } from "socket.io-client";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { SOCKET_URL } from "@/config";
import { PeerReviewForm } from "@/components/peer-review-form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import usePageTitle from "@/hooks/use-page-title";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { PhysicsLab } from "@/components/physics-lab";
import { QuizMonitor } from "@/components/classes/quiz-monitor";

dayjs.extend(relativeTime);

const AssignmentShow = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<User>();
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const isAr = i18n.language === 'ar';
  if (isAr) dayjs.locale('ar');
  else dayjs.locale('en');

  const { query: assignmentQuery } = useShow<Assignment, HttpError>({
    resource: "assignments",
    id,
    meta: {
        populate: ["class", "class.subject"]
    }
  });

  const assignment = assignmentQuery.data?.data;
  usePageTitle(assignment?.title ? `${assignment.title} - ${t("assignments.show.assignmentDetails")}` : t("assignments.show.assignmentDetails"));

  const submissionsList = useList<Submission, HttpError>({
    resource: "submissions",
    filters: id ? [{ field: "assignmentId", operator: "eq", value: id }] : [],
    queryOptions: { enabled: !!assignment },
  });
  
  const submissions = submissionsList.result.data ?? [];
  const refetchSubmissions = submissionsList.query.refetch;

  // --- PEER REVIEWS FOR STUDENTS ---
  const assignedReviewsResult = useCustom<PeerReview[]>({
    url: `${SOCKET_URL.replace("/socket.io", "")}/api/peer-reviews/assigned`,
    method: "get",
    queryOptions: {
      enabled: !!identity && identity.role === UserRole.STUDENT && !!assignment,
    },
  });

  const refetchAssignedReviews = assignedReviewsResult.query.refetch;

  const assignedReviews = useMemo(() => {
    const data = assignedReviewsResult.result.data;
    if (Array.isArray(data)) {
      return (data as PeerReview[]).filter((r: PeerReview) => r.assignmentId === Number(id));
    }
    return [];
  }, [assignedReviewsResult.result.data, id]);


  // --- PEER FEEDBACK RECEIVED ---
  const mySubmission = useMemo(() => {
    if (!identity?.id || !submissions.length) return null;
    return submissions.find((s: Submission) => s.studentId === identity.id);
  }, [submissions, identity?.id]);

  const receivedReviewsResult = useCustom<PeerReview[]>({
    url: `${SOCKET_URL.replace("/socket.io", "")}/api/peer-reviews/submission/${mySubmission?.id}`,
    method: "get",
    queryOptions: {
      enabled: !!mySubmission?.id,
    },
  });

  const receivedReviews = useMemo(() => {
    const data = receivedReviewsResult.result.data;
    return Array.isArray(data) ? (data as PeerReview[]) : [];
  }, [receivedReviewsResult.result.data]);

  // --- LIVE UPDATES FOR TEACHERS ---
  useEffect(() => {
    if (!identity?.id || identity.role === UserRole.STUDENT) return;

    const socket = io(SOCKET_URL, {
      query: { userId: identity.id },
      withCredentials: true,
    });

    socket.on("agent_alert", (data: any) => {
      if (data.classId === assignment?.classId) {
        void refetchSubmissions();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [identity?.id, identity?.role, assignment?.classId, refetchSubmissions]);

  const isQuiz = useMemo(() => {
    return assignment?.description?.includes("### Q1:") && assignment?.description?.includes("---");
  }, [assignment]);

  // NEW: Detect if this is a physics lab assignment
  const isPhysicsLab = useMemo(() => {
    return assignment?.title?.toLowerCase().includes("lab") || 
           assignment?.description?.toLowerCase().includes("trajectory") ||
           assignment?.description?.toLowerCase().includes("kinematics");
  }, [assignment]);

  const isLoading = isIdentityLoading || assignmentQuery.isLoading || submissionsList.query.isLoading;
  const isError = assignmentQuery.isError || submissionsList.query.isError;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] gap-8">
        <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
        >
          <div className="absolute inset-[-20px] rounded-full bg-primary/5 animate-ping duration-[3000ms]" />
          <Loader2 className="h-20 w-20 animate-spin text-primary/10 stroke-[1]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary/30" />
          </div>
        </motion.div>
        <div className="text-center space-y-2">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-primary/60 animate-pulse">
                {t("assignments.show.assembling")}
            </h2>
            <p className="text-xs font-medium text-muted-foreground/60 italic">Preparing your assignment details...</p>
        </div>
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="container mx-auto py-32 text-center space-y-8">
        <div className="p-8 rounded-[2.5rem] bg-destructive/5 text-destructive w-fit mx-auto border border-destructive/10">
          <XCircle className="h-20 w-20" />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-black tracking-tight">
            {t("assignments.show.notFound")}
          </h2>
          <p className="text-muted-foreground font-medium max-w-md mx-auto text-lg">
            {t("assignments.show.notFoundDescription")}
          </p>
        </div>
        <Button
          asChild
          size="lg"
          className="rounded-2xl h-14 px-10 font-bold uppercase tracking-widest text-[10px]"
        >
          <Link to="/assignments">{t("buttons.goBack")}</Link>
        </Button>
      </div>
    );
  }

  const isAdmin = identity?.role === UserRole.ADMIN;
  const isTeacher = identity?.role === UserRole.TEACHER;
  const isStaff = isAdmin || isTeacher;
  
  const dueDate = assignment.dueDate ? dayjs(assignment.dueDate) : null;
  const isOverdue = dueDate ? dayjs().isAfter(dueDate) : false;

  const calculateBlendedGrade = () => {
    if (!mySubmission?.grade || !receivedReviews.length) return null;
    
    const peerGrades = receivedReviews.map((r: PeerReview) => {
      const totalScore = Object.values(r.scores).reduce((a: number, b: number) => a + b, 0);
      const maxScore = assignment.rubric.reduce((a, b) => a + b.maxPoints, 0);
      return (totalScore / maxScore) * 100;
    });

    const avgPeerGrade = peerGrades.reduce((a: number, b: number) => a + b, 0) / peerGrades.length;
    const teacherWeight = (100 - assignment.peerReviewWeight) / 100;
    const peerWeight = assignment.peerReviewWeight / 100;

    return (mySubmission.grade * teacherWeight) + (avgPeerGrade * peerWeight);
  };

  const blendedGrade = calculateBlendedGrade();

  return (
    <div className="container mx-auto py-8 md:py-12 max-w-7xl space-y-10 md:space-y-16">
      {/* Header & Breadcrumb */}
      <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 md:space-y-6 text-start"
      >
          <Breadcrumb />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/5">
                      <FileText className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  <div>
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">{t("assignments.show.assignmentDetails")}</h1>
                      <p className="text-muted-foreground font-medium max-w-xl text-balance">{t("assignments.show.description")}</p>
                  </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full md:w-auto rounded-2xl font-bold uppercase tracking-widest text-[10px] h-12 md:h-14 px-6 md:px-8 gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10"
                      onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success(t("assignments.show.toast.linkCopied"));
                      }}
                  >
                      <Share2 className="w-4 h-4" />
                      {t("buttons.share")}
                  </Button>
                  {isStaff && (
                      <Button 
                          size="lg"
                          className="w-full md:w-auto rounded-2xl font-bold uppercase tracking-widest text-[10px] h-12 md:h-14 px-8 md:px-10 shadow-lg shadow-primary/25"
                          asChild
                      >
                          <Link to={`/assignments/edit/${assignment.id}`}>
                              <Pencil className="w-4 h-4 mr-2" />
                              {t("buttons.editTask")}
                          </Link>
                      </Button>
                  )}
              </div>
          </div>
      </motion.div>

      {/* Premium Assignment Banner */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-[2.5rem] md:rounded-[3rem] border border-border/40 bg-card/50 backdrop-blur-3xl shadow-2xl text-start"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-ai-primary to-primary" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        
        <div className="p-8 md:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-10">
          <div className="space-y-6 flex-1">
            <div className="flex flex-wrap gap-3">
              {assignment.hasPeerReview && (
                <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm">
                  <Users className="h-4 w-4" />
                  {t("assignments.show.banner.peerReviewActive")}
                </Badge>
              )}
              {isQuiz && (
                <Badge className="bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm">
                  <BrainCircuit className="h-4 w-4" />
                  {t("assignments.show.banner.aiQuizMode")}
                </Badge>
              )}
              {isPhysicsLab && (
                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm">
                  <FlaskConical className="h-4 w-4" />
                  {t("assignments.show.banner.physicsLab" as any)}
                </Badge>
              )}
              {assignment.isGroupAssignment && (
                <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm">
                  <Users className="h-4 w-4" />
                  {t("assignments.show.banner.groupAssignment")}
                </Badge>
              )}
              <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-sm">
                <LayoutDashboard className="h-4 w-4" />
                {(assignment as any).class?.name || t("assignments.list.labels.general")}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-none text-balance">{assignment.title}</h1>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground font-black text-xs uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Calendar className={cn("h-5 w-5", isOverdue ? "text-destructive" : "text-primary")} />
                  <span className={cn(isOverdue && "text-destructive")}>
                    {t("assignments.show.banner.due" as any, { date: dueDate ? dueDate.format("MMM D, YYYY") : t("assignments.list.labels.noDeadline") })}
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-2">
                  <Clock className={cn("h-5 w-5", isOverdue ? "text-destructive" : "text-primary")} />
                  <span className={cn(isOverdue && "text-destructive")}>
                    {dueDate ? dueDate.fromNow() : t("assignments.list.labels.open")}
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>{t("assignments.show.banner.submissionsReceived", { count: submissions.length })}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full lg:w-auto">
            {isStaff && isQuiz && (
                <Button 
                    variant="outline" 
                    size="lg"
                    className={cn(
                        "rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] h-14 md:h-16 px-10 gap-3 border-primary/20 transition-all shadow-xl shadow-primary/5",
                        isMonitoring ? "bg-primary text-white" : "bg-primary/5 text-primary hover:bg-primary/10"
                    )}
                    onClick={() => setIsMonitoring(!isMonitoring)}
                >
                    <Activity className={cn("h-5 w-5", isMonitoring && "animate-pulse")} />
                    {isMonitoring ? t("buttons.stopMonitoring", "Stop Monitoring") : t("buttons.liveMonitor", "Live Monitor")}
                </Button>
            )}

            {isStaff && assignment.hasPeerReview && (
                <Button 
                variant="outline" 
                size="lg"
                className="rounded-[1.5rem] font-bold uppercase tracking-widest text-[10px] h-14 md:h-16 px-10 gap-3 border-primary/20 bg-primary/5 backdrop-blur-sm hover:bg-primary/10 transition-all shadow-xl shadow-primary/5"
                onClick={() => {
                    toast.promise(
                    fetch(`${SOCKET_URL.replace("/socket.io", "")}/api/assignments/${id}/assign-peer-reviews`, {
                        method: "POST",
                        headers: {
                        "Authorization": `Bearer ${localStorage.getItem("refine-auth")}`
                        }
                    }),
                    {
                        loading: t("assignments.show.toast.peersLoading"),
                        success: t("assignments.show.toast.peersSuccess"),
                        error: t("assignments.show.toast.peersError"),
                    }
                    );
                }}
                >
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                {t("buttons.assignPeerReviews")}
                </Button>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="px-4 md:px-6 lg:px-8">
          <div className={cn(
            "p-8 md:p-12 rounded-[2.5rem] bg-muted/20 border border-border/40 shadow-inner relative overflow-hidden",
            (isQuiz || isPhysicsLab) && "opacity-40 blur-[0.5px] select-none"
          )}>
            <div className={cn("absolute opacity-5", isAr ? "left-0" : "right-0")}>
                <FileText className="h-32 w-32 md:h-48 md:w-48" />
            </div>
            {(isQuiz || isPhysicsLab) ? (
              <div className="flex flex-col items-center justify-center py-10 md:py-16 gap-4 text-muted-foreground">
                <FlaskConical className="h-12 w-12 md:h-16 md:w-16" />
                <p className="font-black uppercase tracking-widest text-xs md:text-sm">{t("assignments.show.interactiveContentActive" as any)}</p>
              </div>
            ) : (
              <div className="prose prose-lg dark:prose-invert max-w-none font-medium leading-relaxed text-start">
                <MarkdownRenderer content={assignment.description || ""} />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-10 md:gap-16">
        <AnimatePresence>
            {isMonitoring && isStaff && isQuiz && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    <QuizMonitor quizId={Number(assignment.id)} assignmentTitle={assignment.title} />
                </motion.div>
            )}
        </AnimatePresence>

        {isQuiz && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-[2.5rem] md:rounded-[3rem] text-start">
              <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/10 p-8 md:p-10">
                <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-widest flex items-center gap-4 text-indigo-600">
                  <div className="p-3 rounded-2xl bg-indigo-500/10">
                    <BrainCircuit className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  {t("assignments.show.interactiveQuiz")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 md:p-10">
                <InteractiveQuiz 
                  assignmentId={assignment.id} 
                  description={assignment.description || ""} 
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {isPhysicsLab && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-[2.5rem] md:rounded-[3rem] text-start">
              <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10 p-8 md:p-10">
                <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-widest flex items-center gap-4 text-emerald-600">
                  <div className="p-3 rounded-2xl bg-emerald-500/10">
                    <FlaskConical className="h-6 w-6 md:h-8 md:w-8" />
                  </div>
                  {t("assignments.show.physicsLabTitle", "Interactive Simulation")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 md:p-10">
                <PhysicsLab />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!isStaff && !isQuiz && !isPhysicsLab && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16 text-start">
            <div className="lg:col-span-2 space-y-10 md:space-y-16">
              <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-[2.5rem] md:rounded-[3rem]">
                <CardHeader className="bg-primary/5 border-b border-primary/10 p-8 md:p-10">
                  <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-widest flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                      <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                    {t("assignments.show.yourSubmission")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-10">
                  {!mySubmission || isResubmitting ? (
                    <div className="space-y-8">
                        {mySubmission?.requiresResubmission && (
                            <div className="p-6 rounded-[1.5rem] bg-destructive/10 border border-destructive/20 flex items-start gap-4 shadow-sm">
                                <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black text-destructive tracking-tight">{t("assignments.show.resubmissionRequiredTitle")}</h4>
                                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">{t("assignments.show.resubmissionDescription")}</p>
                                    {mySubmission.feedback && (
                                        <div className="mt-4 p-4 rounded-xl bg-white dark:bg-zinc-900 shadow-sm border border-destructive/10 text-destructive italic font-medium text-sm">
                                            "{mySubmission.feedback}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <SubmissionForm 
                            assignmentId={Number(assignment.id)} 
                            assignment={assignment}
                            existingSubmission={mySubmission || undefined}
                            onCancel={mySubmission ? () => setIsResubmitting(false) : undefined}
                        />
                    </div>
                  ) : (
                    <div className="space-y-10 md:space-y-12">
                        <div className="p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-5 shadow-sm">
                          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-emerald-600 uppercase tracking-widest text-[10px]">{t("assignments.show.submissionStatus")}</span>
                            <span className="font-black text-xl md:text-2xl text-emerald-600/80">{t("assignments.show.successfullyTurnedIn")}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            {t("assignments.show.submittedContent")}
                          </Label>
                          <div className="p-8 md:p-10 bg-muted/20 rounded-[2rem] text-base md:text-lg font-medium italic border border-border/40 leading-relaxed shadow-inner">
                            {mySubmission.content}
                          </div>
                        </div>

                        {/* --- FEEDBACK SECTION --- */}
                        {(mySubmission.feedback || mySubmission.suggestedFeedback) && (
                            <div className="space-y-8 pt-8 border-t border-border/40">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                        <MessageSquare className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest">{t("assignments.show.feedbackReview")}</h3>
                                </div>

                                {mySubmission.feedback && (
                                    <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 relative group hover:bg-primary/10 transition-all shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                            <Badge className="bg-primary text-primary-foreground rounded-full">{t("assignments.show.instructorFeedback")}</Badge>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                {dayjs(mySubmission.gradedAt).fromNow()}
                                            </span>
                                        </div>
                                        <p className="text-base md:text-lg italic text-muted-foreground leading-relaxed font-medium">
                                            "{mySubmission.feedback}"
                                        </p>
                                    </div>
                                )}

                                {mySubmission.suggestedFeedback && (
                                    <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 relative shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                                            <Badge variant="outline" className="text-indigo-600 border-indigo-500/20 bg-indigo-500/10 rounded-full">{t("assignments.show.aiCoach")}</Badge>
                                            <Sparkles className="h-4 w-4 text-indigo-400" />
                                        </div>
                                        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                                            <MarkdownRenderer content={mySubmission.suggestedFeedback} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- RESUBMIT BUTTON --- */}
                        <div className="flex justify-end pt-4">
                             <Button 
                                variant="outline" 
                                size="lg" 
                                className="rounded-2xl font-bold uppercase tracking-widest text-[10px] h-12 md:h-14 px-8 shadow-sm"
                                onClick={() => setIsResubmitting(true)}
                             >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                {t("buttons.resubmitAssignment")}
                             </Button>
                        </div>


                        {receivedReviews.length > 0 && (
                          <div className="space-y-8 pt-8 border-t border-border/40">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black uppercase tracking-widest">{t("assignments.show.peerFeedback")}</h3>
                            </div>
                            <div className="grid gap-8">
                              {receivedReviews.map((review: PeerReview, idx: number) => (
                                <div key={review.id} className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 relative group hover:bg-primary/10 transition-all shadow-sm">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                    <div className="flex items-center gap-3">
                                      <div className="size-8 rounded-xl bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                                        {idx + 1}
                                      </div>
                                      <span className="text-xs font-black text-primary uppercase tracking-widest">{t("assignments.show.peerReviewer", { index: idx + 1 })}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {Object.entries(review.scores).map(([criteria, score]) => (
                                        <Badge key={criteria} variant="secondary" className="text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-lg bg-white dark:bg-zinc-900 border-primary/5">
                                          {criteria}: {score as React.ReactNode}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-base md:text-lg italic text-muted-foreground leading-relaxed font-medium">"{review.feedback}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {assignedReviews.length > 0 && (
                <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-[2.5rem] md:rounded-[3rem]">
                  <CardHeader className="bg-amber-500/5 border-b border-amber-500/10 p-8 md:p-10">
                    <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-widest flex items-center gap-4 text-amber-600">
                      <div className="p-3 rounded-2xl bg-amber-500/10">
                        <Star className="h-6 w-6 md:h-8 md:w-8" />
                      </div>
                      {t("assignments.show.peersAssigned")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 md:p-10 space-y-10 md:space-y-12">
                    {assignedReviews.map((review: PeerReview) => (
                      <div key={review.id} className="space-y-8 p-8 rounded-[2rem] border-2 border-dashed border-amber-500/20 bg-amber-500/[0.02] shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 rounded-2xl border-4 border-background shadow-lg">
                                <AvatarImage src={review.submission?.student?.image ?? ""} className="object-cover" />
                                <AvatarFallback className="bg-amber-500/10 text-amber-600 font-black">{review.submission?.student?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">{t("assignments.show.reviewingStudent")}</span>
                              <h4 className="font-black text-xl tracking-tight">{review.submission?.student?.name}</h4>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-amber-500/30 text-amber-600 font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-xl shadow-sm">{t("assignments.show.pendingReview")}</Badge>
                        </div>
                        <div className="p-8 bg-white dark:bg-zinc-900 rounded-[1.5rem] text-base font-medium italic shadow-inner border border-border/40 leading-relaxed">
                          {review.submission?.content}
                        </div>
                        <PeerReviewForm 
                          review={review} 
                          assignment={assignment} 
                          onSuccess={() => refetchAssignedReviews()}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-10 md:space-y-16">
              <AnimatePresence>
                {mySubmission?.grade && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="border-none shadow-2xl bg-gradient-to-br from-primary to-ai-primary text-primary-foreground overflow-hidden rounded-[2.5rem] md:rounded-[3rem] relative">
                      <div className={cn("absolute opacity-10 rotate-12", isAr ? "-left-12 -top-12" : "-right-12 -top-12")}>
                        <Trophy className="h-64 w-64" />
                      </div>
                      <CardHeader className="p-8 md:p-10 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-70 flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          {t("assignments.show.academicPerformance")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 md:p-10 pt-0 space-y-10 relative z-10">
                        <div className="flex flex-col gap-6">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{t("assignments.show.instructorGrade")}</p>
                            <p className="text-5xl md:text-6xl font-black">{mySubmission.grade}%</p>
                          </div>
                          {blendedGrade && (
                            <div className="space-y-1 pt-6 border-t border-white/10">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{t("assignments.show.blendedScore")}</p>
                              <p className="text-6xl md:text-7xl font-black tracking-tighter">{blendedGrade.toFixed(1)}%</p>
                            </div>
                          )}
                        </div>
                        
                        {assignment.hasPeerReview && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
                              <span>{t("assignments.show.peerReviewerWeight")}</span>
                              <span>{assignment.peerReviewWeight}%</span>
                            </div>
                            <div className="h-3 bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${assignment.peerReviewWeight}%` }}
                                className="h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.6)]" 
                              />
                            </div>
                          </div>
                        )}

                        <Button variant="secondary" className="w-full rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 bg-white text-primary hover:bg-white/90 shadow-2xl shadow-black/20">
                          {t("buttons.viewReport")}
                          <ArrowRight className={cn("h-4 w-4 ml-2", isAr && "rotate-180 mr-2 ml-0")} />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
                <CardHeader className="p-8 md:p-10 pb-4 border-b border-border/40">
                    <CardTitle className="text-sm md:text-base font-black uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        {t("assignments.show.submissionRules")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-10 space-y-6 md:space-y-8">
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Timer className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-[10px] uppercase tracking-widest">{t("assignments.show.latePolicy")}</p>
                            <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed">{t("assignments.show.lateDescription")}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-[10px] uppercase tracking-widest">{t("assignments.show.academicIntegrity")}</p>
                            <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed">{t("assignments.show.integrityDescription")}</p>
                        </div>
                    </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {isStaff && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-[2.5rem] md:rounded-[3rem] text-start">
              <CardHeader className="bg-primary/5 border-b border-primary/10 p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <Users className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                    <div>
                        <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-widest">{t("assignments.show.studentSubmissions")}</CardTitle>
                        <CardDescription className="font-bold text-primary/60 text-sm md:text-base">{t("assignments.show.submissionsDescription")}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-none shadow-sm">
                      {t("assignments.show.submissionsCount", { count: submissions.length })}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 md:p-10">
                <SubmissionList submissions={submissions} assignmentId={Number(assignment.id)} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AssignmentShow;
