import React, { useState, useEffect } from "react";
import { useApiUrl, useCustom } from "@refinedev/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BrainCircuit,
  Users,
  TrendingUp,
  AlertCircle,
  BarChart3,
  ShieldAlert,
  ChevronRight,
  Search,
  BookOpen,
  Loader2,
  WifiOff,
} from "lucide-react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  Pie,
  PieChart,
  CartesianGrid,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { handleError } from "@/providers/utils/api-errors";

interface RegistrarSummary {
  standings: Array<{ standing: string; count: number }>;
  gpaDistribution: Array<{ range: string; count: number }>;
  departments: Array<{ id: string; name: string; studentCount: number }>;
}

export default function RegistrarDashboardPage() {
  const { t } = useTranslation();
  const apiUrl = useApiUrl();

  const { query } = useCustom<RegistrarSummary>({
    url: `${apiUrl}/reports/registrar/summary`,
    method: "get",
  });

  const data = query.data?.data;
  const isLoading = query.isLoading;
  const isError = query.isError;
  const isPaused = query.isPaused;
  const error = query.error;

  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    correlationId?: string;
  } | null>(null);

  useEffect(() => {
    if (isError && error) {
      void handleError(error).then((handled) => {
        setErrorDetails({
          message: handled.message,
          correlationId: handled.meta?.correlationId,
        });
      });
    }
  }, [isError, error]);

  // 🎨 HUB RULE 7: Analysis features use BrainCircuit and institutional themes.
  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ];

  const chartConfig = {
    count: {
      label: "Students",
      color: "hsl(var(--primary))",
    },
  };

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-6">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-ai-primary/20" />
          <BrainCircuit className="h-6 w-6 text-ai-primary absolute inset-0 m-auto" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="font-black uppercase tracking-[0.3em] text-xs text-ai-primary animate-pulse">
            Analyzing Academic Data
          </p>
          <div className="h-1 w-32 bg-ai-primary/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-ai-primary"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col h-96 items-center justify-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive/50" />
        <div className="text-center">
          <h3 className="font-black uppercase tracking-tighter text-xl">Data Sync Failed</h3>
          <p className="text-muted-foreground font-medium">
            {errorDetails?.message || "Unable to load registrar analytics."}
          </p>
          {errorDetails?.correlationId && (
            <p className="text-[10px] font-mono text-muted-foreground/40 mt-2">
              Support ID: {errorDetails.correlationId}
            </p>
          )}
        </div>
        <Button variant="outline" onClick={() => query.refetch()} className="rounded-2xl font-bold">
          Retry Sync
        </Button>
      </div>
    );
  }

  const hasStandings = data?.standings && data.standings.length > 0;
  const hasGpaData = data?.gpaDistribution && data.gpaDistribution.length > 0;
  const hasDeptData = data?.departments && data.departments.length > 0;

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter uppercase flex items-center gap-3">
            <BrainCircuit className="h-8 w-8 text-primary" />
            Registrar Overview
            {isPaused && (
              <Badge variant="destructive" className="ml-2 animate-pulse gap-1 rounded-full">
                <WifiOff className="h-3 w-3" /> Offline
              </Badge>
            )}
          </h1>
          <p className="text-muted-foreground font-medium">
            Institutional academic standing and GPA distribution analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-border/40 font-black uppercase text-[10px] tracking-widest h-12"
          >
            Export Transcript Log
          </Button>
          <Button className="rounded-2xl bg-black text-white font-black uppercase text-[10px] tracking-widest h-12 px-8">
            Generate Term Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {hasStandings ? (
          data?.standings.map((s, i) => (
            <Card
              key={s.standing}
              className="rounded-3xl border-border/40 shadow-sm overflow-hidden group hover:shadow-xl transition-all duration-500"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {s.standing} Standing
                </CardTitle>
                <div
                  className="h-2 w-2 rounded-full animate-pulse"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black">{s.count}</div>
                <p className="text-[10px] font-bold text-muted-foreground/60 mt-1 uppercase">
                  Students Enrolled
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-4 p-12 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-muted-foreground/40">
            <Users className="h-12 w-12 mb-4" />
            <p className="font-black uppercase tracking-widest text-xs">No Student Data Found</p>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* GPA Bell Curve */}
        <Card className="md:col-span-2 rounded-[2.5rem] border-border/40 shadow-2xl p-8">
          <CardHeader className="px-0 pt-0 pb-8">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-primary" />
              GPA Distribution (Bell Curve)
            </CardTitle>
            <CardDescription className="font-medium italic">
              Student density across 4.0 academic scale.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            {hasGpaData ? (
              <div className="h-[350px] w-full">
                <ChartContainer config={chartConfig}>
                  <BarChart data={data?.gpaDistribution || []}>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      stroke="rgba(0,0,0,0.05)"
                    />
                    <XAxis
                      dataKey="range"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 900, fill: "rgba(0,0,0,0.4)" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 900, fill: "rgba(0,0,0,0.4)" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="var(--color-count)">
                      {(data?.gpaDistribution || []).map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.count > 10 ? "hsl(var(--primary))" : "rgba(0,0,0,0.1)"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[350px] w-full flex flex-col items-center justify-center text-muted-foreground/20">
                <BarChart3 className="h-16 w-16 mb-4" />
                <p className="font-black uppercase tracking-[0.2em] text-[10px]">
                  Waiting for GPA Data
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Standing Split */}
        <Card className="rounded-[2.5rem] border-border/40 shadow-2xl p-8">
          <CardHeader className="px-0 pt-0 pb-8">
            <CardTitle className="text-xl font-black uppercase tracking-tight">
              Standing Mix
            </CardTitle>
            <CardDescription className="font-medium italic">
              Relative split of institutional standings.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 flex flex-col items-center">
            {hasStandings ? (
              <>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.standings || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={90}
                        paddingAngle={8}
                        dataKey="count"
                        nameKey="standing"
                      >
                        {(data?.standings || []).map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke="none"
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-3 mt-8">
                  {data?.standings.map((s, i) => (
                    <div key={s.standing} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                          {s.standing}
                        </span>
                      </div>
                      <span className="text-xs font-black">{s.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground/20">
                <BarChart3 className="h-16 w-16 mb-4 rotate-90" />
                <p className="font-black uppercase tracking-[0.2em] text-[10px]">Mix Empty</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <div className="space-y-6 pt-10">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary/40" />
            Departmental Performance Sync
          </h3>
          <Badge
            variant="outline"
            className="rounded-full font-bold text-[10px] uppercase border-border/60"
          >
            Live Stream Active
          </Badge>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {hasDeptData ? (
            data?.departments.map((dept) => (
              <Card
                key={dept.id}
                className="rounded-3xl border-border/40 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden relative group"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
                  <Users className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-tight">
                    {dept.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-end gap-3">
                    <span className="text-3xl font-black">{dept.studentCount}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2">
                      Total Students
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-10 rounded-xl bg-muted/30 font-black uppercase text-[8px] tracking-[0.2em] group-hover:bg-primary group-hover:text-white transition-all"
                  >
                    View Dept Roster <ChevronRight className="ms-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 p-20 border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center text-muted-foreground/30">
              <ShieldAlert className="h-16 w-16 mb-4" />
              <p className="font-black uppercase tracking-[0.3em] text-[10px]">
                No Departments Registered
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
