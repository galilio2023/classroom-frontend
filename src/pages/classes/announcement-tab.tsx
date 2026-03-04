import { useList, useCreate, useGetIdentity, useUpdate, useDelete } from "@refinedev/core";
import { useState } from "react";
import { Announcement, User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Edit2, 
  Loader2,
  Calendar
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

interface AnnouncementTabProps {
  classId: string;
}

export const AnnouncementTab = ({ classId }: AnnouncementTabProps) => {
  const { data: identity } = useGetIdentity<User>();
  const isStaff = identity?.role === "teacher" || identity?.role === "admin";

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "", isPinned: false });

  const { data: announcementsData, isLoading, refetch } = useList<Announcement>({
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

  const { mutate: createAnnouncement, isLoading: isCreating } = useCreate();
  const { mutate: updateAnnouncement } = useUpdate();
  const { mutate: deleteAnnouncement } = useDelete();

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
          setNewAnnouncement({ title: "", content: "", isPinned: false });
          refetch();
        },
      }
    );
  };

  const togglePin = (announcement: Announcement) => {
    updateAnnouncement({
      resource: "announcements",
      id: announcement.id,
      values: { isPinned: !announcement.isPinned },
      onSuccess: () => refetch(),
    });
  };

  const handleDelete = (id: number) => {
    deleteAnnouncement({
      resource: "announcements",
      id,
      onSuccess: () => refetch(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const announcements = announcementsData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Announcements</h3>
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
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <Textarea 
                    placeholder="Provide details here..." 
                    rows={5}
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="pin" 
                    checked={newAnnouncement.isPinned}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="pin" className="text-sm font-medium">Pin to top</label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={isCreating || !newAnnouncement.title || !newAnnouncement.content}>
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
          {announcements.map((announcement) => (
            <Card key={announcement.id} className={announcement.isPinned ? "border-primary/20 bg-primary/5" : ""}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={announcement.author?.image} />
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
                  {isStaff && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => togglePin(announcement)}>
                          <Pin className="h-4 w-4 mr-2" />
                          {announcement.isPinned ? "Unpin" : "Pin to top"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(announcement.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {announcement.content}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
