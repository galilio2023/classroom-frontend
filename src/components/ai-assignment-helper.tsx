import React from "react";
import { useAssignmentGeneration } from "@/hooks/use-assignment-generation";
import { AssignmentGeneratorForm } from "./ai/assignment-generator-form";
import { AssignmentPreview } from "./ai/assignment-preview";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useUserRole } from "@/hooks/use-user-role";
import { AIFeatureDisabled } from "./ai/ai-feature-disabled";

interface AIAssignmentHelperProps {
  onUseContent?: (content: string) => void;
}

export const AIAssignmentHelper: React.FC<AIAssignmentHelperProps> = ({ onUseContent }) => {
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
    return <AIFeatureDisabled title="AI Assignment Helper Offline" />;
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
