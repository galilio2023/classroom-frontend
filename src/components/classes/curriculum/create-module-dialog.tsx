import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { useEffect, useState } from "react";
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

interface CreateModuleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
  order: number;
}

interface IModuleForm {
  name: string;
  description: string;
  isPublished: boolean;
  classId: number;
  order: number;
}

export const CreateModuleDialog = ({
  isOpen,
  onOpenChange,
  classId,
  order,
}: CreateModuleDialogProps) => {
  const { t } = useTranslation();
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const {
    refineCore: { onFinish, formLoading },
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<IModuleForm>({
    refineCoreProps: {
      resource: "modules",
      action: "create",
      onMutationSuccess: () => {
        onOpenChange(false);
      },
    },
    shouldUnregister: true,
    defaultValues: {
      name: "",
      description: "",
      isPublished: false,
      classId,
      order,
    },
  });

  // 🛡️ COMPLIANCE: Standardized reset on open to ensure fresh state
  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        description: "",
        isPublished: false,
        classId,
        order,
      });
    }
  }, [isOpen, reset, classId, order]);

  const handleCloseAttempt = (open: boolean) => {
    if (!open && isDirty) {
      setShowConfirmClose(true);
    } else {
      onOpenChange(open);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
        <DialogContent
          onPointerDownOutside={(e) => {
            if (isDirty) e.preventDefault();
          }}
          className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-2xl"
        >
          <form onSubmit={handleSubmit(onFinish)} className="p-8 space-y-6">
            <DialogHeader className="space-y-3 text-start">
              <DialogTitle className="text-2xl font-black tracking-tight">
                {t("buttons.createModule")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                  {t("classes.curriculum.moduleName")}
                </Label>
                <Input
                  placeholder={t("classes.curriculum.moduleNamePlaceholder")}
                  {...register("name", { required: true })}
                  className="h-12 rounded-xl border-muted-foreground/20 focus:border-primary transition-all font-bold"
                />
                {errors.name && (
                  <span className="text-[10px] text-destructive font-bold px-1 uppercase tracking-tighter">
                    {t("common.required", "Required")}
                  </span>
                )}
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                  {t("classes.curriculum.description")}
                </Label>
                <Textarea
                  placeholder={t("classes.curriculum.descriptionPlaceholder")}
                  {...register("description")}
                  className="min-h-[100px] rounded-xl border-muted-foreground/20 focus:border-primary transition-all font-medium leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="space-y-0.5">
                  <Label className="text-sm font-black tracking-tight">
                    {t("common.curriculum.publishImmediately")}
                  </Label>
                  <p className="text-[10px] font-bold text-muted-foreground">
                    {t("common.curriculum.publishHelp")}
                  </p>
                </div>
                <Controller
                  name="isPublished"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => handleCloseAttempt(false)}
                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-muted-foreground/20"
              >
                {t("buttons.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={formLoading}
                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
              >
                {formLoading ? t("common.loading", "Loading...") : t("buttons.create")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl bg-card/95 backdrop-blur-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">
              {t("common.unsavedChanges", "Unsaved Changes")}
            </AlertDialogTitle>
            <AlertDialogDescription className="font-bold">
              {t(
                "common.unsavedChangesDescription",
                "You have unsaved changes. Are you sure you want to close? Your progress will be lost."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3">
            <AlertDialogCancel className="rounded-xl font-black uppercase tracking-widest text-[10px] border-muted-foreground/20">
              {t("buttons.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmClose(false);
                onOpenChange(false);
              }}
              className="rounded-xl font-black uppercase tracking-widest text-[10px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("buttons.closeAnyway", "Close Anyway")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
