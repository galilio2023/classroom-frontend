import React from "react";
import { useCustom, useNavigation, useCustomMutation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { useCapabilities } from "@/hooks/use-capabilities";
import { ListView } from "@/components/refine/views/list-view";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShieldAlert,
  TrendingUp,
  Zap,
  RefreshCw,
  AlertCircle,
  Clock,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

interface AtRiskStudent {
  studentId: string;
  studentName: string;
  studentImage: string | null;
  classId: string;
  className: string;
  riskScore: number;
  riskLevel: "medium" | "high" | "critical";
  lastActiveDate: string | null;
  reason: string;
}

const AtRiskPage: React.FC = () => {
  const { t } = useTranslation();
  const { isTeacher, isPrincipal, identity } = useCapabilities();
  const { push } = useNavigation() as any;

  const { query } = useCustom<AtRiskStudent[]>({
    url: `${import.meta.env.VITE_API_URL}/reports/at-risk`,
    method: "get",
  });

  const { data: queryData, isLoading, isError, refetch } = query;

  const { mutate: triggerIntervention, mutation: triggerMutation } = useCustomMutation();
  const isIntervening = triggerMutation.isPending;

  const handleIntervention = (student: AtRiskStudent) => {
    triggerIntervention(
      {
        url: `${import.meta.env.VITE_API_URL}/ai/intervention`,
        method: "post",
        values: {
          studentId: student.studentId,
          classId: student.classId,
          reason: `Manual intervention requested due to ${student.riskLevel} risk level.`,
        },
      },
      {
        onSuccess: () => {
          toast.success(`Intervention triggered for ${student.studentName}. AI Journey updated.`);
        },
        onError: () => {
          toast.error("Failed to trigger intervention. Please try again.");
        },
      }
    );
  };

  const students = (queryData?.data as any) || [];

  if (!isTeacher && !isPrincipal) {
    return (
      <div className="p-20 text-center font-black uppercase tracking-widest text-destructive">
        Unauthorized Access
      </div>
    );
  }

  return (
    <ListView
      title={
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-destructive/10 text-destructive shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="text-start">
            <h1 className="text-3xl font-black tracking-tight uppercase italic leading-none">
              At-Risk Intelligence
            </h1>
            <p className="text-muted-foreground font-medium mt-1">
              Proactive intervention radar for failing students.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        {isError && (
          <Card className="border-destructive/20 bg-destructive/5 rounded-3xl p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h3 className="text-lg font-bold">Failed to load risk report</h3>
            <Button
              onClick={() => refetch()}
              variant="outline"
              className="rounded-xl border-destructive/20 hover:bg-destructive/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </Card>
        )}

        {!isError && (
          <Card className="rounded-[2.5rem] border-border/40 shadow-2xl overflow-hidden bg-card/50 backdrop-blur-3xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                      Student
                    </TableHead>
                    <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-[10px]">
                      Class
                    </TableHead>
                    <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-[10px]">
                      Risk Analytics
                    </TableHead>
                    <TableHead className="py-6 px-4 font-black uppercase tracking-widest text-[10px]">
                      Last Active
                    </TableHead>
                    <TableHead className="py-6 px-8 text-right font-black uppercase tracking-widest text-[10px]">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-border/20">
                        <TableCell className="py-6 px-8">
                          <Skeleton className="h-10 w-40 rounded-lg" />
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <Skeleton className="h-8 w-32 rounded-lg" />
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <Skeleton className="h-8 w-24 rounded-lg" />
                        </TableCell>
                        <TableCell className="py-6 px-4">
                          <Skeleton className="h-8 w-24 rounded-lg" />
                        </TableCell>
                        <TableCell className="py-6 px-8 text-right">
                          <Skeleton className="h-10 w-24 rounded-lg ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : students.length > 0 ? (
                    <AnimatePresence mode="popLayout">
                      {students.map((student: AtRiskStudent, idx: number) => (
                        <motion.tr
                          key={`${student.studentId}-${student.classId}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="border-border/20 group hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="py-6 px-8 text-start">
                            <div className="flex items-center gap-4">
                              <Avatar className="h-12 w-12 rounded-xl border-2 border-background shadow-lg">
                                <AvatarImage src={student.studentImage || ""} />
                                <AvatarFallback className="bg-primary/10 text-primary font-black">
                                  {student.studentName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-black text-sm uppercase tracking-tight">
                                  {student.studentName}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium italic truncate max-w-[200px]">
                                  {student.reason}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-4 text-start">
                            <div className="flex items-center gap-2">
                              <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                              <span className="font-bold text-xs text-muted-foreground">
                                {student.className}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-4 text-start">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-black text-lg">{student.riskScore}%</span>
                                  <Badge
                                    className={cn(
                                      "rounded-full px-2 py-0 text-[8px] font-black uppercase tracking-tighter",
                                      student.riskLevel === "critical"
                                        ? "bg-destructive text-destructive-foreground animate-pulse"
                                        : student.riskLevel === "high"
                                          ? "bg-orange-500 text-white"
                                          : "bg-yellow-500 text-black"
                                    )}
                                  >
                                    {student.riskLevel}
                                  </Badge>
                                </div>
                                <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full transition-all duration-1000",
                                      student.riskLevel === "critical"
                                        ? "bg-destructive"
                                        : student.riskLevel === "high"
                                          ? "bg-orange-500"
                                          : "bg-yellow-500"
                                    )}
                                    style={{ width: `${student.riskScore}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-4 text-start">
                            <div className="flex items-center gap-2 text-muted-foreground font-bold text-xs uppercase italic">
                              <Clock className="h-3.5 w-3.5" />
                              {student.lastActiveDate
                                ? dayjs(student.lastActiveDate).fromNow()
                                : "Never"}
                            </div>
                          </TableCell>
                          <TableCell className="py-6 px-8 text-right">
                            <Button
                              onClick={() => handleIntervention(student)}
                              disabled={isIntervening}
                              variant="destructive"
                              size="sm"
                              className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[9px] gap-2 shadow-lg shadow-destructive/20 hover:scale-105 active:scale-95 transition-all"
                            >
                              <Zap className="h-3 w-3 fill-current" />
                              Intervene
                            </Button>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-6 rounded-full bg-emerald-500/10 text-emerald-500">
                            <TrendingUp className="h-12 w-12" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase italic text-emerald-700">
                              No at-risk students — great work
                            </h3>
                            <p className="text-sm text-muted-foreground font-medium">
                              All students are currently exceeding academic thresholds.
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </ListView>
  );
};

export default AtRiskPage;
