import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdate, useCreate, useGetIdentity } from "@refinedev/core";
import { User } from "@/types";
import { toast } from "sonner";
import { Rocket, Paintbrush, Building2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Sub-components (Deconstructed for maintainability)
import { StepBasic } from "./setup/StepBasic";
import { StepBranding } from "./setup/StepBranding";
import { StepDepartments } from "./setup/StepDepartments";
import { StepCompleted } from "./setup/StepCompleted";

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
  const { data: identity } = useGetIdentity<User>();
  const isPrivateMode = identity?.planType === "basic";

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

  const handleSaveBasic = () => {
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("School name and slug are required.");
      return;
    }
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

  const steps = React.useMemo(() => {
    const allSteps = [
      {
        id: 1,
        title: t("schools.setup.steps.basic"),
        icon: Building2,
        content: (
          <StepBasic
            formData={formData}
            setData={(data: any) => setData({ ...formData, ...data })}
            onSave={handleSaveBasic}
            isUpdating={isUpdating}
          />
        ),
      },
      {
        id: 2,
        title: t("schools.setup.steps.branding"),
        icon: Paintbrush,
        content: (
          <StepBranding
            formData={formData}
            setData={(data: any) => setData({ ...formData, ...data })}
            onSave={handleSaveBranding}
            isUpdating={isUpdating}
          />
        ),
      },
      {
        id: 3,
        title: t("schools.setup.steps.departments"),
        icon: Rocket,
        content: (
          <StepDepartments
            formData={formData}
            setData={(data: any) => setData({ ...formData, ...data })}
            onAdd={handleAddDept}
            onNext={handleNext}
            isCreatingDept={isCreatingDept}
          />
        ),
      },
      {
        id: 4,
        title: t("schools.setup.steps.completed"),
        icon: CheckCircle2,
        content: <StepCompleted onComplete={onComplete} />,
      },
    ];

    // 🚀 MODE OPTIMIZATION: Private teachers skip institutional setup to save time (Mandate #B)
    if (isPrivateMode) {
      return [allSteps[0], allSteps[3]]; // Only Identity and Completion
    }

    return allSteps;
  }, [isPrivateMode, formData, isUpdating, isCreatingDept, t]);

  function handleNext() {
    const currentIndex = steps.findIndex((s) => s.id === step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1].id);
    } else {
      onComplete();
    }
  }

  const currentStep = steps.find((s) => s.id === step) || steps[0];
  const totalSteps = steps.length;
  const currentStepNumber = steps.findIndex((s) => s.id === step) + 1;

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden p-0 rounded-3xl border-none shadow-2xl">
        <div className="h-2 w-full bg-slate-100">
          <motion.div
            className="h-full bg-indigo-600"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStepNumber / totalSteps) * 100}%` }}
          />
        </div>
        <div className="p-8">
          <DialogHeader className="text-start pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <currentStep.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Step {currentStepNumber} of {totalSteps}
              </span>
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight">
              {currentStep.title}
            </DialogTitle>
            <DialogDescription className="text-slate-500 font-medium">
              {currentStepNumber === 1 ? t("schools.setup.description") : null}
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
