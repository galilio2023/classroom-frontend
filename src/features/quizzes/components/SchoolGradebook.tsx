import { useCustom, useCustomMutation } from "@refinedev/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FileText,
  TrendingUp,
  Download,
  Search,
  User as UserIcon,
  ChevronRight,
  Sparkles,
  Layers,
  MoreHorizontal,
  Lock,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import usePageTitle from "@/hooks/use-page-title";
import { Breadcrumb } from "@/components/refine/layout/breadcrumb";
import { ListView } from "@/components/refine/views/list-view";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useCapabilities } from "@/hooks/use-capabilities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface SchoolGradebookProps {
  classId: string;
  className?: string;
}

export const SchoolGradebook: React.FC<SchoolGradebookProps> = ({
  classId,
  className: _className,
}) => {
  const { t } = useTranslation();
  const { isSchoolSuite, isPrincipal, isTeacher } = useCapabilities();
  const { mutate, mutation: mutationResult } = useCustomMutation();

  const {
    data: queryData,
    isLoading,
    query,
  } = useCustom({
    url: `${import.meta.env.VITE_API_URL}/reports/class/${classId}/term-grades`,
    method: "get",
  }) as any;

  const students = (queryData?.data as any[]) || [];

  const handleAction = async (type: "submit" | "finalize", subjectId: string) => {
    const endpoint = type === "submit" ? "submit-grades" : "finalize-grades";
    // This assumes the backend handles both assignments and quizzes in one go for the subject
    // Or we might need separate calls. For now, let's target assignments as primary.
    mutate(
      {
        url: `${import.meta.env.VITE_API_URL}/submissions/${endpoint}`,
        method: "post",
        values: { assignmentId: subjectId }, // In a real scenario, this would be the specific assessment or bulk subject ID
      },
      {
        onSuccess: () => {
          toast.success(
            t(`classes.gradebook.toasts.${type}Success`, {
              defaultValue: `Grades ${type}d successfully!`,
            })
          );
          query.refetch();
        },
        onError: () => {
          toast.error(
            t(`classes.gradebook.toasts.${type}Error`, {
              defaultValue: `Failed to ${type} grades.`,
            })
          );
        },
      }
    );
  };

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
            Pending Approval
          </Badge>
        );
      case "finalized":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[8px] uppercase font-black"
          >
            Finalized
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
            {t("resources.gradebook.label", "Class Term Gradebook")}
          </h2>
          <p className="text-sm text-muted-foreground font-medium ms-12">
            Aggregated performance metrics and weighted averages across all subjects.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <Input
              placeholder={t("common.search", "Search students...")}
              className="pl-10 h-11 rounded-2xl bg-muted/20 border-none shadow-inner"
            />
          </div>
          {isPrincipal && (
            <Button
              variant="default"
              className="h-11 rounded-2xl font-black uppercase tracking-widest text-[9px] gap-2 shadow-lg shadow-primary/20"
              onClick={() => handleAction("finalize", "all")}
              disabled={mutationResult.isPending}
            >
              {mutationResult.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {t("buttons.finalizeTerm", "Finalize Term")}
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
                    Student
                  </th>
                  <th className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Average
                  </th>
                  {students[0]?.subjects.map((sub: any) => (
                    <th
                      key={sub.name}
                      className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60"
                    >
                      <div className="flex flex-col items-center gap-1">
                        {sub.name}
                        {getStatusBadge(sub.status)}
                      </div>
                    </th>
                  ))}
                  <th className="p-6 text-end text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? [1, 2, 3].map((i) => (
                      <tr key={i} className="animate-pulse border-b border-border/20">
                        <td colSpan={6} className="p-8">
                          <div className="h-12 bg-muted/10 rounded-2xl w-full" />
                        </td>
                      </tr>
                    ))
                  : students.map((row, _idx) => (
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
                              getScoreColor(row.average)
                            )}
                          >
                            {row.average}%
                          </Badge>
                        </td>
                        {row.subjects.map((sub: any) => (
                          <td key={sub.name} className="p-6 text-center">
                            <span className="font-bold text-sm">{sub.score}%</span>
                          </td>
                        ))}
                        <td className="p-6 text-end">
                          {isTeacher && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 px-3 rounded-xl font-black uppercase tracking-widest text-[8px] gap-2 hover:bg-primary/10 text-primary"
                              onClick={() => handleAction("submit", row.studentId)}
                              disabled={mutationResult.isPending}
                            >
                              {mutationResult.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Lock className="w-3 h-3" />
                              )}
                              Submit
                            </Button>
                          )}
                        </td>{" "}
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
