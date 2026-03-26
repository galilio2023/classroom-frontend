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
import { useTranslation } from "react-i18next";

interface CreateModuleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (desc: string) => void;
  onCreate: () => void;
}

export const CreateModuleDialog = ({
  isOpen,
  onOpenChange,
  name,
  setName,
  description,
  setDescription,
  onCreate,
}: CreateModuleDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("buttons.createModule")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>{t("classes.curriculum.moduleName")}</Label>
            <Input
              placeholder={t("classes.curriculum.moduleNamePlaceholder")}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t("classes.curriculum.description")}</Label>
            <Textarea
              placeholder={t("classes.curriculum.descriptionPlaceholder")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("buttons.cancel")}
          </Button>
          <Button onClick={onCreate}>{t("buttons.create")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
