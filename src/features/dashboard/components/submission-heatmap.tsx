import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SubmissionHeatmapProps {
  data: { date: string; count: number }[];
}

export const SubmissionHeatmap = ({ data }: SubmissionHeatmapProps) => {
  const { t } = useTranslation();
  // Using translation keys for days
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Generate last 6 months of dates
  const heatmapData = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = 180; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = data.find((item) => item.date === dateStr);
      result.push({
        date: d,
        dateStr,
        count: entry ? entry.count : 0,
      });
    }
    return result;
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/30";
    if (count === 1) return "bg-primary/30";
    if (count === 2) return "bg-primary/50";
    if (count === 3) return "bg-primary/70";
    return "bg-primary";
  };

  return (
    <Card className="border shadow-md bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <CalendarIcon className="h-5 w-5 text-primary" />
          {t("portfolioPage.submissionActivity", "Submission Activity")}
        </CardTitle>
        <CardDescription>
          {t(
            "portfolioPage.submissionActivityDesc",
            "Your assignment submission frequency over the last 6 months.",
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1 overflow-x-auto pb-2">
          <div className="flex gap-1">
            <div className="grid grid-rows-7 gap-1 pe-2">
              {days.map((day) => (
                <span
                  key={day}
                  className="text-[10px] text-muted-foreground h-3 flex items-center"
                >
                  {t(`days.${day}`, day)}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 max-w-full">
              <TooltipProvider>
                {heatmapData.map((day, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "w-3 h-3 rounded-sm transition-colors cursor-pointer",
                          getColor(day.count),
                        )}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        <span className="font-bold">
                          {t("portfolioPage.heatmapSubmissions", {
                            count: day.count,
                            defaultValue: "{{count}} submissions",
                          })}
                        </span>{" "}
                        {t("portfolioPage.heatmapOn", { defaultValue: "on" })}{" "}
                        {day.date.toLocaleDateString()}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </div>
          <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-muted-foreground">
            <span>{t("portfolioPage.heatmapLess", "Less")}</span>
            <div className="w-2 h-2 rounded-sm bg-muted/30" />
            <div className="w-2 h-2 rounded-sm bg-primary/30" />
            <div className="w-2 h-2 rounded-sm bg-primary/50" />
            <div className="w-2 h-2 rounded-sm bg-primary/70" />
            <div className="w-2 h-2 rounded-sm bg-primary" />
            <span>{t("portfolioPage.heatmapMore", "More")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
