import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ArrowRight,
  FileText,
  Clock,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { UpcomingAssignment } from "@/types/dashboard";
import { formatDistanceToNow, isWithinInterval, addHours } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AssignmentItemCardProps {
  assignment: UpcomingAssignment;
  onOpen: (id: string) => void;
}

export const AssignmentItemCard: React.FC<AssignmentItemCardProps> = ({
  assignment,
  onOpen,
}) => {
  const dueDate = new Date(assignment.dueDate);
  const isUrgent = isWithinInterval(dueDate, {
    start: new Date(),
    end: addHours(new Date(), 48),
  });

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="w-full"
    >
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-500 border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-4xl cursor-pointer",
          isUrgent
            ? "bg-destructive/3 border border-destructive/20 shadow-destructive/5"
            : "hover:shadow-2xl hover:bg-card/80 border border-transparent hover:border-primary/20",
        )}
        onClick={() => onOpen(assignment.id.toString())}
      >
        {/* Top Accent Bar */}
        <div
          className={cn(
            "absolute top-0 start-0 w-full h-1.5 transition-all duration-500",
            isUrgent
              ? "bg-destructive animate-pulse"
              : "bg-primary/20 group-hover:bg-primary",
          )}
        />

        <div className="p-6 space-y-6">
          <div className="flex items-start justify-between">
            <div
              className={cn(
                "p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                isUrgent
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary",
              )}
            >
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex flex-col items-end gap-2">
              {isUrgent && (
                <Badge
                  variant="destructive"
                  className="h-5 px-2 rounded-full font-black text-[9px] uppercase tracking-widest animate-pulse border-none shadow-lg shadow-destructive/20"
                >
                  <AlertCircle className="h-2.5 w-2.5 me-1" />
                  Urgent
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="h-5 px-3 rounded-full font-black text-[9px] uppercase tracking-widest bg-muted/50 border-none"
              >
                {assignment.class?.name}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {assignment.title}
            </h4>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3 opacity-40" />
                <span>Due {dueDate.toLocaleDateString()}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
              <div
                className={cn(
                  "flex items-center gap-1.5",
                  isUrgent ? "text-destructive font-black" : "text-primary/60",
                )}
              >
                <Clock className="h-3 w-3 opacity-40" />
                <span>{formatDistanceToNow(dueDate, { addSuffix: true })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-black/3 dark:border-white/3">
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
              <Sparkles className="h-3 w-3" />
              <span>Ready to submit</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className={cn(
                "h-9 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 transition-all shadow-sm",
                isUrgent
                  ? "bg-destructive text-white hover:bg-destructive/90 shadow-destructive/20"
                  : "bg-primary/5 text-primary hover:bg-primary hover:text-primary-foreground shadow-primary/20",
              )}
            >
              Open Task
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
