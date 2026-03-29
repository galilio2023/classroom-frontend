import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardPlayerProps {
  cards: Flashcard[];
  onComplete: () => void;
}

export const FlashcardPlayer = ({ cards, onComplete }: FlashcardPlayerProps) => {
  const { t, i18n } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const isArabic = i18n.language === "ar";

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;

      const nextKey = isArabic ? "ArrowLeft" : "ArrowRight";
      const prevKey = isArabic ? "ArrowRight" : "ArrowLeft";

      if (e.key === nextKey) {
        handleNext();
      } else if (e.key === prevKey) {
        handlePrev();
      } else if (e.key === " " || e.key === "Enter") {
        setIsFlipped((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isFinished, isArabic]);

  if (isFinished) {
    return (
      <Card className="border-none bg-success/5 py-12 text-center animate-in zoom-in-95 duration-500">
        <CardContent className="space-y-6">
          <div className="mx-auto w-20 h-20 bg-success rounded-full flex items-center justify-center shadow-lg shadow-success/20">
            <CheckCircle2 className="h-10 w-10 text-success-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black">
              {t("aiHub.studyLab.flashcards.sessionComplete")}
            </h3>
            <p className="text-muted-foreground">
              {t("aiHub.studyLab.flashcards.reviewedCount", {
                count: cards.length,
              })}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentIndex(0);
                setIsFinished(false);
                setIsFlipped(false);
              }}
            >
              <RotateCcw className="h-4 w-4 me-2 rtl:me-0 rtl:ms-2" />{" "}
              {t("aiHub.studyLab.flashcards.restart")}
            </Button>
            <Button onClick={onComplete}>{t("aiHub.studyLab.flashcards.backToLab")}</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8 max-w-md mx-auto">
      <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground">
        <span>
          {t("aiHub.studyLab.flashcards.cardOf", {
            current: currentIndex + 1,
            total: cards.length,
          })}
        </span>
        <div className="flex gap-1 rtl:flex-row-reverse">
          {cards.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 w-4 rounded-full transition-all",
                i === currentIndex
                  ? "bg-primary w-8"
                  : i < currentIndex
                    ? "bg-primary/40"
                    : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Flashcard with 3D Flip Effect */}
      <div
        className="relative h-80 w-full cursor-pointer perspective-1000 group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={cn(
            "relative w-full h-full transition-all duration-500 preserve-3d",
            isFlipped ? "rotate-y-180" : ""
          )}
        >
          {/* Front */}
          <Card className="absolute inset-0 backface-hidden border-2 border-primary/10 shadow-xl flex items-center justify-center p-8 text-center bg-card">
            <CardContent className="p-0">
              <p className="text-xl font-bold leading-relaxed">{currentCard.front}</p>
              <p className="absolute bottom-4 start-0 end-0 text-[10px] uppercase font-black tracking-tighter opacity-30">
                {t("aiHub.studyLab.flashcards.flipHint")}
              </p>
            </CardContent>
          </Card>

          {/* Back */}
          <Card className="absolute inset-0 backface-hidden rotate-y-180 border-2 border-primary/20 shadow-2xl flex items-center justify-center p-8 text-center bg-primary/5 dark:bg-primary/10">
            <CardContent className="p-0">
              <p className="text-lg font-medium text-primary leading-relaxed">{currentCard.back}</p>
              <p className="absolute bottom-4 start-0 end-0 text-[10px] uppercase font-black tracking-tighter text-primary/40">
                {t("aiHub.studyLab.flashcards.flipBackHint")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="h-12 w-12 rounded-full"
        >
          <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
        </Button>

        <Button
          onClick={handleNext}
          className="flex-1 h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
        >
          {currentIndex === cards.length - 1
            ? t("aiHub.studyLab.flashcards.finishSession")
            : t("aiHub.studyLab.flashcards.nextCard")}
          <ChevronRight className="h-5 w-5 ms-2 rtl:ms-0 rtl:me-2 rtl:rotate-180" />
        </Button>
      </div>
      <p className="text-center text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
        {t("aiHub.studyLab.flashcards.keyboardNav")}
      </p>
    </div>
  );
};
