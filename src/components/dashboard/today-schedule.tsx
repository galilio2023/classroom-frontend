import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { ScheduleItem } from "@/types/dashboard";
import { ScheduleItemCard } from "./schedule-item-card";

interface TodayScheduleProps {
  schedule: ScheduleItem[];
  show: (resource: string, id: string) => void;
}

export const TodaySchedule = ({ schedule, show }: TodayScheduleProps) => {
  return (
    <Card className="overflow-hidden border-border/50 shadow-xl bg-card/50 backdrop-blur-md relative">
      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
      
      <CardHeader className="pb-4 relative">
        <CardTitle className="text-xl font-black flex items-center gap-2 tracking-tight">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {schedule.length > 0 ? (
          schedule.map((item) => (
            <ScheduleItemCard 
              key={item.id} 
              item={item} 
              onClick={(id) => show("classes", id)} 
            />
          ))
        ) : (
          <div className="text-center py-10 space-y-3 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50">
            <div className="mx-auto w-10 h-10 bg-muted rounded-full flex items-center justify-center opacity-50">
                <Clock className="h-5 w-5" />
            </div>
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Free Day</p>
                <p className="text-[10px] text-muted-foreground/60 font-medium">No classes scheduled for today.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
