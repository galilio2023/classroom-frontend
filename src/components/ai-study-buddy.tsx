import { useState, useRef, useEffect } from "react";
import { useCustomMutation } from "@refinedev/core";
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
import { Sparkles, Send, X, MessageCircle, Loader2, GraduationCap, User } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { mutate: sendMessage, mutation } = useCustomMutation<{ response: string }>();
  const isLoading = mutation.isPending;

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

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
        <Card className="w-[380px] h-[500px] shadow-2xl flex flex-col border-primary/20 animate-in slide-in-from-bottom-4">
          <CardHeader className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">AI Study Buddy</CardTitle>
                <p className="text-[10px] opacity-80">Helping you with {subject || "your studies"}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-white/20 text-primary-foreground"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea ref={scrollAreaRef} className="h-full p-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-12 text-center space-y-4">
                  <div className="p-4 bg-primary/5 rounded-full">
                    <GraduationCap className="h-10 w-10 text-primary opacity-20" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Hello! I'm your Study Buddy.</p>
                    <p className="text-xs text-muted-foreground px-8">
                      Ask me anything about {subject || "your subjects"}. I'm here to help you learn!
                    </p>
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      {msg.role === "model" ? (
                        <div className="bg-primary h-full w-full flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="bg-muted h-full w-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </Avatar>
                    <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === "user" ? "items-end" : ""}`}>
                      <div className={`p-3 rounded-2xl text-sm ${
                        msg.role === "user" 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : "bg-muted rounded-tl-none"
                      }`}>
                        <div 
                          className="prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: msg.parts[0].text }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <div className="bg-primary h-full w-full flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </Avatar>
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-none">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 border-t">
            <form 
              className="flex w-full items-center space-x-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <Input
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      ) : (
        <Button 
          size="lg" 
          className="rounded-full h-14 w-14 shadow-xl hover:scale-110 transition-transform"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};
