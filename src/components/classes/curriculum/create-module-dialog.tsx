import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { useEffect } from "react";

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

  const {
    refineCore: { onFinish, formLoading },
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<IModuleForm>({
    refineCoreProps: {
      resource: "modules",
      action: "create",
      onMutationSuccess: () => {
        onOpenChange(false);
      },
    },
    defaultValues: {
      name: "",
      description: "",
      isPublished: false,
      classId,
      order,
    },
  });

  // 🧹 CLEANUP: Handle reset on open/close to prevent double-reset flickering
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-2xl">
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
              onClick={() => onOpenChange(false)}
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
  );
};
