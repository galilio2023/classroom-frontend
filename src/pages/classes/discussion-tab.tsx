import { useList, useCreate, useDelete, useGetIdentity, useCustomMutation } from "@refinedev/core";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Discussion, User } from "@/types";
import { Loader2, Send, Sparkles, X, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { ChatBubble } from "@/components/classes/chat-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { SOCKET_URL } from "@/config";

interface DiscussionTabProps {
  classId: string;
}

export const DiscussionTab = ({ classId }: DiscussionTabProps) => {
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
    });
    socket.on("new_discussion", () => { void refetch(); });
    socket.on("delete_discussion", () => { void refetch(); });
    return () => { socket.disconnect(); };
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
          toast.success(replyTo ? "Reply sent" : "Message posted");
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

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] md:h-[calc(100vh-300px)] min-h-[400px] md:min-h-[500px] bg-muted/20 rounded-xl md:rounded-2xl border border-border/50 overflow-hidden">
      <div className="p-3 md:p-4 border-b bg-background/50 backdrop-blur-md flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold leading-none">Class Stream</h3>
            <p className="text-[9px] md:text-[10px] text-muted-foreground mt-1">Real-time discussion with your class</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleGenerateSummary} 
          disabled={isSummarizing}
          className="h-7 md:h-8 text-[10px] md:text-xs gap-1.5 md:gap-2 border-primary/20 hover:bg-primary/5 text-primary"
        >
          {isSummarizing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          <span className="hidden sm:inline">AI Catch-up</span>
          <span className="sm:hidden">Catch-up</span>
        </Button>
      </div>

      {summary && (
        <div className="p-3 md:p-4 bg-primary/5 border-b border-primary/10 animate-in slide-in-from-top duration-300 relative">
          <Button variant="ghost" size="icon" onClick={() => setSummary(null)} className="absolute top-2 right-2 h-6 w-6">
            <X className="h-3 w-3" />
          </Button>
          <MarkdownRenderer content={summary} />
        </div>
      )}

      <ScrollArea ref={scrollRef} className="flex-1 p-3 md:p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
            <p className="text-xs text-muted-foreground">Loading messages...</p>
          </div>
        ) : discussions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
            <MessageCircle className="h-10 w-10 md:h-12 md:w-12 mb-2" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {discussions.map((post) => (
              <ChatBubble 
                key={post.id} 
                post={post} 
                isOwn={post.userId === identity?.id}
                isAdmin={identity?.role === "admin"}
                onDelete={(id) => deletePost({ resource: "discussions", id })}
                onReply={(id) => setReplyTo(id)}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-3 md:p-4 bg-background border-t">
        {replyTo && (
          <div className="mb-2 p-2 bg-muted rounded-lg flex justify-between items-center animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-1 h-6 bg-primary rounded-full shrink-0" />
              <p className="text-[10px] truncate italic text-muted-foreground">
                Replying to <span className="font-bold text-foreground">{replyingToPost?.user.name}</span>: "{replyingToPost?.content.replace(/<[^>]*>/g, '')}"
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setReplyTo(null)} className="h-5 w-5">
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <RichTextEditor 
              value={newPost}
              onChange={setNewPost}
              placeholder={replyTo ? "Write your reply..." : "Message your class..."}
              className="min-h-[80px]"
            />
          </div>
          <Button 
            size="icon" 
            onClick={handlePost} 
            disabled={!newPost.trim() || newPost === "<p></p>" || mutation.isPending}
            className="h-10 w-10 md:h-11 md:w-11 shrink-0 rounded-xl shadow-lg shadow-primary/20 mb-1"
          >
            <Send className="h-4 w-4 md:h-5 md:w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
