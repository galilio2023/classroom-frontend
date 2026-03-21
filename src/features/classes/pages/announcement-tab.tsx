import { 
  Megaphone, 
  Pin, 
  X, 
  Paperclip, 
} from "lucide-react";
import { useState } from "react";
import { Announcement } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnnouncementReadsModal } from "./announcement-reads-modal";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAnnouncementTab } from "../hooks/use-announcement-tab";
import { AnnouncementItem } from "../components/announcement-item";
import { CreateAnnouncementDialog } from "../components/create-announcement-dialog";

interface AnnouncementTabProps {
  classId: string;
  announcements: Announcement[];
  dismissedAnnouncements: number[];
  handleDismissAnnouncement: (id: number) => void;
}

export const AnnouncementTab = ({ classId, announcements, dismissedAnnouncements, handleDismissAnnouncement }: AnnouncementTabProps) => {
  const { t } = useTranslation();
  const { 
    isLoading, isCreating, isUploading, isStaff, state, actions 
  } = useAnnouncementTab(classId);

  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null);
  const [isReadsModalOpen, setIsReadsModalOpen] = useState(false);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="h-10 w-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{t("common.searching")}</p>
    </div>
  );

  const pinnedAnnouncements = announcements.filter(a => a.isPinned && !dismissedAnnouncements.includes(a.id));

  return (
    <div className="space-y-10 pb-20">
      {/* Pinned Section */}
      <AnimatePresence>
        {pinnedAnnouncements.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            {pinnedAnnouncements.map((announcement) => (
              <div key={announcement.id} className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/5 backdrop-blur-xl p-8 pr-14 shadow-xl shadow-primary/5 group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary"><Pin className="h-4 w-4" /></div>
                  <span className="font-black text-[10px] text-primary uppercase tracking-widest">{t("classes.announcements.pinnedLabel")}</span>
                </div>
                <h4 className="font-black text-2xl tracking-tight">{announcement.title}</h4>
                <p className="text-sm mt-3 text-muted-foreground font-medium leading-relaxed line-clamp-2">{announcement.content}</p>
                {announcement.fileUrl && (
                  <Button variant="link" className="p-0 h-auto mt-4 text-xs font-black uppercase tracking-widest text-primary gap-2" asChild>
                    <a href={announcement.fileUrl} target="_blank" rel="noopener noreferrer"><Paperclip className="h-4 w-4" />{t("classes.announcements.viewAttachment")}</a>
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="absolute top-6 right-6 h-10 w-10 rounded-full hover:bg-primary/10 text-primary/40 hover:text-primary transition-all" onClick={() => handleDismissAnnouncement(announcement.id)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & History */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary"><Megaphone className="h-4 w-4" /></div>
            <h3 className="text-xl font-black tracking-tight">{t("classes.announcements.history")}</h3>
          </div>
          <p className="text-sm text-muted-foreground font-medium">{t("classes.announcements.description")}</p>
        </div>
        {isStaff && (
          <CreateAnnouncementDialog 
            isOpen={state.isCreateOpen} 
            onOpenChange={state.setIsCreateOpen} 
            data={state.newAnnouncement} 
            setData={state.setNewAnnouncement} 
            isCreating={isCreating} 
            isUploading={isUploading} 
            onUpload={actions.handleFileUpload} 
            onCreate={actions.handleCreate} 
          />
        )}
      </div>

      {announcements.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden py-20 text-center">
            <CardContent className="space-y-6">
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-primary/10 text-primary"><Megaphone className="h-12 w-12 opacity-40" /></div>
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black tracking-tight">{t("classes.announcements.noAnnouncements")}</h4>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto">{t("classes.announcements.noAnnouncementsDesc")}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid gap-6">
          <AnimatePresence mode="popLayout">
            {announcements.map((announcement: Announcement) => (
              <AnnouncementItem
                key={announcement.id}
                announcement={announcement}
                isStaff={isStaff}
                onTogglePin={actions.togglePin}
                onDelete={actions.handleDelete}
                onMarkAsRead={actions.handleMarkAsRead}
                onViewReads={(id: number) => { setSelectedAnnouncementId(id); setIsReadsModalOpen(true); }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnnouncementReadsModal
        announcementId={selectedAnnouncementId}
        open={isReadsModalOpen}
        onOpenChange={setIsReadsModalOpen}
      />
    </div>
  );
};
