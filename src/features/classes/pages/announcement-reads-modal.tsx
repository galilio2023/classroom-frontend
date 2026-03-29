import { useCustom } from "@refinedev/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Loader2, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AnnouncementReadsModalProps {
  announcementId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ReadReceipt {
  id: number;
  readAt: string;
  student: {
    name: string;
    image: string | null;
  };
}

export const AnnouncementReadsModal = ({
  announcementId,
  open,
  onOpenChange,
}: AnnouncementReadsModalProps) => {
  const { t } = useTranslation();
  const { result, query } = useCustom<ReadReceipt[]>({
    url: `announcements/${announcementId}/reads`,
    method: "get",
    queryOptions: {
      enabled: !!announcementId && open,
    },
  });

  // Ensure reads is always an array
  const rawData = result?.data;
  const reads = Array.isArray(rawData) ? rawData : [];
  const isLoading = query?.isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            {t("classes.announcements.reads.title")}
          </DialogTitle>
          <DialogDescription>{t("classes.announcements.reads.description")}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("classes.announcements.reads.empty")}
            </div>
          ) : (
            <ScrollArea className="h-[300px] pe-4">
              <div className="space-y-4">
                {reads.map((read: ReadReceipt) => (
                  <div key={read.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={read.student.image ?? ""} />
                        <AvatarFallback>{read.student.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{read.student.name}</span>
                        <span className="text-xs text-muted-foreground">{t("roles.student")}</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(read.readAt), "MMM d, h:mm a")}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
