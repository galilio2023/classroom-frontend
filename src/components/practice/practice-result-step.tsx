import React from "react";
import { Button } from "@/components/ui/button";
import { Trophy, Target } from "lucide-react";

interface PracticeResultStepProps {
  result: any;
  onClose: () => void;
}

export const PracticeResultStep: React.FC<PracticeResultStepProps> = ({
  result,
  onClose,
}) => {
  return (
    <div className="text-center space-y-6 py-4">
      <div className="flex justify-center">
        {result.passed ? (
          <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <Trophy className="h-12 w-12 text-green-600" />
          </div>
        ) : (
          <div className="h-24 w-24 bg-orange-100 rounded-full flex items-center justify-center">
            <Target className="h-12 w-12 text-orange-600" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight">
          {result.passed ? "Mastery Achieved!" : "Keep Practicing!"}
        </h2>
        <p className="text-muted-foreground text-lg">
          You scored <span className="font-bold text-foreground">{result.score}%</span> (
          {result.correctCount}/{result.totalQuestions} correct)
        </p>
      </div>

      {result.badgeEarned && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-2xl flex flex-col items-center gap-3 animate-in zoom-in duration-500">
          <img
            src={result.badgeEarned.iconUrl}
            alt="Badge"
            className="h-16 w-16 drop-shadow-md"
          />
          <div className="text-center">
            <h4 className="font-bold text-yellow-700">New Badge Unlocked!</h4>
            <p className="text-sm text-yellow-600 font-medium">
              {result.badgeEarned.name}
            </p>
          </div>
        </div>
      )}

      {!result.passed && (
        <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
          Don't worry! Review the material and try again to earn your badge.
        </div>
      )}

      <div className="flex justify-center pt-4">
        <Button onClick={onClose} className="w-full sm:w-auto">
          Close
            </Button>
      </div>
    </div>
  );
};
