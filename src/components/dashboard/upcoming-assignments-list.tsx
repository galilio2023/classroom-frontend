import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpcomingAssignment } from "@/types/dashboard";
import { AssignmentItemCard } from "./assignment-item-card";

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
        <Button variant="ghost" size="sm" onClick={() => list("assignments")} className="text-primary font-bold hover:bg-primary/10">
          View All
        </Button>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid gap-4 sm:grid-cols-2">
          {assignments.length > 0 ? (
            assignments.map((assignment) => (
              <AssignmentItemCard 
                key={assignment.id} 
                assignment={assignment} 
                onOpen={(id) => show("assignments", id)} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 border-2 border-dashed rounded-2xl bg-muted/20 backdrop-blur-sm">
              <p className="text-muted-foreground font-medium">No upcoming assignments. Enjoy your time!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
