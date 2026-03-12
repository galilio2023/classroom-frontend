import { useList, useCreate, useDelete, useGetIdentity, useCustomMutation } from "@refinedev/core";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Discussion, User } from "@/types";
import { Loader2, Send, Sparkles, X, MessageCircle, LayoutDashboard, Info, ArrowRight, Reply } from "lucide-react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { ChatBubble } from "@/components/classes/chat-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SOCKET_URL } from "@/config";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface DiscussionTabProps {
  classId: string;
}

export const DiscussionTab = ({ classId }: DiscussionTabProps) => {
  const { t, i18n } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const [newPost, setNewPost] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const { query } = useList<Discussion>({
    resource: "discussions",
    filters: [
      { field: "classId", operator: "eq", value: classId },
      { field: "parentId", operator: "null", value: true },
    ],
    pagination: { mode: "off" },
    queryOptions: { enabled: !!classId },
  });

  const discussions = query.data?.data || [];
  const isLoading = query.isLoading;
  const refetch = query.refetch;

  const { mutate: createPost, mutation } = useCreate<Discussion, any, any>();
  const { mutate: deletePost } = useDelete();
  const { mutate: generateSummary } = useCustomMutation();

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [discussions]);

  useEffect(() => {
    if (!identity?.id || !classId) return;
    
    const socket = io(SOCKET_URL, {
      query: { userId: identity.id, classId },
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("new_discussion", () => { 
      void refetch(); 
    });

    socket.on("delete_discussion", () => { 
      void refetch(); 
    });

    return () => { 
      socket.disconnect(); 
    };
  }, [identity?.id, classId, refetch]);

  const handlePost = () => {
    if (!newPost.trim() || newPost === "<p></p>") return;
    createPost(
      {
        resource: "discussions",
        values: { 
          content: newPost, 
          classId: Number(classId),
          parentId: replyTo
        },
      },
      {
        onSuccess: () => {
          setNewPost("");
          setReplyTo(null);
          toast.success(replyTo ? t("discussion.toast.replySent") : t("discussion.toast.messagePosted"));
        },
      }
    );
  };

  const handleGenerateSummary = () => {
    setIsSummarizing(true);
    generateSummary(
      { url: `classes/${classId}/generate-summary`, method: "post", values: {} },
      {
        onSuccess: (data: any) => {
          setSummary(data.data.summary);
          setIsSummarizing(false);
        },
        onError: () => setIsSummarizing(false)
      }
    );
  };

  const replyingToPost = discussions.find(d => d.id === replyTo);
  const isAr = i18n.language === 'ar';

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] md:h-[calc(100vh-350px)] min-h-[500px] bg-card/50 backdrop-blur-xl rounded-[2rem] border border-black/[0.05] dark:border-white/[0.05] overflow-hidden shadow-2xl text-start">
      {/* Header */}
      <div className="p-6 border-b bg-background/50 backdrop-blur-md flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight leading-none">{t("discussion.classStream")}</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mt-1.5">{t("discussion.realTime")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="hidden sm:flex rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest bg-muted/50 border-none">
            {t("discussion.messagesCount", { count: discussions.length })}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateSummary} 
            disabled={isSummarizing}
            className="h-10 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 relative overflow-hidden group shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none" />
            {isSummarizing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{t("discussion.aiCatchUp")}</span>
            <span className="sm:hidden">{t("discussion.aiCatchUp").split(' ')[0]}</span>
          </Button>
        </div>
      </div>

      {/* AI Summary Overlay */}
      <AnimatePresence>
        {summary && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-ai-primary/[0.03] border-b border-ai-primary/10 relative overflow-hidden"
          >
            <div className="p-6 pr-14">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-ai-primary/10 text-ai-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <span className="font-black text-[10px] text-ai-primary uppercase tracking-widest">{t("discussion.aiSummary")}</span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground font-medium leading-relaxed">
                <MarkdownRenderer content={summary} />
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSummary(null)} 
              className={cn("absolute top-4 h-10 w-10 rounded-full hover:bg-ai-primary/10 text-ai-primary/40 hover:text-ai-primary transition-all", isAr ? "left-4" : "right-4")}
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Stream */}
      <ScrollArea ref={scrollRef} className="flex-1 p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{t("discussion.loadingStream")}</p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 opacity-20">
            <div className="p-6 rounded-full bg-muted/50">
              <MessageCircle className="h-12 w-12" />
            </div>
            <div className="space-y-1">
              <p className="text-xl font-black tracking-tight">{t("discussion.noMessages")}</p>
              <p className="text-sm font-medium">{t("discussion.startConversation")}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {discussions.map((post, idx) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ChatBubble 
                  post={post} 
                  isOwn={post.userId === identity?.id}
                  isAdmin={identity?.role === "admin"}
                  onDelete={(id) => deletePost({ resource: "discussions", id })}
                  onReply={(id) => {
                    setReplyTo(id);
                    (document.querySelector('.rich-text-editor [contenteditable="true"]') as HTMLElement)?.focus();
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="p-6 bg-background/80 backdrop-blur-xl border-t border-black/[0.05] dark:border-white/[0.05]">
        <AnimatePresence>
          {replyTo && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mb-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex justify-between items-center group"
            >
              <div className="flex items-center gap-3 overflow-hidden text-start">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Reply className={cn("h-4 w-4", isAr && "rotate-180")} />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">{t("discussion.replyingTo")}</span>
                  <p className="text-xs font-bold truncate text-foreground">
                    {replyingToPost?.user.name}: <span className="font-medium text-muted-foreground italic">"{replyingToPost?.content.replace(/<[^>]*>/g, '')}"</span>
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setReplyTo(null)} 
                className="h-8 w-8 rounded-full hover:bg-primary/10 text-primary/40 hover:text-primary transition-all"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="flex gap-4 items-end">
          <div className="flex-1 rounded-[1.5rem] overflow-hidden border-2 border-transparent focus-within:border-primary/20 transition-all shadow-inner bg-muted/20">
            <RichTextEditor 
              value={newPost}
              onChange={setNewPost}
              placeholder={replyTo ? t("discussion.writeReply") : t("discussion.messageClass")}
              className="min-h-[100px]"
            />
          </div>
          <Button 
            size="icon" 
            onClick={handlePost} 
            disabled={!newPost.trim() || newPost === "<p></p>" || mutation.isPending}
            className="h-14 w-14 shrink-0 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground"
          >
            {mutation.isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className={cn("h-6 w-6", isAr && "rotate-180")} />}
          </Button>
        </div>
        <div className="mt-3 flex items-center justify-center gap-2 text-muted-foreground/30">
          <Info className="h-3 w-3" />
          <span className="text-[9px] font-black uppercase tracking-widest">{t("discussion.pressEnter")}</span>
        </div>
      </div>
    </div>
  );
};
