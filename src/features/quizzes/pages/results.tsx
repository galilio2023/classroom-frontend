import { useCustom, useNavigation, HttpError } from "@refinedev/core";
import { useParams } from "react-router-dom";
import { QuizAttempt, Quiz } from "@/types/quiz";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  User,
  Calendar,
  Search,
  LayoutDashboard,
  ListChecks,
  Lock,
  ShieldCheck,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { QuizAnalytics } from "@/features/classes/components/quiz-analytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useCapabilities } from "@/hooks/use-capabilities";
import { useGradeActions } from "../hooks/use-grade-actions";
import { handleError } from "@/providers/utils/api-errors";
import { toast } from "sonner";

/**
 * 📊 QUIZ RESULTS PAGE
 * Centralizes high-stakes quiz analytics and Phase 7 locking.
 */
const QuizResults = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const { list } = useNavigation();
  const [search, setSearch] = useState("");
  const { isPrincipal, isTeacher } = useCapabilities();

  // Fetch Quiz Details
  const { query: quizQuery } = useCustom<Quiz, HttpError>({
    url: `/quizzes/${id}`,
    method: "get",
    queryOptions: {
      enabled: !!id,
    },
  });

  // Fetch Quiz Results (Attempts & Analytics)
  const { query: resultsQuery } = useCustom<
    {
      attempts: QuizAttempt[];
      analytics: any[];
    },
    HttpError
  >({
    url: `/quizzes/${id}/results`,
    method: "get",
    queryOptions: {
      enabled: !!id,
    },
  });

  const { handleAction, isPending } = useGradeActions("quizzes", [resultsQuery, quizQuery]);

  // 🛡️ SAFETY: Guard against malformed routes
  if (!id) {
    list("classes");
    return null;
  }

  const quiz = quizQuery.data?.data;
  const data = resultsQuery.data?.data;
  const attempts = data?.attempts || [];
  const analytics = data?.analytics || [];
  const isLoading = quizQuery.isLoading || resultsQuery.isLoading;

  const filteredAttempts = attempts.filter((attempt: QuizAttempt) =>
    attempt.student?.name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz) return null;

  const totalPoints =
    quiz.questions?.reduce((acc: number, q: any) => acc + (q.points || 1), 0) || 0;

  return (
    <div className="container mx-auto py-10 px-4 space-y-8 max-w-7xl text-start">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => list("classes")}
            className="rounded-xl border-primary/20 hover:bg-primary/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black tracking-tight">{quiz.title}</h1>
            <p className="font-bold text-muted-foreground/60">
              {t("classes.quiz.performanceAnalytics", {
                defaultValue: "Class Performance Analytics",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isTeacher && (
            <Button
              variant="outline"
              className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-primary/20 text-primary hover:bg-primary/5"
              onClick={() => handleAction("submit", id!)}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {t("buttons.submitGrades", { defaultValue: "Submit Grades" })}
            </Button>
          )}
          {isPrincipal && (
            <Button
              variant="default"
              className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20"
              onClick={() => handleAction("finalize", id!)}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {t("buttons.finalizeLock", { defaultValue: "Finalize & Lock" })}
            </Button>
          )}
          <Badge
            variant="secondary"
            className="text-xs px-4 py-2 rounded-xl bg-primary/10 text-primary border-none font-black uppercase tracking-widest"
          >
            {attempts.length} {t("classes.quiz.submissions", { defaultValue: "Submissions" })}
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs px-4 py-2 rounded-xl bg-primary/10 text-primary border-none font-black uppercase tracking-widest"
          >
            {totalPoints} {t("classes.quiz.totalPoints", { defaultValue: "Total Points" })}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="analytics" className="space-y-8">
        <TabsList className="bg-primary/5 p-1 rounded-2xl h-12 border border-primary/10">
          <TabsTrigger
            value="analytics"
            className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t("classes.quiz.tabs.analytics", { defaultValue: "Analytics" })}
          </TabsTrigger>
          <TabsTrigger
            value="submissions"
            className="rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <ListChecks className="h-4 w-4" />
            {t("classes.quiz.tabs.studentList", { defaultValue: "Student List" })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <QuizAnalytics stats={analytics} title={quiz.title} />
        </TabsContent>

        <TabsContent value="submissions">
          <div className="space-y-6">
            <div className="relative group max-w-md">
              <Search className="absolute start-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={t("classes.quiz.searchPlaceholder", {
                  defaultValue: "Search students...",
                })}
                className="ps-12 h-14 rounded-2xl bg-card/50 border-none shadow-sm focus-visible:ring-primary/20 font-bold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAttempts.length > 0 ? (
                filteredAttempts.map((attempt: QuizAttempt) => (
                  <Card
                    key={attempt.id}
                    className="overflow-hidden border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-4xl hover:scale-[1.02] transition-all duration-300"
                  >
                    <div className="flex items-center p-6 gap-4">
                      <Avatar className="h-14 w-14 border-2 border-background shadow-lg rounded-2xl">
                        <AvatarImage src={attempt.student?.image} className="object-cover" />
                        <AvatarFallback className="bg-primary/5 text-primary font-black">
                          {attempt.student?.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-lg tracking-tight truncate">
                          {attempt.student?.name}
                        </p>
                        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(attempt.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="px-6 pb-6 pt-0 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                          {t("classes.quiz.rawScore", { defaultValue: "Raw Score" })}
                        </span>
                        <p className="text-2xl font-black text-primary">
                          {attempt.score}
                          <span className="text-xs text-muted-foreground/40 font-bold ms-1">
                            / {totalPoints}
                          </span>
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-full border-4 border-primary/10 flex items-center justify-center">
                        <span className="text-sm font-black text-primary">
                          {Math.round((attempt.score / totalPoints) * 100)}%
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-20 border-2 border-dashed border-primary/10 rounded-[3rem] opacity-40">
                  <User className="h-12 w-12 mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest">
                    {t("classes.quiz.noResults", { defaultValue: "No student results found" })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuizResults;
