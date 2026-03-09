import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Sparkles, Calendar, ArrowRight, Info } from "lucide-react";
import { ScheduleItem } from "@/types/dashboard";
import { ScheduleItemCard } from "./schedule-item-card";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface TodayScheduleProps {
  schedule: ScheduleItem[];
  show: (resource: string, id: string) => void;
}

export const TodaySchedule = ({ schedule, show }: TodayScheduleProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] relative group">
        {/* Premium Background Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none group-hover:bg-primary/10 transition-colors duration-700" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-ai-primary/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />
        
        <CardHeader className="p-8 pb-4 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black flex items-center gap-3 tracking-tighter">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
                <Clock className="h-6 w-6" />
              </div>
              Today's Schedule
            </CardTitle>
            <Badge variant="secondary" className="rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-none">
              {schedule.length} Classes
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-8 pt-4 space-y-6 relative">
          <AnimatePresence mode="popLayout">
            {schedule.length > 0 ? (
              <div className="grid gap-4">
                {schedule.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ScheduleItemCard 
                      item={item} 
                      onClick={(id) => show("classes", id)} 
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 border-none shadow-inner bg-muted/20 rounded-[2rem] flex flex-col items-center gap-4 group/empty overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative p-5 rounded-full bg-primary/10 text-primary group-hover/empty:scale-110 transition-transform duration-500">
                    <Calendar className="h-10 w-10" />
                  </div>
                </div>
                <div className="space-y-1 relative z-10">
                  <p className="text-xl font-black tracking-tight text-foreground">Free Day!</p>
                  <p className="text-sm font-medium text-muted-foreground/60">No classes scheduled for today.</p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60 relative z-10">
                  <Sparkles className="h-3 w-3" />
                  <span>Enjoy your time off</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {schedule.length > 0 && (
            <div className="pt-4 border-t border-black/[0.03] dark:border-white/[0.03] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
              <Info className="h-3 w-3" />
              <span>Click a class to enter the room</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
