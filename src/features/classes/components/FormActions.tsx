import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useTranslation } from "react-i18next";

interface FormActionsProps {
  formLoading: boolean;
  isEdit?: boolean;
}

export const FormActions = ({ formLoading, isEdit = false }: FormActionsProps) => {
  const { t } = useTranslation();

  return (
    <div className="pt-6 flex justify-end">
      <Button
        type="submit"
        size="lg"
        disabled={formLoading}
        className="h-16 rounded-[1.5rem] px-12 font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:scale-[1.05] active:scale-[0.95] relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_2s_infinite] pointer-events-none" />
        {formLoading ? (
          <div className="flex gap-3 items-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>{t("buttons.saving")}</span>
          </div>
        ) : (
          <div className="flex gap-3 items-center">
            <Save className="h-6 w-6" />
            <span>{isEdit ? t("buttons.saveChanges") : t("buttons.createClass")}</span>
          </div>
        )}
      </Button>
    </div>
  );
};
