import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

interface ResourceState {
  title: string;
  description: string;
  type: "file" | "link" | "video" | "note" | "other";
  url: string;
  content: string;
  cldPubId: string;
  status: "draft" | "active";
}

interface AddResourceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  resource: ResourceState;
  setResource: (res: ResourceState) => void;
  onSave: () => void;
}

export const AddResourceDialog = ({
  isOpen,
  onOpenChange,
  resource,
  setResource,
  onSave,
}: AddResourceDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-2xl">
        <div className="p-8 space-y-6">
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
                  value={resource.title}
                  onChange={(e) => setResource({ ...resource, title: e.target.value })}
                  className="h-12 rounded-xl border-muted-foreground/20 focus:border-primary transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                  {t("classes.resource.addDialog.fieldType")}
                </Label>
                <Select
                  value={resource.type}
                  onValueChange={(v: ResourceState["type"]) => setResource({ ...resource, type: v })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-muted-foreground/20 focus:border-primary transition-all font-bold">
                    <SelectValue placeholder={t("classes.resource.addDialog.typePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-muted-foreground/20">
                    <SelectItem value="note">{t("classes.resource.addDialog.types.note")}</SelectItem>
                    <SelectItem value="file">{t("classes.resource.addDialog.types.file")}</SelectItem>
                    <SelectItem value="link">{t("classes.resource.addDialog.types.link")}</SelectItem>
                    <SelectItem value="video">
                      {t("classes.resource.addDialog.types.video")}
                    </SelectItem>
                    <SelectItem value="other">
                      {t("classes.resource.addDialog.types.other")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(resource.type === "link" || resource.type === "video" || resource.type === "other") && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                  {t("classes.resource.addDialog.fieldUrl")}
                </Label>
                <Input
                  placeholder={t("classes.resource.addDialog.urlPlaceholder")}
                  value={resource.url}
                  onChange={(e) => setResource({ ...resource, url: e.target.value })}
                  className="h-12 rounded-xl border-muted-foreground/20 focus:border-primary transition-all font-bold"
                />
              </div>
            )}

            {resource.type === "note" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                  {t("classes.resource.addDialog.fieldContent")}
                </Label>
                <Textarea
                  className="min-h-50 rounded-xl border-muted-foreground/20 focus:border-primary transition-all font-medium leading-relaxed"
                  placeholder={t("classes.resource.addDialog.contentPlaceholder")}
                  value={resource.content}
                  onChange={(e) => setResource({ ...resource, content: e.target.value })}
                />
              </div>
            )}

            {resource.type === "file" && (
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                  {t("classes.resource.addDialog.fieldUpload", {
                    type: t("classes.resource.addDialog.types.file"),
                  })}
                </Label>
                <FileUpload
                  onUploadSuccess={(url, pubId) =>
                    setResource({ ...resource, url, cldPubId: pubId })
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="space-y-0.5">
                <Label className="text-sm font-black tracking-tight">
                  {t("classes.curriculum.publishImmediately", "Publish Immediately")}
                </Label>
                <p className="text-[10px] font-bold text-muted-foreground">
                  {t("classes.curriculum.resourcePublishHelp", "Visible to students once saved.")}
                </p>
              </div>
              <Switch
                checked={resource.status === "active"}
                onCheckedChange={(val) =>
                  setResource({ ...resource, status: val ? "active" : "draft" })
                }
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-muted-foreground/20"
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              onClick={onSave}
              disabled={!resource.title.trim()}
              className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
            >
              {t("buttons.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
