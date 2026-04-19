import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface StepDepartmentsProps {
  formData: any;
  setData: (data: any) => void;
  onAdd: () => void;
  onNext: () => void;
  isCreatingDept: boolean;
}

export const StepDepartments = ({ formData, setData, onAdd, onNext, isCreatingDept }: StepDepartmentsProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pt-4 text-start">
      <div className="space-y-2">
        <Label>{t("schools.setup.departments.deptName")}</Label>
        <div className="flex gap-2">
          <Input
            value={formData.initialDept}
            onChange={(e) => setData({ ...formData, initialDept: e.target.value })}
            placeholder="e.g. Faculty of Science"
          />
          <Button onClick={onAdd} disabled={isCreatingDept} variant="outline">
            {isCreatingDept ? <Loader2 className="animate-spin" /> : t("schools.setup.departments.addDept")}
          </Button>
        </div>
      </div>
      <div className="pt-8">
        <Button onClick={onNext} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
          {t("buttons.continue")}
        </Button>
      </div>
    </div>
  );
};
