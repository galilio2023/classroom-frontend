import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AttendanceStatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  colorClass: string;
  hoverBorderClass: string;
}

export const AttendanceStatCard: React.FC<AttendanceStatCardProps> = ({
  icon: Icon,
  value,
  label,
  colorClass,
  hoverBorderClass,
}) => {
  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm border-border/50 transition-colors group", hoverBorderClass)}>
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        <div className={cn("p-2 rounded-full mb-2 group-hover:scale-110 transition-transform", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-2xl font-black text-foreground">{value}</span>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          {label}
        </span>
      </CardContent>
    </Card>
  );
};
