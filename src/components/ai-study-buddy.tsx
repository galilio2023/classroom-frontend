import { useState, useRef, useEffect } from "react";
import { useCustomMutation, useGetIdentity } from "@refinedev/core";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Send, X, MessageCircle, Loader2, GraduationCap, User as UserIcon } from "lucide-react";
import { User, UserRole } from "@/types";

interface Message {
  role: "user" | "model";
  parts: { text: string }[];
}

interface AIStudyBuddyProps {
  subject?: string;
  topic?: string;
  assignment?: string;
}

export const AIStudyBuddy = ({ subject, topic, assignment }: AIStudyBuddyProps) => {
  const { data: identity } = useGetIdentity<User>();
  const isTeacher = identity?.role === UserRole.TEACHER || identity?.role === UserRole.ADMIN;

  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { mutate: sendMessage, mutation } = useCustomMutation<{ response: string }>();
  const isLoading = mutation.isPending;

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  if (!isTeacher) return null;

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      parts: [{ text: input }],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    sendMessage(
      {
        url: "/ai/chat",
        method: "post",
        values: {
          message: input,
          history: messages,
          context: { subject, topic, assignment },
        },
      },
      {
        onSuccess: (data) => {
          const aiMessage: Message = {
            role: "model",
            parts: [{ text: data.data.response }],
          };
          setMessages((prev) => [...prev, aiMessage]);
        },
      }
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-[400px] h-[600px] shadow-2xl flex flex-col ai-gradient-border animate-in zoom-in-95 duration-300">
          <CardHeader className="p-5 border-b bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-primary-foreground rounded-t-[calc(var(--radius)-1px)] flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-inner">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <CardTitle className="text-base font-bold tracking-tight">AI Study Buddy</CardTitle>
                <p className="text-[10px] font-medium opacity-90 uppercase tracking-widest">Powered by Gemini</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-white/20 text-primary-foreground rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden bg-dot-pattern">
            <ScrollArea ref={scrollAreaRef} className="h-full p-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-6">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl animate-pulse" />
                    <div className="relative p-5 bg-primary/5 rounded-full border border-primary/10">
                        <GraduationCap className="h-12 w-12 text-primary opacity-40" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-base font-bold text-foreground">Your Personal Tutor</p>
                    <p className="text-xs text-muted-foreground px-10 leading-relaxed">
                      I'm here to help you master <span className="text-primary font-semibold">{subject || "your subjects"}</span>. What should we explore today?
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-9 w-9 shrink-0 border-2 border-background shadow-sm">
                      {msg.role === "model" ? (
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 h-full w-full flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="bg-muted h-full w-full flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </Avatar>
                    <div className={`flex flex-col gap-1.5 max-w-[85%] ${msg.role === "user" ? "items-end" : ""}`}>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-card border rounded-tl-none"
                      }`}>
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: msg.parts[0].text }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground px-1">
                        {msg.role === "model" ? "Study Buddy" : "You"}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9 shrink-0 border-2 border-background shadow-sm">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 h-full w-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </Avatar>
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

          <CardFooter className="p-4 border-t bg-muted/20">
            <form 
              className="flex w-full items-center space-x-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <Input
                placeholder="Type your question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-background border-muted-foreground/20 focus-visible:ring-primary/30 h-11 rounded-xl"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className="h-11 w-11 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
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
