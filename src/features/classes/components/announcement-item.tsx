import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Pin, MoreVertical, Trash2, Calendar, FileText, Eye, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Announcement } from "@/types";

interface Props {
  announcement: Announcement;
  isStaff: boolean;
  onTogglePin: (a: Announcement) => void;
  onDelete: (id: number) => void;
  onMarkAsRead: (id: number) => void;
  onViewReads: (id: number) => void;
}

export const AnnouncementItem = ({
  announcement,
  isStaff,
  onTogglePin,
  onDelete,
  onMarkAsRead,
  onViewReads,
}: Props) => {
  const { t } = useTranslation();
  const itemRef = useRef<HTMLDivElement>(null);
  const isRead = announcement.isRead;

  useEffect(() => {
    if (isRead || isStaff) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onMarkAsRead(announcement.id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (itemRef.current) observer.observe(itemRef.current);
    return () => observer.disconnect();
  }, [announcement.id, isRead, isStaff, onMarkAsRead]);

  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card
        ref={itemRef}
        className={cn(
          "relative transition-all duration-300 border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-4xl overflow-hidden group",
          announcement.isPinned
            ? "border-2 border-primary/20 bg-primary/2"
            : "hover:shadow-2xl hover:-translate-y-1",
          isRead === false && !isStaff ? "ring-2 ring-primary/20" : "opacity-90"
        )}
      >
        {isRead === false && !isStaff && (
          <div className="absolute start-0 top-0 w-1.5 h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        )}
        <CardHeader className="p-8 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-background shadow-sm group-hover:scale-110 transition-transform">
                <AvatarImage src={announcement.author?.image ?? ""} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                  {announcement.author?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">
                    {announcement.title}
                  </CardTitle>
                  {announcement.isPinned && (
                    <Badge
                      variant="secondary"
                      className="h-6 gap-1.5 px-3 rounded-full font-black text-[9px] uppercase tracking-widest bg-primary/10 text-primary border-none"
                    >
                      <Pin className="h-3 w-3" />
                      {t("classes.announcements.pinnedLabel")}
                    </Badge>
                  )}
                  {isRead === false && !isStaff && (
                    <Badge
                      variant="default"
                      className="h-6 px-3 rounded-full bg-primary text-[9px] uppercase font-black tracking-widest animate-pulse"
                    >
                      {t("classes.announcements.newUpdate")}
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-3 font-bold text-[10px] uppercase tracking-widest text-muted-foreground/60">
                  <span className="text-foreground">{announcement.author?.name}</span>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(announcement.createdAt), "MMM d, yyyy")}
                  </span>
                </CardDescription>
              </div>
            </div>
            {isStaff && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                  onClick={() => onViewReads(announcement.id)}
                  title={t("classes.announcements.viewReadStatus")}
                >
                  <Eye className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="rounded-xl border-none shadow-2xl p-2"
                  >
                    <DropdownMenuItem
                      onClick={() => onTogglePin(announcement)}
                      className="rounded-lg font-bold gap-2 py-2.5"
                    >
                      <Pin className="h-4 w-4" />
                      {announcement.isPinned
                        ? t("classes.announcements.unpin")
                        : t("classes.announcements.pin")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive rounded-lg font-bold gap-2 py-2.5"
                      onClick={() => onDelete(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("classes.announcements.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <p className="text-sm font-medium text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {announcement.content}
          </p>
          {announcement.fileUrl && (
            <div className="pt-4 border-t border-black/3 dark:border-white/3">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-10 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest gap-2 border-primary/20 text-primary hover:bg-primary/5 transition-all"
              >
                <a href={announcement.fileUrl} target="_blank" rel="noopener noreferrer">
                  <FileText className="h-4 w-4" />
                  {t("classes.announcements.viewAttachment")}
                  <ArrowRight className="h-3 w-3 ms-1" />
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
