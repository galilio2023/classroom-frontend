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
    <Card
      ref={itemRef}
      className={cn(
        "relative transition-all duration-200",
        announcement.isPinned ? "border-primary/20 bg-primary/5" : "",
        isRead === false && !isStaff ? "ring-1 ring-primary/30" : "opacity-90",
      )}
    >
      {isRead === false && !isStaff && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-8 bg-primary rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
      )}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={announcement.author?.image ?? ""} />
              <AvatarFallback>{announcement.author?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">{announcement.title}</CardTitle>
                {announcement.isPinned && (
                  <Badge variant="secondary" className="h-5 gap-1 px-1.5">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </Badge>
                )}
                {isRead === false && !isStaff && (
                  <Badge
                    variant="default"
                    className="h-5 px-1.5 bg-primary text-[10px] uppercase font-bold"
                  >
                    New
                  </Badge>
                )}
              </div>
              <CardDescription className="flex items-center gap-2 mt-1">
                <span>{announcement.author?.name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(announcement.createdAt), "MMM d, yyyy h:mm a")}
                </span>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isStaff && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={() => onViewReads(announcement.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onTogglePin(announcement)}>
                      <Pin className="h-4 w-4 mr-2" />
                      {announcement.isPinned ? "Unpin" : "Pin to top"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDelete(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {announcement.content}
        </p>
        {announcement.fileUrl && (
          <div className="pt-2">
            <a
              href={announcement.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 p-2 rounded-md border bg-muted/50 hover:bg-muted transition-colors text-sm"
            >
              <FileText className="h-4 w-4 text-primary" />
              <span>View Attachment</span>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const AnnouncementTab = ({ classId }: AnnouncementTabProps) => {
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
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<number[]>(
    [],
  );

  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState<number | null>(null);
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

  const { query } = useList<Announcement>({
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

  const announcements = query.data?.data ?? [];
  const isLoading = query.isLoading;
  const refetch = query.refetch;

  const { mutate: createAnnouncement, mutation: createMutation } = useCreate();
  const isCreating = createMutation.isPending;
  const { mutate: updateAnnouncement } = useUpdate();
  const { mutate: deleteAnnouncement } = useDelete();
  const { mutate: markAsRead } = useCustomMutation();

  const handleMarkAsRead = (id: number) => {
    markAsRead(
      {
        url: `${import.meta.env.VITE_API_URL}/announcements/${id}/read`,
        method: "post",
        values: {},
      },
      {
        onSuccess: () => {
          // Update local state to show as read immediately
          void refetch();
        },
      },
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // 1. Get secure signature from backend
      const sigResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/upload/signature?folder=announcements`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("refine-auth")}`,
          },
        },
      );
      const { data: sigData } = await sigResponse.json();

      // 2. Upload directly to Cloudinary using the signature
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
        toast.success("File uploaded securely");
      }
    } catch (error) {
      toast.error("Failed to upload file securely");
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
          void refetch();
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
          void refetch();
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
          void refetch();
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
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const pinnedAnnouncements = announcements.filter(
    (a) => a.isPinned && !dismissedAnnouncements.includes(a.id),
  );

  return (
    <div className="space-y-6">
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-3">
          {pinnedAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="relative bg-primary/10 border border-primary/20 rounded-lg p-4 pr-12 animate-in fade-in slide-in-from-top-2"
            >
              <div className="flex items-center gap-2 mb-1">
                <Pin className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm text-primary uppercase tracking-wider">
                  Pinned Announcement
                </span>
              </div>
              <h4 className="font-bold text-lg">{announcement.title}</h4>
              <p className="text-sm mt-1 line-clamp-2">{announcement.content}</p>
              {announcement.fileUrl && (
                <a
                  href={announcement.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-xs text-primary hover:underline"
                >
                  <Paperclip className="h-3 w-3" />
                  View Attachment
                </a>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => handleDismiss(announcement.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Announcement History</h3>
          <p className="text-sm text-muted-foreground">
            Official updates and news for this class.
          </p>
        </div>
        {isStaff && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Announcement</DialogTitle>
                <DialogDescription>
                  Post an official update for all students in this class.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="e.g., Upcoming Midterm Exam"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    placeholder="Provide details here..."
                    rows={5}
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        content: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Attachment (Optional)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="cursor-pointer"
                    />
                    {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                  {newAnnouncement.fileUrl && (
                    <div className="flex items-center gap-2 text-xs text-success">
                      <FileText className="h-3 w-3" />
                      File uploaded
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pin"
                    checked={newAnnouncement.isPinned}
                    onChange={(e) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        isPinned: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="pin" className="text-sm font-medium">
                    Pin to top
                  </label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={
                    isCreating ||
                    isUploading ||
                    !newAnnouncement.title ||
                    !newAnnouncement.content
                  }
                >
                  {isCreating ? "Posting..." : "Post Announcement"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {announcements.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Megaphone className="h-12 w-12 mb-4 opacity-20" />
            <p>No announcements yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
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
