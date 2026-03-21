import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Sparkles, User as UserIcon, FileText } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
  sources?: any[];
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const isModel = message.role === "model";
  const fullText = message.parts[0].text;

  return (
    <div
      className={cn(
        "flex gap-3 md:gap-4",
        !isModel ? (isAr ? "flex-row" : "flex-row-reverse") : "",
      )}
    >
      <Avatar className="h-10 w-10 md:h-12 md:w-12 shrink-0 border-[1.5px] border-background shadow-sm">
        {isModel ? (
          <div className="bg-ai-primary h-full w-full flex items-center justify-center">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-white dark:text-black" />
          </div>
        ) : (
          <div className="bg-primary/10 h-full w-full flex items-center justify-center">
            <UserIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          </div>
        )}
      </Avatar>

      <div
        className={cn(
          "flex flex-col gap-1.5 max-w-[85%] md:max-w-[75%]",
          !isModel ? (isAr ? "items-start" : "items-end") : "items-start",
        )}
      >
        <div
          className={cn(
            "p-4 md:p-5 rounded-2xl md:rounded-3xl text-sm md:text-base leading-relaxed",
            !isModel
              ? cn(
                  "bg-primary/10 text-foreground border border-primary/20",
                  isAr ? "rounded-tr-none" : "rounded-tl-none",
                )
              : cn(
                  "bg-card border border-border/40 text-foreground shadow-sm",
                  isAr ? "rounded-tl-none" : "rounded-tr-none",
                ),
          )}
        >
          <div className="max-w-none prose prose-sm md:prose-base dark:prose-invert">
            <MarkdownRenderer content={fullText} />
          </div>

          {/* Citation Chips */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap gap-2">
              <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-muted-foreground w-full mb-1">
                {t("aiHub.studyLab.studyBuddy.sources")}:
              </span>
              <TooltipProvider>
                {message.sources.map((source, idx) => (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="secondary"
                        className="text-[9px] md:text-[10px] h-6 md:h-7 px-3 gap-1.5 bg-primary/10 hover:bg-primary/20 border-none text-primary font-bold cursor-help transition-colors"
                      >
                        <FileText className="h-3 w-3" />
                        {t("aiHub.studyLab.studyBuddy.source")} #{idx + 1}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-75 text-xs font-medium bg-card/95 backdrop-blur-xl border border-border/40 shadow-2xl rounded-2xl p-4 text-start">
                      <p className="font-black mb-2 text-primary uppercase tracking-widest text-[10px]">
                        Metadata
                      </p>
                      <pre className="bg-muted/50 p-3 rounded-xl text-[10px] overflow-auto max-h-37.5 custom-scrollbar text-start whitespace-pre-wrap wrap-break-word text-muted-foreground font-mono">
                        {JSON.stringify(source, null, 2)}
                      </pre>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          )}
        </div>
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 mt-1">
          {isModel
            ? t("aiHub.studyLab.studyBuddy.title")
            : t("messages.you").replace(": ", "")}
        </span>
      </div>
    </div>
  );
};
