import React from "react";
import { useCustom, useCustomMutation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import {
  ShieldCheck,
  Users,
  Award,
  AlertCircle,
  LayoutGrid,
  TrendingUp,
  Bell,
  Zap,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useCapabilities } from "@/hooks/use-capabilities";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CorporateDashboardData {
  metrics: {
    activePrograms: number;
    complianceRate: string;
    certificatesIssued: number;
    overdueCount: number;
  };
  overdueEmployees: Array<{
    id: string;
    name: string;
    programName: string;
    daysOverdue: number;
  }>;
}

const CorporateDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { isCorporateSuite } = useCapabilities();

  const { query } = useCustom<CorporateDashboardData>({
    url: `${import.meta.env.VITE_API_URL}/suite/home`,
    method: "get",
  });

  const { data: queryData, isLoading, isError, refetch } = query;

  const { mutate: triggerNudge, mutation: triggerNudgeMutation } = useCustomMutation();
  const isNudging = triggerNudgeMutation.isPending;

  const handleNudge = (employee: any) => {
    triggerNudge(
      {
        url: `${import.meta.env.VITE_API_URL}/ai/intervention`,
        method: "post",
        values: {
          studentId: employee.id,
          classId: employee.programId,
          reason: "overdue_training",
        },
      },
      {
        onSuccess: () => {
          toast.success(`Compliance reminder dispatched to ${employee.name}.`);
        },
      }
    );
  };

  const data = queryData?.data;
  const metrics = data?.metrics || {
    activePrograms: 0,
    complianceRate: "0%",
    certificatesIssued: 0,
    overdueCount: 0,
  };
  const overdueEmployees = data?.overdueEmployees || [];

  const MetricCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="rounded-[2rem] border-border/40 shadow-xl overflow-hidden group relative bg-card/50 backdrop-blur-xl">
      <div className={cn("absolute top-0 start-0 w-1 h-full", color)} />
      <CardContent className="p-8">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
              {title}
            </p>
            <h3 className="text-4xl font-black tracking-tighter">{value}</h3>
          </div>
          <div
            className={cn(
              "p-4 rounded-2xl bg-muted/30 group-hover:scale-110 transition-transform duration-500",
              color.replace("bg-", "text-")
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 md:p-10 space-y-12 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="p-4 rounded-3xl bg-emerald-500/10 text-emerald-500 shadow-sm border border-emerald-500/5">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <div className="text-start">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic leading-none">
              Corporate Command
            </h1>
            <p className="text-muted-foreground font-medium mt-1.5 uppercase tracking-widest text-[10px]">
              Strategic Compliance & Workforce Growth
            </p>
          </div>
        </div>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[9px] gap-2 border-border/60"
        >
          <TrendingUp className="h-4 w-4" />
          Real-time Sync
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <MetricCard
          title="Active Programs"
          value={isLoading ? <Skeleton className="h-10 w-12" /> : metrics.activePrograms}
          icon={LayoutGrid}
          color="bg-blue-500"
        />
        <MetricCard
          title="Org Compliance"
          value={isLoading ? <Skeleton className="h-10 w-24" /> : metrics.complianceRate}
          icon={ShieldCheck}
          color="bg-emerald-500"
        />
        <MetricCard
          title="Certificates Issued"
          value={isLoading ? <Skeleton className="h-10 w-12" /> : metrics.certificatesIssued}
          icon={Award}
          color="bg-purple-500"
        />
        <MetricCard
          title="Overdue Employees"
          value={isLoading ? <Skeleton className="h-10 w-12" /> : metrics.overdueCount}
          icon={AlertCircle}
          color="bg-destructive"
        />
      </div>

      {/* Overdue Employees Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 rounded-xl bg-destructive/10 text-destructive">
            <Bell className="h-4 w-4" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-tight italic">
            Compliance Red Zone
          </h2>
          <Badge className="bg-destructive/10 text-destructive border-none font-black text-[10px] rounded-full px-3">
            Attention Required
          </Badge>
        </div>

        <Card className="rounded-[2.5rem] border-border/40 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-3xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                    Employee
                  </TableHead>
                  <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                    Active Program
                  </TableHead>
                  <TableHead className="py-6 px-8 font-black uppercase tracking-widest text-[10px]">
                    Compliance Delay
                  </TableHead>
                  <TableHead className="py-6 px-8 text-right font-black uppercase tracking-widest text-[10px]">
                    Intervention
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i} className="border-border/20">
                      <TableCell className="py-6 px-8">
                        <Skeleton className="h-10 w-40" />
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <Skeleton className="h-8 w-48" />
                      </TableCell>
                      <TableCell className="py-6 px-8">
                        <Skeleton className="h-8 w-24" />
                      </TableCell>
                      <TableCell className="py-6 px-8 text-right">
                        <Skeleton className="h-10 w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : overdueEmployees.length > 0 ? (
                  <AnimatePresence mode="popLayout">
                    {overdueEmployees.map((emp: any, idx: number) => (
                      <motion.tr
                        key={emp.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-border/20 group hover:bg-muted/20 transition-colors"
                      >
                        <TableCell className="py-6 px-8 text-start">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black uppercase shadow-sm">
                              {emp.name.slice(0, 2)}
                            </div>
                            <span className="font-black text-sm uppercase tracking-tight">
                              {emp.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-start font-bold text-xs text-muted-foreground uppercase">
                          {emp.programName}
                        </TableCell>
                        <TableCell className="py-6 px-8 text-start">
                          <Badge
                            variant="outline"
                            className="rounded-full px-4 py-1 border-destructive/20 text-destructive font-black text-[10px] gap-2 uppercase tracking-tighter"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                            {emp.daysOverdue} Days Overdue
                          </Badge>
                        </TableCell>
                        <TableCell className="py-6 px-8 text-right">
                          <Button
                            onClick={() => handleNudge(emp)}
                            disabled={isNudging}
                            size="sm"
                            className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[9px] gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95"
                          >
                            <Zap className="h-3 w-3 fill-current" />
                            Nudge Employee
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="py-20 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="p-6 rounded-full bg-emerald-500/10 text-emerald-500">
                          <ShieldCheck className="h-12 w-12" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-xl font-black uppercase italic text-emerald-700">
                            Workforce Fully Compliant
                          </h3>
                          <p className="text-sm text-muted-foreground font-medium">
                            No training delays detected in current programs.
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Strategic Footer */}
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="rounded-[2rem] border-none bg-primary text-primary-foreground p-8 relative overflow-hidden group shadow-2xl shadow-primary/20">
          <div className="absolute top-0 end-0 p-8 opacity-10 rotate-12 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-32 h-32" />
          </div>
          <div className="relative space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tighter leading-none italic">
              Program Insights
            </h3>
            <p className="text-xs text-primary-foreground/70 font-medium leading-relaxed">
              AI-driven analysis of workforce growth and skill acquisition trends.
            </p>
            <Button
              variant="secondary"
              className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[9px] gap-2 bg-white text-primary hover:bg-white/90"
            >
              View Insights
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </Card>

        <div className="md:col-span-2 glass-card rounded-[2rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-8 border border-border/40">
          <div className="space-y-4 text-start">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight italic">
                Compliance Guard
              </h3>
            </div>
            <p className="text-sm text-muted-foreground font-medium max-w-md leading-relaxed">
              Automated monitoring system ensuring every employee stays within regulatory training
              thresholds.
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] gap-3 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5 hover:text-emerald-700 transition-all shrink-0"
          >
            Export Audit Logs
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CorporateDashboard;
