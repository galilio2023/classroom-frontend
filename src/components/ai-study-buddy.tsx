import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, MessageCircle, X } from "lucide-react";
import { ChatMessage } from "./ai/chat-message";
import { useAIChat } from "@/hooks/use-ai-chat";
import { ChatHeader } from "./ai/chat-header";
import { ChatEmptyState } from "./ai/chat-empty-state";
import { ChatInput } from "./ai/chat-input";
import { cn } from "@/lib/utils";

interface AIStudyBuddyProps {
  subject?: string;
  topic?: string;
  assignment?: string;
  classId?: string | number; // New: Support for class-specific knowledge
}

export const AIStudyBuddy = ({ subject, topic, assignment, classId }: AIStudyBuddyProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    messages,
    input,
    setInput,
    handleSend,
    isLoading,
    scrollAreaRef,
  } = useAIChat({
    url: "/ai/chat",
    context: { subject, topic, assignment },
    classId, // Pass classId to the hook
  });

  return (
    <div className={cn(
      "fixed z-50 transition-all duration-300",
      isOpen 
        ? "inset-0 md:inset-auto md:bottom-6 md:right-6" 
        : "bottom-20 md:bottom-6 right-6"
    )}>
      {isOpen ? (
        <Card className={cn(
          "shadow-2xl flex flex-col ai-gradient-border animate-in zoom-in-95 duration-300 overflow-hidden",
          "w-full h-full md:w-[400px] md:h-[600px] rounded-none md:rounded-xl"
        )}>
          <ChatHeader onClose={() => setIsOpen(false)} />
          
          <CardContent className="flex-1 p-0 overflow-hidden bg-dot-pattern">
            <ScrollArea ref={scrollAreaRef} className="h-full p-4 md:p-6">
              {messages.length === 0 && (
                <ChatEmptyState subject={subject} />
              )}
              
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <ChatMessage key={i} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="bg-ai-primary h-9 w-9 shrink-0 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                      <Sparkles className="h-4 w-4 text-ai-primary-foreground" />
                    </div>
                    <div className="bg-card border p-4 rounded-2xl rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 bg-ai-primary/40 rounded-full animate-bounce" />
                        <span className="h-1.5 w-1.5 bg-ai-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1.5 w-1.5 bg-ai-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <ChatInput 
            input={input} 
            setInput={setInput} 
            handleSend={handleSend} 
            isLoading={isLoading} 
          />
        </Card>
      ) : (
        <Button 
          size="lg" 
          className="rounded-2xl h-14 w-14 md:h-16 md:w-16 shadow-2xl shadow-ai-primary/40 hover:scale-110 transition-all duration-300 bg-ai-primary border-0"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
        </Button>
      )}
    </div>
  );
};
