import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Copy, Check, Send, PlusCircle, BookOpen, FileText, HelpCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigation } from "@refinedev/core";
import { cn } from "@/lib/utils";

interface AssignmentPreviewProps {
  content: string;
  onUseContent?: (content: string) => void;
}

export const AssignmentPreview: React.FC<AssignmentPreviewProps> = ({ content, onUseContent }) => {
  const [copied, setCopied] = useState(false);
  const { create } = useNavigation();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGlobalCreate = () => {
    // TODO: Consider replacing sessionStorage with a more robust state management solution (e.g., Refine Context or Redux)
    sessionStorage.setItem("pending_ai_assignment", content);
    create("assignments");
  };

  // Helper to render structured content
  const renderStructuredContent = (text: string) => {
    if (!text) return null;

    // Simple heuristic to detect sections
    const sections = text.split(/(?=#{1,3}\s)/);
    
    return (
      <div className="space-y-6">
        {sections.map((section, idx) => {
          const isLesson = section.toLowerCase().includes("lesson") || section.toLowerCase().includes("introduction");
          const isAssignment = section.toLowerCase().includes("assignment") || section.toLowerCase().includes("task");
          const isQuiz = section.toLowerCase().includes("quiz") || section.toLowerCase().includes("test");

          return (
            <Card key={idx} className={cn(
              "border-l-4 overflow-hidden transition-all hover:shadow-md",
              isLesson ? "border-l-badge-blue bg-badge-blue/5" : 
              isAssignment ? "border-l-badge-purple bg-badge-purple/5" : 
              isQuiz ? "border-l-badge-pink bg-badge-pink/5" : "border-l-primary/20"
            )}>
              <CardHeader className="py-3 px-4 border-b border-black/5 dark:border-white/5 flex flex-row items-center gap-2">
                {isLesson && <BookOpen className="h-4 w-4 text-badge-blue" />}
                {isAssignment && <FileText className="h-4 w-4 text-badge-purple" />}
                {isQuiz && <HelpCircle className="h-4 w-4 text-badge-pink" />}
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
                  {isLesson ? "Lesson Material" : isAssignment ? "Assignment Task" : isQuiz ? "Quiz Section" : "Content Section"}
                </span>
              </CardHeader>
              <CardContent className="p-6 prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{section}</ReactMarkdown>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-full border-primary/10 shadow-xl bg-muted/5">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-card">
        <div className="space-y-1">
          <CardTitle className="text-sm font-bold uppercase tracking-wider">Magic Builder Output</CardTitle>
          <CardDescription className="text-[10px]">Beautifully structured educational content.</CardDescription>
        </div>
        <div className="flex gap-2">
          {content && (
            <>
              {onUseContent ? (
                <Button variant="default" size="sm" onClick={() => onUseContent(content)} className="gap-2 bg-ai-primary hover:bg-ai-primary/90 h-8 text-xs text-ai-primary-foreground">
                  <Send className="h-3.5 w-3.5" />
                  Use Content
                </Button>
              ) : (
                <Button variant="default" size="sm" onClick={handleGlobalCreate} className="gap-2 bg-primary hover:bg-primary/90 h-8 text-xs">
                  <PlusCircle className="h-3.5 w-3.5" />
                  Create Assignment
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={copyToClipboard} className="h-8 w-8">
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pt-6 px-6 pb-8">
        {content ? (
          renderStructuredContent(content)
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground space-y-4 opacity-50 bg-card rounded-2xl border border-dashed">
              <div className="p-4 bg-muted rounded-full animate-pulse">
                <PlusCircle className="h-8 w-8" />
              </div>
              <p className="italic font-medium">Your AI-generated content will appear here...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
