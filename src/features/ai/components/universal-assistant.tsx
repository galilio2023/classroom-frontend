import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Sparkles, BrainCircuit, Send, Loader2 } from "lucide-react";
import { useAIChat } from "../hooks/use-ai-chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { cn } from "@/lib/utils";
import { useGetIdentity } from "@refinedev/core";
import { User } from "@/types";

interface UniversalAssistantProps {
  context?: Record<string, unknown>;
  classId?: string;
}

/**
 * 🤖 UNIVERSAL ASSISTANT SIDEBAR
 * Phase 1.4: Multi-Suite AI Reasoning Assistant.
 * Powered by AgentService (Gemini 1.5 Pro) with Tool-Calling capabilities.
 */
export const UniversalAssistant: React.FC<UniversalAssistantProps> = ({
  context,
  classId: propsClassId,
}) => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity<User>();
  const { classId: routeClassId } = useParams();
  const { pathname } = useLocation();
  const classId = propsClassId || routeClassId;

  const { messages, streamingMessage, input, setInput, handleSend, isLoading, scrollAreaRef } =
    useAIChat({
      url: "/ai/agent",
      context,
      classId,
    });

  const [isOpen, setIsOpen] = useState(false);

  // 🛡️ SECURITY: Strictly hide the assistant on public-facing pages and for unauthenticated guests
  const publicPaths = ["/", "/landing", "/pricing", "/login", "/register", "/forgot-password", "/reset-password", "/privacy", "/terms", "/discovery"];
  const isPublicPage = publicPaths.some(path => pathname === path || pathname.startsWith(path + "/"));
  
  if (isPublicPage || (!identityLoading && !identity)) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-indigo-600 to-purple-700 hover:scale-110 transition-transform z-50 group"
        >
          <Sparkles className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:w-[500px] flex flex-col p-0 border-l-purple-100 shadow-2xl"
      >
        <SheetHeader className="p-6 border-b bg-muted/30 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <BrainCircuit className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-400 dark:to-indigo-400">
                Tablawy Agent OS
              </SheetTitle>
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                Reasoning Engine • Gemini 1.5 Pro • Agentic Core
              </p>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-1 p-6 bg-zinc-50/50 dark:bg-transparent">
          <div className="space-y-6">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-4 opacity-60">
                <Sparkles className="h-12 w-12 text-purple-300" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">Hello! I'm your Tablawy Assistant.</p>
                  <p className="text-xs text-muted-foreground max-w-[200px]">
                    I can analyze grades, check your schedule, and help with risk assessments.
                  </p>
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "flex flex-col gap-2 max-w-[90%]",
                  m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-md"
                      : "bg-white dark:bg-zinc-900 rounded-tl-none border shadow-sm"
                  )}
                >
                  <MarkdownRenderer content={m.parts[0].text} />
                </div>
                <span className="text-[10px] text-muted-foreground px-1 uppercase">
                  {m.role === "user" ? "You" : "Tablawy Agent"}
                </span>
              </div>
            ))}

            {streamingMessage && (
              <div className="flex flex-col gap-2 max-w-[90%] mr-auto items-start">
                <div className="p-4 rounded-2xl text-sm bg-white dark:bg-zinc-900 rounded-tl-none border shadow-sm border-purple-200 dark:border-purple-900/50">
                  <MarkdownRenderer content={streamingMessage} />
                </div>
                <span className="text-[10px] text-muted-foreground px-1 uppercase">
                  Thinking...
                </span>
              </div>
            )}

            {isLoading && !streamingMessage && (
              <div className="flex items-center gap-3 text-muted-foreground text-xs font-medium animate-pulse bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm w-fit">
                <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                Processing reasoning steps...
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 border-t bg-background/80 backdrop-blur-md">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                placeholder="Ask anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="pr-12 min-h-[50px] bg-muted/50 focus-visible:ring-purple-500 border-none rounded-xl"
                disabled={isLoading}
              />
              <div className="absolute right-3 bottom-3 text-[10px] text-muted-foreground font-mono">
                ⌘↵
              </div>
            </div>
            <Button
              size="icon"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="h-[50px] w-[50px] shrink-0 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-purple-500/20"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="mt-4 text-[10px] text-center text-muted-foreground">
            Agent reasoning is grounded in your classroom data. Powered by Tablawy OS AI.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
};
