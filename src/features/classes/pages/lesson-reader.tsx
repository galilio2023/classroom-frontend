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
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

export const LessonReader = () => {
  const { t, i18n } = useTranslation();
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { data: identity } = useGetIdentity<User>();
  
  const [isChatOpen, setIsAddChatOpen] = useState(false);
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
  }, [chatHistory, isTyping]);

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
        onSuccess: (data) => {
          const responseData = data.data as { response: string };
          setChatHistory((prev) => [
            ...prev,
            { role: "model", parts: [{ text: responseData.response }] }
          ]);
          setIsTyping(false);
        },
        onError: () => {
          setIsTyping(false);
          toast.error(t("classes.reader.toast.unavailable"));
        }
      }
    );
  };

  const isAr = i18n.language === 'ar';

  if (isLoading) {
    return (
      <div className="flex flex-col h-dvh items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
            {t("classes.resource.loading")}
        </p>
      </div>
    );
  }

  if (!resource || resource.type !== "note") {
    return (
      <div className="flex flex-col items-center justify-center h-dvh gap-6 p-6 text-center">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
            <X className="h-10 w-10" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tight">{t("classes.reader.lessonNotFound")}</h2>
            <p className="text-muted-foreground font-medium max-w-xs mx-auto">{t("classes.show.notFoundDescription")}</p>
        </div>
        <Button onClick={() => navigate(-1)} className="rounded-xl font-black uppercase tracking-widest text-[10px] h-12 px-8">
            {t("buttons.goBack")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-dvh bg-background overflow-hidden relative">
      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-500 ease-in-out relative min-w-0",
        isChatOpen ? (isAr ? "lg:ms-100" : "lg:me-100") : "m-0"
      )}>
        {/* Header */}
        <header className="h-16 md:h-20 border-b flex items-center justify-between px-4 md:px-8 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full h-9 w-9 md:h-11 md:w-11">
              <ArrowLeft className={cn("h-5 w-5", isAr && "rotate-180")} />
            </Button>
            <div className="flex items-center gap-2 md:gap-3 min-w-0">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                  <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <h1 className="font-black text-sm md:text-lg truncate max-w-50 xs:max-w-50 sm:max-w-md tracking-tight">{resource.title}</h1>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddChatOpen(!isChatOpen)}
            className={cn(
                "rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] h-9 md:h-11 px-3 md:px-5 gap-2 transition-all shadow-sm",
                isChatOpen ? "bg-primary/10 text-primary border-primary/20" : "bg-card/50 border-border/50"
            )}
          >
            <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="hidden xs:inline">{isChatOpen ? t("classes.reader.hideAiTutor") : t("classes.reader.aiTutor")}</span>
          </Button>
        </header>

        {/* Lesson Content */}
        <main className="flex-1 overflow-y-auto px-4 md:px-12 lg:px-20 py-10 md:py-20 max-w-5xl mx-auto w-full text-start scroll-smooth">
          <article className="prose prose-sm md:prose-base lg:prose-lg dark:prose-invert max-w-none">
            <header className="mb-10 md:mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-4 md:mb-6 leading-tight">
                        {resource.title}
                    </h1>
                </motion.div>
                {resource.description && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <p className={cn(
                            "text-lg md:text-xl text-muted-foreground italic py-2 md:py-3 leading-relaxed", 
                            isAr ? "border-r-4 pr-4 md:pr-6" : "border-l-4 pl-4 md:pl-6"
                        )}>
                            {resource.description}
                        </p>
                    </motion.div>
                )}
            </header>
            
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-6 md:space-y-8"
            >
                <ReactMarkdown>{resource.content || ""}</ReactMarkdown>
            </motion.div>
            
            {/* Bottom Actions/Spacing */}
            <div className="h-20" />
          </article>
        </main>
      </div>

      {/* AI Tutor Sidebar/Drawer */}
      <AnimatePresence>
          {isChatOpen && (
              <motion.aside 
                initial={isAr ? { x: -400 } : { x: 400 }}
                animate={{ x: 0 }}
                exit={isAr ? { x: -400 } : { x: 400 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={cn(
                    "fixed top-0 bottom-0 w-full md:w-[400px] lg:w-[400px] border-l bg-card/95 backdrop-blur-3xl z-[50] shadow-2xl flex flex-col overflow-hidden",
                    isAr ? "left-0 border-r border-l-0" : "right-0 border-l",
                )}
              >
                {/* AI Tutor Header */}
                <div className="h-16 md:h-20 px-6 border-b flex items-center justify-between bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl shadow-inner">
                        <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <div className="text-start">
                        <h2 className="font-black text-sm md:text-base tracking-tight">{t("classes.reader.tutorTitle")}</h2>
                        <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t("classes.reader.tutorDescription")}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsAddChatOpen(false)} className="rounded-full h-8 w-8 md:h-10 md:w-10">
                    <X className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </div>

                <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
                  <div className="space-y-6">
                    <div className="bg-muted/50 p-4 rounded-2xl text-[11px] md:text-xs leading-relaxed text-start font-medium border border-black/[0.03] dark:border-white/[0.03]">
                        {t("classes.reader.welcome", { name: identity?.name, title: resource.title })}
                    </div>

                    {chatHistory.map((msg, i) => (
                      <div key={i} className={cn(
                        "flex flex-col max-w-[90%] gap-1.5",
                        msg.role === "user" 
                            ? (isAr ? "ms-auto items-start" : "ms-auto items-end") 
                            : (isAr ? "me-auto items-end" : "me-auto items-start")
                      )}>
                        <div className={cn(
                          "p-4 rounded-2xl text-sm shadow-sm transition-all",
                          msg.role === "user" 
                            ? "bg-primary text-primary-foreground shadow-primary/20 rounded-tr-none" 
                            : "bg-muted shadow-none rounded-tl-none"
                        )}>
                          <div className="prose prose-sm dark:prose-invert max-w-none text-start font-medium leading-relaxed">
                            <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                          </div>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 px-1">
                            {msg.role === 'user' ? identity?.name : 'AI Tutor'}
                        </span>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex gap-2 items-center text-muted-foreground animate-pulse px-2">
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce delay-100" />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce delay-200" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest">{t("classes.reader.thinking")}</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* AI Tutor Input Area */}
                <div className="p-4 md:p-6 border-t bg-background/50 backdrop-blur-xl">
                  <div className="relative group">
                    <Textarea
                      placeholder={t("classes.reader.askPlaceholder")}
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className={cn(
                          "min-h-24 md:min-h-28 resize-none rounded-2xl md:rounded-3xl p-4 md:p-6 text-sm transition-all border-border/50 focus:border-primary/30 bg-muted/20", 
                          isAr ? "pl-14 pr-4" : "pr-14 pl-4"
                      )}
                    />
                    <Button 
                      size="icon" 
                      className={cn(
                          "absolute bottom-4 h-9 w-9 md:h-11 md:w-11 rounded-xl md:rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-90", 
                          isAr ? "left-4" : "right-4"
                      )}
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim() || isTyping}
                    >
                      <Send className={cn("h-4 w-4 md:h-5 md:w-5", isAr && "rotate-180")} />
                    </Button>
                  </div>
                  <p className="mt-3 text-[8px] md:text-[9px] text-center font-bold text-muted-foreground/40 uppercase tracking-[0.1em]">
                    {t("common.aiInsightTitle")} • Gemini 3 Flash Preview
                  </p>
                </div>
              </motion.aside>
          )}
      </AnimatePresence>
      
      {/* Mobile Backdrop for AI Tutor */}
      <AnimatePresence>
          {isChatOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddChatOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[45]"
              />
          )}
      </AnimatePresence>
    </div>
  );
};

export default LessonReader;
