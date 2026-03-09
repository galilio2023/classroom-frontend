import { useShow, useGetIdentity, useList, HttpError, useCustom } from "@refinedev/core";
import { useParams, Link } from "react-router-dom";
import { useMemo, useEffect } from "react";
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
  Timer
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
import usePageTitle from "@/hooks/use-page-title";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

dayjs.extend(relativeTime);

const AssignmentShow = () => {
  const { id } = useParams();
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<User>();

  const { query: assignmentQuery } = useShow<Assignment, HttpError>({
    resource: "assignments",
    id,
    meta: {
        populate: ["class", "class.subject"]
    }
  });

  const assignment = assignmentQuery.data?.data;
  usePageTitle(assignment?.title ? `${assignment.title} - Assignment` : "Assignment Details");

  const { query: submissionsQuery } = useList<Submission, HttpError>({
    resource: "submissions",
    filters: id ? [{ field: "assignmentId", operator: "eq", value: id }] : [],
    queryOptions: { enabled: !!assignment },
  });
  
  const submissions = submissionsQuery.data?.data ?? [];
  const refetchSubmissions = submissionsQuery.refetch;

  // --- PEER REVIEWS FOR STUDENTS ---
  const { result: assignedReviewsResult, query: assignedReviewsQuery } = useCustom<PeerReview[]>({
    url: `${SOCKET_URL.replace("/socket.io", "")}/api/peer-reviews/assigned`,
    method: "get",
    queryOptions: {
      enabled: !!identity && identity.role === UserRole.STUDENT && !!assignment,
    },
  });

  const assignedReviews = useMemo(() => {
    const data = assignedReviewsResult?.data;
    if (Array.isArray(data)) {
      return data.filter((r: PeerReview) => r.assignmentId === Number(id));
    }
    return [];
  }, [assignedReviewsResult, id]);

  const refetchAssignedReviews = assignedReviewsQuery.refetch;

  // --- PEER FEEDBACK RECEIVED ---
  const mySubmission = useMemo(() => {
    if (!identity?.id || !submissions.length) return null;
    return submissions.find((s: Submission) => s.studentId === identity.id);
  }, [submissions, identity?.id]);

  const { result: receivedReviewsResult } = useCustom<PeerReview[]>({
    url: `${SOCKET_URL.replace("/socket.io", "")}/api/peer-reviews/submission/${mySubmission?.id}`,
    method: "get",
    queryOptions: {
      enabled: !!mySubmission?.id,
    },
  });

  const receivedReviews = useMemo(() => {
    const data = receivedReviewsResult?.data;
    return Array.isArray(data) ? data : [];
  }, [receivedReviewsResult]);

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

  const isLoading = isIdentityLoading || assignmentQuery.isLoading || submissionsQuery.isLoading;
  const isError = assignmentQuery.isError || submissionsQuery.isError;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
        <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary/20" />
            <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary/40" />
            </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">Loading Assignment...</p>
      </div>
    );
  }

  if (isError || !assignment) {
    return (
      <div className="container mx-auto py-20 text-center space-y-6">
        <div className="p-6 rounded-full bg-destructive/10 text-destructive w-fit mx-auto">
          <AlertCircle className="h-16 w-16" />
        </div>
        <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight">Assignment not found</h2>
            <p className="text-muted-foreground font-medium max-w-md mx-auto">The assignment you are looking for does not exist or has been removed.</p>
        </div>
        <Button asChild className="rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px]">
            <Link to="/assignments">Back to Assignments</Link>
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
                      <FileText className="h-8 w-8" />
                  </div>
                  <div>
                      <h1 className="text-4xl font-black tracking-tight">Assignment Details</h1>
                      <p className="text-muted-foreground font-medium">Review instructions, submit work, and track feedback.</p>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <Button 
                      variant="outline" 
                      className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-6 gap-2 border-primary/10 bg-card/50 backdrop-blur-sm"
                      onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success("Assignment link copied!");
                      }}
                  >
                      <Share2 className="w-4 h-4" />
                      Share
                  </Button>
                  {isStaff && (
                      <Button 
                          className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-12 px-8 shadow-xl shadow-primary/20"
                          asChild
                      >
                          <Link to={`/assignments/edit/${assignment.id}`}>
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit Task
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
        className="relative overflow-hidden rounded-[3rem] border border-black/[0.08] dark:border-white/10 bg-card/50 backdrop-blur-2xl shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-ai-primary to-primary" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
        
        <div className="p-10 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-3">
              {assignment.hasPeerReview && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Peer Review Active
                </Badge>
              )}
              {isQuiz && (
                <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4" />
                  AI Quiz Mode
                </Badge>
              )}
              <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                {(assignment as any).class?.name || "General Class"}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none">{assignment.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-muted-foreground font-black text-xs uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Calendar className={cn("h-5 w-5", isOverdue ? "text-destructive" : "text-primary")} />
                  <span className={cn(isOverdue && "text-destructive")}>
                    Due {dueDate ? dueDate.format("MMM D, YYYY") : "No due date"}
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-2">
                  <Clock className={cn("h-5 w-5", isOverdue ? "text-destructive" : "text-primary")} />
                  <span className={cn(isOverdue && "text-destructive")}>
                    {dueDate ? dueDate.fromNow() : "Open Enrollment"}
                  </span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>{submissions.length} Submissions Received</span>
                </div>
              </div>
            </div>
          </div>

          {isStaff && assignment.hasPeerReview && (
            <Button 
              variant="outline" 
              className="rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] h-16 px-10 gap-3 border-primary/10 bg-card/50 backdrop-blur-sm hover:bg-primary/5 transition-all shadow-xl shadow-primary/5"
              onClick={() => {
                toast.promise(
                  fetch(`${SOCKET_URL.replace("/socket.io", "")}/api/assignments/${id}/assign-peer-reviews`, {
                    method: "POST",
                    headers: {
                      "Authorization": `Bearer ${localStorage.getItem("refine-auth")}`
                    }
                  }),
                  {
                    loading: 'Assigning peers...',
                    success: 'Peers assigned successfully!',
                    error: 'Failed to assign peers (need min 3 submissions)',
                  }
                );
              }}
            >
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              Assign Peer Reviews
            </Button>
          )}
        </div>

        {/* Description Section */}
        <div className="px-10 md:px-12 pb-12">
          <div className={cn(
            "p-10 rounded-[2.5rem] bg-muted/20 border border-black/[0.03] dark:border-white/[0.03] shadow-inner relative overflow-hidden",
            isQuiz && "opacity-40 blur-[0.5px] select-none"
          )}>
            <div className="absolute top-0 right-0 p-6 opacity-5">
                <FileText className="h-32 w-32" />
            </div>
            {isQuiz ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4 text-muted-foreground">
                <BrainCircuit className="h-12 w-12" />
                <p className="font-black uppercase tracking-widest text-xs">Interactive AI quiz content is active below.</p>
              </div>
            ) : (
              <div className="prose prose-lg dark:prose-invert max-w-none font-medium leading-relaxed">
                <MarkdownRenderer content={assignment.description || ""} />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid gap-12">
        {isQuiz && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-[3rem]">
              <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/10 p-10">
                <CardTitle className="text-2xl font-black uppercase tracking-widest flex items-center gap-4 text-indigo-600">
                  <div className="p-3 rounded-2xl bg-indigo-500/10">
                    <BrainCircuit className="h-8 w-8" />
                  </div>
                  Interactive Quiz Player
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10">
                <InteractiveQuiz 
                  assignmentId={assignment.id} 
                  description={assignment.description || ""} 
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!isStaff && !isQuiz && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-[3rem]">
                <CardHeader className="bg-primary/5 border-b border-primary/10 p-10">
                  <CardTitle className="text-2xl font-black uppercase tracking-widest flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    Your Submission
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-10">
                  {mySubmission ? (
                    <div className="space-y-10">
                        <div className="p-6 border-2 border-dashed rounded-[2rem] bg-success/5 border-success/20 flex items-center gap-5 shadow-sm">
                          <div className="p-3 rounded-2xl bg-success/10 text-success">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-success uppercase tracking-widest text-[10px]">Submission Status</span>
                            <span className="font-black text-xl text-success/80">Successfully Turned In</span>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Submitted Content
                          </Label>
                          <div className="p-10 bg-muted/20 rounded-[2rem] text-lg font-medium italic border border-black/[0.03] dark:border-white/[0.03] leading-relaxed shadow-inner">
                            {mySubmission.content}
                          </div>
                        </div>

                        {receivedReviews.length > 0 && (
                          <div className="space-y-8 pt-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-widest">Peer Feedback</h3>
                            </div>
                            <div className="grid gap-8">
                              {receivedReviews.map((review: PeerReview, idx: number) => (
                                <div key={review.id} className="p-8 bg-primary/5 rounded-[2rem] border border-primary/10 relative group hover:bg-primary/10 transition-all shadow-sm">
                                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                    <div className="flex items-center gap-3">
                                      <div className="size-8 rounded-xl bg-primary/20 flex items-center justify-center text-xs font-black text-primary">
                                        {idx + 1}
                                      </div>
                                      <span className="text-xs font-black text-primary uppercase tracking-widest">Peer Reviewer</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {Object.entries(review.scores).map(([criteria, score]) => (
                                        <Badge key={criteria} variant="secondary" className="text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-lg bg-white dark:bg-zinc-900 border-primary/5">
                                          {criteria}: {score as React.ReactNode}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-lg italic text-muted-foreground leading-relaxed font-medium">"{review.feedback}"</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <SubmissionForm assignmentId={assignment.id} />
                  )}
                </CardContent>
              </Card>

              {assignedReviews.length > 0 && (
                <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-[3rem]">
                  <CardHeader className="bg-amber-500/5 border-b border-amber-500/10 p-10">
                    <CardTitle className="text-2xl font-black uppercase tracking-widest flex items-center gap-4 text-amber-600">
                      <div className="p-3 rounded-2xl bg-amber-500/10">
                        <Star className="h-8 w-8" />
                      </div>
                      Peer Reviews Assigned
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 space-y-12">
                    {assignedReviews.map((review: PeerReview) => (
                      <div key={review.id} className="space-y-8 p-8 rounded-[2.5rem] border-2 border-dashed border-amber-500/20 bg-amber-500/[0.02]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 rounded-2xl border-4 border-background shadow-lg">
                                <AvatarImage src={review.submission?.student?.image ?? ""} className="object-cover" />
                                <AvatarFallback className="bg-amber-500/10 text-amber-600 font-black">{review.submission?.student?.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">Reviewing Student</span>
                              <h4 className="font-black text-xl tracking-tight">{review.submission?.student?.name}</h4>
                            </div>
                          </div>
                          <Badge variant="outline" className="border-amber-500/30 text-amber-600 font-black uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-xl">Pending Review</Badge>
                        </div>
                        <div className="p-8 bg-white dark:bg-zinc-900 rounded-[1.5rem] text-base font-medium italic shadow-inner border border-black/[0.03] dark:border-white/[0.03] leading-relaxed">
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

            <div className="space-y-12">
              <AnimatePresence>
                {mySubmission?.grade && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="border-none shadow-2xl bg-gradient-to-br from-primary to-ai-primary text-primary-foreground overflow-hidden rounded-[3rem] relative">
                      <div className="absolute -right-12 -top-12 opacity-10 rotate-12">
                        <Trophy className="h-64 w-64" />
                      </div>
                      <CardHeader className="p-10 pb-4">
                        <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-70 flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Academic Performance
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-10 pt-0 space-y-10 relative z-10">
                        <div className="flex flex-col gap-6">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Instructor Grade</p>
                            <p className="text-5xl font-black">{mySubmission.grade}%</p>
                          </div>
                          {blendedGrade && (
                            <div className="space-y-1 pt-6 border-t border-white/10">
                              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Final Blended Score</p>
                              <p className="text-7xl font-black tracking-tighter">{blendedGrade.toFixed(1)}%</p>
                            </div>
                          )}
                        </div>
                        
                        {assignment.hasPeerReview && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
                              <span>Peer Review Weight</span>
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
                          View Detailed Report
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4 border-b border-black/[0.03] dark:border-white/[0.03]">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Submission Rules
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Timer className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-[10px] uppercase tracking-widest">Late Policy</p>
                            <p className="text-sm text-muted-foreground font-medium">Submissions after the deadline will be marked as late and may incur penalties.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <GraduationCap className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-black text-[10px] uppercase tracking-widest">Academic Integrity</p>
                            <p className="text-sm text-muted-foreground font-medium">All work must be original. AI-assisted work should be cited if permitted.</p>
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
            <Card className="border-none shadow-2xl bg-card overflow-hidden rounded-[3rem]">
              <CardHeader className="bg-primary/5 border-b border-primary/10 p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                        <Users className="h-8 w-8" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-black uppercase tracking-widest">Student Submissions</CardTitle>
                        <CardDescription className="font-bold text-primary/60">Manage grading and feedback for all students.</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="rounded-xl px-4 py-2 font-black text-[10px] uppercase tracking-widest bg-primary/10 text-primary border-none">
                      {submissions.length} Submissions
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <SubmissionList submissions={submissions} assignmentId={assignment.id} />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AssignmentShow;
