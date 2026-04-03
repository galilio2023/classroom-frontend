import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Database, Zap, Cpu, HardDrive, Loader2, RefreshCcw } from "lucide-react";
import { motion } from "framer-motion";
import { useCustom } from "@refinedev/core";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export const SystemVitalsCard = () => {
  const { query } = useCustom({
    url: "stats/observability/system",
    method: "get",
    config: {
      headers: {
        "Content-Type": "application/json",
      },
    },
    queryOptions: {
      refetchInterval: 30000, // Auto-refresh every 30s
    },
  });

  const { data, isLoading, isFetching, refetch } = query;

  const vitals = data?.data;

  if (isLoading && !vitals) {
    return (
      <Card className="h-full border-none shadow-none bg-muted/20 flex items-center justify-center min-h-[250px] rounded-3xl">
        <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
      </Card>
    );
  }

  const memoryPercent = vitals?.vitals?.memory
    ? Math.round((vitals.vitals.memory.rss / vitals.vitals.memory.totalMem) * 100)
    : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <Card className="h-full border-none shadow-xl bg-card/50 backdrop-blur-xl rounded-3xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4">
          <button
            onClick={() => refetch()}
            className={cn(
              "p-2 rounded-full hover:bg-primary/5 transition-all",
              isFetching && "animate-spin text-primary"
            )}
          >
            <RefreshCcw className="h-3 w-3 text-muted-foreground/40" />
          </button>
        </div>

        <CardHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Server className="h-4 w-4" />
            </div>
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              System Vitals
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-4 space-y-6">
          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full animate-pulse",
                    vitals?.database === "online"
                      ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                      : "bg-red-500"
                  )}
                />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Database
              </p>
              <p className="text-xs font-bold uppercase">{vitals?.database || "Unknown"}</p>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/40 space-y-2">
              <div className="flex items-center justify-between">
                <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full animate-pulse",
                    vitals?.redis === "online"
                      ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                      : "bg-red-500"
                  )}
                />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                Redis
              </p>
              <p className="text-xs font-bold uppercase">{vitals?.redis || "Unknown"}</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                  <Cpu className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    CPU Load
                  </span>
                </div>
                <span className="text-xs font-bold">
                  {(vitals?.vitals?.cpuLoad || 0).toFixed(2)}%
                </span>
              </div>
              <Progress
                value={Math.min((vitals?.vitals?.cpuLoad || 0) * 10, 100)}
                className="h-1.5 bg-primary/5"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-3 w-3 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    RAM Usage
                  </span>
                </div>
                <span className="text-xs font-bold">{vitals?.vitals?.memory?.rss || 0} MB</span>
              </div>
              <Progress value={memoryPercent} className="h-1.5 bg-primary/5" />
              <p className="text-[9px] text-muted-foreground/60 text-right font-medium">
                {memoryPercent}% of heap allocated
              </p>
            </div>
          </div>

          {/* Version Info */}
          <div className="pt-2 border-t border-border/40 flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
              Runtime
            </span>
            <span className="text-[9px] font-bold text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-md">
              Node {vitals?.nodeVersion || "---"}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
