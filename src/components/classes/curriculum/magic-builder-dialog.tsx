import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Zap,
  Loader2,
  GraduationCap,
  MessageSquare,
  Target,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { socket, connectSocket } from "@/lib/socket";
import { motion, AnimatePresence } from "framer-motion";

export type MagicBuilderLevel = "primary" | "high_school" | "university";
export type MagicBuilderTone = "academic" | "creative" | "practical";

export interface MagicBuilderConfig {
  topic: string;
  type: "package" | "note" | "quiz" | "assignment";
  level: MagicBuilderLevel;
  tone: MagicBuilderTone;
  objectives: string;
  moduleId: number | null;
}

interface MagicBuilderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  config: MagicBuilderConfig;
  setConfig: (config: MagicBuilderConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  classId?: number;
}

export const MagicBuilderDialog = ({
  isOpen,
  onOpenChange,
  config,
  setConfig,
  onGenerate,
  isGenerating,
  classId
}: MagicBuilderDialogProps) => {
  const { t } = useTranslation();
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");

  useEffect(() => {
    if (isGenerating && isOpen) {
        void connectSocket();
        
        const handleProgress = (data: { step: string, progress: number, classId: number }) => {
            if (data.classId === classId) {
                setStep(data.step);
                setProgress(data.progress);
            }
        };

        socket.on("magic_builder_progress", handleProgress);
        return () => {
            socket.off("magic_builder_progress", handleProgress);
        };
    } else {
        setProgress(0);
        setStep("");
    }
  }, [isGenerating, isOpen, classId]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125 border-none shadow-2xl bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black tracking-tight">
            <Zap className="h-6 w-6 text-ai-primary fill-ai-primary/10" />
            {t("buttons.aiMagicBuilder")}
          </DialogTitle>
          <DialogDescription className="font-medium">
            {t("aiHub.assistant.description")}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
            {isGenerating ? (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="py-12 flex flex-col items-center justify-center space-y-8"
                >
                    <div className="relative">
                        <div className="absolute -inset-4 bg-ai-primary/20 rounded-full blur-xl animate-pulse" />
                        <Loader2 className="h-12 w-12 text-ai-primary animate-spin relative z-10" />
                    </div>
                    <div className="w-full space-y-4 text-center px-8">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-ai-primary">
                            <span className="flex items-center gap-2"><Sparkles className="h-3 w-3" /> {step || t("buttons.generating")}</span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-ai-primary/10" />
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight italic">
                            Gemini is architecting your curriculum...
                        </p>
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4 py-4"
                >
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t("aiHub.assistant.helper.topic")}
                    </Label>
                    <Input
                      placeholder={t("aiHub.assistant.helper.placeholders.topic")}
                      value={config.topic}
                      onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                      className="rounded-xl border-border/40 focus-visible:ring-ai-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("classes.resource.addDialog.fieldType")}
                      </Label>
                      <Select
                        value={config.type}
                        onValueChange={(
                          v: "package" | "note" | "quiz" | "assignment",
                        ) => setConfig({ ...config, type: v })}
                      >
                        <SelectTrigger className="rounded-xl border-border/40">
                          <SelectValue
                            placeholder={t(
                              "classes.resource.addDialog.typePlaceholder",
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-xl">
                          <SelectItem value="package">
                            {t("aiHub.assistant.architect")}
                          </SelectItem>
                          <SelectItem value="note">
                            {t("classes.resource.addDialog.types.note")}
                          </SelectItem>
                          <SelectItem value="quiz">
                            {t("classes.show.tabs.quizzes")}
                          </SelectItem>
                          <SelectItem value="assignment">
                            {t("classes.show.tabs.assignments")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {t("aiHub.assistant.helper.level")}
                      </Label>
                      <Select
                        value={config.level}
                        onValueChange={(v: MagicBuilderLevel) =>
                          setConfig({ ...config, level: v })
                        }
                      >
                        <SelectTrigger className="rounded-xl border-border/40">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-3.5 w-3.5 text-primary" />
                            <SelectValue
                              placeholder={t(
                                "classes.resource.addDialog.typePlaceholder",
                              )}
                            />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-none shadow-xl">
                          <SelectItem value="primary">
                            {t("aiHub.assistant.helper.levels.beginner")}
                          </SelectItem>
                          <SelectItem value="high_school">
                            {t("aiHub.assistant.helper.levels.intermediate")}
                          </SelectItem>
                          <SelectItem value="university">
                            {t("aiHub.assistant.helper.levels.advanced")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t("aiHub.assistant.helper.tone")}
                    </Label>
                    <Select
                      value={config.tone}
                      onValueChange={(v: MagicBuilderTone) =>
                        setConfig({ ...config, tone: v })
                      }
                    >
                      <SelectTrigger className="rounded-xl border-border/40">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-3.5 w-3.5 text-primary" />
                          <SelectValue
                            placeholder={t(
                              "classes.resource.addDialog.typePlaceholder",
                            )}
                          />
                        </div>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-xl">
                        <SelectItem value="academic">
                          {t("aiHub.assistant.helper.tones.academic")}
                        </SelectItem>
                        <SelectItem value="creative">
                          {t("aiHub.assistant.helper.tones.creative")}
                        </SelectItem>
                        <SelectItem value="practical">
                          {t("aiHub.assistant.helper.tones.practical")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Target className="h-3.5 w-3.5 text-primary" />
                      {t("aiHub.assistant.helper.objectives")}
                    </Label>
                    <Textarea
                      placeholder={t("aiHub.assistant.helper.placeholders.objectives")}
                      value={config.objectives}
                      onChange={(e) =>
                        setConfig({ ...config, objectives: e.target.value })
                      }
                      className="resize-none h-20 text-xs rounded-xl border-border/40"
                    />
                  </div>
                </motion.div>
            )}
        </AnimatePresence>

        {!isGenerating && (
            <DialogFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl font-bold">
                {t("buttons.cancel")}
              </Button>
              <Button
                onClick={onGenerate}
                disabled={isGenerating || !config.topic}
                className="bg-ai-primary hover:bg-ai-primary/90 text-ai-primary-foreground rounded-xl px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-ai-primary/20"
              >
                <Zap className="h-4 w-4 me-2" />
                {t("buttons.create")}
              </Button>
            </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
