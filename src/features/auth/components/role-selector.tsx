import { GraduationCap, User, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type RoleType = "student" | "teacher" | "parent";

interface RoleSelectorProps {
  value: RoleType;
  onChange: (role: RoleType) => void;
  allowedRoles?: RoleType[];
}

export const RoleSelector = ({
  value,
  onChange,
  allowedRoles = ["student", "parent"],
}: RoleSelectorProps) => {
  const { t } = useTranslation();

  const roleConfigs = [
    {
      id: "student" as const,
      label: t("roles.student"),
      icon: GraduationCap,
      activeColor: "text-primary",
      activeBg: "bg-primary/5",
    },
    {
      id: "teacher" as const,
      label: t("roles.teacher"),
      icon: User,
      activeColor: "text-purple-500",
      activeBg: "bg-purple-500/5",
    },
    {
      id: "parent" as const,
      label: t("roles.parent"),
      icon: Heart,
      activeColor: "text-primary",
      activeBg: "bg-primary/5",
    },
  ];

  const filteredRoles = roleConfigs.filter((role) => allowedRoles.includes(role.id));

  return (
    <div className={cn("grid gap-4", filteredRoles.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
      {filteredRoles.map((role) => {
        const isActive = value === role.id;
        const Icon = role.icon;

        return (
          <div
            key={role.id}
            className={cn(
              "relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:border-primary/30",
              isActive ? cn("border-primary", role.activeBg) : "border-border/40 bg-muted/10"
            )}
            onClick={() => onChange(role.id)}
          >
            <Icon
              className={cn(
                "h-10 w-10 mb-3",
                isActive ? role.activeColor : "text-muted-foreground/40"
              )}
            />
            <span
              className={cn(
                "font-bold text-xs uppercase tracking-widest text-center",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {role.label}
            </span>
            {isActive && (
              <div
                className={cn(
                  "absolute top-3 h-2 w-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]",
                  "end-3"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
