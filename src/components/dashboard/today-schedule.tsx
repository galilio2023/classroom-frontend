import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { ScheduleItem } from "@/types/dashboard";

interface TodayScheduleProps {
  schedule: ScheduleItem[];
  show: (resource: string, id: string) => void;
}

export const TodaySchedule = ({ schedule, show }: TodayScheduleProps) => {
  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedule.length > 0 ? (
          schedule.map((item) => (
            <div key={item.id} className="relative pl-4 border-l-2 border-primary/20 py-1 group">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-bold leading-none group-hover:text-primary transition-colors">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.todaySchedule?.startTime} - {item.todaySchedule?.endTime}
                    </span>
                    {item.todaySchedule?.room && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.todaySchedule.room}
                      </span>
                    )}
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => show("classes", item.id.toString())}
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 space-y-2">
            <p className="text-sm text-muted-foreground font-medium">No classes scheduled for today.</p>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">Free Day</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
