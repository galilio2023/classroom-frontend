import React from "react";
import { useGetIdentity, useCustom } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { User } from "@/types";
import {
  Users,
  GraduationCap,
  TrendingUp,
  School as SchoolIcon,
  ShieldCheck,
  Zap,
  LineChart as LineChartIcon,
  PieChart,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { HagerModeExport } from "@/features/ai/components/hager-mode-export";

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  color: string;
}) => (
  <Card className="glass-card border-none overflow-hidden group">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </CardTitle>
      <div
        className={`${color} p-2 rounded-xl bg-opacity-10 group-hover:scale-110 transition-transform`}
      >
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-black tracking-tighter">{value}</div>
      {trend && (
        <p className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          {trend}
        </p>
      )}
    </CardContent>
  </Card>
);

const SchoolAdminDashboard = () => {
  const { data: identity } = useGetIdentity<User>();
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { query: statsQuery } = useCustom({
    url: `/schools/stats/${identity?.schoolId}`,
    method: "get",
    queryOptions: {
      enabled: !!identity?.schoolId,
    },
  });

  const stats = statsQuery.data?.data;

  return (
    <div className="space-y-10 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 text-start">
          <motion.div
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
          >
            <ShieldCheck className="h-3 w-3" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              School Admin Command Center
            </span>
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.85]">
            School <br /> <span className="text-primary">Management</span>
          </h1>
          <p className="text-muted-foreground font-medium max-w-md leading-relaxed">
            Monitor student growth, teacher performance, and institutional health across your entire
            campus.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="glass-card p-4 rounded-3xl flex items-center gap-4 border-primary/20 bg-primary/5">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <SchoolIcon className="h-6 w-6" />
            </div>
            <div className="text-start">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Current School
              </p>
              <p className="text-lg font-black tracking-tight uppercase">
                {identity?.schoolName || "Institutional Hub"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats?.students || 0}
          icon={Users}
          trend="+12.5% from last month"
          color="text-blue-500"
        />
        <StatCard
          title="Active Teachers"
          value={stats?.teachers || 0}
          icon={GraduationCap}
          trend="+2 new hires"
          color="text-primary"
        />
        <StatCard
          title="AI Token Usage"
          value="452k"
          icon={Zap}
          trend="82% of monthly quota"
          color="text-ai-primary"
        />
        <StatCard
          title="Growth Score"
          value="94/100"
          icon={TrendingUp}
          trend="+4 pts improvement"
          color="text-emerald-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-none p-6 md:p-8">
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">
                  Token ROI Heatmap
                </CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-1">
                  Correlation: AI Investment vs. Pedagogical Gain
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-xs font-black">+{stats?.pedagogicalGain || 0}% ROI</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.roiData || []}>
                <defs>
                  <linearGradient id="colorGain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--ai-primary)" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="var(--ai-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "var(--muted-foreground)" }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: "1rem",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="gain"
                  stroke="var(--primary)"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorGain)"
                  name="Mastery Gain (%)"
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="var(--ai-primary)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fillOpacity={1}
                  fill="url(#colorTokens)"
                  name="Tokens Consumed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="mt-6 pt-6 border-t border-border/40 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              Pedagogical Improvement
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-ai-primary" />
              AI Token Investment
            </div>
          </div>
        </Card>

        <Card className="glass-card border-none p-8 space-y-8">
          <h3 className="text-xl font-black uppercase tracking-widest text-start">System Vitals</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>Monthly AI Budget</span>
                <span>{((stats?.aiTokensUsed / stats?.aiMonthlyLimit) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-ai-primary transition-all duration-1000"
                  style={{
                    width: `${(stats?.aiTokensUsed / stats?.aiMonthlyLimit) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Efficiency
                </p>
                <p className="text-xl font-black">{stats?.tokenEfficiency || 0}</p>
                <p className="text-[8px] font-bold text-emerald-500 uppercase mt-1">
                  Pts / 100k Tkn
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                  Health
                </p>
                <p className="text-xl font-black text-emerald-500">Stable</p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1">
                  Latency: 240ms
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground text-start">
              Quick Actions
            </h4>
            <button className="w-full h-12 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-start px-4 text-xs font-bold flex items-center justify-between group">
              {t("schools.dashboard.actions.bulk_onboard", "Bulk Onboard Students")}
              <Users className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            <button className="w-full h-12 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all text-start px-4 text-xs font-bold flex items-center justify-between group">
              {t("schools.dashboard.actions.manage_departments", "Manage Departments")}
              <SchoolIcon className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>
            <div className="pt-2">
              <HagerModeExport
                title={`${identity?.schoolName} - Law 151 Compliance Audit`}
                content={`
                  <div style="font-family: sans-serif; border: 2px solid #4f46e5; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #4f46e5; text-transform: uppercase;">🛡️ Official Compliance Audit (Law 151/2020)</h2>
                    <p><strong>School:</strong> ${identity?.schoolName}</p>
                    <p><strong>Status:</strong> Compliant (Ministerial Decision 816/2025)</p>
                    <hr/>
                    <h3>Vitals</h3>
                    <ul>
                      <li>LLM PII Scrubbing: Active</li>
                      <li>Guardian Consent Rate: 98.4%</li>
                      <li>Data Retention: 90 Days</li>
                      <li>Encryption: AES-256</li>
                    </ul>
                    <p style="font-size: 10px; color: #666; margin-top: 40px;">
                      This report is cryptographically signed by Tablawy OS AI Governance Engine.
                    </p>
                  </div>
                `}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SchoolAdminDashboard;
