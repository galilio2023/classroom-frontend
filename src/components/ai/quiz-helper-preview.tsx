import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Send } from "lucide-react";

interface QuizHelperPreviewProps {
  questions: any[];
  onUseAll?: () => void;
}

export const QuizHelperPreview: React.FC<QuizHelperPreviewProps> = ({
  questions,
  onUseAll,
}) => {
  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Generated Questions</CardTitle>
          <CardDescription>Review and add these to your quiz.</CardDescription>
        </div>
        {questions.length > 0 && onUseAll && (
          <Button variant="outline" size="sm" onClick={onUseAll} className="gap-2">
            <Send className="h-4 w-4" />
            Use All Questions
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="space-y-4 max-h-[400px]">
          {questions.length > 0 ? (
            questions.map((q, idx) => (
              <div key={idx} className="p-3 border rounded-md bg-muted/30 space-y-2">
                <p className="font-medium text-sm">
                  {idx + 1}. {q.question}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  {q.options.map((opt: string, oIdx: number) => (
                    <div
                      key={oIdx}
                      className={opt === q.correctAnswer ? "text-green-600 font-bold" : ""}
                    >
                      • {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground italic text-center py-10">
              Questions will appear here...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
