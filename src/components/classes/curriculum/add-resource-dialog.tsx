import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/file-upload";
import { useTranslation } from "react-i18next";

interface ResourceState {
  title: string;
  description: string;
  type: "file" | "link" | "video" | "note" | "other";
  url: string;
  content: string;
  cldPubId: string;
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
  onSave
}: AddResourceDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader><DialogTitle>{t("classes.resource.addDialog.title")}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("classes.resource.addDialog.fieldTitle")}</Label>
              <Input 
                placeholder={t("classes.resource.addDialog.titlePlaceholder")}
                value={resource.title} 
                onChange={(e) => setResource({ ...resource, title: e.target.value })} 
              />
            </div>
            <div className="space-y-2">
              <Label>{t("classes.resource.addDialog.fieldType")}</Label>
              <Select 
                value={resource.type} 
                onValueChange={(v: ResourceState["type"]) => setResource({ ...resource, type: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("classes.resource.addDialog.typePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">{t("classes.resource.addDialog.types.note")}</SelectItem>
                  <SelectItem value="file">{t("classes.resource.addDialog.types.file")}</SelectItem>
                  <SelectItem value="link">{t("classes.resource.addDialog.types.link")}</SelectItem>
                  <SelectItem value="video">{t("classes.resource.addDialog.types.video")}</SelectItem>
                  <SelectItem value="other">{t("classes.resource.addDialog.types.other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {(resource.type === "link" || resource.type === "video" || resource.type === "other") && (
             <div className="space-y-2">
               <Label>{t("classes.resource.addDialog.fieldUrl")}</Label>
               <Input 
                 placeholder={t("classes.resource.addDialog.urlPlaceholder")} 
                 value={resource.url} 
                 onChange={(e) => setResource({ ...resource, url: e.target.value })} 
               />
             </div>
          )}

          {resource.type === "note" && (
            <div className="space-y-2">
              <Label>{t("classes.resource.addDialog.fieldContent")}</Label>
              <Textarea 
                className="min-h-[200px]" 
                placeholder={t("classes.resource.addDialog.contentPlaceholder")}
                value={resource.content} 
                onChange={(e) => setResource({ ...resource, content: e.target.value })} 
              />
            </div>
          )}
          
          {resource.type === "file" && (
            <div className="space-y-2">
              <Label>{t("classes.resource.addDialog.fieldUpload", { type: t("classes.resource.addDialog.types.file") })}</Label>
              <FileUpload 
                onUploadSuccess={(url, pubId) => setResource({ ...resource, url, cldPubId: pubId })} 
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("buttons.cancel")}</Button>
          <Button onClick={onSave}>{t("buttons.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
