import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, ShieldCheck, AlertTriangle, Skull } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ClassHealth } from "@/types/dashboard";
import { motion } from "framer-motion";

interface ClassHealthDashboardProps {
  data?: ClassHealth[];
}

export const ClassHealthDashboard = ({ data }: ClassHealthDashboardProps) => {
  const { t } = useTranslation();

  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8 px-2 text-start">
        <div className="p-2 rounded-xl bg-ai-primary/10 text-ai-primary">
          <HeartPulse className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-black tracking-tight">
          {t("dashboard.staff.classHealth.title", "Class Health Dashboard")}
        </h2>
        <div className="h-px flex-1 bg-linear-to-r from-ai-primary/20 to-transparent" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item, idx) => (
          <motion.div
            key={item.classId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="border-border/40 bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden hover:border-primary/30 transition-all shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <Badge
                    className={cn(
                      "font-black uppercase tracking-[0.1em] text-[10px] px-3 py-1 rounded-full",
                      item.status === "Green" &&
                        "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                      item.status === "Yellow" &&
                        "bg-amber-500/10 text-amber-600 border-amber-500/20",
                      item.status === "Red" &&
                        "bg-destructive/10 text-destructive border-destructive/20"
                    )}
                  >
                    {item.label}
                  </Badge>
                  <span className="text-xs font-black text-muted-foreground/40">
                    {item.studentCount} Students
                  </span>
                </div>
                <CardTitle className="text-xl font-black mt-2 text-start">
                  {item.className}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <svg className="h-20 w-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-muted/10"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={213.6}
                        strokeDashoffset={213.6 * (1 - item.score / 100)}
                        strokeLinecap="round"
                        className={cn(
                          "transition-all duration-1000",
                          item.status === "Green" && "text-emerald-500",
                          item.status === "Yellow" && "text-amber-500",
                          item.status === "Red" && "text-destructive"
                        )}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-black leading-none">{item.score}</span>
                      <span className="text-[8px] font-black uppercase text-muted-foreground/60">
                        Risk
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                      <span>Distribution</span>
                    </div>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-muted/20">
                      <div
                        className="bg-emerald-500 h-full"
                        style={{ width: `${(item.distribution.low / item.studentCount) * 100}%` }}
                      />
                      <div
                        className="bg-blue-500 h-full"
                        style={{
                          width: `${(item.distribution.medium / item.studentCount) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-amber-500 h-full"
                        style={{ width: `${(item.distribution.high / item.studentCount) * 100}%` }}
                      />
                      <div
                        className="bg-destructive h-full"
                        style={{
                          width: `${(item.distribution.critical / item.studentCount) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[8px] font-black uppercase tracking-tight text-muted-foreground/40">
                      <span className="text-emerald-600">L</span>
                      <span className="text-blue-600">M</span>
                      <span className="text-amber-600">H</span>
                      <span className="text-destructive">C</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
