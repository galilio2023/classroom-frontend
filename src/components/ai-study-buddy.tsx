import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, MessageCircle } from "lucide-react";
import { ChatMessage } from "./ai/chat-message";
import { useAIChat } from "@/hooks/use-ai-chat";
import { ChatHeader } from "./ai/chat-header";
import { ChatEmptyState } from "./ai/chat-empty-state";
import { ChatInput } from "./ai/chat-input";

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
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-[400px] h-[600px] shadow-2xl flex flex-col ai-gradient-border animate-in zoom-in-95 duration-300">
          <ChatHeader onClose={() => setIsOpen(false)} />
          
          <CardContent className="flex-1 p-0 overflow-hidden bg-dot-pattern">
            <ScrollArea ref={scrollAreaRef} className="h-full p-6">
              {messages.length === 0 && (
                <ChatEmptyState subject={subject} />
              )}
              
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <ChatMessage key={i} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 h-9 w-9 shrink-0 rounded-full flex items-center justify-center border-2 border-background shadow-sm">
                      <Sparkles className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="bg-card border p-4 rounded-2xl rounded-tl-none shadow-sm">
                      <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce" />
                        <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1.5 w-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
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
          className="rounded-2xl h-16 w-16 shadow-2xl shadow-primary/40 hover:scale-110 transition-all duration-300 bg-gradient-to-br from-indigo-600 to-purple-700 border-0"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-7 w-7" />
        </Button>
      )}
    </div>
  );
};
