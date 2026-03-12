import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Target, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface QuestionReview {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  isCorrect: boolean;
}

interface PracticeResultStepProps {
  result: {
    passed: boolean;
    score: number;
    correctCount: number;
    totalQuestions: number;
    badgeEarned?: {
      name: string;
      iconUrl: string;
    };
    review?: QuestionReview[];
  };
  onClose: () => void;
}

export const PracticeResultStep: React.FC<PracticeResultStepProps> = ({
  result,
  onClose,
}) => {
  const { t, i18n } = useTranslation();
  const [showReview, setShowReview] = useState(false);
  const isArabic = i18n.language === 'ar';

  return (
    <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          {result.passed ? (
            <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-green-500/20">
              <Trophy className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          ) : (
            <div className="h-24 w-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Target className="h-12 w-12 text-orange-600 dark:text-orange-400" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-2">
            {result.passed ? t("practice.results.passed") : t("practice.results.practiceNeeded")}
          </div>
          <h2 className="text-3xl font-black tracking-tight">
            {result.passed ? t("practice.results.masteryAchieved") : t("practice.results.keepPracticing")}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="text-center">
              <p className="text-3xl font-black text-primary">
                {new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US').format(result.score)}%
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{t("practice.results.finalScore")}</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-3xl font-black text-foreground">
                {new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US').format(result.correctCount)}/{new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US').format(result.totalQuestions)}
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">{t("practice.results.correct")}</p>
            </div>
          </div>
        </div>

        {result.badgeEarned && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl flex flex-col items-center gap-3 animate-in zoom-in duration-500">
            <img
              src={result.badgeEarned.iconUrl}
              alt="Badge"
              className="h-16 w-16 drop-shadow-md"
            />
            <div className="text-center">
              <h4 className="font-bold text-yellow-700 dark:text-yellow-500">{t("practice.results.badgeUnlocked")}</h4>
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">
                {result.badgeEarned.name}
              </p>
            </div>
          </div>
        )}

        {!result.passed && (
          <div className="bg-muted p-4 rounded-xl text-sm text-muted-foreground font-medium">
            {t("practice.results.reviewMaterial")}
          </div>
        )}
      </div>

      {result.review && (
        <div className="space-y-4">
          <Button 
            variant="ghost" 
            className="w-full justify-between font-bold"
            onClick={() => setShowReview(!showReview)}
          >
            {t("practice.results.reviewQuestions")}
            {showReview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showReview && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              {result.review.map((item, idx) => (
                <div key={idx} className={cn(
                  "p-4 rounded-xl border-2 transition-all",
                  item.isCorrect ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
                )}>
                  <div className="flex items-start gap-3">
                    {item.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <div className="space-y-2">
                      <p className="font-bold text-sm leading-tight">{item.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 rounded-lg bg-background/50 border border-border">
                          <span className="text-muted-foreground block mb-1 uppercase font-black text-[8px]">{t("practice.results.yourAnswer")}</span>
                          <span className={cn("font-bold", item.isCorrect ? "text-green-600" : "text-red-600")}>{item.userAnswer}</span>
                        </div>
                        {!item.isCorrect && (
                          <div className="p-2 rounded-lg bg-background/50 border border-border">
                            <span className="text-muted-foreground block mb-1 uppercase font-black text-[8px]">{t("practice.results.correctAnswer")}</span>
                            <span className="font-bold text-green-600">{item.correctAnswer}</span>
                          </div>
                        )}
                      </div>
                      {item.explanation && (
                        <p className="text-xs text-muted-foreground italic bg-background/30 p-2 rounded-lg">
                          {item.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-center pt-4 sticky bottom-0 bg-background/80 backdrop-blur-sm pb-2">
        <Button onClick={onClose} className="w-full h-12 text-lg font-black shadow-lg shadow-primary/20">
          {t("practice.results.finishSession")}
        </Button>
      </div>
    </div>
  );
};
