import React from "react";
import { Users, MousePointer2, UserPlus, ArrowDown, Sparkles, Info } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {} from "framer-motion";

interface FunnelData {
  impressions: number;
  previewClicks: number;
  registrationAttempts: number;
  enrollments: number;
  stitchedConversions: number;
}

interface Props {
  data: FunnelData;
}

export const MarketplaceFunnel = ({ data }: Props) => {
  const { t } = useTranslation();

  const stages = [
    {
      label: "Impressions",
      value: data.impressions,
      icon: Users,
      color: "bg-muted/50",
      description: "Guests who saw your class in the catalog.",
    },
    {
      label: "Previews",
      value: data.previewClicks,
      icon: MousePointer2,
      color: "bg-primary/10 text-primary",
      description: "Guests who clicked to view curriculum details.",
    },
    {
      label: "Conversions",
      value: data.enrollments,
      icon: UserPlus,
      color: "bg-success/10 text-success",
      description: "Students who successfully joined the class.",
    },
  ];

  const calculateConversion = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round((current / previous) * 100);
  };

  const totalConversion = calculateConversion(data.enrollments, data.impressions);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const prevStage = stages[idx - 1];
          const conversion = prevStage ? calculateConversion(stage.value, prevStage.value) : null;

          return (
            <div key={stage.label} className="relative group">
              <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden h-full">
                <CardHeader className={cn("p-6 pb-4", stage.color)}>
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5" />
                    {conversion !== null && (
                      <Badge
                        variant="outline"
                        className="bg-background/50 border-none font-black text-[10px]"
                      >
                        {conversion}% Conv.
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-6 text-start">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                    {stage.label}
                  </p>
                  <h3 className="text-4xl font-black tracking-tighter mb-4">
                    {stage.value.toLocaleString()}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground/60 leading-relaxed uppercase">
                    {stage.description}
                  </p>
                </CardContent>
              </Card>

              {idx < stages.length - 1 && (
                <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center bg-background border-4 border-muted rounded-full p-1 shadow-lg">
                  <ArrowDown className="-rotate-90 h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Insights & Stitched Data */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-linear-to-br from-primary/5 to-ai-primary/5 overflow-hidden">
        <CardContent className="p-10 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 text-start">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white shadow-xl">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight uppercase leading-none">
                  Creator Insights
                </h3>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  AI Market Analysis
                </span>
              </div>
            </div>

            <p className="text-lg font-medium leading-relaxed">
              {totalConversion > 5
                ? "Your class is performing above the market average! High impression-to-enrollment ratio detected."
                : "Your 'Previews' are high but 'Conversions' are low. Consider adding a video trailer or lowering the price to reduce friction."}
            </p>

            <div className="flex items-center gap-2 p-4 rounded-2xl bg-white/50 border border-white/20 backdrop-blur-sm">
              <Info className="h-4 w-4 text-primary" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                {data.stitchedConversions} students were explicitly linked to guest marketplace
                sessions.
              </p>
            </div>
          </div>

          <div className="md:w-1/3 flex flex-col items-center justify-center p-8 bg-white rounded-3xl shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Total Yield
            </p>
            <div className="relative">
              <svg className="h-32 w-32 rotate-[-90deg]">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  className="stroke-muted fill-none"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  className="stroke-primary fill-none"
                  strokeWidth="12"
                  strokeDasharray={`${(totalConversion / 100) * 364} 364`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-black">{totalConversion}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Badge = ({ children, variant, className }: any) => (
  <div
    className={cn(
      "px-2 py-0.5 rounded text-[10px] md:text-[11px] font-black uppercase",
      variant === "outline" ? "border" : "bg-primary text-white",
      className
    )}
  >
    {children}
  </div>
);
