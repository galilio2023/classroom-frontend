import { useApiUrl, useCustom } from "@refinedev/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, BarChart3, AlertCircle, Clock, Database, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface AiMetricsResponse {
  data: {
    data: Record<string, unknown>;
  };
}

export default function AiMetricsPage() {
  const { t } = useTranslation();
  const apiUrl = useApiUrl();

  const { query: metricsQuery } = useCustom<AiMetricsResponse>({
    url: `${apiUrl}/ai/metrics`,
    method: "get",
  });

  const { data, isLoading, isRefetching, refetch } = metricsQuery;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const metrics = data?.data?.data as any;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("resources.ai-metrics.label", { defaultValue: "AI Observability" })}
          </h1>
          <p className="text-muted-foreground">
            Real-time observability for Gemini API and BullMQ background workers.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2"
        >
          <RefreshCw className={isRefetching ? "animate-spin h-4 w-4" : "h-4 w-4"} />
          {t("buttons.refresh")}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-ai-primary/20 bg-ai-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg AI Latency</CardTitle>
            <Clock className="h-4 w-4 text-ai-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.ai?.avgLatencyMs}ms</div>
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AI Tokens</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.ai?.totalTokens.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Consumption (24h)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total AI Requests</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.ai?.totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">API calls (24h)</p>
          </CardContent>
        </Card>
        <Card
          className={metrics?.ai?.errorCount > 0 ? "border-destructive/20 bg-destructive/5" : ""}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Errors</CardTitle>
            <AlertCircle
              className={
                metrics?.ai?.errorCount > 0
                  ? "h-4 w-4 text-destructive"
                  : "h-4 w-4 text-muted-foreground"
              }
            />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.ai?.errorCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Worker failures (24h)</p>
          </CardContent>
        </Card>
      </div>

      {/* Queue Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Main Task Queue
            </CardTitle>
            <CardDescription>
              Document processing, AI grading, and system maintenance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Waiting / Delayed</span>
                <Badge variant="outline">
                  {metrics?.queues?.main?.waiting + metrics?.queues?.main?.delayed}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active</span>
                <Badge className="bg-success">{metrics?.queues?.main?.active}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-destructive font-bold">Failed</span>
                <Badge variant="destructive">{metrics?.queues?.main?.failed}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-ai-primary" />
              Guardian Angel Queue
            </CardTitle>
            <CardDescription>
              Real-time student risk analysis and behavior modeling.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Waiting / Delayed</span>
                <Badge variant="outline">
                  {metrics?.queues?.guardian?.waiting + metrics?.queues?.guardian?.delayed}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active</span>
                <Badge className="bg-success">{metrics?.queues?.guardian?.active}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-destructive font-bold">Failed</span>
                <Badge variant="destructive">{metrics?.queues?.guardian?.failed}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-[10px] text-muted-foreground font-mono uppercase tracking-widest pt-4">
        Last metrics sync: {metrics?.timestamp}
      </div>
    </div>
  );
}
