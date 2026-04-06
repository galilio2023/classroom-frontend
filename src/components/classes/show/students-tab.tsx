import { useMemo, useState } from "react";
import { Enrollment, User } from "@/types";
import { HttpError, GetListResponse } from "@refinedev/core";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  TrendingDown,
  BrainCircuit,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { BulkEnrollDialog } from "./bulk-enroll-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AIRiskBadge, AIRiskLevel } from "@/components/ai-risk-badge";
import { AiFeatureGuard } from "../../ai/AiFeatureGuard";
import { useAiAccess } from "@/hooks/use-ai-access";
import dayjs from "dayjs";

interface StudentsTabProps {
  classId: string;
  approvedCount: number;
  pendingEnrollments: Enrollment[];
  isStaff: boolean;
  onInsight: (student: { id: string; name: string }) => void;
  onUnenroll: (id: number) => void;
  onEnrollClick: () => void;
  onMessageAllClick: () => void;
  onEnrollmentAction: (id: number, status: "approved" | "rejected") => void;
}

export const StudentsTab = ({
  classId,
  approvedCount,
  pendingEnrollments,
  isStaff,
  onInsight,
  onUnenroll,
  onEnrollClick,
  onMessageAllClick,
  onEnrollmentAction,
}: StudentsTabProps) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  /**
   * ARCHITECTURAL PATTERN: Optimistic Update Helper
   * Manually updates the React Query cache before the server responds.
   */
  const handleOptimisticEnrollment = async (id: number, status: "approved" | "rejected") => {
    // 1. Trigger the actual mutation (which remains passed from the parent for consistency)
    onEnrollmentAction(id, status);

    // 2. Perform manual cache manipulation for instant UI feedback
    const queryKey = ["enrollments", "list"];

    // We update both the specific enrollment list and general dashboard stats
    await queryClient.cancelQueries({ queryKey });

    queryClient.setQueriesData({ queryKey }, (old: GetListResponse<Enrollment> | undefined) => {
      if (!old?.data) return old;
      return {
        ...old,
        data: old.data.map((e: Enrollment) => (e.id === id ? { ...e, status } : e)),
      };
    });
  };

  const columns = useMemo<ColumnDef<Enrollment>[]>(
    () => [
      {
        id: "student",
        header: () => (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("classes.show.students.table.student" as any)}
          </p>
        ),
        accessorKey: "student",
        cell: ({ getValue, row }) => {
          const student = getValue<User>();
          const isWaitlisted = row.original.status === "waitlisted";
          const isPending = row.original.status === "pending";
          const riskAssessment = row.original.riskAssessment;

          return (
            <div className="flex items-center gap-3 py-1">
              <Avatar className="size-9 md:size-10 border-2 border-background shadow-sm rounded-lg md:rounded-xl">
                {student.image && (
                  <AvatarImage src={student.image} alt={student.name} className="object-cover" />
                )}
                <AvatarFallback className="bg-primary/5 text-primary font-black text-[10px] md:text-xs">
                  {student.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col truncate text-start min-w-0">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <span className="font-black text-xs md:text-sm tracking-tight truncate text-foreground">
                    {student.name}
                  </span>

                  {isStaff && riskAssessment && (
                    <AiFeatureGuard silent>
                      <AIRiskBadge riskLevel={riskAssessment.riskLevel as AIRiskLevel} />
                    </AiFeatureGuard>
                  )}

                  {/* 🧠 LEARNING DNA TOOLTIP (Staff Only) */}
                  {isStaff && student.persona && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1 rounded-md bg-ai-primary/10 text-ai-primary cursor-help hover:bg-ai-primary/20 transition-colors">
                          <BrainCircuit className="h-3 w-3" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="max-w-xs p-4 rounded-2xl bg-card/95 backdrop-blur-xl border-ai-primary/20 shadow-2xl z-50"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-2">
                            <Sparkles className="h-3 w-3 text-ai-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-ai-primary">
                              Learning DNA
                            </span>
                          </div>
                          <p className="text-xs font-medium leading-relaxed italic wrap-break-word whitespace-pre-wrap">
                            "{student.persona.learningDNA}"
                          </p>
                          <div className="pt-2 flex justify-between items-center text-[8px] font-bold text-muted-foreground uppercase">
                            <span>Tone: {student.persona.preferredTone}</span>
                            <span>
                              Updated: {dayjs(student.persona.lastSummarizedAt).fromNow()}
                            </span>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {isWaitlisted && (
                    <Badge
                      variant="outline"
                      className="bg-orange-500/10 text-orange-600 border-none text-[7px] md:text-[8px] font-black uppercase tracking-tighter px-1.5 md:px-2 py-0 h-3.5 md:h-4 shrink-0"
                    >
                      {t("classes.show.students.table.waitlist", {
                        pos: row.original.waitlistPosition,
                      })}
                    </Badge>
                  )}
                  {isPending && (
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-600 border-none text-[7px] md:text-[8px] font-black uppercase tracking-tighter px-1.5 md:px-2 py-0 h-3.5 md:h-4 shrink-0"
                    >
                      {t("classes.show.students.pending.title")}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold truncate">
                    {student.email}
                  </span>
                  {isStaff &&
                    riskAssessment?.predictedGrade &&
                    riskAssessment.riskLevel !== "low" && (
                      <span className="text-[9px] font-black text-destructive flex items-center gap-0.5">
                        <TrendingDown className="h-2.5 w-2.5" />
                        AI: {Math.round(riskAssessment.predictedGrade)}%
                      </span>
                    )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">
            {t("classes.show.students.table.actions" as any)}
          </p>
        ),
        cell: ({ row }) => (
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-primary transition-colors"
              onClick={() =>
                onInsight({ id: row.original.studentId, name: row.original.student?.name || "" })
              }
            >
              <Sparkles className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
              onClick={() => onUnenroll(row.original.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [t, isStaff, onInsight, onUnenroll]
  );

  const { isAiEnabled } = useAiAccess();

  const table = useTable<Enrollment, HttpError, Enrollment>({
    refineCoreProps: {
      resource: "enrollments",
      filters: {
        initial: [{ field: "classId", operator: "eq", value: classId }],
      },
      meta: {
        includeAi: isAiEnabled,
      },
    },
    columns,
  });

  return (
    <TooltipProvider>
      <div className="space-y-10">
        {/* --- STATS & ACTIONS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-4xl border-none shadow-xl shadow-primary/5 bg-primary/5 border border-primary/10 overflow-hidden">
            <CardContent className="p-8 flex items-center gap-6">
              <div className="p-4 rounded-3xl bg-primary/10 text-primary">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                  {t("classes.show.students.stats.totalStudents" as any)}
                </p>
                <h3 className="text-3xl font-black tracking-tight">{approvedCount}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 rounded-4xl border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center md:text-start">
                <h4 className="font-black text-lg tracking-tight">
                  {t("classes.show.students.actions.title" as any)}
                </h4>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("classes.show.students.actions.description" as any)}
                </p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[10px] gap-2 border-primary/20 text-primary hover:bg-primary/5 transition-all"
                  onClick={() => setBulkDialogOpen(true)}
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  {t("classes.show.students.actions.bulkEnroll")}
                </Button>
                <Button
                  className="flex-1 md:flex-none rounded-2xl h-12 px-8 font-black uppercase tracking-widest text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                  onClick={onEnrollClick}
                >
                  <UserPlus className="h-4 w-4" />
                  {t("classes.show.students.actions.enroll")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* --- PENDING REQUESTS --- */}
        {pendingEnrollments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 px-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <h3 className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">
                {t("classes.show.students.pending.title")} ({pendingEnrollments.length})
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {pendingEnrollments.map((enrollment) => (
                  <motion.div
                    key={enrollment.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="rounded-3xl border-none shadow-lg bg-card/80 backdrop-blur-md overflow-hidden group hover:shadow-xl transition-all">
                      <CardContent className="p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Avatar className="h-10 w-10 rounded-2xl border-2 border-background shadow-sm">
                            <AvatarFallback className="bg-blue-500/10 text-blue-600 font-black text-xs">
                              {enrollment.student?.name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="overflow-hidden">
                            <p className="font-black text-sm truncate">
                              {enrollment.student?.name}
                            </p>
                            <p className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-tighter">
                              {dayjs(enrollment.createdAt).fromNow()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 rounded-xl text-emerald-600 hover:bg-emerald-500/10"
                            onClick={() => handleOptimisticEnrollment(enrollment.id, "approved")}
                          >
                            <CheckCircle2 className="h-5 w-5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-9 w-9 p-0 rounded-xl text-destructive hover:bg-destructive/10"
                            onClick={() => handleOptimisticEnrollment(enrollment.id, "rejected")}
                          >
                            <XCircle className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* --- ROSTER TABLE --- */}
        <Card className="rounded-[2.5rem] md:rounded-[3rem] border-none shadow-2xl shadow-primary/5 bg-card/30 backdrop-blur-xl overflow-hidden">
          <CardHeader className="p-8 md:p-10 border-b border-border/40 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black tracking-tight">
                {t("classes.show.students.table.title")}
              </CardTitle>
              <CardDescription className="font-bold text-muted-foreground/80">
                {t("classes.show.students.table.description")}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl h-10 px-4 font-black uppercase tracking-widest text-[10px] gap-2"
              onClick={onMessageAllClick}
            >
              <MessageSquare className="h-4 w-4" />
              {t("classes.show.students.actions.messageAll")}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-125">
              <div className="p-4 md:p-6">
                <DataTable table={table} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <BulkEnrollDialog
          open={bulkDialogOpen}
          onOpenChange={setBulkDialogOpen}
          classId={classId}
        />
      </div>
    </TooltipProvider>
  );
};
