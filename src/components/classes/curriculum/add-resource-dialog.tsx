import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/file-upload";
import { useTranslation } from "react-i18next";
import { useForm } from "@refinedev/react-hook-form";
import { Controller } from "react-hook-form";
import { useEffect } from "react";

interface AddResourceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  classId: number;
  moduleId: number;
}

export const AddResourceDialog = ({
  isOpen,
  onOpenChange,
  classId,
  moduleId,
}: AddResourceDialogProps) => {
  const { t } = useTranslation();

  const {
    refineCore: { onFinish, formLoading },
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    refineCoreProps: {
      resource: "resources",
      action: "create",
      onMutationSuccess: () => {
        onOpenChange(false);
      },
    },
    shouldUnregister: true,
    defaultValues: {
      title: "",
      description: "",
      type: "file",
      url: "",
      content: "",
      cldPubId: "",
      status: "draft",
      classId,
      moduleId,
    },
  });

  const resourceType = watch("type");

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data: any) => {
    // 🧹 CLEANUP: Only send relevant data based on type to keep DB clean
    const payload = { ...data };
    if (data.type === "note") {
      delete payload.url;
      delete payload.cldPubId;
    } else if (data.type === "file") {
      delete payload.content;
    } else {
      delete payload.content;
      delete payload.cldPubId;
    }
    onFinish(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-2xl">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-8 space-y-6">
          <DialogHeader className="space-y-3 text-start">
            <DialogTitle className="text-2xl font-black tracking-tight">
              {t("classes.resource.addDialog.title")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                  {t("classes.resource.addDialog.fieldTitle")}
                </Label>
                <Input
                  placeholder={t("classes.resource.addDialog.titlePlaceholder")}
                  {...register("title", { required: true })}
                  className="h-12 rounded-xl border-muted-foreground/20 focus:border-primary transition-all font-bold"
                />
                {errors.title && (
                  <span className="text-[10px] text-destructive font-bold px-1 uppercase tracking-tighter">
                    {t("common.required", "Required")}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                  {t("classes.resource.addDialog.fieldType")}
                </Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-12 rounded-xl border-muted-foreground/20 focus:border-primary transition-all font-bold">
                        <SelectValue
                          placeholder={t("classes.resource.addDialog.typePlaceholder")}
                        />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-muted-foreground/20">
                        <SelectItem value="note">
                          {t("classes.resource.addDialog.types.note")}
                        </SelectItem>
                        <SelectItem value="file">
                          {t("classes.resource.addDialog.types.file")}
                        </SelectItem>
                        <SelectItem value="link">
                          {t("classes.resource.addDialog.types.link")}
                        </SelectItem>
                        <SelectItem value="video">
                          {t("classes.resource.addDialog.types.video")}
                        </SelectItem>
                        <SelectItem value="other">
                          {t("classes.resource.addDialog.types.other")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {(resourceType === "link" || resourceType === "video" || resourceType === "other") && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                  {t("classes.resource.addDialog.fieldUrl")}
                </Label>
                <Input
                  placeholder={t("classes.resource.addDialog.urlPlaceholder")}
                  {...register("url", { required: true })}
                  className="h-12 rounded-xl border-muted-foreground/20 focus:border-primary transition-all font-bold"
                />
              </div>
            )}

            {resourceType === "note" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                  {t("classes.resource.addDialog.fieldContent")}
                </Label>
                <Textarea
                  className="min-h-50 rounded-xl border-muted-foreground/20 focus:border-primary transition-all font-medium leading-relaxed"
                  placeholder={t("classes.resource.addDialog.contentPlaceholder")}
                  {...register("content", { required: true })}
                />
              </div>
            )}

            {resourceType === "file" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                  {t("classes.resource.addDialog.fieldUpload", {
                    type: t("classes.resource.addDialog.types.file"),
                  })}
                </Label>
                <FileUpload
                  onUploadSuccess={(url, pubId) => {
                    setValue("url", url);
                    setValue("cldPubId", pubId);
                  }}
                />
              </div>
            )}

            <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="space-y-0.5">
                <Label className="text-sm font-black tracking-tight">
                  {t("common.curriculum.publishImmediately")}
                </Label>
                <p className="text-[10px] font-black text-muted-foreground">
                  {t("common.curriculum.resourcePublishHelp")}
                </p>
              </div>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value === "active"}
                    onCheckedChange={(val) => field.onChange(val ? "active" : "draft")}
                  />
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
              {formLoading ? t("common.loading", "Loading...") : t("buttons.save")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
