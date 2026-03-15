import { Announcement } from "@/types";
import { Button } from "@/components/ui/button";
import { Pin, X, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface PinnedAnnouncementsProps {
  announcements: Announcement[];
  dismissedAnnouncements: number[];
  handleDismissAnnouncement: (id: number) => void;
}

export const PinnedAnnouncements = ({
  announcements,
  dismissedAnnouncements,
  handleDismissAnnouncement,
}: PinnedAnnouncementsProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const pinnedAnnouncements = announcements.filter(
    (a) => a.isPinned && !dismissedAnnouncements.includes(a.id),
  );

  const isSafeUrl = (url: string) => {
    try {
      // Use window.location.origin as base for relative URLs (e.g., /uploads/file.pdf)
      const parsedUrl = new URL(url, window.location.origin);
      return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch (e) {
      return false;
    }
  };

  if (pinnedAnnouncements.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-4 text-start"
      >
        {pinnedAnnouncements.map((announcement) => (
          <div
            key={announcement.id}
            className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/5 backdrop-blur-xl p-8 pr-16 shadow-xl shadow-primary/5 group"
          >
            <div
              className={cn(
                "absolute top-0 w-1.5 h-full bg-primary",
                isAr ? "right-0" : "left-0",
              )}
            />
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Pin className="h-4 w-4" />
              </div>
              <span className="font-black text-[10px] text-primary uppercase tracking-widest">
                {t("classes.show.announcement.priority")}
              </span>
            </div>
            <h4 className="font-black text-2xl tracking-tight">
              {announcement.title}
            </h4>
            <p className="text-base mt-3 text-muted-foreground leading-relaxed line-clamp-2 font-medium">
              {announcement.content}
            </p>
            {announcement.fileUrl && isSafeUrl(announcement.fileUrl) && (
              <Button
                variant="link"
                className="p-0 h-auto mt-4 text-sm font-black text-primary gap-2 uppercase tracking-widest"
                asChild
              >
                <a
                  href={announcement.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Paperclip className="h-4 w-4" />
                  {t("classes.show.announcement.viewAttachment")}
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-6 h-12 w-12 rounded-full hover:bg-primary/10 text-primary/40 hover:text-primary transition-all",
                isAr ? "left-6" : "right-6",
              )}
              onClick={() => handleDismissAnnouncement(announcement.id)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};
