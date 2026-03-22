import { useMemo, useState } from "react";
import { Enrollment, User } from "@/types";
import { HttpError, useInvalidate } from "@refinedev/core";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Calendar,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  MessageSquare,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  ShieldAlert,
  TrendingDown,
  BrainCircuit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { BulkEnrollDialog } from "./bulk-enroll-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const isAr = i18n.language === "ar";
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
    
    queryClient.setQueriesData({ queryKey }, (old: any) => {
        if (!old?.data) return old;
        return {
            ...old,
            data: old.data.map((e: Enrollment) => e.id === id ? { ...e, status } : e)
        };
    });
  };

  const columns = useMemo<ColumnDef<Enrollment>[]>(
    () => [
      {
        id: "student",
        header: () => (
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("classes.show.students.table.student")}
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
                  <AvatarImage
                    src={student.image}
                    alt={student.name}
                    className="object-cover"
                  />
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
                  
                  {isStaff && row.original.riskAssessment && row.original.riskAssessment.riskLevel !== "low" && (
                    <Badge 
                        variant="destructive" 
                        className={cn(
                            "border-none text-[7px] md:text-[8px] font-black uppercase tracking-tighter px-1.5 md:px-2 py-0 h-3.5 md:h-4 shrink-0 gap-1",
                            row.original.riskAssessment.riskLevel === "critical" ? "bg-red-600 text-white animate-pulse" : 
                            row.original.riskAssessment.riskLevel === "high" ? "bg-orange-600 text-white" : "bg-yellow-500 text-white"
                        )}
                    >
                        <ShieldAlert className="h-2 w-2" />
                        {row.original.riskAssessment.riskLevel}
                    </Badge>
                  )}

                  {/* 🧠 LEARNING DNA TOOLTIP (Staff Only) */}
                  {isStaff && student.persona && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="p-1 rounded-md bg-ai-primary/10 text-ai-primary cursor-help hover:bg-ai-primary/20 transition-colors">
                                    <BrainCircuit className="h-3 w-3" />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-xs p-4 rounded-2xl bg-card/95 backdrop-blur-xl border-ai-primary/20 shadow-2xl z-50">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 border-b border-border/40 pb-2 mb-2">
                                        <Sparkles className="h-3 w-3 text-ai-primary" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-ai-primary">Learning DNA</span>
                                    </div>
                                    <p className="text-xs font-medium leading-relaxed italic break-words whitespace-pre-wrap">
                                        "{student.persona.learningDNA}"
                                    </p>
                                    <div className="pt-2 flex justify-between items-center text-[8px] font-bold text-muted-foreground uppercase">
                                        <span>Tone: {student.persona.preferredTone}</span>
                                        <span>Updated: {dayjs(student.persona.lastSummarizedAt).fromNow()}</span>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
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
                  {isStaff && riskAssessment && riskAssessment.riskLevel !== "low" && (
                    <Badge
                      variant="destructive"
                      className={cn(
                        "border-none text-[7px] md:text-[8px] font-black uppercase tracking-tighter px-1.5 md:px-2 py-0 h-3.5 md:h-4 shrink-0 gap-1",
                        riskAssessment.riskLevel === "critical" ? "bg-red-600 text-white animate-pulse" : 
                        riskAssessment.riskLevel === "high" ? "bg-orange-600 text-white" : "bg-yellow-500 text-white"
                      )}
                    >
                      <ShieldAlert className="h-2 w-2" />
                      {riskAssessment.riskLevel}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] md:text-[10px] text-muted-foreground font-bold truncate">
                    {student.email}
                  </span>
                  {isStaff && riskAssessment?.predictedGrade && (
                    <span className="text-[9px] font-black text-destructive flex items-center gap-0.5">
                      <TrendingDown className="h-2.5 w-2.5" />
                      AI: {riskAssessment.predictedGrade}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: () => (
          <p className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            {t("classes.show.students.table.enrolledOn")}
          </p>
        ),
        cell: ({ getValue }) => (
          <div className="hidden sm:flex items-center gap-2 text-[10px] md:text-xs font-bold text-muted-foreground">
            <Calendar className="h-3 md:h-3.5 w-3 md:w-3.5 opacity-40" />
            <span className="whitespace-nowrap">
              {new Date(getValue<string>()).toLocaleDateString(
                isAr ? "ar-EG" : "en-US",
                { month: "short", day: "numeric", year: "numeric" },
              )}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className={cn("flex items-center gap-1.5 md:gap-2 justify-end")}>
            {isStaff && row.original.status === "approved" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 md:h-9 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest gap-1.5 md:gap-2 border-ai-primary/20 hover:bg-ai-primary/5 text-ai-primary transition-all shadow-sm px-2 md:px-3"
                onClick={() =>
                  onInsight({
                    id: row.original.student.id,
                    name: row.original.student.name,
                  })
                }
              >
                <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5" />
                <span className="hidden xs:inline">
                  {t("buttons.aiInsight")}
                </span>
              </Button>
            )}
            {isStaff && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-9 md:w-9 rounded-lg md:rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                onClick={() => onUnenroll(row.original.id)}
              >
                <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [isStaff, t, isAr, onInsight, onUnenroll],
  );

  const enrollmentsTable = useTable<Enrollment, HttpError>({
    columns,
    refineCoreProps: {
      resource: "enrollments",
      filters: {
        initial: [
          {
            field: "classId",
            operator: "eq",
            value: classId,
          },
          {
            field: "status",
            operator: "in",
            value: ["approved", "waitlisted"],
          },
        ],
      },
      pagination: {
        pageSize: 50,
      },
      syncWithLocation: false,
    },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-10 items-start">
      <div className="lg:col-span-3 space-y-6 md:space-y-8">
        <Card className="rounded-4xl md:rounded-[2.5rem] border-none shadow-2xl shadow-black/5 overflow-hidden bg-card/50 backdrop-blur-3xl">
          <CardHeader className="p-6 md:p-10 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-black/3 dark:border-white/3 bg-muted/30">
            <div className="space-y-1.5 md:space-y-2 text-start">
              <div className="flex items-center gap-3">
                <div className="p-2 md:p-3 rounded-xl md:rounded-2xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
                  <Users className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <CardTitle className="text-xl md:text-2xl font-black tracking-tight text-foreground">
                  {t("classes.show.students.table.title")}
                </CardTitle>
              </div>
              <CardDescription className="text-xs md:text-sm text-muted-foreground font-medium px-1">
                {t("classes.show.students.table.description", {
                  count: approvedCount,
                })}
              </CardDescription>
            </div>
            {isStaff && (
              <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onMessageAllClick}
                  className="flex-1 sm:flex-none rounded-xl md:rounded-2xl h-12 md:h-14 px-6 md:px-8 font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 border-primary/20 hover:bg-primary/10 transition-all text-primary shadow-sm"
                >
                  <MessageSquare className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden xs:inline">
                    {t("classes.show.students.actions.messageAll")}
                  </span>
                  <span className="xs:hidden">{t("classes.show.students.actions.message")}</span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setBulkDialogOpen(true)}
                  className="flex-1 sm:flex-none rounded-xl md:rounded-2xl h-12 md:h-14 px-6 md:px-8 font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 border-emerald-500/20 hover:bg-emerald-500/10 transition-all text-emerald-600 shadow-sm"
                >
                  <FileSpreadsheet className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden xs:inline">
                    {t("classes.show.students.actions.bulkEnroll", "Bulk Enroll")}
                  </span>
                  <span className="xs:hidden">{t("classes.show.students.actions.csv")}</span>
                </Button>
                <Button
                  size="lg"
                  onClick={onEnrollClick}
                  className="flex-1 sm:flex-none rounded-xl md:rounded-2xl h-12 md:h-14 px-6 md:px-8 font-black uppercase tracking-widest text-[9px] md:text-[10px] gap-2 shadow-xl shadow-primary/20 transition-all text-white bg-primary hover:bg-primary/90"
                >
                  <UserPlus className="h-4 w-4 md:h-5 md:w-5" />
                  <span className="hidden xs:inline">
                    {t("classes.show.students.actions.enrollStudent")}
                  </span>
                  <span className="xs:hidden">{t("classes.show.students.actions.enroll")}</span>
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto relative min-h-100">
            <DataTable table={enrollmentsTable} />
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Pending Requests */}
      {isStaff && (
        <div className="space-y-6 md:space-y-8 lg:sticky lg:top-40">
          <Card className="rounded-4xl md:rounded-[2.5rem] border-none shadow-2xl shadow-black/5 overflow-hidden bg-card/50 backdrop-blur-3xl">
            <CardHeader className="p-6 md:p-8 pb-4 bg-orange-500/5 border-b border-orange-500/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5 text-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 shadow-sm border border-orange-500/20">
                      <UserPlus className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-lg md:text-xl font-black tracking-tight text-foreground">
                      {t("classes.show.students.pending.title")}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-orange-600/80 px-1">
                    {t("classes.show.students.pending.count", {
                      count: pendingEnrollments.length,
                    })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-125">
                <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                  {pendingEnrollments.length === 0 ? (
                    <div className="text-center py-10 md:py-16 space-y-3 opacity-40">
                      <UserPlus className="h-8 w-8 md:h-12 md:w-12 mx-auto text-muted-foreground" />
                      <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-muted-foreground">
                        {t("classes.show.students.pending.empty")}
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence mode="popLayout">
                      {pendingEnrollments.map(
                        (enrollment: Enrollment, index: number) => (
                          <motion.div
                            key={enrollment.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 md:p-5 rounded-2xl md:rounded-3xl bg-orange-500/3 border border-orange-500/10 transition-all hover:bg-orange-500/10 hover:border-orange-500/20 group shadow-sm"
                          >
                            <div className="flex items-center gap-3 md:gap-4 min-w-0">
                              <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-background shadow-sm rounded-xl md:rounded-2xl group-hover:scale-105 transition-transform duration-500">
                                {enrollment.student.image && (
                                  <AvatarImage
                                    src={enrollment.student.image}
                                    alt={enrollment.student.name}
                                    className="object-cover"
                                  />
                                )}
                                <AvatarFallback className="bg-orange-500/10 text-orange-600 font-black text-xs md:text-sm">
                                  {enrollment.student.name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col text-start min-w-0">
                                <span className="text-sm md:text-base font-black tracking-tight truncate text-foreground group-hover:text-orange-700 transition-colors">
                                  {enrollment.student.name}
                                </span>
                                <span className="text-[9px] md:text-[10px] text-muted-foreground/80 font-bold uppercase tracking-widest truncate mt-0.5">
                                  {t("classes.show.students.pending.requested")}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 md:h-10 md:w-10 rounded-xl text-emerald-600 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                onClick={() =>
                                  handleOptimisticEnrollment(enrollment.id, "approved")
                                }
                              >
                                <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 md:h-10 md:w-10 rounded-xl text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive hover:text-white transition-all shadow-sm"
                                onClick={() =>
                                  handleOptimisticEnrollment(enrollment.id, "rejected")
                                }
                              >
                                <XCircle className="h-4 w-4 md:h-5 md:w-5" />
                              </Button>
                            </div>
                          </motion.div>
                        ),
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}

      <BulkEnrollDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        classId={classId}
      />
    </div>
  );
};
