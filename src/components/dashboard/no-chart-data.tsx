import { LucideIcon } from "lucide-react";

interface NoChartDataProps {
  icon: LucideIcon;
  message: string;
}

export const NoChartData = ({ icon: Icon, message }: NoChartDataProps) => (
  <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
    <Icon className="h-10 w-10 mb-2" />
    <p className="text-sm font-bold uppercase tracking-widest">{message}</p>
  </div>
);
