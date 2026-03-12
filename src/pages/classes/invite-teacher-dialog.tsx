import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelect, useCreate, useGetIdentity } from "@refinedev/core";
import { User, UserRole } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { useTranslation } from "react-i18next";

interface InviteTeacherDialogProps {
  classId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  existingTeacherIds: string[];
}

export const InviteTeacherDialog = ({
  classId,
  isOpen,
  onOpenChange,
  existingTeacherIds,
}: InviteTeacherDialogProps) => {
  const { t } = useTranslation();
  const { data: identity } = useGetIdentity<User>();
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(
    null,
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: addTeacher, mutation } = useCreate();
  const isLoading = mutation.isPending;

  const { options: teacherOptions } = useSelect<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: UserRole.TEACHER }],
    optionLabel: "name",
    optionValue: "id",
  });

  const handleInvite = () => {
    if (!selectedTeacherId) {
      toast.error(t("classes.dialogs.inviteTeacher.toast.selectTeacher"));
      return;
    }

    addTeacher(
      {
        resource: `classes/${classId}/teachers`,
        values: {
          teacherId: selectedTeacherId,
          isPrimary: false,
        },
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success(t("classes.dialogs.inviteTeacher.toast.success"));
          setTimeout(() => {
            setSelectedTeacherId(null);
            setIsSuccess(false);
            onOpenChange(false);
          }, 1000);
        },
        onError: (error: any) => {
          toast.error(error?.data?.message || t("classes.dialogs.inviteTeacher.toast.error"));
        },
      },
    );
  };

  const availableTeachers = teacherOptions.filter(
    (option) => 
      !existingTeacherIds.includes(String(option.value)) && 
      String(option.value) !== identity?.id
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="text-start">
        <DialogHeader>
          <DialogTitle>{t("classes.dialogs.inviteTeacher.title")}</DialogTitle>
          <DialogDescription>
            {t("classes.dialogs.inviteTeacher.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select
            onValueChange={setSelectedTeacherId}
            value={selectedTeacherId ?? undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("classes.dialogs.inviteTeacher.fieldPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {availableTeachers.length > 0 ? (
                availableTeachers.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)} className="text-start">
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-sm text-muted-foreground text-start">
                  {t("classes.dialogs.inviteTeacher.noTeachers")}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("buttons.cancel")}
          </Button>
          <LoadingButton
            onClick={handleInvite}
            isLoading={isLoading}
            isSuccess={isSuccess}
            disabled={availableTeachers.length === 0}
          >
            {t("buttons.inviteTeacher")}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
