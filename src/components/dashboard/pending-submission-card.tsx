import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Clock, User, ArrowRight } from "lucide-react";
import { PendingSubmission } from "@/types/dashboard";
import { formatDistanceToNow } from "date-fns";

interface PendingSubmissionCardProps {
  submission: PendingSubmission;
  onGrade: (id: string) => void;
}

export const PendingSubmissionCard: React.FC<PendingSubmissionCardProps> = ({
  submission,
  onGrade,
}) => {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 bg-card/50 backdrop-blur-sm border-border/50">
      <div className="flex items-center p-4 gap-4">
        <div className="relative">
          <Avatar className="h-12 w-12 border-2 border-background shadow-sm transition-transform group-hover:scale-105">
            <AvatarImage src={submission.student?.image} />
            <AvatarFallback className="bg-primary/5 text-primary">
              <User className="h-6 w-6" />
            </AvatarFallback>
          </Avatar>
          {submission.isLate && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full border-2 border-background flex items-center justify-center">
              <Clock className="h-2 w-2 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold truncate text-foreground group-hover:text-primary transition-colors">
              {submission.student?.name}
            </p>
            {submission.isLate && (
              <Badge
                variant="destructive"
                className="text-[9px] h-4 px-1.5 uppercase font-black tracking-tighter"
              >
                Late
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate font-medium">
            {submission.assignment?.title}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground/70 font-bold uppercase tracking-wider">
            <span>
              Submitted{" "}
              {formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground"
          onClick={() => onGrade(submission.assignmentId.toString())}
        >
          Grade <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
};
