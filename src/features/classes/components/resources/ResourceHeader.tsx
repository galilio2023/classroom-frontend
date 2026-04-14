import { Library } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ResourceHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-start">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <Library className="h-4 w-4" />
          </div>
          <h3 className="text-xl font-black tracking-tight">
            {t("classes.resource.learningMaterials")}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          {t("classes.resource.description")}
        </p>
      </div>
    </div>
  );
};
