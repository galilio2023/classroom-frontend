import React from "react";
import { useList, useNavigation, useDelete, useTranslate } from "@refinedev/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, Plus, Trash2, Pin, Calendar, User, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";

export default function AnnouncementsList() {
  const t = useTranslate();
  const { create } = useNavigation();
  const { mutate: deleteAnnouncement } = useDelete();
  const { isStaff: isTeacher } = useUserRole();

  const { query } = useList({
    resource: "announcements",
    sorters: [
      { field: "isPinned", order: "desc" },
      { field: "createdAt", order: "desc" },
    ],
  });

  const { data, isLoading } = query;
  const announcements = data?.data || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Megaphone className="h-8 w-8 text-primary" />
            {t("resources.announcements.label")}
          </h1>
          <p className="text-muted-foreground font-medium">
            Stay updated with the latest news from your teachers.
          </p>
        </div>
        {isTeacher && (
          <Button onClick={() => create("announcements")} className="rounded-xl font-bold gap-2">
            <Plus className="h-4 w-4" />
            {t("buttons.create")}
          </Button>
        )}
      </div>

      {announcements.length === 0 ? (
        <Card className="border-dashed py-12 flex flex-col items-center justify-center text-center bg-muted/5">
          <div className="bg-primary/10 p-4 rounded-full mb-4">
            <Megaphone className="h-8 w-8 text-primary opacity-50" />
          </div>
          <CardTitle className="text-xl font-bold">
            {t("classes.announcements.noAnnouncements")}
          </CardTitle>
          <CardDescription className="max-w-xs mt-2 font-medium">
            No important updates have been posted yet. Check back soon!
          </CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement: any) => (
            <Card
              key={announcement.id}
              className={cn(
                "group transition-all hover:shadow-md border-l-4",
                announcement.isPinned ? "border-l-primary bg-primary/5" : "border-l-transparent"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      {announcement.isPinned && (
                        <Pin className="h-4 w-4 text-primary fill-primary" />
                      )}
                      {announcement.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {announcement.author?.name || "Teacher"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  {isTeacher && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm(t("buttons.confirmDelete"))) {
                          deleteAnnouncement({
                            resource: "announcements",
                            id: announcement.id,
                          });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap text-foreground/80">
                  {announcement.content}
                </p>
                {announcement.fileUrl && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="rounded-lg font-bold gap-2"
                    >
                      <a href={announcement.fileUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                        View Attachment
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Helper for conditional classes
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
