import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface StepBasicProps {
  formData: any;
  setData: (data: any) => void;
  onSave: () => void;
  isUpdating: boolean;
}

export const StepBasic = ({ formData, setData, onSave, isUpdating }: StepBasicProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pt-4">
      <div className="space-y-2 text-start">
        <Label>{t("schools.setup.basic.schoolName")}</Label>
        <Input
          value={formData.name}
          onChange={(e) => setData({ ...formData, name: e.target.value })}
          placeholder="e.g. Tablawy University"
        />
      </div>
      <div className="space-y-2 text-start">
        <Label>{t("schools.setup.basic.schoolSlug")}</Label>
        <Input
          value={formData.slug}
          onChange={(e) => setData({ ...formData, slug: e.target.value })}
          placeholder="tablawy-uni"
        />
        <p className="text-[10px] text-muted-foreground">{t("schools.setup.basic.schoolSlugHint")}</p>
      </div>
      <Button onClick={onSave} disabled={isUpdating} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
        {isUpdating ? <Loader2 className="animate-spin mr-2" /> : null}
        {t("buttons.continue")}
      </Button>
    </div>
  );
};
