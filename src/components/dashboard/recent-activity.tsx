import { useCustom, HttpError } from "@refinedev/core";
import { Bell, CheckCheck, Info, GraduationCap, ClipboardCheck, Trophy, BrainCircuit, ArrowRight, History, Sparkles, Clock } from "lucide-react";
import { Notification } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";

interface RecentActivityProps {
  limit?: number;
}

export const RecentActivity = ({ limit = 5 }: RecentActivityProps) => {
  const { query } = useCustom<Notification[], HttpError>({
    url: "/notifications",
    method: "get",
    config: {
        query: {
            _limit: limit,
            _sort: "createdAt",
            _order: "desc"
        }
    }
  });

  const notifications = query.data?.data || [];
  const isLoading = query.isLoading;

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment": return { icon: GraduationCap, color: "text-blue-500", bg: "bg-blue-500/10" };
      case "grade": return { icon: CheckCheck, color: "text-success", bg: "bg-success/10" };
      case "attendance": return { icon: ClipboardCheck, color: "text-orange-500", bg: "bg-orange-500/10" };
      case "achievement": return { icon: Trophy, color: "text-gold-primary", bg: "bg-gold-primary/10" };
      case "agent_alert": return { icon: BrainCircuit, color: "text-ai-primary", bg: "bg-ai-primary/10" };
      default: return { icon: Info, color: "text-muted-foreground", bg: "bg-muted/10" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <History className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Recent Activity</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 gap-2 group transition-all"
        >
          View All 
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      <div className="bg-card/50 backdrop-blur-xl rounded-[2rem] border border-black/[0.05] dark:border-white/[0.05] overflow-hidden shadow-2xl">
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-6 space-y-6">
              {[...Array(limit)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/2 rounded-full" />
                      <Skeleton className="h-3 w-1/4 rounded-full" />
                    </div>
                    <Skeleton className="h-3 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center p-8 gap-4 opacity-20">
              <div className="p-6 rounded-full bg-muted/50">
                <Bell className="h-12 w-12" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-black tracking-tight">No activity yet</p>
                <p className="text-sm font-medium">Updates will appear here as they happen.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              <AnimatePresence mode="popLayout">
                {notifications.map((notification: Notification, index: number) => {
                  const { icon: Icon, color, bg } = getIcon(notification.type);
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex gap-5 p-6 transition-all duration-300 hover:bg-primary/[0.02] group cursor-pointer relative",
                        index !== notifications.length - 1 && "border-b border-black/[0.03] dark:border-white/[0.03]"
                      )}
                    >
                      <div className="shrink-0">
                        <div className={cn(
                          "p-3 rounded-2xl shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                          bg
                        )}>
                          <Icon className={cn("h-5 w-5", color)} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-sm font-black tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                            {notification.title}
                          </span>
                          <span className="text-[9px] font-black text-muted-foreground/40 whitespace-nowrap uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="h-2.5 w-2.5" />
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-muted-foreground/80 line-clamp-2 leading-relaxed">
                          {notification.message}
                        </p>
                        {notification.type === 'agent_alert' && (
                          <div className="mt-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-ai-primary/60">
                            <Sparkles className="h-2.5 w-2.5" />
                            AI Insight Available
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
