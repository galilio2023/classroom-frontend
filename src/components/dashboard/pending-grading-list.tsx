import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, User, ArrowRight } from "lucide-react";
import { PendingSubmission } from "@/types/dashboard";

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
        <Badge variant="secondary" className="rounded-full px-3">
          {submissions.length} New
        </Badge>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid gap-4">
          {submissions.length > 0 ? (
            submissions.map((submission) => (
              <Card key={submission.id} className="group overflow-hidden transition-all hover:ring-1 hover:ring-primary/20">
                <div className="flex items-center p-4 gap-4">
                  <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                    <AvatarImage src={submission.student?.image} />
                    <AvatarFallback className="bg-primary/5 text-primary">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{submission.student?.name}</p>
                      {submission.isLate && (
                        <Badge variant="destructive" className="text-[10px] h-4 px-1.5 uppercase font-bold">Late</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate font-medium">
                      {submission.assignment?.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Submitted {new Date(submission.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => show("assignments", submission.assignmentId.toString())}
                  >
                    Grade <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-2xl bg-muted/30">
              <p className="text-muted-foreground font-medium">All caught up! No pending submissions.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
