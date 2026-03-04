import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, FileText } from "lucide-react";
import { UpcomingAssignment } from "@/types/dashboard";
import { formatDistanceToNow, isWithinInterval, addHours } from "date-fns";
import { cn } from "@/lib/utils";

interface AssignmentItemCardProps {
  assignment: UpcomingAssignment;
  onOpen: (id: string) => void;
}

export const AssignmentItemCard: React.FC<AssignmentItemCardProps> = ({ assignment, onOpen }) => {
  const dueDate = new Date(assignment.dueDate);
  const isUrgent = isWithinInterval(dueDate, {
    start: new Date(),
    end: addHours(new Date(), 48),
  });

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50",
        isUrgent
          ? "bg-destructive/5 border-destructive/20"
          : "hover:border-primary/30 bg-card/50 backdrop-blur-sm"
      )}
    >
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "p-2 rounded-lg transition-colors",
              isUrgent ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
            )}
          >
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex gap-2">
            {isUrgent && (
              <Badge variant="destructive" className="text-[10px] uppercase font-black animate-pulse">
                Urgent
              </Badge>
            )}
            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider bg-muted/50">
              {assignment.class?.name}
            </Badge>
          </div>
        </div>
        <div>
          <h4 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">
            {assignment.title}
          </h4>
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground font-medium">
            <Calendar className="h-3.5 w-3.5" />
            <span>Due {dueDate.toLocaleDateString()}</span>
            <span className="text-[10px] opacity-60">•</span>
            <span className={cn(isUrgent && "text-destructive font-bold")}>
              {formatDistanceToNow(dueDate, { addSuffix: true })}
            </span>
          </div>
        </div>
        <Button
          className={cn(
            "w-full justify-between group/btn transition-all",
            isUrgent
              ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              : "variant-outline hover:bg-primary hover:text-primary-foreground"
          )}
          variant={isUrgent ? "default" : "outline"}
          size="sm"
          onClick={() => onOpen(assignment.id.toString())}
        >
          Open Assignment
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
};
