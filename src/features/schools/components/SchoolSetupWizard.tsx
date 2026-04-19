import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdate, useCreate } from "@refinedev/core";
import { toast } from "sonner";
import { Loader2, Rocket, Paintbrush, Building2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SchoolSetupWizardProps {
  school: any;
  onComplete: () => void;
}

/**
 * 🚀 SCHOOL SETUP WIZARD
 * Multi-step onboarding for new school environments.
 * Guides admins through identity, branding, and academic structure.
 */
export const SchoolSetupWizard = ({ school, onComplete }: SchoolSetupWizardProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [formData, setData] = useState({
    name: school?.name || "",
    slug: school?.slug || "",
    primaryColor: school?.brandingConfig?.primaryColor || "#4f46e5",
    secondaryColor: school?.brandingConfig?.secondaryColor || "#10b981",
    logoUrl: school?.brandingConfig?.logoUrl || "",
    initialDept: "",
  });

  const { mutate: updateSchool, mutation: updateMutation } = useUpdate();
  const { mutate: createDept, mutation: createMutation } = useCreate();

  const isUpdating = updateMutation.isPending;
  const isCreatingDept = createMutation.isPending;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else onComplete();
  };

  const handleSaveBasic = () => {
    updateSchool(
      {
        resource: "schools",
        id: school.id,
        values: {
          name: formData.name,
          slug: formData.slug,
        },
      },
      {
        onSuccess: () => {
          toast.success("Identity saved.");
          handleNext();
        },
      }
    );
  };

  const handleSaveBranding = () => {
    updateSchool(
      {
        resource: "schools",
        id: school.id,
        values: {
          brandingConfig: {
            primaryColor: formData.primaryColor,
            secondaryColor: formData.secondaryColor,
            logoUrl: formData.logoUrl,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success("Branding updated.");
          handleNext();
        },
      }
    );
  };

  const handleAddDept = () => {
    if (!formData.initialDept) return;
    createDept(
      {
        resource: "departments",
        values: {
          name: formData.initialDept,
          schoolId: school.id,
          isActive: true,
        },
      },
      {
        onSuccess: () => {
          toast.success("Department created.");
          setData({ ...formData, initialDept: "" });
        },
      }
    );
  };

  const steps = [
    {
      id: 1,
      title: t("schools.setup.steps.basic"),
      icon: Building2,
      content: (
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
          <Button onClick={handleSaveBasic} disabled={isUpdating} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
            {isUpdating ? <Loader2 className="animate-spin mr-2" /> : null}
            {t("buttons.continue")}
          </Button>
        </div>
      ),
    },
    {
      id: 2,
      title: t("schools.setup.steps.branding"),
      icon: Paintbrush,
      content: (
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
          <div className="p-4 rounded-xl border border-dashed mt-4 flex items-center justify-center gap-4" style={{ borderColor: formData.primaryColor }}>
             <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: formData.primaryColor }} />
             <div className="w-12 h-12 rounded-lg" style={{ backgroundColor: formData.secondaryColor }} />
             <span className="text-xs font-bold uppercase tracking-widest">{t("schools.setup.branding.preview")}</span>
          </div>
          <Button onClick={handleSaveBranding} disabled={isUpdating} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
            {isUpdating ? <Loader2 className="animate-spin mr-2" /> : null}
            {t("buttons.continue")}
          </Button>
        </div>
      ),
    },
    {
      id: 3,
      title: t("schools.setup.steps.departments"),
      icon: Rocket,
      content: (
        <div className="space-y-4 pt-4 text-start">
          <div className="space-y-2">
            <Label>{t("schools.setup.departments.deptName")}</Label>
            <div className="flex gap-2">
              <Input
                value={formData.initialDept}
                onChange={(e) => setData({ ...formData, initialDept: e.target.value })}
                placeholder="e.g. Faculty of Science"
              />
              <Button onClick={handleAddDept} disabled={isCreatingDept} variant="outline">
                {isCreatingDept ? <Loader2 className="animate-spin" /> : t("schools.setup.departments.addDept")}
              </Button>
            </div>
          </div>
          <div className="pt-8">
            <Button onClick={handleNext} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              {t("buttons.continue")}
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: 4,
      title: t("schools.setup.steps.completed"),
      icon: CheckCircle2,
      content: (
        <div className="text-center space-y-6 pt-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black">{t("schools.setup.completed.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("schools.setup.completed.desc")}</p>
          </div>
          <Button onClick={onComplete} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl">
             {t("schools.setup.completed.cta")}
          </Button>
        </div>
      ),
    },
  ];

  const currentStep = steps.find((s) => s.id === step)!;

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 rounded-3xl border-none shadow-2xl">
        <div className="h-2 w-full bg-slate-100">
           <motion.div 
             className="h-full bg-indigo-600"
             initial={{ width: "0%" }}
             animate={{ width: `${(step / 4) * 100}%` }}
           />
        </div>
        <div className="p-8">
          <DialogHeader className="text-start pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <currentStep.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Step {step} of 4
              </span>
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">{currentStep.title}</DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              {step === 1 ? t("schools.setup.description") : null}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};
