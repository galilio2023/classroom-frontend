import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, ArrowRight, Radio } from "lucide-react";
import { ScheduleItem } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import { isWithinInterval, parse, format } from "date-fns";

interface TodayScheduleProps {
  schedule: ScheduleItem[];
  show: (resource: string, id: string) => void;
}

export const TodaySchedule = ({ schedule, show }: TodayScheduleProps) => {
  const now = new Date();

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
          schedule.map((item) => {
            // Check if class is currently live
            let isLive = false;
            try {
              const startTime = parse(item.todaySchedule?.startTime || "", "HH:mm", now);
              const endTime = parse(item.todaySchedule?.endTime || "", "HH:mm", now);
              isLive = isWithinInterval(now, { start: startTime, end: endTime });
            } catch (e) { /* ignore parse errors */ }

            return (
              <div 
                key={item.id} 
                className={cn(
                  "relative pl-4 border-l-2 py-2 group transition-all duration-300 hover:bg-primary/5 rounded-r-xl cursor-pointer",
                  isLive ? "border-primary bg-primary/5" : "border-primary/20"
                )}
                onClick={() => show("classes", item.id.toString())}
              >
                <div className="flex items-start justify-between gap-2 pr-2">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-sm font-black leading-none transition-colors",
                        isLive ? "text-primary" : "group-hover:text-primary"
                      )}>
                        {item.name}
                      </p>
                      {isLive && (
                        <Badge variant="default" className="h-4 px-1.5 text-[8px] uppercase font-black animate-pulse bg-primary text-primary-foreground">
                          <Radio className="h-2 w-2 mr-1" /> Live
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
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
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      isLive ? "opacity-100 bg-primary text-primary-foreground" : "opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-primary-foreground"
                    )}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })
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
