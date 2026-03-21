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
import { useSelect, useCreate } from "@refinedev/core";
import { User, UserRole } from "@/types";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/ui/loading-button";
import { useTranslation } from "react-i18next";

interface EnrollStudentDialogProps {
  classId: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  enrolledStudentIds: string[];
}

export const EnrollStudentDialog = ({
  classId,
  isOpen,
  onOpenChange,
  enrolledStudentIds,
}: EnrollStudentDialogProps) => {
  const { t } = useTranslation();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [isSuccess, setIsSuccess] = useState(false);

  // Correctly destructure mutation from useCreate
  const { mutate: createEnrollment, mutation } = useCreate();
  const isLoading = mutation.isPending;

  const { options: studentOptions } = useSelect<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: UserRole.STUDENT }],
    optionLabel: "name",
    optionValue: "id",
  });

  const handleEnroll = () => {
    if (!selectedStudentId) {
      toast.error(t("classes.dialogs.enrollStudent.toast.selectStudent"));
      return;
    }

    createEnrollment(
      {
        resource: "enrollments",
        values: {
          classId: Number(classId),
          studentId: selectedStudentId,
        },
      },
      {
        onSuccess: () => {
          setIsSuccess(true);
          toast.success(t("classes.dialogs.enrollStudent.toast.success"));
          setTimeout(() => {
            setSelectedStudentId(null); // Reset selection
            setIsSuccess(false);
            onOpenChange(false);
          }, 1000);
        },
        onError: (error) => {
          toast.error(error.message || t("classes.dialogs.enrollStudent.toast.error"));
        },
      },
    );
  };

  const availableStudents = studentOptions.filter(
    (option) => !enrolledStudentIds.includes(String(option.value)),
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="text-start">
        <DialogHeader>
          <DialogTitle>{t("classes.dialogs.enrollStudent.title")}</DialogTitle>
          <DialogDescription>
            {t("classes.dialogs.enrollStudent.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select
            onValueChange={setSelectedStudentId}
            value={selectedStudentId ?? undefined}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("classes.dialogs.enrollStudent.fieldPlaceholder")} />
            </SelectTrigger>
            <SelectContent>
              {availableStudents.length > 0 ? (
                availableStudents.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)} className="text-start">
                    {option.label}
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-sm text-muted-foreground text-start">
                  {t("classes.dialogs.enrollStudent.noStudents")}
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
            onClick={handleEnroll}
            isLoading={isLoading}
            isSuccess={isSuccess}
            disabled={availableStudents.length === 0}
          >
            {t("buttons.enrollStudent")}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
