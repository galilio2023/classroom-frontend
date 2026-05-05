import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BrainCircuit, Loader2, Wand2, CheckCircle, Trash2 } from "lucide-react";
import { useCourseBuilder, type CourseDraft } from "../hooks/use-course-builder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNotification } from "@refinedev/core";

interface CinematicArchitectModalProps {
  resourceId: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 🏗️ CINEMATIC ARCHITECT MODAL
 * Phase 2.3: Teacher Dashboard for AI Course Drafting.
 */
export const CinematicArchitectModal: React.FC<CinematicArchitectModalProps> = ({
  resourceId,
  isOpen,
  onClose,
}) => {
  const { open } = useNotification();
  const { startDrafting, publishCourse, isGenerating, isCommitting } = useCourseBuilder();
  const [draft, setDraft] = useState<CourseDraft | null>(null);

  const handleGenerate = () => {
    startDrafting(resourceId, (newDraft) => {
      setDraft(newDraft);
      open?.({
        type: "success",
        message: "AI Architect has finished drafting your course structure!",
      });
    });
  };

  const handlePublish = () => {
    if (!draft) return;
    publishCourse(String(draft.id), () => {
      open?.({
        type: "success",
        message: "Course modules successfully published to the classroom!",
      });
      onClose();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <BrainCircuit className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Cinematic Architect</DialogTitle>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-black">
                Autonomous Course Builder • PDF to Structure
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {!draft ? (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500 blur-3xl opacity-20 animate-pulse" />
                <Wand2 className="h-16 w-12 text-purple-400 relative z-10" />
              </div>
              <div className="max-w-[400px] space-y-2">
                <h3 className="text-lg font-bold">Ready to automate your course?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Our AI Architect will analyze your textbook content and break it down into logical
                  modules with learning objectives.
                </p>
              </div>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="rounded-xl px-8 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 transition-transform shadow-xl shadow-purple-500/20"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Content...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Drafting
                  </>
                )}
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-full p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-black uppercase tracking-tighter text-sm">
                    Suggested Structure
                  </h4>
                  <Badge variant="outline" className="text-[10px] font-bold py-1 bg-purple-50">
                    AI GENERATED
                  </Badge>
                </div>

                <div className="space-y-4">
                  {draft.content.map((m, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl border bg-card hover:border-purple-200 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">
                            Module {i + 1}
                          </span>
                          <h5 className="font-bold text-base">{m.title}</h5>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground/40 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {m.learningObjectives?.slice(0, 3).map((obj, j) => (
                          <Badge
                            key={j}
                            variant="secondary"
                            className="text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800"
                          >
                            {obj}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter className="p-6 border-t bg-muted/10">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          {draft && (
            <Button
              onClick={handlePublish}
              disabled={isCommitting}
              className="rounded-xl bg-success text-white hover:bg-success/90 px-8"
            >
              {isCommitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Commit & Publish
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Placeholder for icons not imported from lucide-react if any
const Sparkles = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3 1.912 4.912L18.824 9.824 13.912 11.736 12 16.648 10.088 11.736 5.176 9.824 10.088 7.912 12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);
