import React from "react";
import { useCustom } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

interface InstitutionalHealthProps {
  schoolId: string;
}

export const InstitutionalHealthCard: React.FC<InstitutionalHealthProps> = ({ schoolId }) => {
  const { query } = useCustom({
    url: `/schools/institutional-health/${schoolId}`,
    method: "get",
    queryOptions: {
      enabled: !!schoolId,
    },
  });

  const health = query.data?.data;
  const isLoading = query.isLoading;

  if (isLoading) {
    return (
      <Card className="glass-card animate-pulse border-none h-[400px]">
        <div className="p-8 space-y-4">
          <div className="h-6 w-32 bg-muted rounded-full" />
          <div className="h-4 w-48 bg-muted rounded-full" />
          <div className="h-24 w-full bg-muted rounded-2xl" />
        </div>
      </Card>
    );
  }

  const getStatusColor = (score: number) => {
    if (score >= 90) return "text-emerald-500";
    if (score >= 75) return "text-amber-500";
    return "text-red-500";
  };

  const getStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    if (score >= 75) return <Activity className="h-5 w-5 text-amber-500" />;
    return <AlertTriangle className="h-5 w-5 text-red-500" />;
  };

  return (
    <Card className="glass-card border-none overflow-hidden group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black uppercase tracking-tight">
              Institutional Health
            </CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Real-time System Vitals & SLO Tracking
            </CardDescription>
          </div>
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(health?.overallScore || 0)}
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                Overall Health
              </span>
            </div>
            <p className={`text-2xl font-black ${getStatusColor(health?.overallScore || 0)}`}>
              {health?.overallScore || 0}%
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                SLO Attainment
              </span>
            </div>
            <p className="text-2xl font-black text-primary">{health?.sloAttainment || 0}%</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Journey Reliability
          </h4>
          {health?.journeyStats?.map((stat: any) => (
            <div key={stat.journey} className="space-y-1">
              <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                <span className="truncate max-w-[150px]">{stat.journey.replace(/_/g, " ")}</span>
                <span
                  className={
                    stat.successRate < stat.target.successTarget
                      ? "text-red-500"
                      : "text-emerald-500"
                  }
                >
                  {(stat.successRate * 100).toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.successRate * 100}%` }}
                  className={`h-full ${stat.successRate < stat.target.successTarget ? "bg-red-500" : "bg-emerald-500"}`}
                />
              </div>
            </div>
          ))}
        </div>

        {health?.activeIncidents > 0 && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div className="text-start">
              <p className="text-xs font-black text-red-500 uppercase">Active Incidents</p>
              <p className="text-[10px] font-bold text-red-500/80 uppercase">
                {health?.activeIncidents} critical disruption(s) detected.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
