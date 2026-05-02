import { useApiUrl, useCustom } from "@refinedev/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, BarChart3, AlertCircle, Database, RefreshCw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";

interface AiMetricsResponse {
  ai: {
    avgLatencyMs: number;
    totalTokens: number;
    totalRequests: number;
    errorCount: number;
  };
  timeSeries: Array<{
    timestamp: string;
    tokens: number;
    requests: number;
    latency: number;
  }>;
  distribution: Array<{
    name: string;
    value: number;
    requests: number;
  }>;
  queues: Record<
    string,
    {
      waiting: number;
      active: number;
      failed: number;
      delayed?: number;
    }
  >;
  timestamp: string;
}

export default function AiMetricsPage() {
  const apiUrl = useApiUrl();

  const { query: metricsQuery } = useCustom<AiMetricsResponse>({
    url: `${apiUrl}/ai/metrics`,
    method: "get",
  });

  const { data: axiosResponse, isLoading, isRefetching, refetch } = metricsQuery;
  const metrics = axiosResponse?.data;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-12 w-12 animate-spin text-primary/20" />
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40 animate-pulse">
            Fetching Observability Stream...
          </p>
        </div>
      </div>
    );
  }

  const chartConfig = {
    tokens: {
      label: "Tokens",
      color: "hsl(var(--primary))",
    },
    requests: {
      label: "Requests",
      color: "hsl(var(--ai-primary))",
    },
    latency: {
      label: "Latency (ms)",
      color: "#f59e0b",
    },
  };

  const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ai-primary/10 rounded-xl">
              <Activity className="h-6 w-6 text-ai-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tight uppercase italic">
              AI Observability
            </h1>
          </div>
          <p className="text-muted-foreground font-medium">
            Real-time monitoring of token consumption, latency, and agent health.
          </p>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isRefetching}
          variant="outline"
          className="rounded-2xl h-12 px-6 font-bold uppercase tracking-widest"
        >
          {isRefetching ? (
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh Stream
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-card/50 backdrop-blur-sm group hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Avg Latency
            </CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{metrics?.ai?.avgLatencyMs}ms</div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter">
              Inference Response Time
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-card/50 backdrop-blur-sm group hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Token Burn
            </CardTitle>
            <Database className="h-4 w-4 text-ai-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {(metrics?.ai?.totalTokens || 0).toLocaleString()}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter">
              Total Tokens Consumed
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-[2.5rem] border-none shadow-xl bg-card/50 backdrop-blur-sm group hover:scale-[1.02] transition-transform">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              AI Requests
            </CardTitle>
            <Layers className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{metrics?.ai?.totalRequests || 0}</div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-tighter">
              Across all agents
            </p>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "rounded-[2.5rem] border-none shadow-xl transition-all duration-500",
            metrics?.ai?.errorCount && metrics.ai.errorCount > 0
              ? "bg-red-50/50 border-red-200"
              : "bg-card/50 backdrop-blur-sm"
          )}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Failures
            </CardTitle>
            <AlertCircle
              className={cn(
                "h-4 w-4",
                metrics?.ai?.errorCount && metrics.ai.errorCount > 0
                  ? "text-red-500"
                  : "text-green-500"
              )}
            />
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-3xl font-black",
                metrics?.ai?.errorCount && metrics.ai.errorCount > 0
                  ? "text-red-500"
                  : "text-muted-foreground"
              )}
            >
              {metrics?.ai?.errorCount}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div
                className={cn(
                  "h-2 w-2 rounded-full animate-pulse",
                  metrics?.ai?.errorCount && metrics.ai.errorCount > 0
                    ? "bg-red-600"
                    : "bg-green-600"
                )}
              />
              <p
                className={cn(
                  "text-[10px] font-bold uppercase tracking-tighter",
                  metrics?.ai?.errorCount && metrics.ai.errorCount > 0
                    ? "text-red-600"
                    : "text-green-600"
                )}
              >
                {metrics?.ai?.errorCount && metrics.ai.errorCount > 0
                  ? "Attention Required"
                  : "System Healthy"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Token Usage Time Series */}
        <Card className="lg:col-span-2 rounded-[3rem] border-none shadow-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-black uppercase italic tracking-tight">
              Token Consumption
            </CardTitle>
            <CardDescription className="font-medium">
              24-hour rolling window of AI inference volume.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[350px] w-full">
              <ChartContainer config={chartConfig}>
                <AreaChart data={metrics?.timeSeries || []}>
                  <defs>
                    <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-tokens)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-tokens)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={(val) => dayjs(val).format("HH:mm")}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: "bold", fill: "rgba(0,0,0,0.3)" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: "bold", fill: "rgba(0,0,0,0.3)" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="tokens"
                    stroke="var(--color-tokens)"
                    fillOpacity={1}
                    fill="url(#colorTokens)"
                    strokeWidth={4}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feature Distribution */}
        <Card className="rounded-[3rem] border-none shadow-2xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-black uppercase italic tracking-tight">
              Feature Load
            </CardTitle>
            <CardDescription className="font-medium">
              Token distribution across AI modules.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics?.distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {(metrics?.distribution || []).map((_, index) => (
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
            <div className="space-y-3 mt-4">
              {(metrics?.distribution || []).map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                      {entry.name}
                    </span>
                  </div>
                  <span className="text-xs font-black italic">
                    {((entry.value / (metrics?.ai?.totalTokens || 1)) * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="rounded-[3rem] border-none shadow-2xl bg-card/50 backdrop-blur-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase italic tracking-tight">Main Job Queue</h3>
              <p className="text-xs font-medium text-muted-foreground">
                Background generative tasks.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-2xl border border-border/20">
              <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                Waiting
              </div>
              <div className="text-xl font-black">
                {(metrics?.queues?.main?.waiting || 0) + (metrics?.queues?.main?.delayed || 0)}
              </div>
            </div>
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
              <div className="text-[10px] font-black uppercase text-primary mb-1">Active</div>
              <div className="text-xl font-black">{metrics?.queues?.main?.active || 0}</div>
            </div>
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
              <div className="text-[10px] font-black uppercase text-red-500 mb-1">Failed</div>
              <div className="text-xl font-black">{metrics?.queues?.main?.failed || 0}</div>
            </div>
          </div>
        </Card>

        <Card className="rounded-[3rem] border-none shadow-2xl bg-card/50 backdrop-blur-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-black uppercase italic tracking-tight">Outbox Worker</h3>
              <p className="text-xs font-medium text-muted-foreground">
                Notification & Sync dispatch.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-2xl border border-border/20">
              <div className="text-[10px] font-black uppercase text-muted-foreground mb-1">
                Waiting
              </div>
              <div className="text-xl font-black">
                {(metrics?.queues?.guardian?.waiting || 0) +
                  (metrics?.queues?.guardian?.delayed || 0)}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <div className="text-[10px] font-black uppercase text-blue-500 mb-1">Active</div>
              <div className="text-xl font-black">{metrics?.queues?.guardian?.active || 0}</div>
            </div>
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
              <div className="text-[10px] font-black uppercase text-red-500 mb-1">Failed</div>
              <div className="text-xl font-black">{metrics?.queues?.guardian?.failed || 0}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/30">
          System Observability Stream: {metrics?.timestamp}
        </p>
      </div>
    </div>
  );
}
