import React from "react";
import { useAssignmentGeneration } from "@/hooks/use-assignment-generation";
import { AssignmentGeneratorForm } from "./ai/assignment-generator-form";
import { AssignmentPreview } from "./ai/assignment-preview";

interface AIAssignmentHelperProps {
  onUseContent?: (content: string) => void;
}

export const AIAssignmentHelper: React.FC<AIAssignmentHelperProps> = ({ onUseContent }) => {
  const {
    subject,
    setSubject,
    topic,
    setTopic,
    difficulty,
    setDifficulty,
    generatedContent,
    handleGenerate,
    isLoading,
  } = useAssignmentGeneration();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AssignmentGeneratorForm
        subject={subject}
        setSubject={setSubject}
        topic={topic}
        setTopic={setTopic}
        difficulty={difficulty}
        setDifficulty={setDifficulty}
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
