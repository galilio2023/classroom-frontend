import { useCustom } from "@refinedev/core";
import { Bell, CheckCheck, Info, GraduationCap, ClipboardCheck, Trophy, BrainCircuit, ArrowRight } from "lucide-react";
import { Notification } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentActivityProps {
  limit?: number;
}

export const RecentActivity = ({ limit = 5 }: RecentActivityProps) => {
  const { data, isLoading } = useCustom<Notification[]>({
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

  const notifications = data?.data || [];

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment": return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case "grade": return <CheckCheck className="h-4 w-4 text-green-500" />;
      case "attendance": return <ClipboardCheck className="h-4 w-4 text-orange-500" />;
      case "achievement": return <Trophy className="h-4 w-4 text-yellow-500" />;
      case "agent_alert": return <BrainCircuit className="h-4 w-4 text-purple-500" />;
      default: return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Recent Activity</h3>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
          View All <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>

      <div className="sidebar-glass rounded-3xl border border-border/50 overflow-hidden shadow-sm">
        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="p-4 space-y-4">
              {[...Array(limit)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[320px] text-center p-6">
              <div className="p-4 bg-muted/20 rounded-full mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No recent activity</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-4 p-4 transition-all duration-200 hover:bg-muted/30 group",
                    index !== notifications.length - 1 && "border-b border-border/30"
                  )}
                >
                  <div className="shrink-0">
                    <div className="p-2.5 bg-background rounded-xl shadow-sm border border-border/50 group-hover:scale-110 transition-transform duration-200">
                      {getIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground truncate">
                        {notification.title}
                      </span>
                      <span className="text-[9px] font-black text-muted-foreground/60 whitespace-nowrap uppercase tracking-tighter">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
