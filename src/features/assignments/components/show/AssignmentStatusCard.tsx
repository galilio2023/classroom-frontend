import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Assignment } from "@/types";

interface AssignmentStatusCardProps {
  assignment: Assignment;
}

export const AssignmentStatusCard = ({ assignment }: AssignmentStatusCardProps) => {
  const { t } = useTranslation();

  return (
    <Card className="rounded-4xl border-none shadow-xl bg-card/50 backdrop-blur-xl overflow-hidden text-start">
      <CardHeader className="p-8 border-b border-border/40">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">
          {t("assignments.show.status" as any)}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-bold text-muted-foreground">
            {t("assignments.show.dueDate" as any)}
          </span>
          <span className="font-black text-sm">
            {assignment.dueDate
              ? new Date(assignment.dueDate).toLocaleDateString()
              : t("common.noDueDate" as any)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-muted-foreground">
            {t("assignments.show.points" as any)}
          </span>
          <Badge className="bg-primary/10 text-primary border-none font-black px-3">
            {assignment.id} {t("common.xp" as any)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
