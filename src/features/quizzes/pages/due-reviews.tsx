import React from "react";
import { useCustom, useNavigation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import {
  Brain,
  Calendar,
  Clock,
  ArrowLeft,
  ChevronRight,
  Zap,
  LayoutGrid,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

const DueReviewsPage: React.FC = () => {
  const { t } = useTranslation();
  const { push } = useNavigation() as any;

  const { query } = useCustom<any[]>({
    url: `${import.meta.env.VITE_API_URL}/quizzes/due-reviews`,
    method: "get",
  });

  const { data: queryData, isLoading } = query;

  const dueQuizzes = queryData?.data || [];

  return (
    <div className="p-6 md:p-10 space-y-12 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-3xl bg-primary/10 text-primary shadow-sm border border-primary/5">
            <Brain className="h-8 w-8" />
          </div>
          <div className="text-start">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic leading-none">
              Spaced Repetition
            </h1>
            <p className="text-muted-foreground font-medium mt-1.5 uppercase tracking-widest text-[10px]">
              Optimized Cognitive Retention Engine
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-primary/5 self-start md:self-center"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-3 px-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-xl font-black uppercase tracking-tight italic">
            Due for Review Today
          </h2>
          <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] rounded-full px-3">
            {dueQuizzes.length}
          </Badge>
        </div>

        {isLoading ? (
          <div className="grid gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-[2rem]" />
            ))}
          </div>
        ) : dueQuizzes.length > 0 ? (
          <div className="grid gap-6">
            <AnimatePresence mode="popLayout">
              {dueQuizzes.map((quiz: any, idx: number) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="rounded-[2.5rem] border-border/40 shadow-xl overflow-hidden group bg-card/40 backdrop-blur-3xl hover:shadow-2xl transition-all duration-500">
                    <CardContent className="p-8">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6 flex-1 text-start">
                          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/40 group-hover:scale-110 transition-transform duration-500">
                            <LayoutGrid className="h-7 w-7 text-primary/60" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-2xl font-black uppercase italic tracking-tight">
                              {quiz.topic}
                            </h3>
                            <div className="flex items-center gap-4 text-muted-foreground font-bold text-xs uppercase tracking-tighter">
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                Due {dayjs(quiz.nextReviewAt).fromNow()}
                              </div>
                              <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                              <div className="flex items-center gap-1.5 text-emerald-500">
                                <CheckCircle2 className="h-3 w-3" />
                                Ready for Recall
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => push(`/classes/${quiz.classId}/quizzes`)}
                          className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                        >
                          Start Recall
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="rounded-[3rem] border-none bg-emerald-500/5 p-20 text-center">
            <div className="flex flex-col items-center space-y-6">
              <div className="p-10 rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-20 w-20" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-black uppercase italic text-emerald-700">
                  Cognitive Load Balanced
                </h3>
                <p className="text-muted-foreground font-medium max-w-sm">
                  Your knowledge retention is optimized. No reviews are due at this moment.
                </p>
              </div>
              <Button
                onClick={() => push("/dashboard")}
                variant="outline"
                className="rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] border-emerald-500/20 text-emerald-700 hover:bg-emerald-500/5"
              >
                Return to Dashboard
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DueReviewsPage;
