import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Sparkles, User as UserIcon } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { type Message, type ChatSource } from "@/types/ai";
import { ChatSourceBadge } from "./chat-source-badge";
import { AIFeedback } from "./ai-feedback";

interface ChatMessageProps {
  message: Message;
  isLast?: boolean;
}

export const ChatMessage = React.memo(
  ({ message, isLast: _isLast }: ChatMessageProps) => {
    const { t, i18n } = useTranslation();
    const isAr = i18n.language === "ar";
    const isModel = message.role === "model";
    const fullText = message.parts[0].text;

    // 🚀 PERFORMANCE: Memoize source deduplication to avoid expensive recalculations on every stream update
    const uniqueSources = React.useMemo(() => {
      if (!message.sources || message.sources.length === 0) return [];
      const seen = new Set<string>();
      return message.sources.filter((s) => {
        const key = s.id ? `id-${s.id}` : s.url ? `url-${s.url}` : `title-${s.title}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }, [message.sources]);

    return (
      <div
        className={cn(
          "flex gap-3 md:gap-4 group",
          !isModel ? (isAr ? "flex-row" : "flex-row-reverse") : ""
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
            !isModel ? (isAr ? "items-start" : "items-end") : "items-start"
          )}
        >
          <div
            className={cn(
              "relative p-4 md:p-5 rounded-2xl md:rounded-3xl text-sm md:text-base leading-relaxed",
              !isModel
                ? cn(
                    "bg-primary/10 text-foreground border border-primary/20",
                    isAr ? "rounded-tr-none" : "rounded-tl-none"
                  )
                : cn(
                    "bg-card border border-border/40 text-foreground shadow-sm",
                    isAr ? "rounded-tl-none" : "rounded-tr-none"
                  )
            )}
          >
            <div className="max-w-none prose prose-sm md:prose-base dark:prose-invert">
              <MarkdownRenderer content={fullText} />
            </div>

            {/* 🔄 AI FEEDBACK LOOP */}
            {isModel && (
              <div className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between">
                <AIFeedback
                  actionType="chat"
                  metadata={{
                    messageId: message.id || null,
                    messageLength: fullText.length,
                    role: message.role,
                    contentFingerprint: fullText.substring(0, 100),
                  }}
                />
              </div>
            )}

            {/* Citation Chips */}
            {uniqueSources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap gap-2">
                <span className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-muted-foreground w-full mb-1">
                  {t("aiHub.studyLab.studyBuddy.sources")}:
                </span>
                {uniqueSources.map((source: ChatSource, idx) => (
                  <ChatSourceBadge key={source.id || idx} source={source} index={idx} />
                ))}
              </div>
            )}
          </div>
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 px-2 mt-1">
            {isModel ? t("aiHub.studyLab.studyBuddy.title") : t("messages.you").replace(": ", "")}
          </span>
        </div>
      </div>
    );
  },
  (prev, next) => {
    // 🚀 PERFORMANCE: Avoid re-rendering old messages during active streaming.
    // 🛡️ ROBUSTNESS: Compare all message parts to handle potential multi-part evolution.
    const partsMatch =
      prev.message.parts.length === next.message.parts.length &&
      prev.message.parts.every((p, i) => p.text === next.message.parts[i].text);

    return (
      prev.message.role === next.message.role &&
      partsMatch &&
      prev.message.sources?.length === next.message.sources?.length &&
      prev.isLast === next.isLast
    );
  }
);
