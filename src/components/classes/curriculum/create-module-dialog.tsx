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
import { useTranslation } from "react-i18next";

interface CreateModuleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  isPublished: boolean;
  setIsPublished: (val: boolean) => void;
  onCreate: () => void;
}

export const CreateModuleDialog = ({
  isOpen,
  onOpenChange,
  name,
  setName,
  description,
  setDescription,
  isPublished,
  setIsPublished,
  onCreate,
}: CreateModuleDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden bg-card/95 backdrop-blur-2xl">
        <div className="p-8 space-y-6">
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl border-muted-foreground/20 focus:border-primary transition-all font-bold"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">
                {t("classes.curriculum.description")}
              </Label>
              <Textarea
                placeholder={t("classes.curriculum.descriptionPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] rounded-xl border-muted-foreground/20 focus:border-primary transition-all font-medium leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="space-y-0.5">
                <Label className="text-sm font-black tracking-tight">
                  {t("classes.curriculum.publishImmediately", "Publish Immediately")}
                </Label>
                <p className="text-[10px] font-bold text-muted-foreground">
                  {t("classes.curriculum.publishHelp", "Visible to students once created.")}
                </p>
              </div>
              <Switch checked={isPublished} onCheckedChange={setIsPublished} />
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
              onClick={onCreate}
              disabled={!name.trim()}
              className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
            >
              {t("buttons.create")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
