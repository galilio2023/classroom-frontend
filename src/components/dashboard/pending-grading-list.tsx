import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { PendingSubmission } from "@/types/dashboard";
import { PendingSubmissionCard } from "./pending-submission-card";

interface PendingGradingListProps {
  submissions: PendingSubmission[];
  show: (resource: string, id: string) => void;
}

export const PendingGradingList = ({ submissions, show }: PendingGradingListProps) => {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Pending Grading</CardTitle>
          <p className="text-sm text-muted-foreground">Submissions awaiting your feedback.</p>
        </div>
        <Badge variant="secondary" className="rounded-full px-3 bg-primary/10 text-primary border-primary/20 font-bold">
          {submissions.length} New
        </Badge>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid gap-4">
          {submissions.length > 0 ? (
            submissions.map((submission) => (
              <PendingSubmissionCard 
                key={submission.id} 
                submission={submission} 
                onGrade={(id) => show("assignments", id)} 
              />
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-muted/20 backdrop-blur-sm flex flex-col items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest">All caught up!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
