import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, BookOpen, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface FrictionPoint {
  id: number;
  title: string;
  type: "Quiz" | "Assignment";
  avgScore: number;
  failureRate: number;
  totalAttempts: number;
}

interface FrictionPointsCardProps {
  points: FrictionPoint[];
  isLoading?: boolean;
}

export const FrictionPointsCard = ({ points, isLoading }: FrictionPointsCardProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Card className="border-none shadow-2xl shadow-red-500/5 bg-card/50 backdrop-blur-xl animate-pulse">
        <div className="h-40" />
      </Card>
    );
  }

  if (points.length === 0) return null;

  return (
    <Card className="border-none shadow-2xl shadow-red-500/5 bg-card/50 backdrop-blur-xl overflow-hidden group">
      <CardHeader className="pb-4 space-y-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-600 group-hover:scale-110 transition-transform">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-black tracking-tight">
              {t("analytics.friction.title", "Curriculum Friction")}
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              {t("analytics.friction.description", "AI detected high-failure nodes")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {points.map((point, idx) => (
          <motion.div
            key={`${point.type}-${point.id}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {point.type === "Quiz" ? (
                  <BookOpen className="h-3.5 w-3.5 text-orange-500" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-blue-500" />
                )}
                <span className="text-sm font-bold text-indigo-950 truncate max-w-[150px]">
                  {point.title}
                </span>
              </div>
              <Badge
                variant="destructive"
                className="rounded-full px-2 py-0 h-5 font-black text-[9px] uppercase tracking-tighter"
              >
                {point.failureRate}% Failed
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                  <span>Avg Score</span>
                  <span>{Math.round(point.avgScore)}/100</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
                  <div
                    className="h-full bg-red-500 transition-all duration-1000"
                    style={{ width: `${point.avgScore}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-[10px] font-black">{point.totalAttempts}</span>
              </div>
            </div>
          </motion.div>
        ))}

        <p className="text-[9px] text-center text-muted-foreground italic font-medium px-4">
          💡 Reviewing these materials can significantly improve class-wide performance.
        </p>
      </CardContent>
    </Card>
  );
};
