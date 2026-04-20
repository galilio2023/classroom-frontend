import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface StepBrandingProps {
  formData: any;
  setData: (data: any) => void;
  onSave: () => void;
  isUpdating: boolean;
}

export const StepBranding = ({ formData, setData, onSave, isUpdating }: StepBrandingProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 text-start">
          <Label>{t("schools.setup.branding.primaryColor")}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              className="w-12 h-10 p-1"
              value={formData.primaryColor}
              onChange={(e) => setData({ ...formData, primaryColor: e.target.value })}
            />
            <Input
              value={formData.primaryColor}
              onChange={(e) => setData({ ...formData, primaryColor: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-2 text-start">
          <Label>{t("schools.setup.branding.secondaryColor")}</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              className="w-12 h-10 p-1"
              value={formData.secondaryColor}
              onChange={(e) => setData({ ...formData, secondaryColor: e.target.value })}
            />
            <Input
              value={formData.secondaryColor}
              onChange={(e) => setData({ ...formData, secondaryColor: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="space-y-2 text-start">
        <Label>{t("schools.setup.branding.logoUrl")}</Label>
        <Input
          value={formData.logoUrl}
          onChange={(e) => setData({ ...formData, logoUrl: e.target.value })}
          placeholder="https://..."
        />
      </div>
      <div
        className="p-4 rounded-xl border border-dashed mt-4 flex items-center justify-center gap-4"
        style={{ borderColor: formData.primaryColor }}
      >
        <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: formData.primaryColor }} />
        <div
          className="w-12 h-12 rounded-lg"
          style={{ backgroundColor: formData.secondaryColor }}
        />
        <span className="text-xs font-bold uppercase tracking-widest">
          {t("schools.setup.branding.preview")}
        </span>
      </div>
      <Button
        onClick={onSave}
        disabled={isUpdating}
        className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
      >
        {isUpdating ? <Loader2 className="animate-spin mr-2" /> : null}
        {t("buttons.continue")}
      </Button>
    </div>
  );
};
