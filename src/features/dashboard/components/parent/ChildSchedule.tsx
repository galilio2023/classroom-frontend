import { useTranslation } from "react-i18next";
import { useCustom } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import { ScheduleItem } from "@/types/dashboard";
import { ScheduleItemCard } from "../schedule-item-card";

interface ChildScheduleProps {
  childId: string;
  childName: string;
  show: (resource: string, id: string | number) => void;
}

export const ChildSchedule = ({ childId, childName, show }: ChildScheduleProps) => {
  const { t } = useTranslation();
  const { data: response, isLoading } = useCustom<ScheduleItem[]>({
    url: `/dashboard`,
    method: "get",
    config: {
      query: {
        sections: "schedule",
        studentId: childId,
      },
    },
  }) as any;

  const schedule: ScheduleItem[] = response?.data || [];

  return (
    <Card className="border-border/40 bg-primary/2 rounded-4xl overflow-hidden shadow-inner">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60">
            {t("dashboard.schedule.child", { name: childName.split(" ")[0] })}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 rounded-lg px-3 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10"
            onClick={() => show("calendar", "")}
          >
            {t("dashboard.schedule.viewFull")}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-primary/40" />
          </div>
        ) : schedule.length > 0 ? (
          <div className="grid gap-3 text-start">
            {schedule.slice(0, 2).map((item: ScheduleItem) => (
              <ScheduleItemCard key={item.id} item={item} onClick={(id) => show("classes", id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 px-4 space-y-2 opacity-40 grayscale text-balance">
            <Calendar className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
              {t("dashboard.schedule.noClasses", {
                name: childName.split(" ")[0],
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
