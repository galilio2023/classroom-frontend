import { useShow, useGetIdentity, useList, HttpError } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Assignment, User, Submission } from "@/types";
import { SubmissionForm } from "./submission-form";
import { SubmissionList } from "./submission-list";
import { Badge } from "@/components/ui/badge";

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

  const mySubmission = submissions.find(
    (s) => s.studentId === identity?.id,
  );

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

  // Helper to render the student's view
  const renderStudentView = () => {
    // If graded, show the results
    if (mySubmission?.grade != null) {
      return (
        <div className="space-y-4">
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

          {mySubmission.feedback && (
            <div className="p-4 border rounded-lg bg-muted/20">
              <h4 className="font-semibold mb-2">Teacher Feedback</h4>
              <p className="text-sm">{mySubmission.feedback}</p>
            </div>
          )}

          <div className="pt-4">
            <h4 className="font-semibold mb-2 text-muted-foreground">
              Your Submission
            </h4>
            <div className="p-3 rounded-md bg-muted/50 text-sm whitespace-pre-wrap">
              {mySubmission.content}
            </div>
          </div>
        </div>
      );
    }

    // If not graded, show the form
    return (
      <SubmissionForm
        assignmentId={assignment.id}
        existingSubmission={mySubmission}
      />
    );
  };

  return (
    <ShowView>
      <ShowViewHeader resource="assignments" title={assignment.title} />
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{assignment.title}</CardTitle>
            <CardDescription>Due: {dueDate}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{assignment.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {isTeacher ? "Student Submissions" : "Your Submission"}
              {/* Show a badge if the student has submitted but not been graded yet */}
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
