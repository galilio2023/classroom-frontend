import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubmissionForm } from "../../pages/submission-form";
import { SubmissionList } from "../../pages/submission-list";
import { Assignment, Submission } from "@/types";

interface SubmissionContainerProps {
  isStaff: boolean;
  assignment: Assignment;
  submissions: Submission[];
  mySubmission?: Submission;
  isResubmitting: boolean;
  setIsResubmitting: (val: boolean) => void;
}

export const SubmissionContainer = ({
  isStaff,
  assignment,
  submissions,
  mySubmission,
  isResubmitting,
  setIsResubmitting,
}: SubmissionContainerProps) => {
  const { t } = useTranslation();

  return (
    <Card className="rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-xl">
      <CardHeader className="bg-primary/5 p-8 md:p-10 border-b border-border/40">
        <CardTitle className="text-primary flex items-center gap-4 font-black uppercase tracking-widest text-xl text-start">
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
            existingSubmission={mySubmission}
            onCancel={mySubmission ? () => setIsResubmitting(false) : undefined}
          />
        ) : (
          <div className="space-y-10 text-start">
            <div className="p-6 rounded-4xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-5">
              <CheckCircle2 className="text-emerald-600 h-8 w-8" />
              <span className="font-black text-xl text-emerald-600">
                {t("assignments.show.successfullyTurnedIn" as any)}
              </span>
            </div>
            <div className="p-8 bg-muted/20 rounded-4xl italic border border-border/40 font-medium whitespace-pre-wrap">
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
  );
};
