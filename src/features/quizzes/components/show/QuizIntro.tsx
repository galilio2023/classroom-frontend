import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { FileQuestion, ShieldCheck, Sparkles, LayoutDashboard, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { Quiz } from "@/types";

interface QuizIntroProps {
  quiz: Quiz;
  isStudent: boolean;
  onStart: () => void;
  onViewResults: () => void;
  onBack: () => void;
}

export const QuizIntro = ({ quiz, isStudent, onStart, onViewResults, onBack }: QuizIntroProps) => {
  const { t } = useTranslation();

  return (
    <div className="container max-w-3xl mx-auto py-8 md:py-12 px-4 md:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
          <div className="h-3 bg-linear-to-r from-primary via-ai-primary to-primary" />
          <CardHeader className="p-8 md:p-12 text-center space-y-6">
            <div className="mx-auto p-5 rounded-4xl bg-primary/10 text-primary shadow-xl shadow-primary/5 w-fit">
              <FileQuestion className="h-12 w-12 md:h-16 md:w-16" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-balance">
                {quiz.title}
              </h1>
              <p className="text-base md:text-lg font-medium text-muted-foreground max-w-md mx-auto leading-relaxed">
                {quiz.description || t("classes.quiz.noDescription")}
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-8 md:p-12 pt-0 space-y-10 md:space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 md:p-8 rounded-4xl bg-muted/30 border border-primary/5 space-y-2 text-center shadow-inner text-start">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                  {t("classes.quiz.questionsCount", "Questions")}
                </p>
                <p className="text-3xl md:text-4xl font-black text-primary">
                  {quiz.questions?.length || 0}
                </p>
              </div>
              <div className="p-6 md:p-8 rounded-4xl bg-muted/30 border border-primary/5 space-y-2 text-center shadow-inner text-start">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                  {t("classes.quiz.timeLimit", "Time Limit")}
                </p>
                <p className="text-3xl md:text-4xl font-black text-primary">
                  {quiz.timeLimit
                    ? `${quiz.timeLimit} ${t("classes.quiz.minsUnit", "min")}`
                    : t("classes.quiz.noLimit", "Unlimited")}
                </p>
              </div>
            </div>

            {isStudent && (
              <div className="bg-amber-500/5 border-2 border-dashed border-amber-500/20 p-6 md:p-8 rounded-4xl flex flex-col sm:flex-row gap-5 items-start shadow-sm text-start">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
                  <ShieldCheck className="h-6 w-6 md:h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <p className="font-black uppercase tracking-widest text-xs text-amber-600">
                    {t("classes.quiz.integrityPolicy", "Academic Integrity")}
                  </p>
                  <p className="text-sm md:text-base text-amber-800/70 font-medium leading-relaxed">
                    {t(
                      "classes.quiz.integrityDescription",
                      "Your session is monitored. Once started, you cannot pause the timer."
                    )}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-8 md:p-12 bg-primary/2 border-t border-primary/5 flex flex-col gap-4">
            {isStudent ? (
              <Button
                className="w-full h-14 md:h-16 text-sm md:text-base font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20"
                onClick={onStart}
              >
                <Sparkles className="h-5 w-5 me-2" />
                {t("buttons.takeQuiz")}
              </Button>
            ) : (
              <div className="w-full space-y-4">
                <Button
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
                  variant="outline"
                  onClick={onViewResults}
                >
                  <LayoutDashboard className="h-4 w-4 me-2" />
                  {t("buttons.viewReport")}
                </Button>
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                  {t("classes.quiz.teacherViewNotice", "Only students can take quizzes.")}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] text-muted-foreground"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4 me-2" />
              {t("buttons.goBack")}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};
