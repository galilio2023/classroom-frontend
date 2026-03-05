import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Copy, Check, Send, PlusCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useNavigation } from "@refinedev/core";

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
    // Store content in session storage so the create page can pick it up
    sessionStorage.setItem("pending_ai_assignment", content);
    create("assignments");
  };

  return (
    <Card className="flex flex-col h-full border-primary/10 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b bg-muted/20">
        <div className="space-y-1">
          <CardTitle className="text-sm font-bold uppercase tracking-wider">Generated Draft</CardTitle>
          <CardDescription className="text-[10px]">Review and apply this content.</CardDescription>
        </div>
        <div className="flex gap-2">
          {content && (
            <>
              {onUseContent ? (
                <Button variant="default" size="sm" onClick={() => onUseContent(content)} className="gap-2 bg-purple-600 hover:bg-purple-700 h-8 text-xs">
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
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto pt-6">
        <div className="h-full min-h-[400px] p-6 rounded-2xl bg-background border shadow-inner prose prose-sm dark:prose-invert max-w-none">
          {content ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 opacity-50">
                <Send className="h-12 w-12" />
                <p className="italic font-medium">Your AI-generated draft will appear here...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
