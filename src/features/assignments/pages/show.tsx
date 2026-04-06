import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import {
  CheckCircle2,
  Loader2,
  Users,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useList, useGetIdentity, useCustom } from "@refinedev/core";
import { Assignment, Submission, User, PeerReview } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SubmissionForm } from "./submission-form";
import { SubmissionList } from "./submission-list";
import { PeerReviewForm } from "@/components/peer-review-form";
import { AssignmentBanner } from "../components/assignment-banner";
import { useAssignmentLogic } from "../hooks/use-assignment-logic";
import { useAssignmentSocket } from "../hooks/use-assignment-socket";
import { useState } from "react";
import { AssignmentHeader } from "../components/assignment-header";
import usePageTitle from "@/hooks/use-page-title";

const AssignmentShow = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: identity } = useGetIdentity<User>();

  // --- UI State ---
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // --- Data Fetching ---
  const { query: assignmentQuery } = useCustom<Assignment>({
    url: `assignments/${id}`,
    method: "get",
  });

  const assignment = assignmentQuery.data?.data;
  const isAssignmentLoading = assignmentQuery.isLoading;

  const { query: submissionsQuery } = useList<Submission>({
    resource: "submissions",
    filters: [{ field: "assignmentId", operator: "eq", value: id }],
    queryOptions: { enabled: !!id },
  });

  const submissions = submissionsQuery.data?.data || [];

  // --- Peer Review Data ---
  const { query: reviewsQuery } = useList<PeerReview>({
    resource: "peer-reviews/assigned",
    filters: [{ field: "assignmentId", operator: "eq", value: id }],
    queryOptions: { enabled: !!id && identity?.role === "student" },
  });

  const assignedReviews = reviewsQuery.data?.data || [];
  const refetchReviews = reviewsQuery.refetch;

  // --- Real-time & Logic ---
  useAssignmentSocket(id || "");
  const { mySubmission } = useAssignmentLogic(
    assignment,
    submissions,
    identity?.id
  );

  usePageTitle(assignment?.title || (t("assignments.list.title" as any) as string));

  if (isAssignmentLoading || !assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin opacity-20" />
      </div>
    );
  }

  const isStaff = identity?.role === "admin" || identity?.role === "teacher";

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <AssignmentHeader
        assignment={assignment}
        isStaff={isStaff}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <AssignmentBanner 
            assignment={assignment}
            submissions={submissions}
            isStaff={isStaff}
            isQuiz={false}
            isPhysicsLab={false}
            isMonitoring={isMonitoring}
            setIsMonitoring={setIsMonitoring}
          />

          <Card className="rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-xl">
            <CardHeader className="bg-primary/5 p-8 md:p-10 border-b border-border/40">
              <CardTitle className="text-primary flex items-center gap-4 font-black uppercase tracking-widest text-xl">
                {isStaff ? (
                  <>
                    <Users className="h-8 w-8" /> {t("assignments.show.allSubmissions" as any)}
                  </>
                ) : (
                  <>
                    <FileText className="h-8 w-8" /> {t("assignments.show.yourSubmission" as any)}
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 md:p-10">
              {isStaff ? (
                <SubmissionList submissions={submissions} assignmentId={Number(assignment.id)} />
              ) : !mySubmission || isResubmitting ? (
                <SubmissionForm
                  assignmentId={Number(assignment.id)}
                  assignment={assignment}
                  existingSubmission={mySubmission || undefined}
                  onCancel={mySubmission ? () => setIsResubmitting(false) : undefined}
                />
              ) : (
                <div className="space-y-10">
                  <div className="p-6 rounded-4xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-5">
                    <CheckCircle2 className="text-emerald-600 h-8 w-8" />
                    <span className="font-black text-xl text-emerald-600">
                      {t("assignments.show.successfullyTurnedIn" as any)}
                    </span>
                  </div>
                  <div className="p-8 bg-muted/20 rounded-4xl italic border border-border/40 font-medium">
                    {mySubmission.content}
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-2xl h-12 font-black uppercase tracking-widest text-[10px]"
                    onClick={() => setIsResubmitting(true)}
                  >
                    {t("buttons.resubmitAssignment" as any)}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {assignment.hasPeerReview && !isStaff && (
            <Card className="rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-none shadow-2xl bg-amber-500/[0.02]">
              <CardHeader className="bg-amber-500/5 p-8 md:p-10 border-b border-amber-500/10">
                <CardTitle className="text-amber-600 flex items-center gap-4 font-black uppercase tracking-widest text-xl">
                  <Users className="h-8 w-8" /> {t("assignments.show.peersAssigned" as any)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 md:p-10">
                {assignedReviews.length > 0 ? (
                  <div className="space-y-10">
                    {assignedReviews.map((review: any) => (
                      <div
                        key={review.id}
                        className="p-8 rounded-4xl border-2 border-dashed border-amber-500/20 space-y-6 bg-card"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2 border-amber-500/20">
                            <AvatarFallback className="bg-amber-500/10 text-amber-600 font-bold">
                              {review.submission?.student?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-black text-lg">
                              {t("assignments.show.peerReviewerAnonymous" as any, "Peer Reviewer")}
                            </h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600/60">
                              {(review as any).status === "completed" ? t("status.completed" as any) : t("status.pending" as any)}
                            </p>
                          </div>
                        </div>
                        <div className="p-6 bg-muted/20 rounded-2xl italic border border-border/20 font-medium">
                          {review.submission?.content}
                        </div>
                        <PeerReviewForm
                          review={review}
                          assignment={assignment}
                          onSuccess={() => refetchReviews()}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                    <div className="p-6 rounded-full bg-amber-500/10 text-amber-600">
                      <Users className="h-12 w-12" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black uppercase tracking-tight">
                        {t("assignments.show.noReviewsYet" as any, "No Reviews Assigned Yet")}
                      </h3>
                      <p className="max-w-md mx-auto font-medium text-muted-foreground">
                        {t(
                          "assignments.show.noReviewsDesc" as any,
                          "Once the teacher closes the submission window and assigns peer reviews, you will see your classmates' work here for evaluation."
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-10">
          {/* Status Card */}
          <Card className="rounded-4xl border-none shadow-xl bg-card/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="p-8 border-b border-border/40">
              <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                {t("assignments.show.status" as any)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">{t("assignments.show.dueDate" as any)}</span>
                <span className="font-black text-sm">
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : t("common.noDueDate" as any)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground">{t("assignments.show.points" as any)}</span>
                <Badge className="bg-primary/10 text-primary border-none font-black px-3">
                  {assignment.id} {t("common.xp" as any)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssignmentShow;
