import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import { SubmissionTiming } from "@/types/dashboard";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SubmissionTimingHeatmapProps {
  data: SubmissionTiming[];
}

export const SubmissionTimingHeatmap = ({
  data,
}: SubmissionTimingHeatmapProps) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Create a 7x24 grid
  const grid = Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => {
      const entry = data.find((d) => d.dayOfWeek === day && d.hour === hour);
      return entry ? entry.count : 0;
    }),
  );

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getOpacity = (count: number) => {
    if (count === 0) return 0.05;
    return Math.max(0.2, count / maxCount);
  };

  return (
    <Card className="border shadow-md bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Clock className="h-5 w-5 text-emerald-500" />
          </div>
          Submission Timing
        </CardTitle>
        <CardDescription>
          When do students submit their work? (Hour × Day)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 overflow-x-auto">
        <div className="min-w-[600px]">
          <div className="flex mb-2">
            <div className="w-10"></div>
            {hours.map((h) => (
              <div
                key={h}
                className="flex-1 text-[10px] text-center text-muted-foreground"
              >
                {h % 6 === 0 ? `${h}:00` : ""}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {days.map((day, dayIndex) => (
              <div key={day} className="flex items-center h-6">
                <div className="w-10 text-xs font-medium text-muted-foreground">
                  {day}
                </div>
                <div className="flex-1 grid grid-cols-24 gap-[1px] h-full">
                  {grid[dayIndex].map((count, hour) => (
                    <TooltipProvider key={hour}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className="h-full rounded-[1px] bg-emerald-500 transition-all hover:ring-1 hover:ring-ring hover:z-10"
                            style={{ opacity: getOpacity(count) }}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs font-medium">
                            {day} at {hour}:00 -{" "}
                            <span className="text-emerald-500 font-bold">
                              {count} submissions
                            </span>
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-end gap-1 mt-4 text-[10px] text-muted-foreground">
            <span>Less</span>
            <div className="w-2 h-2 rounded-sm bg-emerald-500 opacity-[0.05]" />
            <div className="w-2 h-2 rounded-sm bg-emerald-500 opacity-[0.3]" />
            <div className="w-2 h-2 rounded-sm bg-emerald-500 opacity-[0.6]" />
            <div className="w-2 h-2 rounded-sm bg-emerald-500 opacity-[1]" />
            <span>More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
