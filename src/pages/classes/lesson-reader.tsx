import { useOne, useGetIdentity, useCustomMutation } from "@refinedev/core";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Resource, User } from "@/types";
import { 
  Loader2, 
  ArrowLeft, 
  MessageSquare, 
  Sparkles, 
  Send, 
  BookOpen,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const LessonReader = () => {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<User>();
  
  const [isChatOpen, setIsAddChatOpen] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: "user" | "model"; parts: { text: string }[] }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { query } = useOne<Resource>({
    resource: "resources",
    id: resourceId,
    queryOptions: { enabled: !!resourceId }
  });

  const resource = query.data?.data;
  const isLoading = query.isLoading;

  const { mutate: chatMutation } = useCustomMutation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !resource?.content) return;

    const userMsg = { role: "user" as const, parts: [{ text: chatMessage }] };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatMessage("");
    setIsTyping(true);

    chatMutation(
      {
        url: "ai/chat",
        method: "post",
        values: {
          message: chatMessage,
          history: chatHistory,
          context: {
            subject: "Lesson Content",
            topic: resource.title,
            assignment: resource.content
          }
        },
      },
      {
        onSuccess: (data: any) => {
          setChatHistory((prev) => [
            ...prev,
            { role: "model", parts: [{ text: data.data.response }] }
          ]);
          setIsTyping(false);
        },
        onError: () => {
          setIsTyping(false);
          toast.error("AI Tutor is currently unavailable.");
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!resource || resource.type !== "note") {
    return (
      <div className="flex flex-col items-center justify-center h-dvh gap-4">
        <p>Lesson not found or invalid type.</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh bg-background overflow-hidden">
      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isChatOpen ? "mr-0 lg:mr-100" : "mr-0"
      )}>
        {/* Header */}
        <header className="h-16 border-b flex items-center justify-between px-6 bg-card/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="font-bold truncate max-w-50 sm:max-w-md">{resource.title}</h1>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddChatOpen(!isChatOpen)}
            className={cn("gap-2", isChatOpen && "bg-primary/10 text-primary border-primary/20")}
          >
            <MessageSquare className="h-4 w-4" />
            {isChatOpen ? "Hide AI Tutor" : "AI Tutor"}
          </Button>
        </header>

        {/* Lesson Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20 max-w-5xl mx-auto w-full">
          <article className="prose prose-lg dark:prose-invert max-w-none">
            <div className="mb-8">
                <h1 className="text-4xl font-black tracking-tight mb-2">{resource.title}</h1>
                {resource.description && (
                    <p className="text-xl text-muted-foreground italic border-l-4 pl-4 py-1">
                        {resource.description}
                    </p>
                )}
            </div>
            <ReactMarkdown>{resource.content || ""}</ReactMarkdown>
          </article>
        </main>
      </div>

      {/* AI Tutor Sidebar */}
      <aside className={cn(
        "fixed right-0 top-0 h-full w-full lg:w-100 border-l bg-card transition-transform duration-300 z-20 shadow-2xl flex flex-col",
        isChatOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-4 border-b flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
                <h2 className="font-bold text-sm">AI Lesson Tutor</h2>
                <p className="text-[10px] text-muted-foreground">Ask me anything about this lesson</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsAddChatOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <div className="bg-muted/50 p-3 rounded-lg text-xs leading-relaxed">
                Hi {identity?.name}! I've read through <strong>{resource.title}</strong>. 
                If you're confused about any part of the text or want more examples, just ask!
            </div>

            {chatHistory.map((msg, i) => (
              <div key={i} className={cn(
                "flex flex-col max-w-[85%] gap-1",
                msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
              )}>
                <div className={cn(
                  "p-3 rounded-2xl text-sm",
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted rounded-tl-none"
                )}>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-1 items-center text-muted-foreground animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-[10px]">Tutor is thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t bg-background">
          <div className="relative">
            <Textarea
              placeholder="Ask a question..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="min-h-20 pr-12 resize-none"
            />
            <Button 
              size="icon" 
              className="absolute right-2 bottom-2 h-8 w-8"
              onClick={handleSendMessage}
              disabled={!chatMessage.trim() || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default LessonReader;
