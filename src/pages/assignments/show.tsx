import { useShow, useGetIdentity, useList, HttpError } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, FileText, ExternalLink } from "lucide-react";
import { Assignment, User, Submission } from "@/types";
import { SubmissionForm } from "./submission-form";
import { SubmissionList } from "./submission-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AssignmentShow = () => {
  const { id } = useParams();
  const { data: identity, isLoading: isIdentityLoading } = useGetIdentity<User>();

  const { result: assignment, query: assignmentQuery } = useShow<
    Assignment,
    HttpError
  >({
    resource: "assignments",
    id,
  });

  const { result: submissionsResult, query: submissionsQuery } = useList<
    Submission,
    HttpError
  >({
    resource: "submissions",
    filters: id
      ? [{ field: "assignmentId", operator: "eq", value: id }]
      : [],
    queryOptions: {
      enabled: !!assignment,
    },
  });
  
  const submissions = submissionsResult?.data ?? [];

  // Use useMemo to ensure mySubmission is recalculated correctly
  const mySubmission = useMemo(() => {
    if (!identity?.id || !submissions.length) return null;
    return submissions.find((s) => s.studentId === identity.id);
  }, [submissions, identity?.id]);

  const isLoading =
    isIdentityLoading || assignmentQuery.isLoading || submissionsQuery.isLoading;
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

  const isTeacher = identity?.role === "teacher";
  const dueDate = assignment.dueDate
    ? new Date(assignment.dueDate).toLocaleDateString()
    : "No due date";

  const renderStudentView = () => {
    if (mySubmission) {
      return (
        <div className="space-y-4">
          {mySubmission.grade != null ? (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
              <div>
                <h3 className="font-semibold text-lg">Grade</h3>
                <p className="text-sm text-muted-foreground">
                  Feedback from your teacher
                </p>
              </div>
              <div className="text-2xl font-bold text-primary">
                {mySubmission.grade} / 100
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-100">
              <h3 className="font-semibold text-blue-800">Submitted</h3>
              <p className="text-sm text-blue-600">
                Your work has been received and is waiting to be graded.
              </p>
            </div>
          )}

          {mySubmission.feedback && (
            <div className="p-4 border rounded-lg bg-muted/20">
              <h4 className="font-semibold mb-2">Teacher Feedback</h4>
              <p className="text-sm">{mySubmission.feedback}</p>
            </div>
          )}

          <div className="pt-4 space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-muted-foreground">
                Your Submission
              </h4>
              <div className="p-3 rounded-md bg-muted/50 text-sm whitespace-pre-wrap border">
                {mySubmission.content}
              </div>
            </div>

            {mySubmission.fileUrl && (
              <div className="flex items-center justify-between p-3 border rounded-lg bg-background">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-md">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium">Submitted File</span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={mySubmission.fileUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View File
                  </a>
                </Button>
              </div>
            )}
          </div>
          
          {mySubmission.grade == null && (
            <div className="pt-6 border-t">
              <h4 className="font-semibold mb-4">Update Your Submission</h4>
              <SubmissionForm
                assignmentId={assignment.id}
                existingSubmission={mySubmission}
              />
            </div>
          )}
        </div>
      );
    }

    return (
      <SubmissionForm
        assignmentId={assignment.id}
      />
    );
  };

  return (
    <ShowView>
      <ShowViewHeader resource="assignments" title={assignment.title} />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{assignment.title}</CardTitle>
                <CardDescription>Due: {dueDate}</CardDescription>
              </div>
              {assignment.fileUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Attachment
                  </a>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{assignment.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {isTeacher ? "Student Submissions" : "Your Submission"}
              {!isTeacher && mySubmission && mySubmission.grade === null && (
                <Badge variant="secondary" className="ml-3">
                  Submitted
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isTeacher ? (
              <SubmissionList submissions={submissions} />
            ) : (
              renderStudentView()
            )}
          </CardContent>
        </Card>
      </div>
    </ShowView>
  );
};

export default AssignmentShow;
