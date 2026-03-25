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
import { cn } from "@/lib/utils";
import { useDashboard } from "@/features/dashboard/hooks/use-dashboard";
import { useUserRole } from "@/hooks/use-user-role";
import { AI_API } from "@/constants/api";
import { useCan } from "@refinedev/core";

interface AIStudyBuddyProps {
  subject?: string;
  topic?: string;
  assignment?: string;
  classId?: string | number;
}

export const AIStudyBuddy = ({ subject, topic, assignment, classId }: AIStudyBuddyProps) => {
  const { coreData } = useDashboard();
  const { isParent } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);

  // 🛡️ RBAC: Centralized access control via Refine patterns
  const { data: canAccessAI } = useCan({
      resource: "ai_features",
      action: "interact",
      params: { classId }
  });

  const {
    messages,
    streamingMessage,
    streamingSources,
    input,
    setInput,
    handleSend,
    isLoading,
    scrollAreaRef,
  } = useAIChat({
    url: AI_API.STUDY_BUDDY,
    classId,
    context: { subject, topic, assignment },
  });

  // 🛡️ Global Master Switch: Hide if AI is disabled
  // 🛡️ CONTEXT GUARD: Hide if no classId is provided
  // 🛡️ PARENT GATING: AI interactive features are disabled for Parents
  if (coreData?.globalConfig?.enableAiFeatures === false || !classId || isParent || canAccessAI?.can === false) {
    return null;
  }

  return (
    <div className={cn(
      "fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
      isOpen 
        ? "inset-0 md:inset-auto md:bottom-6 md:end-6 md:w-auto" 
        : "bottom-[5rem] md:bottom-6 end-4 md:end-6"
    )}>
      {isOpen ? (
        <Card className={cn(
          "shadow-2xl flex flex-col ai-gradient-border animate-[zoom-in_0.3s_ease-out] overflow-hidden",
          "w-full h-full md:w-[400px] md:h-[600px] rounded-none md:rounded-2xl bg-card/90 backdrop-blur-3xl"
        )}>
          <ChatHeader onClose={() => setIsOpen(false)} />
          
          <CardContent className="flex-1 p-0 overflow-hidden bg-dot-pattern min-h-0">
            <ScrollArea ref={scrollAreaRef} className="h-full p-4 md:p-6">
              {messages.length === 0 && !streamingMessage && (
                <ChatEmptyState subject={subject} />
              )}
              
              <div className="space-y-6 flex flex-col">
                {messages.map((msg, i) => (
                  <ChatMessage key={i} message={msg} />
                ))}
                
                {/* Live Streaming Message */}
                {streamingMessage && (
                  <ChatMessage 
                    message={{ 
                        role: "model", 
                        parts: [{ text: streamingMessage }],
                        sources: streamingSources || undefined
                    }} 
                  />
                )}

                {isLoading && !streamingMessage && (
                  <div className="flex gap-3 md:gap-4 animate-[fade-in_0.3s_ease-out]">
                    <div className="bg-ai-primary h-10 w-10 md:h-12 md:w-12 shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center border-2 border-background shadow-md">
                      <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-white" />
                    </div>
                    <div className="bg-card/80 backdrop-blur-md border border-border/40 p-4 md:p-5 rounded-2xl md:rounded-3xl rounded-ts-none shadow-sm flex items-center h-fit">
                      <div className="flex gap-1.5 md:gap-2">
                        <span className="h-1.5 w-1.5 md:h-2 md:w-2 bg-ai-primary/40 rounded-full animate-bounce" />
                        <span className="h-1.5 w-1.5 md:h-2 md:w-2 bg-ai-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1.5 w-1.5 md:h-2 md:w-2 bg-ai-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
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
          className="rounded-[1.5rem] md:rounded-[2rem] h-14 w-14 md:h-16 md:w-16 shadow-[0_10px_40px_-10px_rgba(var(--ai-primary),0.8)] hover:scale-110 active:scale-95 transition-all duration-500 bg-ai-primary border-none text-white p-0 group overflow-hidden"
          onClick={() => setIsOpen(true)}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <MessageCircle className="h-6 w-6 md:h-7 md:w-7 group-hover:rotate-12 transition-transform duration-500 relative z-10" />
        </Button>
      )}
    </div>
  );
};
