import React from "react";
import { Avatar } from "@/components/ui/avatar";
import { Sparkles, User as UserIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === "model";

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
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-card border rounded-tl-none"
        }`}>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{message.parts[0].text}</ReactMarkdown>
          </div>
        </div>
        <span className="text-[9px] text-muted-foreground px-1">
          {isModel ? "Study Buddy" : "You"}
        </span>
      </div>
    </div>
  );
};
