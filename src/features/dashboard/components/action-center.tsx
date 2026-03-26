import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ActionPriority = "urgent" | "normal" | "success" | "ai";

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: ActionPriority;
  icon?: React.ElementType;
  onClick: () => void;
  actionText: string;
}

interface ActionCenterProps {
  title: string;
  actions: ActionItem[];
  emptyMessage: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionText?: string;
}

const getPriorityStyles = (priority: ActionPriority) => {
  switch (priority) {
    case "urgent":
      return "bg-destructive/10 text-destructive border-destructive/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
    case "success":
      return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
    case "ai":
      return "bg-ai-primary/10 text-ai-primary border-ai-primary/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]";
    case "normal":
    default:
      return "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]";
  }
};

const getPriorityIcon = (priority: ActionPriority) => {
  switch (priority) {
    case "urgent":
      return AlertCircle;
    case "success":
      return CheckCircle2;
    case "ai":
      return Sparkles;
    case "normal":
    default:
      return Clock;
  }
};

export const ActionCenter = ({
  title,
  actions,
  emptyMessage,
  emptyDescription,
  onEmptyAction,
  emptyActionText,
}: ActionCenterProps) => {
  if (actions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      >
        <Card className="border-none bg-gradient-to-br from-background via-background to-primary/5 shadow-2xl rounded-[2.5rem] overflow-hidden group">
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.03] pointer-events-none" />
          <CardContent className="p-10 md:p-16 flex flex-col items-center justify-center text-center relative z-10">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="p-6 rounded-full bg-emerald-500/10 text-emerald-500 mb-6 shadow-inner border border-emerald-500/5"
            >
              <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12 animate-pulse" />
            </motion.div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-3">
              {emptyMessage}
            </h3>
            {emptyDescription && (
              <p className="text-muted-foreground font-medium mb-8 max-w-md mx-auto leading-relaxed">
                {emptyDescription}
              </p>
            )}
            {onEmptyAction && emptyActionText && (
              <Button
                onClick={onEmptyAction}
                size="lg"
                className="rounded-2xl font-black uppercase tracking-widest h-14 px-10 shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
              >
                <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                {emptyActionText}
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 px-2">
        <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60">
          {title}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-muted-foreground/10 to-transparent" />
      </div>

      <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        <AnimatePresence mode="popLayout">
          {actions.map((action, index) => {
            const Icon = action.icon || getPriorityIcon(action.priority);
            const styles = getPriorityStyles(action.priority);

            return (
              <motion.div
                key={action.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                  ease: [0.23, 1, 0.32, 1],
                }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={cn(
                  "relative p-6 rounded-[2rem] border shadow-lg flex flex-col group cursor-pointer overflow-hidden transition-all duration-500",
                  action.priority === "urgent"
                    ? "bg-destructive/[0.01] border-destructive/10 hover:border-destructive/30 hover:shadow-destructive/5"
                    : action.priority === "ai"
                      ? "bg-ai-primary/[0.01] border-ai-primary/10 hover:border-ai-primary/30 hover:shadow-ai-primary/5"
                      : "bg-background/40 border-border/40 hover:border-primary/30 hover:shadow-primary/5",
                )}
                onClick={action.onClick}
              >
                {/* Visual Glow */}
                <div
                  className={cn(
                    "absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-700",
                    action.priority === "urgent"
                      ? "bg-destructive"
                      : action.priority === "ai"
                        ? "bg-ai-primary"
                        : "bg-primary",
                  )}
                />

                <div className="flex items-start gap-5 mb-6">
                  <div
                    className={cn(
                      "p-3.5 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                      styles,
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 mt-1 text-start">
                    <h3 className="text-lg font-black leading-tight tracking-tight">
                      {action.title}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground font-medium flex-1 text-start leading-relaxed">
                  {action.description}
                </p>

                <div className="mt-8 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-[0.2em] transition-colors mb-1",
                        action.priority === "urgent"
                          ? "text-destructive/60"
                          : action.priority === "ai"
                            ? "text-ai-primary/60"
                            : "text-primary/60",
                      )}
                    >
                      Status
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-black uppercase tracking-[0.1em] transition-colors",
                        action.priority === "urgent"
                          ? "text-destructive"
                          : action.priority === "ai"
                            ? "text-ai-primary"
                            : "text-primary",
                      )}
                    >
                      {action.actionText}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "p-2 rounded-xl bg-background border shadow-sm transition-all duration-500 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 group-hover:bg-primary group-hover:text-white",
                      action.priority === "urgent"
                        ? "border-destructive/10 text-destructive group-hover:bg-destructive"
                        : action.priority === "ai"
                          ? "border-ai-primary/10 text-ai-primary group-hover:bg-ai-primary"
                          : "border-primary/10 text-primary",
                    )}
                  >
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
