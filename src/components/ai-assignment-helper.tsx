import React from "react";
import { useAssignmentGeneration } from "@/hooks/use-assignment-generation";
import { AssignmentGeneratorForm } from "./ai/assignment-generator-form";
import { AssignmentPreview } from "./ai/assignment-preview";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useUserRole } from "@/hooks/use-user-role";
import { BrainCircuit } from "lucide-react";

interface AIAssignmentHelperProps {
  onUseContent?: (content: string) => void;
}

export const AIAssignmentHelper: React.FC<AIAssignmentHelperProps> = ({
  onUseContent,
}) => {
  const { coreData } = useDashboard();
  const { isParent } = useUserRole();
  const {
    subject,
    setSubject,
    topic,
    setTopic,
    difficulty,
    setDifficulty,
    tone,
    setTone,
    objectives,
    setObjectives,
    generatedContent,
    handleGenerate,
    isLoading,
  } = useAssignmentGeneration();

  const isAiEnabled = coreData?.globalConfig?.enableAiFeatures !== false;

  // 🛡️ PARENT GATING: AI interactive features are disabled for Parents
  if (isParent) return null;

  // 🛡️ Global Master Switch: Graceful Degradation
  if (!isAiEnabled) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-border/40 text-center p-8 space-y-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <BrainCircuit className="w-10 h-10 text-destructive grayscale" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold">AI Assignment Helper Offline</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            AI features are currently disabled by the administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AssignmentGeneratorForm
        subject={subject}
        setSubject={setSubject}
        topic={topic}
        setTopic={setTopic}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        tone={tone}
        setTone={setTone}
        objectives={objectives}
        setObjectives={setObjectives}
        handleGenerate={handleGenerate}
        isLoading={isLoading}
      />
      <AssignmentPreview
        content={generatedContent}
        onUseContent={onUseContent}
      />
    </div>
  );
};
