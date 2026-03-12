import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Discussion } from "@/types";
import { Trash2, Reply } from "lucide-react";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { useTranslation } from "react-i18next";

interface ChatBubbleProps {
  post: Discussion;
  isOwn: boolean;
  onDelete: (id: number) => void;
  onReply: (id: number) => void;
  isAdmin: boolean;
}

export const ChatBubble = ({ post, isOwn, onDelete, onReply, isAdmin }: ChatBubbleProps) => {
  const { t, i18n } = useTranslation();
  dayjs.locale(i18n.language);

  return (
    <div className={cn(
      "flex gap-3 mb-4 group animate-in fade-in slide-in-from-bottom-2 duration-300",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar className="h-9 w-9 shrink-0 shadow-sm">
        <AvatarImage src={post.user?.image ?? ""} />
        <AvatarFallback className={isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}>
          {post.user?.name?.[0]}
        </AvatarFallback>
      </Avatar>

      <div className={cn(
        "flex flex-col max-w-[80%]",
        isOwn ? "items-end" : "items-start"
      )}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[11px] font-bold text-muted-foreground">
            {post.user?.name}
          </span>
          <span className="text-[10px] text-muted-foreground/60">
            {dayjs(post.createdAt).format("h:mm A")}
          </span>
          {post.user?.role === "teacher" && (
            <Badge variant="default" className="h-3.5 text-[8px] px-1 uppercase font-black">
                {t("roles.teacher")}
            </Badge>
          )}
        </div>

        <div className={cn(
          "relative p-3 rounded-2xl shadow-sm border",
          isOwn 
            ? "bg-primary text-primary-foreground rounded-tr-none border-primary/20" 
            : "bg-card rounded-tl-none border-border/50"
        )}>
          <div className="text-sm leading-relaxed">
            <MarkdownRenderer content={post.content} />
          </div>
          
          {/* Actions Overlay */}
          <div className={cn(
            "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-background border rounded-full p-1 shadow-lg -translate-y-1/2",
            isOwn ? "right-full mr-2" : "left-full ml-2"
          )}>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full hover:bg-primary/10 hover:text-primary"
              onClick={() => onReply(post.id)}
            >
              <Reply className="h-3 w-3" />
            </Button>
            {(isOwn || isAdmin) && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                onClick={() => onDelete(post.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Replies Count */}
        {post.replies && post.replies.length > 0 && (
          <button 
            onClick={() => onReply(post.id)}
            className="mt-1 text-[10px] font-bold text-primary hover:underline px-1"
          >
            {post.replies.length} {post.replies.length === 1 ? t("assignments.list.table.submissionsHeader").slice(0, -1) : t("assignments.list.table.submissionsHeader")}
          </button>
        )}
      </div>
    </div>
  );
};
