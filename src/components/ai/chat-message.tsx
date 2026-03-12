import React, { useState, useEffect } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Sparkles, User as UserIcon } from "lucide-react";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useTranslation } from "react-i18next";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { t } = useTranslation();
  const isModel = message.role === "model";
  const fullText = message.parts[0].text;
  const [displayedText, setDisplayedText] = useState(isModel ? "" : fullText);
  const [isTyping, setIsTyping] = useState(isModel);

  useEffect(() => {
    if (!isModel) return;

    const words = fullText.split(" ");
    let index = 0;
    
    if (words.length > 100) {
        setDisplayedText(fullText);
        setIsTyping(false);
        return;
    }

    const timer = setInterval(() => {
      if (index < words.length) {
        setDisplayedText((prev) => (prev ? prev + " " + words[index] : words[index]));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [fullText, isModel]);

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
          <div className="max-w-none">
            {isTyping ? (
                <div className="whitespace-pre-wrap">{displayedText}</div>
            ) : (
                <MarkdownRenderer content={displayedText} />
            )}
            {isTyping && <span className="inline-block w-1.5 h-4 ml-1 bg-primary/40 animate-pulse align-middle" />}
          </div>
        </div>
        <span className="text-[9px] text-muted-foreground px-1">
          {isModel ? t("aiHub.studyLab.studyBuddy.title") : t("messages.you").replace(": ", "")}
        </span>
      </div>
    </div>
  );
};
