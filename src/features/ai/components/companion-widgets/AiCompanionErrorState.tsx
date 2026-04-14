import React from "react";
import { BrainCircuit } from "lucide-react";

/**
 * 🛡️ ATOMIC WIDGET: AI Companion Error State
 * Displays maintenance/offline status when global AI is disabled.
 */
export const AiCompanionErrorState = React.memo(() => {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-black/60 border-white/10 rounded-3xl p-8 text-center border-4">
      <div className="bg-destructive/10 p-6 rounded-full mb-6">
        <BrainCircuit className="w-12 h-12 text-destructive grayscale" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-4">AI Co-Teacher Offline</h3>
      <p className="text-muted-foreground max-w-xs mx-auto">
        The AI Co-teacher features are currently undergoing maintenance to improve your experience.
      </p>
    </div>
  );
});
