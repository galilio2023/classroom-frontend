import {
  useList,
  useCreate,
  useDelete,
  useGetIdentity,
  useCustomMutation,
  HttpError,
} from "@refinedev/core";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Discussion, User, UserRole } from "@/types";
import {
  Loader2,
  Send,
  Sparkles,
  X,
  MessageCircle,
  LayoutDashboard,
  ArrowRight,
  Trophy,
  Info,
  Reply,
} from "lucide-react";
import { toast } from "sonner";
import { ChatBubble } from "@/components/classes/chat-bubble";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { getSocket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useUserRole } from "@/hooks/use-user-role";

interface DiscussionTabProps {
  classId: string;
}

export const DiscussionTab = ({ classId }: DiscussionTabProps) => {
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const { isStaff } = useUserRole();
  const [newPost, setNewPost] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);

  // 🛡️ AUTO-DRAFT: Discussion Persistence
  useEffect(() => {
    const draftKey = `draft:discussion:${classId}${replyTo ? `:${replyTo}` : ""}`;
    if (newPost && newPost !== "<p></p>") {
      localStorage.setItem(draftKey, newPost);
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [newPost, classId, replyTo]);

  // 🚀 DRAFT RECOVERY
  useEffect(() => {
    const draftKey = `draft:discussion:${classId}${replyTo ? `:${replyTo}` : ""}`;
    const saved = localStorage.getItem(draftKey);
    if (saved && !newPost) {
      setNewPost(saved);
    }
  }, [classId, replyTo]);

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

  const { mutate: createPost, mutation } = useCreate<
    Discussion,
    HttpError,
    { content: string; classId: number; parentId: number | null }
  >();
  const { mutate: deletePost } = useDelete();
  const { mutate: solvePost } = useCustomMutation();
  const { mutate: generateSummary } = useCustomMutation();

  useEffect(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [discussions]);

  useEffect(() => {
    if (!identity?.id || !classId) return;

    const socket = getSocket();

    const handleNewDiscussion = () => {
      void refetch();
    };

    const handleDeleteDiscussion = () => {
      void refetch();
    };

    const handleDiscussionSolved = (payload: { message?: string }) => {
      toast.success(payload.message || "A question has been solved!", {
        icon: <Trophy className="w-4 h-4 text-yellow-500" />,
        duration: 5000,
      });
      void refetch();
    };

    socket.on("new_discussion", handleNewDiscussion);
    socket.on("delete_discussion", handleDeleteDiscussion);
    socket.on("discussion_solved", handleDiscussionSolved);

    return () => {
      socket.off("new_discussion", handleNewDiscussion);
      socket.off("delete_discussion", handleDeleteDiscussion);
      socket.off("discussion_solved", handleDiscussionSolved);
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
          parentId: replyTo,
        },
      },
      {
        onSuccess: () => {
          setNewPost("");
          setReplyTo(null);
          toast.success(
            replyTo
              ? t("classes.discussion.toast.replySent")
              : t("classes.discussion.toast.messagePosted"),
          );
        },
      },
    );
  };

  const handleSolve = (postId: number, solverId: string) => {
    solvePost(
      {
        url: `/discussions/${postId}/solve`,
        method: "patch",
        values: { solvedById: solverId },
      },
      {
        onSuccess: () => {
          void refetch();
        },
      },
    );
  };

  const handleGenerateSummary = () => {
    if (!discussions.length) return;
    setIsSummarizing(true);
    generateSummary(
      {
        url: `ai/discussions/summarize`,
        method: "post",
        values: { classId: Number(classId) },
      },
      {
        onSuccess: (data) => {
          const responseData = data.data as { summary: string };
          setSummary(responseData.summary);
          setIsSummarizing(false);
        },
        onError: () => {
          toast.error(t("classes.discussion.toast.summaryError"));
          setIsSummarizing(false);
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] max-w-5xl mx-auto space-y-4">
      {/* Discussion Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">
            {t("classes.discussion.classStream")}
          </h2>
          <Badge variant="outline" className="ml-2 font-mono">
            {discussions.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateSummary}
            disabled={isSummarizing || !discussions.length}
            className="hidden sm:flex items-center gap-2 hover:bg-primary/10 hover:text-primary transition-colors"
          >
            {isSummarizing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {t("classes.discussion.aiCatchUp")}
          </Button>
        </div>
      </div>

      {/* Summary Box */}
      <AnimatePresence>
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-2 p-4 bg-primary/5 border border-primary/20 rounded-xl relative group shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-primary/10 rounded-lg">
                <LayoutDashboard className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                    {t("classes.discussion.aiSummary")}
                    <span className="text-[10px] uppercase tracking-wider bg-primary/10 px-1.5 py-0.5 rounded text-primary/70">
                      AI GENERATED
                    </span>
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full hover:bg-primary/10"
                    onClick={() => setSummary(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-sm leading-relaxed text-foreground/80">
                  <MarkdownRenderer content={summary} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <ScrollArea
        ref={scrollRef}
        className="flex-1 px-4 rounded-2xl bg-muted/30 border shadow-inner"
      >
        <div className="py-6 space-y-8">
          {discussions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <MessageCircle className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-sm font-medium">
                {t("classes.discussion.noMessages")}
              </p>
            </div>
          ) : (
            discussions.map((discussion) => (
              <ChatBubble
                key={discussion.id}
                post={discussion}
                isOwn={discussion.user.id === identity?.id}
                isAdmin={identity?.role === UserRole.ADMIN}
                isStaff={isStaff}
                onReply={(id) => {
                  setReplyTo(id);
                  // Scroll to editor
                }}
                onSolve={handleSolve}
                onDelete={(id) => {
                  deletePost({ resource: "discussions", id });
                }}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Posting Area */}
      <div className="px-2 pb-2 space-y-3">
        <AnimatePresence>
          {replyTo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-primary/10 px-4 py-2 rounded-t-xl border-x border-t flex items-center justify-between"
            >
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <Reply className="w-3 h-3" />
                <span>Replying to message #{replyTo}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-primary hover:bg-primary/20"
                onClick={() => setReplyTo(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={cn(
            "bg-background rounded-2xl border-2 transition-all duration-200 shadow-lg",
            mutation.isPending
              ? "opacity-70 pointer-events-none"
              : "hover:border-primary/30",
            replyTo ? "rounded-t-none border-t-0" : "",
          )}
        >
          <RichTextEditor
            value={newPost}
            onChange={setNewPost}
            placeholder={t("classes.discussion.messageClass")}
            className="border-0 shadow-none ring-0 min-h-[100px]"
          />
          <div className="flex items-center justify-between p-3 bg-muted/20 border-t rounded-b-2xl">
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-primary" />
                Markdown supported
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-green-500" />
                Real-time sync
              </div>
            </div>
            <Button
              onClick={handlePost}
              disabled={
                mutation.isPending || !newPost.trim() || newPost === "<p></p>"
              }
              size="sm"
              className="px-6 rounded-xl shadow-md transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {replyTo ? t("buttons.reply") : t("buttons.post")}
            </Button>
          </div>
        </div>

        {/* Tips / Info */}
        <div className="flex items-center justify-center gap-6 text-[11px] text-muted-foreground/60 font-medium pt-1">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            Guidelines
          </div>
          <div className="flex items-center gap-1">
            <ArrowRight className="w-3 h-3" />
            Class Community
          </div>
        </div>
      </div>
    </div>
  );
};
