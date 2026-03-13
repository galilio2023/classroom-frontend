import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Sparkles, User as UserIcon, FileText } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
  sources?: any[];
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { t } = useTranslation();
  const isModel = message.role === "model";
  const fullText = message.parts[0].text;

  return (
    <div className={`flex gap-3 ${!isModel ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-9 w-9 shrink-0 border-2 border-background shadow-sm">
        {isModel ? (
          <div className="bg-ai-primary h-full w-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-ai-primary-foreground" />
          </div>
        ) : (
          <div className="bg-muted h-full w-full flex items-center justify-center">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </Avatar>
      <div className={`flex flex-col gap-1.5 max-w-[85%] ${!isModel ? "items-end" : ""}`}>
        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
          !isModel 
            ? "bg-card border rounded-tl-none" 
            : "bg-primary text-primary-foreground rounded-tr-none"
        }`}>
          <div className="max-w-none prose dark:prose-invert">
            <MarkdownRenderer content={fullText} />
          </div>
          
          {/* Citation Chips (Task 4.4) */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-primary-foreground/10 flex flex-wrap gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest opacity-60 w-full mb-1">
                {t("aiHub.studyLab.studyBuddy.sources")}:
              </span>
              <TooltipProvider>
                {message.sources.map((source, idx) => (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="secondary" 
                        className="text-[9px] h-6 gap-1 bg-white/10 hover:bg-white/20 border-none text-white font-bold cursor-help"
                      >
                        <FileText className="h-3 w-3" />
                        {t("aiHub.studyLab.studyBuddy.source")} #{idx + 1}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px] text-xs font-medium">
                      <p className="font-black mb-1">Chunk Metadata:</p>
                      <pre className="bg-muted p-2 rounded text-[10px]">
                        {JSON.stringify(source, null, 2)}
                      </pre>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          )}
        </div>
        <span className="text-[9px] text-muted-foreground px-1">
          {isModel ? t("aiHub.studyLab.studyBuddy.title") : t("messages.you").replace(": ", "")}
        </span>
      </div>
    </div>
  );
};
