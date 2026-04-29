import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCustom } from "@refinedev/core";
import { cn } from "@/lib/utils";

export const GpaPreviewWidget: React.FC = () => {
  const { t } = useTranslation();

  const { data: queryData, isLoading } = useCustom({
    url: `${import.meta.env.VITE_API_URL}/reports/gpa-preview`,
    method: "get",
  } as any) as any;

  const data = (queryData?.data as any) || { gpa: "0.00", courses: [], standing: "Good" };

  const gpaValue = parseFloat(data.gpa);

  const getGpaColor = (val: number) => {
    if (val >= 3.5) return "text-emerald-500";
    if (val >= 3.0) return "text-blue-500";
    if (val >= 2.0) return "text-amber-500";
    return "text-destructive";
  };

  if (isLoading) {
    return <Card className="h-[300px] animate-pulse bg-muted/10 rounded-4xl border-border/40" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border border-border/80 dark:border-white/5 shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem] relative group h-full">
        <CardHeader className="p-8 pb-4">
          <CardTitle className="text-xl font-black flex items-center gap-3 tracking-tight uppercase italic">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <GraduationCap className="w-6 h-6" />
            </div>
            Projected GPA
          </CardTitle>
          <CardDescription className="font-medium">Faculty Dynamic Projection</CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-0 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className={cn("text-6xl font-black tracking-tighter", getGpaColor(gpaValue))}>
                {data.gpa}
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full px-3 py-1 font-black uppercase text-[8px] tracking-widest",
                    data.standing === "Good"
                      ? "border-emerald-500/20 text-emerald-600"
                      : "border-destructive/20 text-destructive"
                  )}
                >
                  {data.standing} Standing
                </Badge>
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="w-24 h-24 rounded-full border-8 border-muted/10 flex items-center justify-center relative">
                <motion.div
                  initial={{ rotate: -90 }}
                  animate={{ rotate: (gpaValue / 4.0) * 360 - 90 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute inset-[-8px] rounded-full border-8 border-purple-500 border-t-transparent border-r-transparent border-l-transparent"
                />
                <TrendingUp className="w-8 h-8 text-purple-500/40" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ms-1">
              Course Breakdown
            </div>
            <div className="grid gap-2">
              {data.courses.slice(0, 2).map((c: any) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-background/40 border border-border/40"
                >
                  <span className="text-[10px] font-black truncate max-w-[120px] uppercase tracking-tight">
                    {c.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      {c.credits} CR
                    </span>
                    <Badge
                      variant="secondary"
                      className="h-5 px-2 rounded-full text-[8px] font-black bg-purple-500/10 text-purple-500 border-none"
                    >
                      {c.points.toFixed(1)} PTS
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="ghost"
            className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-purple-500/5 hover:text-purple-600 transition-all border border-dashed border-border/60"
          >
            View Full Transcript
            <ArrowRight className="w-3 h-3" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
