import { useCustom, useNavigation, useGetIdentity } from "@refinedev/core";
import { Quiz, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, FileQuestion, PlusCircle, ArrowRight, Trophy, Clock, Calendar, LayoutDashboard, Sparkles, Info } from "lucide-react";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { AssessmentsEmptyState } from "../components/class-empty-states";

interface QuizTabProps {
  classId: string;
}

export const QuizTab = ({ classId }: QuizTabProps) => {
  const { t, i18n } = useTranslation();
  const { show, create } = useNavigation();
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === "teacher" || identity?.role === "admin";

  const { query: quizQuery } = useCustom<Quiz[]>({
    url: `/quizzes`,
    method: "get",
    config: {
      query: { classId },
    }
  });

  const quizzes = quizQuery.data?.data || [];
  const isLoading = quizQuery.isLoading;

  const isAr = i18n.language === 'ar';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-start">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{t("classes.quiz.loading")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <FileQuestion className="h-4 w-4" />
            </div>
            <h3 className="text-xl font-black tracking-tight">{t("classes.quiz.classQuizzes")}</h3>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {t("classes.quiz.description", { count: quizzes.length })}
          </p>
        </div>
        {isStaff && (
          <Button 
            onClick={() => create("quizzes", "push", { query: { classId } })}
            className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            {t("buttons.createQuiz")}
          </Button>
        )}
      </div>

      {quizzes.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          {quizzes.map((quiz: Quiz) => {
            const isOverdue = quiz.dueDate && dayjs(quiz.dueDate).isBefore(dayjs());
            
            return (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all hover:-translate-y-1 text-start">
                  <CardHeader className="p-8 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                        <FileQuestion className="h-6 w-6" />
                      </div>
                      <div className={cn("flex flex-col gap-2", isAr ? "items-start" : "items-end")}>
                        {quiz.timeLimit && (
                          <Badge variant="secondary" className="flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest bg-orange-500/10 text-orange-600 border-none px-3 py-1">
                            <Clock className="h-3 w-3" />
                            {quiz.timeLimit} {t("classes.quiz.minsUnit")}
                          </Badge>
                        )}
                        {quiz.dueDate && (
                          <div className={cn(
                            "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest",
                            isOverdue ? "text-destructive" : "text-muted-foreground/40"
                          )}>
                            <Calendar className="h-3 w-3" />
                            <span>{t("classes.quiz.due", { date: dayjs(quiz.dueDate).format("MMM D") })}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <CardTitle className="mt-6 text-xl font-black tracking-tight group-hover:text-primary transition-colors">{quiz.title}</CardTitle>
                    <CardDescription className="line-clamp-2 font-medium leading-relaxed mt-2">
                      {quiz.description || t("classes.quiz.noDescription")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 pt-4">
                    <div className="flex items-center justify-between pt-6 border-t border-black/[0.03] dark:border-white/[0.03]">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-muted/50 text-muted-foreground">
                          <LayoutDashboard className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                          {t("classes.quiz.questionsCount", { count: quiz.questions?.length || 0 })}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        {isStaff ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => show("quizzes", quiz.id.toString(), "push", { query: { action: "results" } })}
                            className="h-10 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 border-primary/20 text-primary hover:bg-primary/5"
                          >
                            <Trophy className="h-3.5 w-3.5" />
                            {t("buttons.results")}
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => show("quizzes", quiz.id.toString())}
                            className="h-10 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 shadow-lg shadow-primary/20 px-6"
                          >
                            {t("buttons.takeQuiz")}
                            <ArrowRight className={cn("h-3.5 w-3.5", isAr && "rotate-180")} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <AssessmentsEmptyState 
            type="quizzes"
            isTeacher={isStaff}
            onAddClick={() => create("quizzes", "push", { query: { classId } })}
        />
      )}
    </div>
  );
};
