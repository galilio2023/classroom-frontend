import { GraduationCap, User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface RoleSelectorProps {
  value: "student" | "teacher" | "parent";
  onChange: (role: "student" | "teacher" | "parent") => void;
}

export const RoleSelector = ({ value, onChange }: RoleSelectorProps) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-3 gap-4">
      <div 
        className={cn(
          "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50",
          value === "student" ? "border-primary bg-primary/5" : "border-muted bg-background"
        )}
        onClick={() => onChange("student")}
      >
        <GraduationCap className={cn("h-8 w-8 mb-2", value === "student" ? "text-primary" : "text-muted-foreground")} />
        <span className={cn("font-medium text-xs text-center", value === "student" ? "text-primary" : "text-muted-foreground")}>
          {t("roles.student")}
        </span>
        {value === "student" && (
            <div className={cn("absolute top-2 h-2 w-2 bg-primary rounded-full", "end-2")} />
        )}
      </div>
      <div 
        className={cn(
          "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50",
          value === "teacher" ? "border-primary bg-primary/5" : "border-muted bg-background"
        )}
        onClick={() => onChange("teacher")}
      >
        <User className={cn("h-8 w-8 mb-2", value === "teacher" ? "text-primary" : "text-muted-foreground")} />
        <span className={cn("font-medium text-xs text-center", value === "teacher" ? "text-primary" : "text-muted-foreground")}>
          {t("roles.teacher")}
        </span>
        {value === "teacher" && (
            <div className={cn("absolute top-2 h-2 w-2 bg-primary rounded-full", "end-2")} />
        )}
      </div>
      <div 
        className={cn(
          "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary/50",
          value === "parent" ? "border-primary bg-primary/5" : "border-muted bg-background"
        )}
        onClick={() => onChange("parent")}
      >
        <Heart className={cn("h-8 w-8 mb-2", value === "parent" ? "text-primary" : "text-muted-foreground")} />
        <span className={cn("font-medium text-xs text-center", value === "parent" ? "text-primary" : "text-muted-foreground")}>
          {t("roles.parent")}
        </span>
        {value === "parent" && (
            <div className={cn("absolute top-2 h-2 w-2 bg-primary rounded-full", "end-2")} />
        )}
      </div>
    </div>
  );
};
