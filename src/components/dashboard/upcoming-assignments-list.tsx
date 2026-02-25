import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { EmptyState } from "@/components/empty-state";
import { cn } from "@/lib/utils";

interface UpcomingAssignment {
  id: string;
  title: string;
  dueDate: string;
  class?: { name: string };
}

interface UpcomingAssignmentsListProps {
  assignments: UpcomingAssignment[];
  list: (resource: string) => void;
  show: (resource: string, id: string) => void;
}

const Badge = ({ children, variant = "default", className = "" }: { children: React.ReactNode, variant?: "default" | "outline" | "destructive", className?: string }) => {
    const variants = {
        default: "bg-primary text-primary-foreground shadow-md",
        outline: "border-2 border-primary/20 bg-white/50 dark:bg-black/20 text-foreground backdrop-blur-sm",
        destructive: "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 animate-pulse"
    };
    return (
        <div className={cn("inline-flex items-center rounded-xl px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all", variants[variant], className)}>
            {children}
        </div>
    );
};

export const UpcomingAssignmentsList = ({ assignments, list, show }: UpcomingAssignmentsListProps) => (
    <Card className="border-none shadow-xl bg-white/50 dark:bg-black/20 backdrop-blur-xl group">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black/5 dark:border-white/5 pb-6 gap-4">
            <div className="space-y-1">
                <CardTitle className="flex items-center gap-3 text-2xl font-black">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    Upcoming Assignments
                </CardTitle>
                <CardDescription className="text-sm font-medium">Don't miss your next deadlines.</CardDescription>
            </div>
            <Button variant="secondary" size="sm" onClick={() => list("assignments")} className="w-full sm:w-auto rounded-full px-6 font-bold shadow-sm">
                View All
            </Button>
        </CardHeader>
        <CardContent className="pt-8">
            {assignments.length > 0 ? (
                <div className="space-y-4">
                    {assignments.map((assignment) => (
                        <div 
                            key={assignment.id} 
                            className="group/item flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/40 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10 hover:scale-[1.01] transition-all cursor-pointer shadow-sm gap-4"
                            onClick={() => show("assignments", assignment.id)}
                        >
                            <div className="flex flex-col gap-1.5">
                                <span className="font-black text-lg group-hover/item:text-primary transition-colors">{assignment.title}</span>
                                <div className="px-2 py-0.5 w-fit rounded-md bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider">
                                    {assignment.class?.name}
                                </div>
                            </div>
                            <Badge variant={new Date(assignment.dueDate) < new Date(Date.now() + 86400000) ? "destructive" : "outline"} className="w-fit rounded-full px-4 py-1 text-xs">
                                <Clock className="h-3.5 w-3.5 mr-1.5" />
                                {formatDistanceToNow(new Date(assignment.dueDate), { addSuffix: true })}
                            </Badge>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState icon={FileText} title="All caught up!" description="No upcoming assignments due soon." />
            )}
        </CardContent>
    </Card>
);
