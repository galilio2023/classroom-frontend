import { useApiUrl, useCustom, useCustomMutation } from "@refinedev/core";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertCircle,
  LayoutGrid,
  ClipboardList,
} from "lucide-react";
import usePageTitle from "@/hooks/use-page-title";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AuditSummary {
  reasoningCluster: string;
  count: number;
  avgGrade: number;
  promptVersion: number;
}

interface AuditDetail {
  id: string;
  suggestedGrade: number;
  suggestedFeedback: string;
  submission: {
    id: string;
    student: { name: string; image?: string };
    assignment: { title: string };
  };
}

export default function AiAuditBoard() {
  const apiUrl = useApiUrl();
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  // 1. Fetch Audit Summary (Clusters)
  const { query: summaryQuery } = useCustom<AuditSummary[]>({
    url: `${apiUrl}/ai-audits/summary`,
    method: "get",
  });

  const summaryData = summaryQuery.data?.data;
  const isSummaryLoading = summaryQuery.isLoading;
  const refetchSummary = summaryQuery.refetch;

  // 2. Fetch Detailed Audits for Selected Cluster
  const { query: clusterQuery } = useCustom<AuditDetail[]>({
    url: `${apiUrl}/ai-audits/cluster`,
    method: "get",
    config: {
      query: { prefix: selectedCluster },
    },
    queryOptions: {
      enabled: !!selectedCluster,
    },
  });

  const clusterData = clusterQuery.data?.data;
  const isClusterLoading = clusterQuery.isLoading;

  const { mutate: verifyCluster, mutation: verifyMutation } = useCustomMutation();

  const handleVerify = (_: string, isCorrect: boolean) => {
    const details = clusterData || [];
    if (details.length === 0) return;

    verifyCluster(
      {
        url: `${apiUrl}/ai-audits/verify`,
        method: "post",
        values: {
          auditIds: details.map((d: AuditDetail) => d.id),
          isCorrect,
          feedback: isCorrect ? "Verified by teacher" : "Flagged for refinement",
        },
      },
      {
        onSuccess: () => {
          refetchSummary();
          setSelectedCluster(null);
        },
      }
    );
  };

  usePageTitle("AI Grading Audit Board");

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-ai-primary/10 rounded-xl">
            <BrainCircuit className="h-6 w-6 text-ai-primary" />
          </div>
          <h1 className="text-4xl font-black tracking-tight uppercase italic">Audit Board</h1>
        </div>
        <p className="text-muted-foreground font-medium">
          Review and verify AI grading logic clusters to evolve the institutional brain.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
        {/* Left: Clusters */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground px-1">
            <LayoutGrid className="h-4 w-4" />
            Logic Clusters
          </div>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-3">
              {isSummaryLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-3xl" />
                ))
              ) : summaryData?.length === 0 ? (
                <div className="p-8 text-center bg-card rounded-[2rem] border-2 border-dashed border-border/50">
                  <ClipboardList className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-bold text-muted-foreground">All clusters verified!</p>
                </div>
              ) : (
                summaryData?.map((cluster) => (
                  <button
                    key={cluster.reasoningCluster}
                    onClick={() => setSelectedCluster(cluster.reasoningCluster)}
                    className={cn(
                      "w-full text-left p-6 rounded-[2rem] border-2 transition-all duration-300 group relative overflow-hidden",
                      selectedCluster === cluster.reasoningCluster
                        ? "bg-primary border-primary text-primary-foreground shadow-2xl shadow-primary/20 scale-[1.02]"
                        : "bg-card border-border/40 hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <div className="flex flex-col gap-3 relative z-10">
                      <div className="flex items-start justify-between gap-2">
                        <Badge
                          variant={
                            selectedCluster === cluster.reasoningCluster ? "secondary" : "outline"
                          }
                          className="font-black uppercase tracking-tighter italic"
                        >
                          v{cluster.promptVersion}
                        </Badge>
                        <div className="text-2xl font-black italic tracking-tighter">
                          {cluster.count}
                        </div>
                      </div>
                      <p
                        className={cn(
                          "text-sm font-medium line-clamp-2 leading-relaxed",
                          selectedCluster === cluster.reasoningCluster
                            ? "text-primary-foreground/90"
                            : "text-muted-foreground"
                        )}
                      >
                        "{cluster.reasoningCluster}..."
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 flex-1 bg-current/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-current transition-all"
                            style={{ width: `${cluster.avgGrade}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black uppercase italic">
                          Avg: {Math.round(cluster.avgGrade)}%
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right: Cluster Details & Action */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          {!selectedCluster ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-card/30 rounded-[3rem] border-2 border-dashed border-border/40 text-center p-12">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <BrainCircuit className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight mb-2">
                Select a Cluster
              </h2>
              <p className="text-muted-foreground max-w-sm font-medium">
                Choose a reasoning pattern from the left to review specific student submissions and
                verify the logic.
              </p>
            </div>
          ) : (
            <>
              <Card className="rounded-[3rem] border-none shadow-2xl bg-card/50 backdrop-blur-sm flex-1 flex flex-col overflow-hidden">
                <CardHeader className="p-8 border-b border-border/40 shrink-0">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-black uppercase italic tracking-tight">
                        Logic Verification
                      </CardTitle>
                      <CardDescription className="font-medium">
                        Reviewing {clusterData?.length || 0} samples for this reasoning pattern.
                      </CardDescription>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        size="lg"
                        className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20"
                        onClick={() => handleVerify(selectedCluster, true)}
                        disabled={verifyMutation.isPending || isClusterLoading}
                      >
                        {verifyMutation.isPending ? (
                          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                        )}
                        Approve Logic
                      </Button>
                      <Button
                        size="lg"
                        variant="destructive"
                        className="rounded-2xl h-14 px-8 font-black uppercase tracking-widest shadow-xl shadow-red-500/20"
                        onClick={() => handleVerify(selectedCluster, false)}
                        disabled={verifyMutation.isPending || isClusterLoading}
                      >
                        {verifyMutation.isPending ? (
                          <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                          <XCircle className="mr-2 h-5 w-5" />
                        )}
                        Flag Issues
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-8 space-y-4">
                      {isClusterLoading
                        ? Array.from({ length: 3 }).map((_, i) => (
                            <div
                              key={i}
                              className="h-32 w-full bg-muted animate-pulse rounded-3xl"
                            />
                          ))
                        : clusterData?.map((audit) => (
                            <div
                              key={audit.id}
                              className="p-6 rounded-3xl border border-border/40 bg-card hover:border-primary/30 transition-all group"
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  <div className="h-12 w-12 rounded-2xl bg-muted overflow-hidden">
                                    {audit.submission.student.image && (
                                      <img
                                        src={audit.submission.student.image}
                                        alt=""
                                        className="h-full w-full object-cover"
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-black uppercase tracking-tight italic">
                                      {audit.submission.student.name}
                                    </div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                      {audit.submission.assignment.title}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-3xl font-black italic tracking-tighter text-primary">
                                  {audit.suggestedGrade}%
                                </div>
                              </div>
                              <div className="p-4 bg-muted/30 rounded-2xl border border-border/20 text-sm font-medium leading-relaxed italic">
                                "{audit.suggestedFeedback}"
                              </div>
                            </div>
                          ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <div className="p-6 bg-ai-primary/5 rounded-[2.5rem] border-2 border-dashed border-ai-primary/20 flex items-center gap-4">
                <div className="h-12 w-12 bg-ai-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertCircle className="h-6 w-6 text-ai-primary" />
                </div>
                <p className="text-xs font-bold leading-relaxed text-muted-foreground/80 italic">
                  🛡️{" "}
                  <span className="text-ai-primary uppercase tracking-tighter">
                    Human-in-the-Loop:
                  </span>{" "}
                  Approving this logic will mark these audits as "Verified" and inform the Janitor
                  Agent that this prompt pattern is successful. Flagging will trigger a prompt
                  evolution cycle.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
