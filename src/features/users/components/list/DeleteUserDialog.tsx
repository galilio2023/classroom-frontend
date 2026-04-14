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
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeleteUserDialogProps {
  targetId: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteUserDialog = ({ targetId, onClose, onConfirm }: DeleteUserDialogProps) => {
  const { t } = useTranslation();

  return (
    <AlertDialog open={targetId !== null} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-w-lg">
        <AlertDialogHeader className="space-y-6 text-center">
          <div className="p-5 rounded-2xl bg-destructive/10 text-destructive w-fit mx-auto">
            <Trash2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <AlertDialogTitle className="text-3xl font-black">
              {t("users.governance.deleteDialog.title")}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-base px-8 text-balance">
              {t("users.governance.deleteDialog.description")}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-4 pt-8">
          <AlertDialogCancel className="rounded-2xl px-10 h-14 font-black uppercase text-[10px]">
            {t("buttons.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-2xl px-12 h-14 bg-destructive hover:bg-destructive/90"
          >
            {t("buttons.confirmDelete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
