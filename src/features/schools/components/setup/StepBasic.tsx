import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2, Library, ShieldCheck } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface StepBasicProps {
  formData: any;
  setData: (data: any) => void;
  onSave: () => void;
  isUpdating: boolean;
}

export const StepBasic = ({ formData, setData, onSave, isUpdating }: StepBasicProps) => {
  const { t } = useTranslation();

  const SUITE_OPTIONS = [
    {
      id: "school",
      label: t("schools.suites.school.title", "Tablawy School"),
      description: t("schools.suites.school.desc", "For K-12 institutions and academies."),
      icon: Building2,
    },
    {
      id: "faculty",
      label: t("schools.suites.faculty.title", "Tablawy Faculty"),
      description: t("schools.suites.faculty.desc", "For Universities and Higher-Ed."),
      icon: Library,
    },
    {
      id: "corporate",
      label: t("schools.suites.corporate.title", "Tablawy Corporate"),
      description: t("schools.suites.corporate.desc", "For corporate training and compliance."),
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-4">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {t("schools.setup.basic.selectSuite", "Select Your Suite")}
        </Label>
        <RadioGroup
          value={formData.suiteType || "school"}
          onValueChange={(val) => setData({ ...formData, suiteType: val })}
          className="grid grid-cols-1 gap-3"
        >
          {SUITE_OPTIONS.map((option) => (
            <Label
              key={option.id}
              className={cn(
                "flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300",
                formData.suiteType === option.id
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/5"
                  : "border-border/40 hover:border-border hover:bg-muted/50"
              )}
            >
              <RadioGroupItem value={option.id} className="sr-only" />
              <div
                className={cn(
                  "p-2 rounded-xl",
                  formData.suiteType === option.id
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <option.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1 text-start">
                <p className="font-black text-sm uppercase tracking-tight">{option.label}</p>
                <p className="text-[10px] font-medium text-muted-foreground">
                  {option.description}
                </p>
              </div>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2 text-start pt-2">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {t("schools.setup.basic.schoolName")}
        </Label>
        <Input
          value={formData.name}
          onChange={(e) => setData({ ...formData, name: e.target.value })}
          placeholder="e.g. Tablawy University"
          className="h-12 rounded-xl"
        />
      </div>

      <div className="space-y-2 text-start">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {t("schools.setup.basic.schoolSlug")}
        </Label>
        <Input
          value={formData.slug}
          onChange={(e) => setData({ ...formData, slug: e.target.value })}
          placeholder="tablawy-uni"
          className="h-12 rounded-xl"
        />
        <p className="text-[9px] font-bold text-muted-foreground ps-1">
          {t("schools.setup.basic.schoolSlugHint")}
        </p>
      </div>

      <Button
        onClick={onSave}
        disabled={isUpdating}
        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 mt-4"
      >
        {isUpdating ? <Loader2 className="animate-spin mr-2" /> : null}
        {t("buttons.continue")}
      </Button>
    </div>
  );
};
