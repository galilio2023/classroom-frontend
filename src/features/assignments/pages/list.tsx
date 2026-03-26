import { useRef } from "react";
import { useUserRole } from "@/hooks/use-user-role";
import { Assignment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGo, useList } from "@refinedev/core";
import { PlusCircle, FileText, Calendar, Clock, Edit3, ArrowRight, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CanAccess } from "@/components/auth/can-access";
import "dayjs/locale/ar";

dayjs.extend(relativeTime);

interface AssignmentListProps {
  classId: string;
}

export const AssignmentList = ({ classId }: AssignmentListProps) => {
  const { t, i18n } = useTranslation();
  const go = useGo();
  const { isStaff } = useUserRole();
  const isAr = i18n.language === "ar";

  if (isAr) dayjs.locale("ar");
  else dayjs.locale("en");

  const { query: { data, isLoading, isError } } = useList<Assignment>({
    resource: "assignments",
    filters: [{ field: "classId", operator: "eq", value: classId }],
    sorters: [{ field: "createdAt", order: "desc" }],
    queryOptions: { enabled: !!classId },
  });

  const assignments = data?.data || [];

  const handleCreate = () => {
    go({
      to: `/assignments/create?classId=${classId}`,
      type: "push",
    });
  };

  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: assignments.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 90,
    overscan: 5,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-start">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{t("assignments.list.loading", "Loading Assignments...")}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-start text-destructive">
        <p className="font-bold">Failed to load assignments</p>
      </div>
    );
  }

  return (
    <Card className="border border-border/80 dark:border-white/5 shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden rounded-[2rem]">
      <CardHeader className="p-8 pb-4 flex flex-row items-center justify-between border-b border-black/[0.03] dark:border-white/[0.03]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <CardTitle className="text-xl font-black uppercase tracking-widest">{t("assignments.list.title")}</CardTitle>
          <Badge variant="secondary" className="rounded-full px-2 py-0 h-5 text-[10px] font-bold">
            {assignments.length}
          </Badge>
        </div>
        
        <CanAccess resource="assignments" action="create" params={{ classId }}>
            <Button 
                onClick={handleCreate}
                className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-4 gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
                <PlusCircle className="h-4 w-4" />
                {t("buttons.createAssignment")}
            </Button>
        </CanAccess>
      </CardHeader>
      <CardContent className="p-0">
        {assignments.length > 0 ? (
          <div 
            ref={parentRef}
            className="h-[500px] overflow-auto pr-2 custom-scrollbar"
          >
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
              {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                const assignment = assignments[virtualItem.index];
                const date = assignment.dueDate ? dayjs(assignment.dueDate) : null;
                const isOverdue = date ? dayjs().isAfter(date) : false;
                const isSoon = date ? dayjs().add(2, 'day').isAfter(date) && !isOverdue : false;

                return (
                  <motion.div
                    key={virtualItem.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: virtualItem.index * 0.02 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    className="flex items-center px-8 py-4 border-b border-primary/5 hover:bg-primary/[0.02] transition-colors group cursor-pointer"
                    onClick={() => go({ to: `/assignments/show/${assignment.id}`, type: "push" })}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col min-w-0 items-start">
                        <span className="font-black text-base tracking-tight truncate group-hover:text-primary transition-colors">
                          {assignment.title}
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                          {date ? (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                              <Calendar className={cn("h-3 w-3", isOverdue ? "text-destructive" : "text-primary")} />
                              <span className={cn(isOverdue && "text-destructive")}>{date.format("MMM D, YYYY")}</span>
                              <span className="mx-1 opacity-20">•</span>
                              <Clock className="h-3 w-3 opacity-40" />
                              <span className={cn(
                                isOverdue ? "text-destructive" : isSoon ? "text-amber-600" : "text-muted-foreground/40"
                              )}>
                                {date.fromNow()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 italic">{t("assignments.list.labels.noDeadline")}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 ml-4">
                      <Badge 
                        variant={isOverdue ? "destructive" : "secondary"} 
                        className={cn(
                          "hidden sm:flex text-[9px] font-black uppercase tracking-widest px-3 h-6 rounded-lg border-none",
                          !isOverdue && "bg-green-500/10 text-green-600"
                        )}
                      >
                        {isOverdue ? t("status.completed") : t("status.active")}
                      </Badge>

                      <div className="flex items-center gap-2">
                        <CanAccess resource="assignments" action="edit" id={assignment.id}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-primary/5 hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              go({ to: `/assignments/edit/${assignment.id}`, type: "push" });
                            }}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </CanAccess>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-muted-foreground group-hover:text-primary"
                        >
                          <ArrowRight className={cn("h-4 w-4", isAr && "rotate-180")} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-20">
            <EmptyState
              icon={FileText}
              title={t("assignments.list.noAssignments")}
              description={isStaff ? t("assignments.list.noAssignmentsDescriptionTeacher") : t("assignments.list.noAssignmentsDescriptionStudent")}
              action={isStaff ? {
                label: t("buttons.createAssignment"),
                onClick: handleCreate,
              } : undefined}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
