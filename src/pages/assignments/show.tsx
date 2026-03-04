import { useShow, useGetIdentity, useList, HttpError } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { useMemo, useEffect } from "react";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, BrainCircuit, Users, CheckCircle2 } from "lucide-react";
import { Assignment, User, Submission } from "@/types";
import { SubmissionForm } from "./submission-form";
import { SubmissionList } from "./submission-list";
import { Badge } from "@/components/ui/badge";
import { InteractiveQuiz } from "@/components/interactive-quiz";
import { cn } from "@/lib/utils";
import { io } from "socket.io-client";

const AssignmentShow = () => {
  const { id } = useParams();
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<User>();

  const { query: assignmentQuery } = useShow<Assignment, HttpError>({
    resource: "assignments",
    id,
  });

  const assignment = assignmentQuery.data?.data;

  const { query: submissionsQuery } = useList<Submission, HttpError>({
    resource: "submissions",
    filters: id ? [{ field: "assignmentId", operator: "eq", value: id }] : [],
    queryOptions: { enabled: !!assignment },
  });
  
  const submissions = submissionsQuery.data?.data ?? [];
  const refetchSubmissions = submissionsQuery.refetch;

  // --- LIVE UPDATES FOR TEACHERS ---
  useEffect(() => {
    if (!identity?.id || identity.role === "student") return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL.replace("/api", "");
    const socket = io(socketUrl, {
      query: { userId: identity.id },
      withCredentials: true,
    });

    socket.on("agent_alert", (data: any) => {
      // Only refetch if the alert is for this specific assignment/class
      if (data.classId === assignment?.classId) {
        void refetchSubmissions();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [identity?.id, identity?.role, assignment?.classId, refetchSubmissions]);

  const mySubmission = useMemo(() => {
    if (!identity?.id || !submissions.length) return null;
    return submissions.find((s: Submission) => s.studentId === identity.id);
  }, [submissions, identity?.id]);

  const isQuiz = useMemo(() => {
    return assignment?.description?.includes("### Q1:") && assignment?.description?.includes("---");
  }, [assignment]);

  const isLoading = isIdentityLoading || assignmentQuery.isLoading || submissionsQuery.isLoading;
  const isError = assignmentQuery.isError || submissionsQuery.isError;

  if (isLoading) {
    return (
      <ShowView>
        <ShowViewHeader resource="assignments" title="Loading..." />
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        </div>
      </ShowView>
    );
  }

  if (isError || !assignment) {
    return (
      <ShowView>
        <ShowViewHeader title="Assignment not found" />
      </ShowView>
    );
  }

  const isAdmin = identity?.role === "admin";
  const isTeacher = identity?.role === "teacher";
  const isStaff = isAdmin || isTeacher;
  
  const dueDate = assignment.dueDate
    ? new Date(assignment.dueDate).toLocaleDateString()
    : "No due date";

  return (
    <ShowView>
      <ShowViewHeader resource="assignments" title={assignment.title} />
      <div className="space-y-8">
        <Card className="border-none shadow-xl bg-white/50 dark:bg-black/20 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black">{assignment.title}</CardTitle>
                <CardDescription className="font-bold">Due: {dueDate}</CardDescription>
              </div>
              <div className="flex gap-2">
                {isQuiz && (
                  <Badge className="bg-indigo-500 text-white border-none px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">
                    <BrainCircuit className="h-3 w-3 mr-2" />
                    AI Quiz Mode
                  </Badge>
                )}
                {isAdmin && (
                  <Badge className="bg-red-500 text-white border-none px-4 py-1 rounded-full font-black uppercase tracking-widest text-[10px]">
                    Admin View
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className={cn("whitespace-pre-wrap text-muted-foreground leading-relaxed", isQuiz && "opacity-40 blur-[0.5px] select-none italic text-xs")}>
              {isQuiz ? "Interactive AI quiz content is active below." : assignment.description}
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-8">
          {isQuiz && (
            <Card className="border-none shadow-2xl bg-white dark:bg-black/40 overflow-hidden">
              <CardHeader className="bg-indigo-500/5 border-b border-indigo-500/10">
                <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-indigo-600">
                  <BrainCircuit className="h-5 w-5" />
                  Interactive Quiz Player
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <InteractiveQuiz 
                  assignmentId={assignment.id} 
                  description={assignment.description || ""} 
                />
              </CardContent>
            </Card>
          )}

          {!isStaff && !isQuiz && (
            <Card className="border-none shadow-2xl bg-white dark:bg-black/40 overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-black/5">
                <CardTitle className="text-lg font-black uppercase tracking-widest">
                  Your Submission
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                {mySubmission ? (
                   <div className="space-y-4">
                      <div className="p-4 border rounded-xl bg-green-500/5 border-green-500/20 flex items-center gap-3">
                        <CheckCircle2 className="text-green-500" />
                        <span className="font-bold text-green-700">Assignment Submitted Successfully</span>
                      </div>
                      <div className="p-4 bg-muted/30 rounded-xl text-sm italic">
                        {mySubmission.content}
                      </div>
                   </div>
                ) : (
                  <SubmissionForm assignmentId={assignment.id} />
                )}
              </CardContent>
            </Card>
          )}

          {isStaff && (
            <Card className="border-none shadow-2xl bg-white dark:bg-black/40 overflow-hidden">
              <CardHeader className="bg-primary/5 border-b border-primary/10">
                <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                  <Users className="h-5 w-5" />
                  {isAdmin ? "Admin: Student Submissions" : "Teacher: Student Submissions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <SubmissionList submissions={submissions} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ShowView>
  );
};

export default AssignmentShow;
