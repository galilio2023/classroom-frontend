import { useCustom, useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { useTerm } from "@/contexts/term-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  Calculator,
  Calendar,
  Trophy,
  Star,
  TrendingUp,
  Award,
  FileText,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import usePageTitle from "@/hooks/use-page-title";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { useTranslation } from "react-i18next";

interface ReportCardClass {
  classId: number;
  className: string;
  subject: string;
  average: number;
  letterGrade: string;
  gradedAssignments: number;
}

interface ReportCardData {
  term: {
    name: string;
    startDate: string;
    endDate: string;
  };
  gpa: string;
  classes: ReportCardClass[];
}

export default function ReportCard() {
  const { t } = useTranslation();
  usePageTitle(t("reportCard.title"));
  const { data: identity } = useGetIdentity<User>();
  const { selectedTerm } = useTerm();

  const { result, query } = useCustom<ReportCardData>({
    url: `/submissions/report-card`,
    method: "get",
    config: {
      query: {
        studentId: identity?.id,
        termId: selectedTerm?.id,
      },
    },
    queryOptions: {
      enabled: !!identity && !!selectedTerm,
    },
  });

  const report = result?.data;
  const isLoading = query.isLoading;

  if (isLoading) {
    return <ReportCardSkeleton />;
  }

  if (!report) {
    return (
      <div className="flex-1 flex items-center justify-center w-full min-h-[500px]">
        <EmptyState
          icon={FileText}
          title={t("reportCard.noData")}
          description={t("reportCard.noDataDesc")}
          className="border-none bg-transparent min-h-0"
        />
      </div>
    );
  }

  const classes = report.classes || [];
  const hasClasses = classes.length > 0;

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm">
              <GraduationCap className="h-8 w-8" />
            </div>
            {t("reportCard.title")}
          </h1>
          <div className="flex items-center gap-3 text-muted-foreground font-bold text-sm ms-1">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{report.term?.name || "Current Term"}</span>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>
              {t("reportCard.academicYear", {
                year: report.term?.startDate
                  ? new Date(report.term.startDate).getFullYear()
                  : new Date().getFullYear(),
              })}
            </span>
          </div>
        </div>

        <Card className="w-full md:w-auto border-none shadow-2xl bg-linear-to-br from-primary to-ai-primary text-primary-foreground overflow-hidden rounded-4xl relative group">
          <div className="absolute -end-4 -top-4 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <Trophy className="h-32 w-32" />
          </div>
          <CardContent className="p-8 flex items-center gap-6 relative z-10">
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                {t("reportCard.gpa")}
              </p>
              <p className="text-5xl font-black tracking-tighter">{report.gpa || "0.00"}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden h-full">
            <CardHeader className="p-10 pb-6 border-b border-black/3 dark:border-white/3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                    {t("reportCard.coursePerformance")}
                  </CardTitle>
                  <CardDescription className="font-medium">
                    {t("reportCard.coursePerformanceDesc")}
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className="rounded-xl px-4 py-1.5 font-black text-[10px] uppercase tracking-widest bg-primary/5 text-primary border-none"
                >
                  {t("reportCard.coursesCount", { count: classes.length })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!hasClasses ? (
                <div className="p-20">
                  <EmptyState
                    icon={FileText}
                    title={t("reportCard.noGradedCourses")}
                    description={t("reportCard.noGradedCoursesDesc")}
                    className="border-none bg-transparent min-h-0"
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent border-none">
                      <TableHead className="h-14 px-10 font-black uppercase tracking-widest text-[10px]">
                        {t("reportCard.subjectAndClass")}
                      </TableHead>
                      <TableHead className="h-14 text-center font-black uppercase tracking-widest text-[10px]">
                        {t("reportCard.tasks")}
                      </TableHead>
                      <TableHead className="h-14 text-center font-black uppercase tracking-widest text-[10px]">
                        {t("reportCard.avgScore")}
                      </TableHead>
                      <TableHead className="h-14 text-end px-10 font-black uppercase tracking-widest text-[10px]">
                        {t("reportCard.grade")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((c: ReportCardClass) => (
                      <TableRow
                        key={c.classId}
                        className="group hover:bg-primary/2 transition-colors border-black/3 dark:border-white/3"
                      >
                        <TableCell className="py-6 px-10">
                          <div className="flex flex-col">
                            <span className="font-black text-lg tracking-tight group-hover:text-primary transition-colors">
                              {c.subject}
                            </span>
                            <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                              {c.className}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center py-6">
                          <Badge
                            variant="outline"
                            className="rounded-lg font-black text-[10px] border-primary/10"
                          >
                            {t("reportCard.graded", {
                              count: c.gradedAssignments,
                            })}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center py-6">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-lg font-black tracking-tighter">
                              {c.average}%
                            </span>
                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  c.average >= 80
                                    ? "bg-green-500"
                                    : c.average >= 60
                                      ? "bg-primary"
                                      : "bg-destructive"
                                )}
                                style={{ width: `${c.average}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-end py-6 px-10">
                          <div
                            className={cn(
                              "inline-flex items-center justify-center size-12 rounded-2xl font-black text-xl shadow-lg",
                              ["A", "B"].includes(c.letterGrade)
                                ? "bg-green-500 text-white shadow-green-500/20"
                                : c.letterGrade === "C"
                                  ? "bg-primary text-white shadow-primary/20"
                                  : "bg-destructive text-white shadow-destructive/20"
                            )}
                          >
                            {c.letterGrade}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                {t("reportCard.insights")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <Star className="h-5 w-5 text-green-600" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-[10px] uppercase tracking-widest">
                    {t("reportCard.topSubject")}
                  </p>
                  <p className="text-sm text-muted-foreground font-bold">
                    {hasClasses
                      ? [...classes].sort((a, b) => b.average - a.average)[0]?.subject
                      : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-[10px] uppercase tracking-widest">
                    {t("reportCard.termStanding")}
                  </p>
                  <p className="text-sm text-muted-foreground font-bold">
                    {Number(report.gpa || 0) >= 3.5
                      ? t("reportCard.deansList")
                      : hasClasses
                        ? t("reportCard.goodStanding")
                        : t("reportCard.noStanding")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl bg-primary/5 rounded-[2.5rem] p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Star className="h-5 w-5" />
                </div>
                <p className="font-black text-sm uppercase tracking-widest">
                  {t("reportCard.instructorNote")}
                </p>
              </div>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                {hasClasses ? `"${t("reportCard.defaultNote")}"` : `"${t("reportCard.noNote")}"`}
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function ReportCardSkeleton() {
  return (
    <div className="space-y-10 max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-center">
        <div className="space-y-3">
          <Skeleton className="h-12 w-80 rounded-2xl" />
          <Skeleton className="h-4 w-48 rounded-lg" />
        </div>
        <Skeleton className="h-32 w-64 rounded-4xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Skeleton className="lg:col-span-2 h-[600px] rounded-[2.5rem]" />
        <div className="space-y-8">
          <Skeleton className="h-48 rounded-[2.5rem]" />
          <Skeleton className="h-48 rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );
}
