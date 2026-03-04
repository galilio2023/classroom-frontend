import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Copy, Check, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AssignmentPreviewProps {
  content: string;
  onUseContent?: (content: string) => void;
}

export const AssignmentPreview: React.FC<AssignmentPreviewProps> = ({ content, onUseContent }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Generated Content</CardTitle>
          <CardDescription>Your AI-generated assignment draft.</CardDescription>
        </div>
        <div className="flex gap-2">
          {content && onUseContent && (
            <Button variant="outline" size="sm" onClick={() => onUseContent(content)} className="gap-2">
              <Send className="h-4 w-4" />
              Use Content
            </Button>
          )}
          {content && (
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="h-full min-h-[300px] p-4 border rounded-md bg-muted/30 prose prose-sm dark:prose-invert max-w-none">
          {content ? (
            <ReactMarkdown>{content}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">Generated content will appear here...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
