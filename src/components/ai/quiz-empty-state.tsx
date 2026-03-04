import React from "react";
import { BrainCircuit } from "lucide-react";

export const QuizEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
      <BrainCircuit className="h-12 w-12 text-muted-foreground/20 mb-4" />
      <p className="text-muted-foreground">No questions generated yet.</p>
      <p className="text-xs text-muted-foreground/60">Enter a topic and click generate to start.</p>
    </div>
  );
};
