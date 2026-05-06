import { Announcement } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pin, X, ChevronRight, Megaphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface PinnedAnnouncementsProps {
  announcements: Announcement[];
  dismissedAnnouncements: (string | number)[];
  handleDismissAnnouncement: (id: string | number) => void;
}

export const PinnedAnnouncements = ({
  announcements,
  dismissedAnnouncements,
  handleDismissAnnouncement,
}: PinnedAnnouncementsProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const pinnedAnnouncements = announcements.filter((a) => a.isPinned);
  const visiblePinned = pinnedAnnouncements.filter((a) => !dismissedAnnouncements.includes(a.id));

  if (visiblePinned.length === 0) return null;

  return (
    <div className="space-y-4 px-2 md:px-0">
      <AnimatePresence mode="popLayout">
        {visiblePinned.map((announcement, index) => (
          <motion.div
            key={announcement.id}
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{
              delay: index * 0.1,
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            className="group relative bg-amber-500/10 border-2 border-amber-500/20 rounded-4xl md:rounded-[2.5rem] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl shadow-amber-500/5 backdrop-blur-md overflow-hidden text-start"
          >
            {/* Subtle Animated Background */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-amber-500/5 to-transparent -translate-x-full group-hover:animate-[shine_3s_infinite] pointer-events-none" />

            <div className="flex items-start gap-4 md:gap-5 flex-1 min-w-0 z-10">
              <div className="p-3 md:p-3.5 rounded-xl md:rounded-2xl bg-amber-500/20 text-amber-600 shadow-inner shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500">
                <Megaphone className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <Badge
                    variant="outline"
                    className="bg-amber-500/10 text-amber-700 border-amber-500/30 text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-0.5 md:py-1 rounded-full shadow-sm"
                  >
                    <Pin className="h-3 w-3 me-1.5" />
                    {t("classes.show.banner.pinned" as any)}
                  </Badge>
                  <h4 className="font-black text-lg md:text-xl text-amber-900 dark:text-amber-400 tracking-tight leading-tight group-hover:text-amber-600 transition-colors">
                    {announcement.title}
                  </h4>
                </div>
                <p className="text-sm md:text-base text-amber-800/80 dark:text-amber-500/80 font-medium leading-relaxed max-w-3xl">
                  {announcement.content}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto z-10 shrink-0">
              {announcement.linkUrl && (
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[9px] md:text-[10px] h-10 md:h-12 px-6 bg-white dark:bg-muted/10 border-amber-500/20 text-amber-700 hover:bg-amber-50 hover:text-amber-800 shadow-sm transition-all"
                  asChild
                >
                  <a href={announcement.linkUrl} target="_blank" rel="noopener noreferrer">
                    {t("buttons.readMore" as any)}
                    <ChevronRight className={cn("h-4 w-4 ms-1.5", isAr && "rotate-180")} />
                  </a>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl text-amber-700/50 hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
                onClick={() => handleDismissAnnouncement(announcement.id)}
                title={t("buttons.dismiss" as any)}
              >
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
