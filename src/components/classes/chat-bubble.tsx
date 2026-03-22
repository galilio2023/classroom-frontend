import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Discussion, User } from "@/types";
import { Trash2, Reply, CheckCircle2, Trophy, Sparkles } from "lucide-react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useGetIdentity } from "@refinedev/core";

interface ChatBubbleProps {
  post: Discussion;
  isOwn: boolean;
  onDelete: (id: number) => void;
  onReply: (id: number) => void;
  isAdmin: boolean;
}

export const ChatBubble = ({ post, isOwn, onDelete, onReply, isAdmin }: ChatBubbleProps) => {
  const { t, i18n } = useTranslation();
  const { data: userIdentity } = useGetIdentity<User>();
  dayjs.locale(i18n.language);

  return (
    <div className={cn(
      "flex gap-3 mb-4 group animate-in fade-in slide-in-from-bottom-2 duration-300",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="h-9 w-9 shrink-0 shadow-sm border border-border/50">
        <AvatarImage src={post.user?.image ?? ""} />
        <AvatarFallback className={isOwn ? "bg-primary text-primary-foreground font-bold" : "bg-muted font-bold"}>
          {post.user?.name?.[0]}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        "flex flex-col max-w-[85%]",
        isOwn ? "items-end" : "items-start"
      )}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-bold text-muted-foreground/80">
            {post.user?.name}
          </span>
          <span className="text-[10px] text-muted-foreground/40">
            {dayjs(post.createdAt).format("h:mm A")}
          </span>
          {post.user?.role === "teacher" && (
            <Badge variant="default" className="h-3.5 text-[8px] px-1 uppercase font-black bg-primary/10 text-primary border-none">
                {t("roles.teacher")}
            </Badge>
          )}
          {post.isSolved && !post.parentId && (
            <Badge variant="outline" className="h-3.5 text-[8px] px-1 uppercase font-black bg-green-500/10 text-green-600 border-green-500/20 gap-1 solved-badge-shine">
                <CheckCircle2 className="w-2 h-2" />
                {t("common.solved", "SOLVED")}
            </Badge>
          )}
        </div>

        <div className={cn(
          "relative p-3 rounded-2xl shadow-sm border transition-all duration-500",
          isOwn 
            ? "bg-primary text-primary-foreground rounded-tr-none border-primary/20" 
            : "bg-card rounded-tl-none border-border/50",
          post.isSolved && !post.parentId ? "ring-2 ring-green-500/20 shadow-lg shadow-green-500/5" : ""
        )}>
          <div className="text-sm leading-relaxed">
            <MarkdownRenderer content={post.content} />
          </div>
          
          {/* Actions Overlay */}
          <div className={cn(
            "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background border rounded-full p-1 shadow-xl -translate-y-1/2 z-10",
            isOwn ? "right-full mr-2" : "left-full ml-2"
          )}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => onReply(post.id)}
            >
              <Reply className="h-3.5 w-3.5" />
            </Button>
            {(isOwn || isAdmin) && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
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
        {post.replies && post.replies.length > 0 && (
          <div className="flex flex-col gap-4 mt-4 w-full border-l-2 border-muted/30 ltr:pl-4 rtl:border-l-0 rtl:border-r-2 rtl:pr-4">
             {post.replies.map((reply) => (
                 <ChatBubble 
                    key={reply.id} 
                    post={{...reply, solvedBy: post.solvedBy}} 
                    isOwn={reply.user?.id === userIdentity?.id} 
                    onDelete={onDelete} 
                    onReply={onReply} 
                    isAdmin={isAdmin} 
                 />
             ))}
          </div>
        )}
      </div>
    </div>
  );
};
