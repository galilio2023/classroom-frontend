import React from "react";
import { AIAssignmentHelper } from "@/components/ai-assignment-helper";
import { AIQuizGenerator } from "@/components/ai-quiz-generator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileText, BrainCircuit } from "lucide-react";

export const AIAssistantPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-primary" />
          AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Leverage Gemini AI to create high-quality educational content in seconds.
        </p>
      </div>

      <Tabs defaultValue="assignment" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="assignment" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Assignment Helper
          </TabsTrigger>
          <TabsTrigger value="quiz" className="flex items-center gap-2">
            <BrainCircuit className="h-4 w-4" />
            Quiz Generator
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="assignment" className="mt-6">
          <AIAssignmentHelper />
        </TabsContent>
        
        <TabsContent value="quiz" className="mt-6">
          <AIQuizGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIAssistantPage;
