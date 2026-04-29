import { useCustom, HttpError } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Search, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useCapabilities } from "@/hooks/use-capabilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useGradeActions } from "../hooks/use-grade-actions";
import { toast } from "sonner";
import React from "react";

interface SchoolGradebookProps {
  classId: string;
  className?: string;
}

/**
 * 🎓 SCHOOL GRADEBOOK
 * Implements Phase 7 Grade Locking with Centralized Actions.
 * Mandate Check: Refine v5 Query Pattern & Header Stability.
 */
export const SchoolGradebook: React.FC<SchoolGradebookProps> = ({
  classId,
  className: _className,
}) => {
  const { t } = useTranslation();
  const { isSchoolSuite, isPrincipal, isTeacher } = useCapabilities();

  // 🛠️ v5 Pattern: Destructure { query }
  const { query } = useCustom<any, HttpError>({
    url: `${import.meta.env.VITE_API_URL}/reports/class/${classId}/term-grades`,
    method: "get",
  });

  const { handleAction, isPending } = useGradeActions("submissions", [query]);

  const students = (query.data?.data as any[]) || [];
  const isLoading = query.isLoading;

  // 🛡️ STABILITY: Compute a stable unique list of subjects from all students to prevent brittle headers
  const uniqueSubjects = React.useMemo(() => {
    const subjects = new Set<string>();
    students.forEach((s) => s.subjects?.forEach((sub: any) => subjects.add(sub.name)));
    return Array.from(subjects);
  }, [students]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
    if (score >= 70) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "locked":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[8px] uppercase font-black"
          >
            {t("classes:gradebook.status.pending", { defaultValue: "Pending Approval" })}
          </Badge>
        );
      case "finalized":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[8px] uppercase font-black"
          >
            {t("classes:gradebook.status.finalized", { defaultValue: "Finalized" })}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!isSchoolSuite) return null;

  return (
    <div className={cn("space-y-8 text-start animate-in fade-in duration-500", _className)}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/5 shadow-sm">
              <FileText className="w-6 h-6" />
            </div>
            {t("resources.gradebook.label", { defaultValue: "Class Term Gradebook" })}
          </h2>
          <p className="text-sm text-muted-foreground font-medium ms-12">
            {t("classes:gradebook.description", {
              defaultValue:
                "Aggregated performance metrics and weighted averages across all subjects.",
            })}
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <Input
              placeholder={t("common.search", { defaultValue: "Search students..." })}
              className="pl-10 h-11 rounded-2xl bg-muted/20 border-none shadow-inner"
            />
          </div>
          {isPrincipal && (
            <Button
              variant="default"
              className="h-11 rounded-2xl font-black uppercase tracking-widest text-[9px] gap-2 shadow-lg shadow-primary/20"
              onClick={() => handleAction("finalize", "all")}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {t("buttons.finalizeTerm", { defaultValue: "Finalize Term" })}
            </Button>
          )}
        </div>
      </div>

      <Card className="rounded-[2.5rem] border-border/40 bg-card/40 backdrop-blur-3xl shadow-2xl overflow-hidden group">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/5">
                  <th className="p-6 text-start text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 w-[300px]">
                    {t("classes:gradebook.columns.student", { defaultValue: "Student" })}
                  </th>
                  <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {t("classes:gradebook.columns.average", { defaultValue: "Average" })}
                  </th>
                  {/* 🛡️ STABILITY: Render headers from the computed stable subject list */}
                  {uniqueSubjects.length > 0 ? (
                    uniqueSubjects.map((subName) => {
                      // Find status from any student who has this subject (as status is usually per-subject-class)
                      const subjectStatus = students.find((s) =>
                        s.subjects?.find((sub: any) => sub.name === subName),
                      )?.subjects?.find((sub: any) => sub.name === subName)?.status;

                      return (
                        <th
                          key={subName}
                          className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60"
                        >
                          <div className="flex flex-col items-center gap-1">
                            {subName}
                            {subjectStatus && getStatusBadge(subjectStatus)}
                          </div>
                        </th>
                      );
                    })
                  ) : (
                    <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      {t("classes:gradebook.columns.subjects", { defaultValue: "Subjects" })}
                    </th>
                  )}
                  <th className="p-6 text-end text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    {t("common:actions", { defaultValue: "Actions" })}
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [1, 2, 3].map((i) => (
                    <tr key={i} className="animate-pulse border-b border-border/20">
                      <td colSpan={uniqueSubjects.length + 3} className="p-8">
                        <div className="h-12 bg-muted/10 rounded-2xl w-full" />
                      </td>
                    </tr>
                  ))
                ) : students.length > 0 ? (
                  students.map((row, _idx) => (
                    <tr
                      key={row.studentId}
                      className="border-b border-border/20 hover:bg-primary/5 transition-colors group/row"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 rounded-xl border border-border/40">
                            <AvatarImage src={row.studentImage} />
                            <AvatarFallback className="bg-primary/5 text-primary font-black uppercase text-xs">
                              {row.studentName.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-black truncate">{row.studentName}</span>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">
                              {row.studentId.slice(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-8 px-3 rounded-xl font-black text-sm border-none shadow-sm",
                            getScoreColor(row.average),
                          )}
                        >
                          {row.average}%
                        </Badge>
                      </td>
                      {uniqueSubjects.map((subName) => {
                        const sub = row.subjects?.find((s: any) => s.name === subName);
                        return (
                          <td key={subName} className="p-6 text-center">
                            <span className="font-bold text-sm">
                              {sub ? `${sub.score}%` : "-"}
                            </span>
                          </td>
                        );
                      })}
                      <td className="p-6 text-end">
                        {isTeacher && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-3 rounded-xl font-black uppercase tracking-widest text-[8px] gap-2 hover:bg-primary/10 text-primary"
                            onClick={() => handleAction("submit", row.studentId)}
                            disabled={isPending}
                          >
                            {isPending ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Lock className="w-3 h-3" />
                            )}
                            {t("buttons.submit", { defaultValue: "Submit" })}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={uniqueSubjects.length + 3}
                      className="p-20 text-center text-muted-foreground/40 font-black uppercase tracking-widest"
                    >
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      {t("common:empty.no_data", {
                        defaultValue: "No students or grades found for this term",
                      })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
