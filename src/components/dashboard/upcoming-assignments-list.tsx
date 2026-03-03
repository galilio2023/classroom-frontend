import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, FileText } from "lucide-react";
import { UpcomingAssignment } from "@/types/dashboard";

interface UpcomingAssignmentsListProps {
  assignments: UpcomingAssignment[];
  list: (resource: string) => void;
  show: (resource: string, id: string) => void;
}

export const UpcomingAssignmentsList = ({ assignments, list, show }: UpcomingAssignmentsListProps) => {
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">Upcoming Tasks</CardTitle>
          <p className="text-sm text-muted-foreground">Don't miss your deadlines.</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => list("assignments")} className="text-primary font-bold">
          View All
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid gap-4 sm:grid-cols-2">
          {assignments.length > 0 ? (
            assignments.map((assignment) => (
              <Card key={assignment.id} className="group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                      {assignment.class?.name}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-bold leading-tight group-hover:text-primary transition-colors line-clamp-1">
                      {assignment.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Due {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full justify-between group/btn" 
                    variant="outline" 
                    size="sm"
                    onClick={() => show("assignments", assignment.id.toString())}
                  >
                    Open Assignment
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 border-2 border-dashed rounded-2xl bg-muted/30">
              <p className="text-muted-foreground font-medium">No upcoming assignments. Enjoy your time!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
