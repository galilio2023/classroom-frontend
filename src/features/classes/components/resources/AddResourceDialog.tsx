import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Save, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/file-upload";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface AddResourceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (resource: any) => void;
  isLoading: boolean;
}

export const AddResourceDialog = ({
  isOpen,
  onOpenChange,
  onAdd,
  isLoading,
}: AddResourceDialogProps) => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "file" as "file" | "link" | "video" | "note" | "image" | "other",
    url: "",
    content: "",
    cldPubId: "",
    isAiPinned: false,
  });

  const handleSubmit = () => {
    onAdd(newResource);
    // Reset local state if needed (or parent can handle)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] rounded-4xl border-none shadow-2xl bg-card/95 backdrop-blur-xl text-start">
        <DialogHeader className="space-y-3">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit">
            <PlusCircle className="h-6 w-6" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">
            {t("classes.resource.addDialog.title")}
          </DialogTitle>
          <DialogDescription className="font-medium">
            {t("classes.resource.addDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <Label
                htmlFor="title"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1"
              >
                {t("classes.resource.addDialog.fieldTitle")}
              </Label>
              <Input
                id="title"
                placeholder={t("classes.resource.addDialog.titlePlaceholder")}
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                className="h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary font-bold"
              />
            </div>
            <div className="space-y-2.5">
              <Label
                htmlFor="type"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1"
              >
                {t("classes.resource.addDialog.fieldType")}
              </Label>
              <Select
                value={newResource.type}
                onValueChange={(v: any) => setNewResource({ ...newResource, type: v })}
              >
                <SelectTrigger className="h-12 rounded-xl bg-muted/20 border-none focus:ring-primary transition-all font-bold">
                  <SelectValue placeholder={t("classes.resource.addDialog.typePlaceholder")} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-2xl">
                  <SelectItem value="note" className="rounded-lg font-bold text-start">
                    {t("classes.resource.addDialog.types.note")}
                  </SelectItem>
                  <SelectItem value="file" className="rounded-lg font-bold text-start">
                    {t("classes.resource.addDialog.types.file")}
                  </SelectItem>
                  <SelectItem value="image" className="rounded-lg font-bold text-start">
                    {t("classes.resource.addDialog.types.image")}
                  </SelectItem>
                  <SelectItem value="link" className="rounded-lg font-bold text-start">
                    {t("classes.resource.addDialog.types.link")}
                  </SelectItem>
                  <SelectItem value="video" className="rounded-lg font-bold text-start">
                    {t("classes.resource.addDialog.types.video")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {newResource.type === "note" && (
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                {t("classes.resource.addDialog.fieldContent")}
              </Label>
              <Textarea
                placeholder={t("classes.resource.addDialog.contentPlaceholder")}
                value={newResource.content}
                onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                className="min-h-[250px] rounded-2xl bg-muted/20 border-none focus-visible:ring-primary p-5 text-sm leading-relaxed font-mono shadow-inner"
              />
            </div>
          )}

          {(newResource.type === "file" || newResource.type === "image") && (
            <div className="space-y-2.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1">
                {t("classes.resource.addDialog.fieldUpload", {
                  type:
                    newResource.type === "image"
                      ? t("classes.resource.addDialog.types.image")
                      : t("classes.resource.addDialog.types.file"),
                })}
              </Label>
              <div className="p-6 rounded-2xl border-2 border-dashed border-muted-foreground/10 bg-muted/10">
                <FileUpload
                  onUploadSuccess={(url, pubId) =>
                    setNewResource({ ...newResource, url, cldPubId: pubId })
                  }
                />
              </div>
            </div>
          )}

          {(newResource.type === "link" || newResource.type === "video") && (
            <div className="space-y-2.5">
              <Label
                htmlFor="url"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1"
              >
                {t("classes.resource.addDialog.fieldUrl")}
              </Label>
              <div className="relative group">
                <Input
                  id="url"
                  placeholder={t("classes.resource.addDialog.urlPlaceholder")}
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  className={cn(
                    "h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary font-bold",
                    isAr ? "pe-10" : "ps-10"
                  )}
                />
                <LinkIcon
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors",
                    "start-3.5"
                  )}
                />
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <Label
              htmlFor="desc"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ms-1"
            >
              {t("classes.resource.addDialog.fieldDescription")}
            </Label>
            <Input
              id="desc"
              placeholder={t("classes.resource.addDialog.descPlaceholder")}
              value={newResource.description}
              onChange={(e) =>
                setNewResource({
                  ...newResource,
                  description: e.target.value,
                })
              }
              className="h-12 rounded-xl bg-muted/20 border-none focus-visible:ring-primary font-bold"
            />
          </div>
        </div>
        <DialogFooter className="gap-3">
          <Button
            variant="ghost"
            className="rounded-xl font-bold h-12"
            onClick={() => onOpenChange(false)}
          >
            {t("buttons.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="rounded-xl font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 me-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 me-2" />
            )}
            {t("buttons.saveMaterial")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
