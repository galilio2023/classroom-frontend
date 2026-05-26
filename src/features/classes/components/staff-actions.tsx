import React from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Trash2, MessageSquare } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EnrollStudentDialog } from "../pages/enroll-student-dialog";
import { InviteTeacherDialog } from "../pages/invite-teacher-dialog";
import { AIStudentInsightModal } from "@/features/ai/components/ai-student-insight-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StaffActionsProps {
  classId: string;
  unenrollTarget: string | number | null;
  setUnenrollTarget: (id: string | number | null) => void;
  handleConfirmUnenroll: () => void;
  isDeleting: boolean;

  isEnrollDialogOpen: boolean;
  setIsEnrollDialogOpen: (open: boolean) => void;
  enrolledStudentIds: string[];

  isInviteDialogOpen: boolean;
  setIsInviteDialogOpen: (open: boolean) => void;
  existingTeacherIds: string[];

  insightTarget: { id: string; name: string } | null;
  setInsightTarget: (target: { id: string; name: string } | null) => void;

  isMessageAllOpen: boolean;
  setIsMessageAllOpen: (open: boolean) => void;
  approvedCount: number;
  bulkMessage: { title: string; message: string };
  setBulkMessage: (msg: { title: string; message: string }) => void;
  handleMessageAll: () => void;
  isMessaging: boolean;
}

export const StaffActions: React.FC<StaffActionsProps> = ({
  classId,
  unenrollTarget,
  setUnenrollTarget,
  handleConfirmUnenroll,
  isDeleting,
  isEnrollDialogOpen,
  setIsEnrollDialogOpen,
  enrolledStudentIds,
  isInviteDialogOpen,
  setIsInviteDialogOpen,
  existingTeacherIds,
  insightTarget,
  setInsightTarget,
  isMessageAllOpen,
  setIsMessageAllOpen,
  approvedCount,
  bulkMessage,
  setBulkMessage,
  handleMessageAll,
  isMessaging,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <AlertDialog open={unenrollTarget !== null} onOpenChange={() => setUnenrollTarget(null)}>
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-[95vw] sm:max-w-lg">
          <AlertDialogHeader className="space-y-6">
            <div className="p-5 rounded-2xl bg-destructive/10 text-destructive w-fit mx-auto">
              <Trash2 className="h-10 w-10" />
            </div>
            <div className="space-y-2 text-center">
              <AlertDialogTitle className="text-3xl font-black">
                {t("classes.show.unenrollDialog.removeStudentTitle")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base font-medium px-6">
                {t("classes.show.unenrollDialog.description")}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-4 pt-8">
            <AlertDialogCancel className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-[10px]">
              {t("buttons.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnenroll}
              disabled={isDeleting}
              className="rounded-2xl px-12 h-14 font-black uppercase tracking-widest text-[10px] bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xl shadow-destructive/20"
            >
              {isDeleting ? t("buttons.processing") : t("buttons.confirmRemoval")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EnrollStudentDialog
        classId={classId}
        isOpen={isEnrollDialogOpen}
        onOpenChange={setIsEnrollDialogOpen}
        enrolledStudentIds={enrolledStudentIds}
      />

      <InviteTeacherDialog
        classId={classId}
        isOpen={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        existingTeacherIds={existingTeacherIds}
      />

      <AIStudentInsightModal
        isOpen={insightTarget !== null}
        onClose={() => setInsightTarget(null)}
        studentId={insightTarget?.id || ""}
        studentName={insightTarget?.name || ""}
        classId={classId}
      />

      <Dialog open={isMessageAllOpen} onOpenChange={setIsMessageAllOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-[95vw] sm:max-w-2xl">
          <DialogHeader className="space-y-6">
            <div className="p-5 rounded-2xl bg-primary/10 text-primary w-fit mx-auto">
              <MessageSquare className="h-10 w-10" />
            </div>
            <div className="space-y-2 text-center">
              <DialogTitle className="text-3xl font-black">
                {t("classes.show.messageAllDialog.title")}
              </DialogTitle>
              <DialogDescription className="text-base font-medium px-6">
                {t("classes.show.messageAllDialog.description", {
                  count: approvedCount,
                })}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="py-8 space-y-8">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2">
                {t("classes.show.messageAllDialog.subject")}
              </Label>
              <Input
                value={bulkMessage.title}
                onChange={(e) => setBulkMessage({ ...bulkMessage, title: e.target.value })}
                placeholder={t("classes.show.messageAllDialog.subjectPlaceholder")}
                className="h-16 rounded-3xl text-lg px-8 bg-muted/30 border-none shadow-inner"
              />
            </div>
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ms-2">
                {t("classes.show.messageAllDialog.message")}
              </Label>
              <Textarea
                value={bulkMessage.message}
                onChange={(e) =>
                  setBulkMessage({
                    ...bulkMessage,
                    message: e.target.value,
                  })
                }
                placeholder={t("classes.show.messageAllDialog.messagePlaceholder")}
                className="min-h-60 rounded-4xl p-8 text-lg bg-muted/30 border-none shadow-inner"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-center gap-4 pt-6">
            <Button
              variant="ghost"
              size="lg"
              onClick={() => setIsMessageAllOpen(false)}
              className="rounded-2xl px-10 h-14"
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              onClick={handleMessageAll}
              size="lg"
              disabled={isMessaging || !bulkMessage.title || !bulkMessage.message}
              className="rounded-2xl px-14 h-14 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
            >
              {isMessaging ? (
                <>
                  <Loader2 className="h-5 w-5 me-3 animate-spin" />
                  {t("buttons.processing")}
                </>
              ) : (
                t("buttons.sendMessage")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
