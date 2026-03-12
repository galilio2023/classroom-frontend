import {
  useList,
  useCreate,
  useGetIdentity,
  useUpdate,
  useDelete,
  useCustomMutation,
} from "@refinedev/core";
import { useState, useEffect, useRef } from "react";
import { Announcement, User } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Megaphone,
  Pin,
  Plus,
  MoreVertical,
  Trash2,
  Loader2,
  Calendar,
  X,
  Paperclip,
  FileText,
  Eye,
  LayoutDashboard,
  Sparkles,
  Info,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  Send,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AnnouncementReadsModal } from "./announcement-reads-modal";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";

interface AnnouncementTabProps {
  classId: string;
}

const AnnouncementItem = ({
  announcement,
  isStaff,
  onTogglePin,
  onDelete,
  onMarkAsRead,
  onViewReads,
}: {
  announcement: Announcement;
  isStaff: boolean;
  onTogglePin: (a: Announcement) => void;
  onDelete: (id: number) => void;
  onMarkAsRead: (id: number) => void;
  onViewReads: (id: number) => void;
}) => {
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
      { threshold: 0.5 },
    );

    if (itemRef.current) {
      observer.observe(itemRef.current);
    }

    return () => observer.disconnect();
  }, [announcement.id, isRead, isStaff, onMarkAsRead]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card
        ref={itemRef}
        className={cn(
          "relative transition-all duration-300 border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden group",
          announcement.isPinned
            ? "border-2 border-primary/20 bg-primary/[0.02]"
            : "hover:shadow-2xl hover:-translate-y-1",
          isRead === false && !isStaff
            ? "ring-2 ring-primary/20"
            : "opacity-90",
        )}
      >
        {isRead === false && !isStaff && (
          <div className="absolute left-0 top-0 w-1.5 h-full bg-primary shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
        )}
        <CardHeader className="p-8 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-background shadow-sm group-hover:scale-110 transition-transform">
                <AvatarImage
                  src={announcement.author?.image ?? ""}
                  className="object-cover"
                />
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
                  <span className="text-foreground">
                    {announcement.author?.name}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(announcement.createdAt), "MMM d, yyyy")}
                  </span>
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-6">
          <p className="text-sm font-medium text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {announcement.content}
          </p>
          {announcement.fileUrl && (
            <div className="pt-4 border-t border-black/[0.03] dark:border-white/[0.03]">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="h-10 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest gap-2 border-primary/20 text-primary hover:bg-primary/5 transition-all"
              >
                <a
                  href={announcement.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText className="h-4 w-4" />
                  {t("classes.announcements.viewAttachment")}
                  <ArrowRight className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const AnnouncementTab = ({ classId }: AnnouncementTabProps) => {
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === "teacher" || identity?.role === "admin";

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    isPinned: false,
    fileUrl: null as string | null,
    fileCldPubId: null as string | null,
  });

  const [isUploading, setIsUploading] = useState(false);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<
    number[]
  >([]);

  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<
    number | null
  >(null);
  const [isReadsModalOpen, setIsReadsModalOpen] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(
      `dismissed_announcements_${identity?.id}`,
    );
    if (dismissed) {
      setDismissedAnnouncements(JSON.parse(dismissed));
    }
  }, [identity?.id]);

  const handleDismiss = (id: number) => {
    if (dismissedAnnouncements.includes(id)) return;
    const updated = [...dismissedAnnouncements, id];
    setDismissedAnnouncements(updated);
    localStorage.setItem(
      `dismissed_announcements_${identity?.id}`,
      JSON.stringify(updated),
    );
  };

  const { result, query } = useList<Announcement>({
    resource: "announcements",
    filters: [
      {
        field: "classId",
        operator: "eq",
        value: classId,
      },
    ],
    sorters: [
      { field: "isPinned", order: "desc" },
      { field: "createdAt", order: "desc" },
    ],
  });

  const announcements = result?.data ?? [];
  const isLoading = query?.isLoading;
  const refetch = query?.refetch;

  const { mutate: createAnnouncement, mutation: createMutation } = useCreate();
  const isCreating = createMutation?.isPending;
  const { mutate: updateAnnouncement } = useUpdate();
  const { mutate: deleteAnnouncement } = useDelete();
  const { mutate: markAsRead } = useCustomMutation();

  const handleMarkAsRead = (id: number) => {
    markAsRead(
      {
        url: `announcements/${id}/read`,
        method: "post",
        values: {},
      },
      {
        onSuccess: () => {
          void refetch?.();
        },
      },
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const sigResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/upload/signature?folder=announcements`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("refine-auth")}`,
          },
        },
      );
      const { data: sigData } = await sigResponse.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", sigData.timestamp);
      formData.append("signature", sigData.signature);
      formData.append("folder", sigData.folder);

      const cloudResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const result = await cloudResponse.json();

      if (result.secure_url) {
        setNewAnnouncement((prev) => ({
          ...prev,
          fileUrl: result.secure_url,
          fileCldPubId: result.public_id,
        }));
        toast.success(t("common.upload.success"));
      }
    } catch (error) {
      toast.error(t("common.upload.error"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = () => {
    createAnnouncement(
      {
        resource: "announcements",
        values: {
          ...newAnnouncement,
          classId: Number(classId),
          authorId: identity?.id,
        },
      },
      {
        onSuccess: () => {
          setIsCreateOpen(false);
          setNewAnnouncement({
            title: "",
            content: "",
            isPinned: false,
            fileUrl: null,
            fileCldPubId: null,
          });
          void refetch?.();
        },
      },
    );
  };

  const togglePin = (announcement: Announcement) => {
    updateAnnouncement(
      {
        resource: "announcements",
        id: announcement.id,
        values: { isPinned: !announcement.isPinned },
      },
      {
        onSuccess: () => {
          void refetch?.();
        },
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteAnnouncement(
      {
        resource: "announcements",
        id,
      },
      {
        onSuccess: () => {
          void refetch?.();
        },
      },
    );
  };

  const handleViewReads = (id: number) => {
    setSelectedAnnouncementId(id);
    setIsReadsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
          {t("common.searching")}
        </p>
      </div>
    );
  }

  const pinnedAnnouncements = announcements.filter(
    (a) => a.isPinned && !dismissedAnnouncements.includes(a.id),
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Pinned Section */}
      <AnimatePresence>
        {pinnedAnnouncements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {pinnedAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-primary/5 backdrop-blur-xl p-8 pr-14 shadow-xl shadow-primary/5 group"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <Pin className="h-4 w-4" />
                  </div>
                  <span className="font-black text-[10px] text-primary uppercase tracking-widest">
                    {t("classes.announcements.pinnedLabel")}
                  </span>
                </div>
                <h4 className="font-black text-2xl tracking-tight">
                  {announcement.title}
                </h4>
                <p className="text-sm mt-3 text-muted-foreground font-medium leading-relaxed line-clamp-2">
                  {announcement.content}
                </p>
                {announcement.fileUrl && (
                  <Button
                    variant="link"
                    className="p-0 h-auto mt-4 text-xs font-black uppercase tracking-widest text-primary gap-2"
                    asChild
                  >
                    <a
                      href={announcement.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Paperclip className="h-4 w-4" />
                      {t("classes.announcements.viewAttachment")}
                    </a>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-6 right-6 h-10 w-10 rounded-full hover:bg-primary/10 text-primary/40 hover:text-primary transition-all"
                  onClick={() => handleDismiss(announcement.id)}
                >
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
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Megaphone className="h-4 w-4" />
            </div>
            <h3 className="text-xl font-black tracking-tight">
              {t("classes.announcements.history")}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            {t("classes.announcements.description")}
          </p>
        </div>
        {isStaff && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl h-11 px-6 font-black uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                <PlusCircle className="h-4 w-4" />
                {t("classes.announcements.new")}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl">
              <DialogHeader className="space-y-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit">
                  <Megaphone className="h-6 w-6" />
                </div>
                <DialogTitle className="text-2xl font-black tracking-tight">
                  {t("classes.announcements.createTitle")}
                </DialogTitle>
                <DialogDescription className="font-medium">
                  {t("classes.announcements.createDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {t("classes.announcements.fieldTitle")}
                  </Label>
                  <Input
                    placeholder="e.g., Upcoming Midterm Exam"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                    className="h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary font-bold"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {t("classes.announcements.fieldContent")}
                  </Label>
                  <Textarea
                    placeholder="Provide all necessary details here..."
                    rows={5}
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        content: e.target.value,
                      })
                    }
                    className="min-h-[150px] rounded-2xl bg-muted/20 border-none focus-visible:ring-primary p-5 text-sm leading-relaxed"
                  />
                </div>
                <div className="space-y-2.5">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                    {t("classes.announcements.fieldAttachment")}
                  </Label>
                  <div className="flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-muted-foreground/10 bg-muted/10">
                    <div className="relative flex-1">
                      <Input
                        type="file"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                      />
                      <div className="flex items-center gap-3 text-muted-foreground/60">
                        <div className="p-2 rounded-lg bg-background shadow-sm">
                          <Paperclip className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest">
                          {isUploading ? t("buttons.uploading") : t("buttons.selectFile")}
                        </span>
                      </div>
                    </div>
                    {isUploading && (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    )}
                    {newAnnouncement.fileUrl && (
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-success bg-success/10 px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("assignments.create.attached")}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <Checkbox
                    id="pin"
                    checked={newAnnouncement.isPinned}
                    onCheckedChange={(checked) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        isPinned: checked as boolean,
                      })
                    }
                    className="data-[state=checked]:bg-primary"
                  />
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="pin"
                      className="text-sm font-black tracking-tight cursor-pointer"
                    >
                      {t("classes.announcements.fieldPin")}
                    </Label>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      {t("classes.announcements.pinDesc")}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button
                  variant="ghost"
                  className="rounded-xl font-bold h-12"
                  onClick={() => setIsCreateOpen(false)}
                >
                  {t("buttons.cancel")}
                </Button>
                <Button
                  className="rounded-xl font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-primary/20"
                  onClick={handleCreate}
                  disabled={
                    isCreating ||
                    isUploading ||
                    !newAnnouncement.title ||
                    !newAnnouncement.content
                  }
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  {t("buttons.postAnnouncement")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {announcements.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden py-20 text-center">
            <CardContent className="space-y-6">
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative p-6 rounded-full bg-primary/10 text-primary">
                  <Megaphone className="h-12 w-12 opacity-40" />
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black tracking-tight">
                  {t("classes.announcements.noAnnouncements")}
                </h4>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                  {t("classes.announcements.noAnnouncementsDesc")}
                </p>
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
                onTogglePin={togglePin}
                onDelete={handleDelete}
                onMarkAsRead={handleMarkAsRead}
                onViewReads={handleViewReads}
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
