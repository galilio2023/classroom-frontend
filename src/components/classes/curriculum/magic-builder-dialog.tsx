import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Loader2, GraduationCap, MessageSquare, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

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
}

export const MagicBuilderDialog = ({
  isOpen,
  onOpenChange,
  config,
  setConfig,
  onGenerate,
  isGenerating
}: MagicBuilderDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-ai-primary" />
            {t("buttons.aiMagicBuilder")}
          </DialogTitle>
          <DialogDescription>
            {t("aiHub.assistant.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("aiHub.assistant.helper.topic")}</Label>
            <Input 
              placeholder={t("aiHub.assistant.helper.placeholders.topic")} 
              value={config.topic} 
              onChange={(e) => setConfig({ ...config, topic: e.target.value })} 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("classes.resource.addDialog.fieldType")}</Label>
              <span className="block">
                <Select 
                  value={config.type} 
                  onValueChange={(v: "package" | "note" | "quiz" | "assignment") => setConfig({ ...config, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("classes.resource.addDialog.typePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="package">{t("aiHub.assistant.architect")}</SelectItem>
                    <SelectItem value="note">{t("classes.resource.addDialog.types.note")}</SelectItem>
                    <SelectItem value="quiz">{t("classes.show.tabs.quizzes")}</SelectItem>
                    <SelectItem value="assignment">{t("classes.show.tabs.assignments")}</SelectItem>
                  </SelectContent>
                </Select>
              </span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("aiHub.assistant.helper.level")}</Label>
              <span className="block">
                <Select 
                  value={config.level} 
                  onValueChange={(v: MagicBuilderLevel) => setConfig({ ...config, level: v })}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-primary" />
                      <SelectValue placeholder={t("classes.resource.addDialog.typePlaceholder")} />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="primary">{t("aiHub.assistant.helper.levels.beginner")}</SelectItem>
                    <SelectItem value="high_school">{t("aiHub.assistant.helper.levels.intermediate")}</SelectItem>
                    <SelectItem value="university">{t("aiHub.assistant.helper.levels.advanced")}</SelectItem>
                  </SelectContent>
                </Select>
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("aiHub.assistant.helper.tone")}</Label>
            <span className="block">
              <Select 
                value={config.tone} 
                onValueChange={(v: MagicBuilderTone) => setConfig({ ...config, tone: v })}
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                    <SelectValue placeholder={t("classes.resource.addDialog.typePlaceholder")} />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">{t("aiHub.assistant.helper.tones.academic")}</SelectItem>
                  <SelectItem value="creative">{t("aiHub.assistant.helper.tones.creative")}</SelectItem>
                  <SelectItem value="practical">{t("aiHub.assistant.helper.tones.practical")}</SelectItem>
                </SelectContent>
              </Select>
            </span>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-primary" />
              {t("aiHub.assistant.helper.objectives")}
            </Label>
            <Textarea 
              placeholder={t("aiHub.assistant.helper.placeholders.objectives")} 
              value={config.objectives} 
              onChange={(e) => setConfig({ ...config, objectives: e.target.value })}
              className="resize-none h-20 text-xs"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("buttons.cancel")}</Button>
          <Button onClick={onGenerate} disabled={isGenerating} className="bg-ai-primary hover:bg-ai-primary/90 text-ai-primary-foreground">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("buttons.generating")}
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                {t("buttons.create")}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
