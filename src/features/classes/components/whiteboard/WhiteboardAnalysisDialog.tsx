import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Lightbulb, MessageSquare, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WhiteboardAnalysisDialogProps {
  analysisResult: any;
  onClose: () => void;
}

export const WhiteboardAnalysisDialog = ({
  analysisResult,
  onClose,
}: WhiteboardAnalysisDialogProps) => {
  return (
    <Dialog open={!!analysisResult} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col gap-0 p-0 overflow-hidden rounded-2xl ai-gradient-border border-2 text-start">
        <div className="p-6 bg-ai-primary/5 border-b flex items-center gap-3">
          <div className="bg-ai-primary p-2 rounded-xl">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <DialogHeader className="p-0">
            <DialogTitle className="text-xl font-black tracking-tight">
              AI Drawing Analysis
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-ai-primary/70">
              Insights powered by Gemini 1.5 Flash Vision
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Key Concepts & Explanation
              </div>
              <div className="bg-card border p-5 rounded-2xl text-base leading-relaxed font-medium shadow-sm break-words whitespace-pre-wrap">
                {analysisResult?.analysis}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                Pedagogical Follow-up Questions
              </div>
              <div className="grid gap-3">
                {analysisResult?.followUpQuestions.map((q: string, i: number) => (
                  <div
                    key={i}
                    className="flex gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 group hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-6 w-6 rounded-full bg-background border flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm font-bold text-foreground/80 leading-tight pt-0.5">{q}</p>
                    <ChevronRight className="h-4 w-4 ms-auto text-muted-foreground/30 group-hover:text-primary transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 bg-muted/20 border-t flex justify-end">
          <Button onClick={onClose} variant="outline" className="rounded-xl font-bold px-6">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
