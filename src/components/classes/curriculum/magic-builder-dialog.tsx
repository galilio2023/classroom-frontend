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

interface MagicBuilderConfig {
  topic: string;
  type: "package" | "note" | "quiz" | "assignment";
  level: string;
  tone: string;
  objectives: string;
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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-ai-primary" />
              AI Magic Builder
          </DialogTitle>
          <DialogDescription>
              Generate a complete lesson package or specific materials using Gemini AI.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Topic</Label>
              <Input placeholder="e.g. Photosynthesis, Quantum Mechanics" value={config.topic} onChange={(e) => setConfig({ ...config, topic: e.target.value })} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Content Type</Label>
                  <Select 
                    value={config.type} 
                    onValueChange={(v: MagicBuilderConfig["type"]) => setConfig({ ...config, type: v })}
                  >
                      <SelectTrigger>
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="package">Full Package</SelectItem>
                          <SelectItem value="note">Lesson Notes</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
              <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Grade Level</Label>
                  <Select 
                    value={config.level} 
                    onValueChange={(v: string) => setConfig({ ...config, level: v })}
                  >
                      <SelectTrigger>
                          <div className="flex items-center gap-2">
                              <GraduationCap className="h-3.5 w-3.5 text-primary" />
                              <SelectValue />
                          </div>
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="primary">Primary School</SelectItem>
                          <SelectItem value="high_school">High School</SelectItem>
                          <SelectItem value="university">University</SelectItem>
                      </SelectContent>
                  </Select>
              </div>
          </div>

          <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tone & Style</Label>
              <Select 
                value={config.tone} 
                onValueChange={(v: string) => setConfig({ ...config, tone: v })}
              >
                  <SelectTrigger>
                      <div className="flex items-center gap-2">
                          <MessageSquare className="h-3.5 w-3.5 text-primary" />
                          <SelectValue />
                      </div>
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="academic">Academic & Formal</SelectItem>
                      <SelectItem value="creative">Creative & Engaging</SelectItem>
                      <SelectItem value="practical">Practical & Hands-on</SelectItem>
                  </SelectContent>
              </Select>
          </div>

          <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  Learning Objectives (Optional)
              </Label>
              <Textarea 
                  placeholder="e.g. Focus on chemical equations, or historical context..." 
                  value={config.objectives} 
                  onChange={(e) => setConfig({ ...config, objectives: e.target.value })}
                  className="resize-none h-20 text-xs"
              />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onGenerate} disabled={isGenerating} className="bg-ai-primary hover:bg-ai-primary/90 text-ai-primary-foreground">
              {isGenerating ? (
                  <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                  </>
              ) : (
                  <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate
                  </>
              )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
