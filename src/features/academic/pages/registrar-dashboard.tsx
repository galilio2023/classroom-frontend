import React, { useState, useEffect } from "react";
import { useApiUrl, useCustom } from "@refinedev/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BrainCircuit,
  Users,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
  BookOpen,
  Loader2,
  WifiOff,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { handleError } from "@/providers/utils/api-errors";
import { RegistrarGPAChart } from "../components/RegistrarGPAChart";
import { RegistrarStandingMix } from "../components/RegistrarStandingMix";

interface RegistrarSummary {
  standings: Array<{ standing: string; count: number }>;
  gpaDistribution: Array<{ range: string; count: number }>;
  departments: Array<{ id: string; name: string; studentCount: number }>;
}

// 🎨 HUB RULE 7: Analysis features use ai-primary colors and institutional themes.
const COLORS = [
  "hsl(var(--ai-primary))",
  "hsl(var(--ai-primary) / 0.7)",
  "hsl(var(--ai-primary) / 0.5)",
  "hsl(var(--ai-primary) / 0.3)",
  "hsl(var(--ai-primary) / 0.1)",
];

export default function RegistrarDashboardPage() {
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
  const isFetching = query.isFetching; // 🚀 Rule 4: Background refresh indicator

  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    correlationId?: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (isError && error) {
      void handleError(error).then((handled) => {
        if (isMounted) {
          setErrorDetails({
            message: handled.message,
            correlationId: handled.meta?.correlationId,
          });
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isError, error]);

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

  const hasDeptData = data?.departments && data.departments.length > 0;

  return (
    <div className="p-8 space-y-10 max-w-7xl mx-auto relative">
      {/* 🚀 Background Fetching Indicator */}
      {isFetching && !isLoading && (
        <div className="absolute top-0 left-0 w-full h-1 z-50 overflow-hidden rounded-full bg-ai-primary/5">
          <motion.div
            className="h-full bg-ai-primary"
            initial={{ width: "0%", x: "-100%" }}
            animate={{ width: "30%", x: "400%" }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </div>
      )}

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
        {data?.standings && data.standings.length > 0 ? (
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
        <RegistrarGPAChart data={data?.gpaDistribution || []} />
        <RegistrarStandingMix data={data?.standings || []} />
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
