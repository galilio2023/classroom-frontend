import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface QuizResultsProps {
  score: number | null;
  onBack: () => void;
}

export const QuizResults = ({ score, onBack }: QuizResultsProps) => {
  const { t } = useTranslation();

  return (
    <div className="container max-w-2xl mx-auto py-20 px-4 md:px-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="text-center border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] overflow-hidden">
          <div className="h-3 bg-linear-to-r from-primary via-indigo-500 to-primary" />
          <CardHeader className="p-8 md:p-12">
            <div className="flex justify-center mb-6">
              <div className="p-6 rounded-4xl bg-yellow-500/10 text-yellow-500 shadow-xl shadow-yellow-500/10">
                <Trophy className="h-16 w-16 md:h-20 md:w-20 animate-bounce" />
              </div>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-black tracking-tight">
              {t("status.completed")}
            </CardTitle>
            <CardDescription className="text-base md:text-lg font-medium text-muted-foreground max-w-md mx-auto">
              {t("classes.quiz.finishedAssessment")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 md:p-12 pt-0 space-y-8">
            <div className="p-8 md:p-10 bg-primary/5 rounded-[2.5rem] inline-block border border-primary/10 shadow-inner">
              <span className="text-6xl md:text-7xl font-black text-primary tracking-tighter">
                {score}
              </span>
              <span className="text-lg md:text-xl font-black text-muted-foreground/60 uppercase tracking-widest ms-4">
                {t("common.xp")}
              </span>
            </div>
            <p className="text-muted-foreground font-medium max-w-xs mx-auto text-sm md:text-base">
              {t("classes.live.toasts.recordingSaved")}
            </p>
          </CardContent>
          <CardFooter className="p-8 md:p-12 bg-primary/2 border-t border-primary/5 flex justify-center">
            <Button
              onClick={onBack}
              size="lg"
              className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 text-white"
            >
              {t("buttons.goBack")}
              <ArrowRight className="h-4 w-4 ms-2" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};
