import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";
import { ScheduleItem } from "@/types/dashboard";

interface TodayScheduleProps {
  schedule: ScheduleItem[];
  show: (resource: string, id: string) => void;
}

export const TodaySchedule = ({ schedule, show }: TodayScheduleProps) => (
    <Card className="border-none shadow-xl overflow-hidden bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader className="pb-6 border-b border-black/5 dark:border-white/5 bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-3 font-black">
                <div className="p-2 bg-primary/20 rounded-lg">
                    <Clock className="h-5 w-5 text-primary" />
                </div>
                Today's Schedule
            </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
            {schedule.length > 0 ? (
                <div className="space-y-4">
                    {schedule.map((item) => (
                        <div 
                            key={item.id} 
                            className="group relative flex flex-col gap-3 p-5 rounded-2xl bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/10 hover:border-primary/40 hover:bg-white/50 transition-all cursor-pointer shadow-sm"
                            onClick={() => show("classes", item.id)}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-base font-black truncate pr-2 group-hover:text-primary transition-colors">{item.name}</span>
                                <div className="px-3 py-1 rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-lg shadow-primary/20">
                                    {item.todaySchedule?.startTime}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                                <Clock className="h-4 w-4 text-primary/60" />
                                <span>{item.todaySchedule?.startTime} - {item.todaySchedule?.endTime}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 opacity-40">
                    <Calendar className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">No classes today</p>
                </div>
            )}
        </CardContent>
    </Card>
);
