import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Discussion, User } from "@/types";
import { Trash2, Reply, CheckCircle2, Trophy, Sparkles, MoreHorizontal } from "lucide-react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useGetIdentity, useList } from "@refinedev/core";
import { useState, useEffect } from "react";
import { useDiscussion } from "@/contexts/discussion-context";

interface ChatBubbleProps {
  post: Discussion & { repliesCount?: number };
  isOwn: boolean;
  onDelete: (id: number) => void;
  onReply: (id: number) => void;
  onSolve?: (postId: number, solverId: string) => void;
}

/**
 * RECURSIVE PATTERN: ChatBubble renders its own children (replies).
 */
export const ChatBubble = ({ post, isOwn, onDelete, onReply, onSolve }: ChatBubbleProps) => {
  const { t, i18n } = useTranslation();
  const { data: userIdentity } = useGetIdentity<User>();
  const { isStaff, isAdmin } = useDiscussion();
  dayjs.locale(i18n.language);

  const [fullReplies, setFullReplies] = useState<Discussion[]>(post.replies || []);

  // 🛡️ RECOVERY: Sync state if prop updates from server (e.g. Socket.io or invalidation)
  useEffect(() => {
    // 🛡️ PERFORMANCE: Use reference or length checks instead of JSON.stringify for large threads
    if (
      post.replies &&
      (post.replies !== fullReplies || post.replies.length !== fullReplies.length)
    ) {
      setFullReplies(post.replies);
    }
  }, [post.replies, fullReplies]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // 🛡️ REFINE PATTERN: Use useList with filters for better integration with state/cache
  const { query } = useList<Discussion>({
    resource: "discussions",
    filters: [
      {
        field: "parentId",
        operator: "eq",
        value: post.id,
      },
    ],
    pagination: {
      mode: "server",
      currentPage: currentPage,
      pageSize: pageSize,
    },
    queryOptions: {
      enabled: false,
    },
  });

  const { isFetching, refetch: loadMore } = query;

  const handleLoadMore = async () => {
    const { data } = await loadMore();
    if (data?.data) {
      // 🛡️ DATA GROWTH: Append and deduplicate by ID to prevent UI glitches
      const newItems = data.data as Discussion[];
      setFullReplies((prev) => {
        const combined = [...prev, ...newItems];
        return Array.from(new Map(combined.map((item) => [item.id, item])).values());
      });
      // 🛡️ SRE: Only increment page after successful load to prevent offset drift
      setCurrentPage((prev) => prev + 1);
    }
  };

  const hasLoadedAll = fullReplies.length >= (post.repliesCount || 0);

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 group animate-in fade-in slide-in-from-bottom-2 duration-300",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-9 w-9 shrink-0 shadow-sm border border-border/50">
        <AvatarImage src={post.user?.image ?? ""} />
        <AvatarFallback
          className={isOwn ? "bg-primary text-primary-foreground font-bold" : "bg-muted font-bold"}
        >
          {post.user?.name?.[0]}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col max-w-[85%]", isOwn ? "items-end" : "items-start")}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-bold text-muted-foreground/80">{post.user?.name}</span>
          <span className="text-[10px] text-muted-foreground/40">
            {dayjs(post.createdAt).format("h:mm A")}
          </span>
          {post.user?.role === "teacher" && (
            <Badge
              variant="default"
              className="h-3.5 text-[8px] px-1 uppercase font-black bg-primary/10 text-primary border-none"
            >
              {t("roles.teacher")}
            </Badge>
          )}
          {post.isSolved && !post.parentId && (
            <Badge
              variant="outline"
              className="h-3.5 text-[8px] px-1 uppercase font-black bg-green-500/10 text-green-600 border-green-500/20 gap-1 solved-badge-shine"
            >
              <CheckCircle2 className="w-2 h-2" />
              {t("common.solved", "SOLVED")}
            </Badge>
          )}
        </div>

        <div
          className={cn(
            "relative p-3 rounded-2xl shadow-sm border transition-all duration-500",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-none border-primary/20"
              : post.user?.role === "teacher" && isStaff
                ? "bg-ai-primary text-white border-none rounded-tl-none shadow-[0_4px_20px_-5px_rgba(var(--ai-primary),0.3)]"
                : "bg-card rounded-tl-none border-border/50",
            post.isSolved && !post.parentId
              ? "ring-2 ring-green-500/20 shadow-lg shadow-green-500/5"
              : ""
          )}
        >
          <div className="text-sm leading-relaxed">
            <MarkdownRenderer content={post.content} />
          </div>

          {/* Actions Overlay */}
          <div
            className={cn(
              "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background border rounded-full p-1 shadow-xl -translate-y-1/2 z-10",
              isOwn ? "end-full me-2" : "start-full ms-2"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => onReply(post.id)}
            >
              <Reply className="h-3.5 w-3.5" />
            </Button>
            {isStaff && post.parentId && post.user?.id !== post.solvedBy?.id && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-green-500/10 hover:text-green-600 transition-colors"
                onClick={() => onSolve?.(post.parentId!, post.user.id)}
                title="Mark as Solved"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </Button>
            )}
            {(isOwn || isAdmin || isStaff) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground/40"
                onClick={() => onDelete(post.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Solver recognition for replies */}
        {post.parentId && post.user?.id === post.solvedBy?.id && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ y: -2 }}
            className="mt-2 flex items-center gap-2 px-1"
          >
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 solved-badge-shine shadow-sm">
              <Trophy className="w-3 h-3 fill-yellow-500/20" />
              <span className="text-[10px] font-black uppercase tracking-tight">
                {t("gamification.badges.juniorTeacher", "Junior Teacher Solution")}
              </span>
              <Sparkles className="w-2.5 h-2.5 animate-pulse text-yellow-500" />
            </div>
          </motion.div>
        )}

        {/* Replies List */}
        {fullReplies.length > 0 && (
          <div className="flex flex-col gap-4 mt-4 w-full border-s-2 border-muted/30 ltr:ps-4 rtl:border-s-0 rtl:border-e-2 rtl:pe-4">
            {fullReplies.map((reply) => (
              <ChatBubble
                key={reply.id}
                post={{ ...reply, solvedBy: post.solvedBy }}
                isOwn={reply.user?.id === userIdentity?.id}
                onDelete={onDelete}
                onReply={onReply}
                onSolve={onSolve}
              />
            ))}

            {!hasLoadedAll &&
              post.repliesCount !== undefined &&
              post.repliesCount > fullReplies.length && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/5 gap-2 h-8 rounded-lg"
                  onClick={() => handleLoadMore()}
                  disabled={isFetching}
                >
                  {isFetching ? (
                    <Sparkles className="h-3 w-3 animate-spin" />
                  ) : (
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  )}
                  {t("discussions.loadMoreReplies", {
                    count: post.repliesCount - fullReplies.length,
                    defaultValue: `View ${post.repliesCount - fullReplies.length} more replies`,
                  })}
                </Button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
