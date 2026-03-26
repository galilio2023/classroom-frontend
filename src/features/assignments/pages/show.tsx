import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  FlaskConical, 
  Loader2,
  ShieldCheck,
  Timer,
  GraduationCap,
  Users
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAssignment } from "../hooks/use-assignment";
import { AssignmentHeader } from "../components/assignment-header";
import { AssignmentBanner } from "../components/assignment-banner";
import { PerformanceCard } from "../components/performance-card";
import { SubmissionForm } from "./submission-form";
import { SubmissionList } from "./submission-list";
import { InteractiveQuiz } from "@/components/interactive-quiz";
import { PhysicsLab } from "@/components/physics-lab";
import { QuizMonitor } from "@/components/classes/quiz-monitor";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PeerReviewForm } from "@/components/peer-review-form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PeerReview } from "@/types";
import usePageTitle from "@/hooks/use-page-title";

const AssignmentShow = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { 
    assignment, 
    submissions, 
    assignedReviews, 
    mySubmission, 
    blendedGrade, 
    isStaff, 
    isQuiz, 
    isPhysicsLab,
    isAr,
    isLoading, 
    isError,
    state,
    refetch
  } = useAssignment(id);

  usePageTitle(assignment?.title ? `${assignment.title} - ${t("assignments.show.assignmentDetails")}` : t("assignments.show.assignmentDetails"));

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-[85vh] gap-8">
      <Loader2 className="h-20 w-20 animate-spin text-primary/10" />
      <p className="text-sm font-black uppercase tracking-[0.3em] text-primary/60">{t("assignments.show.assembling")}</p>
    </div>
  );

  if (isError || !assignment) return (
    <div className="container mx-auto py-32 text-center space-y-8">
      <XCircle className="h-20 w-20 text-destructive mx-auto" />
      <h2 className="text-4xl font-black">{t("assignments.show.notFound")}</h2>
      <Button asChild><Link to="/assignments">{t("buttons.goBack")}</Link></Button>
    </div>
  );

  return (
    <div className="container mx-auto py-8 md:py-12 max-w-7xl space-y-10 md:space-y-16">
      <AssignmentHeader assignment={assignment} isStaff={isStaff} />
      
      <AssignmentBanner 
        assignment={assignment} 
        submissions={submissions} 
        isStaff={isStaff} 
        isQuiz={!!isQuiz} 
        isPhysicsLab={!!isPhysicsLab} 
        isMonitoring={state.isMonitoring}
        setIsMonitoring={state.setIsMonitoring}
        isAr={isAr}
      />

      <div className="grid gap-10 md:gap-16">
        <AnimatePresence>
            {state.isMonitoring && isStaff && isQuiz && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <QuizMonitor quizId={Number(assignment.id)} assignmentTitle={assignment.title} />
                </motion.div>
            )}
        </AnimatePresence>

        {isQuiz && (
            <Card className="rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-none shadow-2xl text-start">
                <CardHeader className="bg-indigo-500/5 p-8 md:p-10 border-b border-indigo-500/10">
                    <CardTitle className="text-indigo-600 flex items-center gap-4 font-black uppercase tracking-widest text-xl">
                        <BrainCircuit className="h-8 w-8" /> {t("assignments.show.interactiveQuiz")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-10">
                    <InteractiveQuiz assignmentId={assignment.id} description={assignment.description || ""} />
                </CardContent>
            </Card>
        )}

        {isPhysicsLab && (
            <Card className="rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-none shadow-2xl text-start">
                <CardHeader className="bg-emerald-500/5 p-8 md:p-10 border-b border-emerald-500/10">
                    <CardTitle className="text-emerald-600 flex items-center gap-4 font-black uppercase tracking-widest text-xl">
                        <FlaskConical className="h-8 w-8" /> {t("assignments.show.physicsLabTitle", "Interactive Simulation")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-10"><PhysicsLab /></CardContent>
            </Card>
        )}

        {!isStaff && !isQuiz && !isPhysicsLab && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16 text-start">
            <div className="lg:col-span-2 space-y-10 md:space-y-16">
              <Card className="rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-none shadow-2xl">
                <CardHeader className="bg-primary/5 p-8 md:p-10 border-b border-primary/10">
                  <CardTitle className="flex items-center gap-4 font-black uppercase tracking-widest text-xl">
                    <CheckCircle2 className="h-8 w-8 text-primary" /> {t("assignments.show.yourSubmission")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-10">
                  {!mySubmission || state.isResubmitting ? (
                    <SubmissionForm 
                      assignmentId={Number(assignment.id)} 
                      assignment={assignment} 
                      existingSubmission={mySubmission || undefined} 
                      onCancel={mySubmission ? () => state.setIsResubmitting(false) : undefined} 
                    />
                  ) : (
                    <div className="space-y-10">
                      <div className="p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-5">
                         <CheckCircle2 className="text-emerald-600 h-8 w-8" />
                         <span className="font-black text-xl text-emerald-600">{t("assignments.show.successfullyTurnedIn")}</span>
                      </div>
                      <div className="p-8 bg-muted/20 rounded-[2rem] italic border border-border/40 font-medium">
                        {mySubmission.content}
                      </div>
                      <Button variant="outline" className="rounded-2xl" onClick={() => state.setIsResubmitting(true)}>{t("buttons.resubmitAssignment")}</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {assignedReviews.length > 0 && (
                <Card className="rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-none shadow-2xl">
                    <CardHeader className="bg-amber-500/5 p-8 md:p-10 border-b border-amber-500/10">
                        <CardTitle className="text-amber-600 flex items-center gap-4 font-black uppercase tracking-widest text-xl">
                            <Users className="h-8 w-8" /> {t("assignments.show.peersAssigned")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 md:p-10 space-y-10">
                        {assignedReviews.map((review: PeerReview) => (
                            <div key={review.id} className="p-8 rounded-[2rem] border-2 border-dashed border-amber-500/20 space-y-6">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12"><AvatarFallback>{review.submission?.student?.name?.[0]}</AvatarFallback></Avatar>
                                    <h4 className="font-black text-lg">{review.submission?.student?.name}</h4>
                                </div>
                                <div className="p-6 bg-muted/20 rounded-2xl italic">{review.submission?.content}</div>
                                <PeerReviewForm review={review} assignment={assignment} onSuccess={() => refetch.assignedReviews()} />
                            </div>
                        ))}
                    </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-10 md:space-y-16">
              <PerformanceCard assignment={assignment} submission={mySubmission || null} blendedGrade={blendedGrade} isAr={isAr} />
              
              <Card className="rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-xl">
                <CardHeader className="p-8 md:p-10 pb-4 border-b border-border/40">
                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" /> {t("assignments.show.submissionRules")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8 md:p-10 space-y-8">
                    <div className="flex gap-4">
                        <Timer className="h-6 w-6 text-primary" />
                        <div><p className="font-black text-[10px] uppercase tracking-widest">{t("assignments.show.latePolicy")}</p><p className="text-sm text-muted-foreground">{t("assignments.show.lateDescription")}</p></div>
                    </div>
                    <div className="flex gap-4">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <div><p className="font-black text-[10px] uppercase tracking-widest">{t("assignments.show.academicIntegrity")}</p><p className="text-sm text-muted-foreground">{t("assignments.show.integrityDescription")}</p></div>
                    </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {isStaff && (
          <Card className="rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-none shadow-2xl text-start">
              <CardHeader className="bg-primary/5 p-8 md:p-10 border-b border-primary/10">
                <div className="flex items-center gap-4">
                    <Users className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-widest">{t("assignments.show.studentSubmissions")}</CardTitle>
                        <CardDescription className="font-bold text-primary/60">{t("assignments.show.submissionsDescription")}</CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 md:p-10">
                <SubmissionList submissions={submissions} assignmentId={Number(assignment.id)} />
              </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AssignmentShow;
