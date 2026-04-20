import { useGetIdentity, useCustomMutation, useCustom, useList } from "@refinedev/core";
import { User, UserRole, Enrollment } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CircleDollarSign,
  Wand2,
  CheckCircle2,
  AlertCircle,
  // //   ArrowRight,
  Loader2,
  Trophy,
  Landmark,
  TrendingUp,
  ShoppingBag,
  Wallet,
  Clock,
  ExternalLink,
  ChevronRight,
  Eye,
  MousePointer2,
  Percent,
  BarChart3,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {} from "framer-motion";
import { toast } from "sonner";
import { useMemo } from "react";
import {} from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import {} from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export default function MonetizationSettings() {
  const { t } = useTranslation();
  const { data: identity, isLoading: userLoading } = useGetIdentity<User>();
  const user = identity;

  const isConnected = user?.stripeOnboardingComplete;

  const { mutate: getOnboardingLink, isLoading: linkLoading } = useCustomMutation() as any;

  // --- REAL-TIME DATA ---
  const { data: balanceData, isLoading: balanceLoading } = useCustom({
    url: "marketplace/balance",
    method: "get",
    queryOptions: { enabled: !!isConnected },
  }) as any;

  const { query: transactionsQuery } = useList<Enrollment>({
    resource: "enrollments",
    filters: [{ field: "paymentStatus", operator: "eq", value: "paid" }],
    sorters: [{ field: "updatedAt", order: "desc" }],
    queryOptions: { enabled: !!isConnected },
    meta: {
      populate: ["student", "class"],
    },
  });

  const transactionsData = transactionsQuery.data;
  const transactionsLoading = transactionsQuery.isLoading;

  const { data: marketplaceStats, isLoading: statsLoading } = useCustom({
    url: "stats/teacher/marketplace",
    method: "get",
    queryOptions: { enabled: !!isConnected },
  }) as any;

  const stripeBalance = balanceData?.data?.balance;
  const availableBalance = stripeBalance?.available?.[0]?.amount || 0;
  const _pendingBalancee = stripeBalance?.pending?.[0]?.amount || 0;
  const currency = stripeBalance?.available?.[0]?.currency || "USD";

  const trendData = useMemo(() => marketplaceStats?.data?.trend || [], [marketplaceStats]);

  const formatPrice = (amount: number, cur: string = "USD") => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur.toUpperCase(),
    }).format(amount / 100);
  };

  const handleConnectStripe = () => {
    getOnboardingLink(
      {
        url: "marketplace/onboarding-link",
        method: "post",
        values: {},
      },
      {
        onSuccess: (data: any) => {
          if (data?.data?.url) {
            window.location.href = data.data.url;
          }
        },
        onError: () => {
          toast.error(
            t("settings.monetization.error", { defaultValue: "Failed to start Stripe onboarding." })
          );
        },
      }
    );
  };

  if (userLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  const isTeacher = user?.role === UserRole.TEACHER || user?.role === UserRole.ADMIN;

  if (!isTeacher) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px] text-center">
        <div className="max-w-md space-y-4">
          <div className="p-4 rounded-full bg-muted w-fit mx-auto">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-black">
            {t("settings.monetization.notTeacherTitle", { defaultValue: "Not Available" })}
          </h2>
          <p className="text-muted-foreground">
            {t("settings.monetization.notTeacherDesc", {
              defaultValue: "Only teachers can set up monetization for their classes.",
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 text-start">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-3">
            <CircleDollarSign className="h-10 w-10 text-primary" />
            {t("settings.monetization.title", { defaultValue: "Sales Dashboard" })}
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            {t("settings.monetization.subtitle", {
              defaultValue: "Monitor your classroom performance and revenue growth.",
            })}
          </p>
        </div>

        {isConnected && (
          <div className="flex gap-4">
            <Card className="bg-success/5 border-success/20 px-6 py-3 rounded-2xl flex flex-col items-end shadow-sm">
              <span className="text-[10px] font-bold text-success/60 uppercase tracking-widest">
                {t("settings.monetization.availableToPayout", {
                  defaultValue: "Available to Payout",
                })}
              </span>
              <span className="text-xl font-black text-success">
                {balanceLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mt-1" />
                ) : (
                  formatPrice(availableBalance, currency)
                )}
              </span>
            </Card>
          </div>
        )}
      </div>

      {!isConnected ? (
        <Card className="rounded-[3rem] border-none shadow-2xl bg-primary/5 p-12 text-center space-y-8">
          <div className="p-6 rounded-full bg-primary/10 text-primary w-fit mx-auto">
            <Wand2 className="h-16 w-16" />
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-4xl font-black tracking-tight">
              {t("settings.monetization.unlockTitle", { defaultValue: "Unlock Your Earnings" })}
            </h2>
            <p className="text-lg text-muted-foreground font-medium">
              {t("settings.monetization.unlockDesc", {
                defaultValue:
                  "Start monetizing your knowledge. Connect your Stripe account to list paid classes on the marketplace and receive automatic payouts.",
              })}
            </p>
          </div>
          <Button
            size="lg"
            className="h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
            onClick={handleConnectStripe}
            disabled={linkLoading}
          >
            {linkLoading ? (
              <Loader2 className="h-5 w-5 animate-spin me-3" />
            ) : (
              <Landmark className="h-5 w-5 me-3" />
            )}
            {t("settings.monetization.connectStripe", { defaultValue: "Connect Stripe Account" })}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Analytics Area */}
          <div className="lg:col-span-8 space-y-8">
            {/* Core Funnel Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="rounded-3xl border-none shadow-lg bg-card/50 backdrop-blur-xl group hover:scale-[1.02] transition-transform">
                <CardContent className="p-6 text-start">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500 w-fit mb-3">
                    <Eye className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t("settings.monetization.totalViews", { defaultValue: "Total Views" })}
                  </p>
                  <p className="text-2xl font-black">{marketplaceStats?.data?.totalViews || 0}</p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-none shadow-lg bg-card/50 backdrop-blur-xl group hover:scale-[1.02] transition-transform">
                <CardContent className="p-6 text-start">
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 w-fit mb-3">
                    <MousePointer2 className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t("settings.monetization.previewClicks", { defaultValue: "Preview Clicks" })}
                  </p>
                  <p className="text-2xl font-black">
                    {marketplaceStats?.data?.totalPreviewClicks || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-none shadow-lg bg-card/50 backdrop-blur-xl group hover:scale-[1.02] transition-transform">
                <CardContent className="p-6 text-start">
                  <div className="p-2 rounded-xl bg-green-500/10 text-green-500 w-fit mb-3">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t("settings.monetization.enrollments", { defaultValue: "Enrollments" })}
                  </p>
                  <p className="text-2xl font-black">
                    {marketplaceStats?.data?.totalEnrollments || 0}
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-none shadow-lg bg-card/50 backdrop-blur-xl group hover:scale-[1.02] transition-transform">
                <CardContent className="p-6 text-start">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 w-fit mb-3">
                    <Percent className="h-5 w-5" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t("settings.monetization.convRate", { defaultValue: "Conv. Rate" })}
                  </p>
                  <p className="text-2xl font-black">
                    {marketplaceStats?.data?.avgConversionRate || 0}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Growth Chart */}
            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden">
              <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                <div className="text-start">
                  <CardTitle className="text-2xl font-black tracking-tight">
                    {t("settings.monetization.growthTrend", { defaultValue: "Growth Trend" })}
                  </CardTitle>
                  <CardDescription className="font-bold uppercase text-[10px] tracking-widest">
                    Last 30 Days Marketplace Activity
                  </CardDescription>
                </div>
                <BarChart3 className="h-6 w-6 text-primary opacity-20" />
              </CardHeader>
              <CardContent className="p-8 h-[350px]">
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: "bold" }}
                        tickFormatter={(val) => format(new Date(val), "MMM d")}
                      />
                      <YAxis hide />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderRadius: "1rem",
                          border: "1px solid hsl(var(--border))",
                          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                        }}
                        labelStyle={{ fontWeight: "black", marginBottom: "0.5rem" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(var(--primary))"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                        name="Views"
                      />
                      <Area
                        type="monotone"
                        dataKey="enrollments"
                        stroke="hsl(var(--success))"
                        strokeWidth={4}
                        fill="transparent"
                        name="Sales"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                    <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest">
                      Processing Trend Data...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden">
              <CardHeader className="p-8 pb-4 text-start flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">
                    {t("settings.monetization.recentSales", { defaultValue: "Recent Sales" })}
                  </CardTitle>
                  <CardDescription className="text-xs font-medium mt-1">
                    Your latest marketplace enrollments.
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl font-black text-[10px] uppercase tracking-widest opacity-50"
                >
                  View All <ChevronRight className="ms-1 h-3 w-3" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-start border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-y border-black/5 dark:border-white/5">
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Student
                        </th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Class
                        </th>
                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-end">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 dark:divide-white/5 font-medium">
                      {transactionsLoading ? (
                        [...Array(3)].map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={3} className="px-8 py-6 h-16 bg-muted/5" />
                          </tr>
                        ))
                      ) : transactionsData?.data?.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-8 py-20 text-center text-muted-foreground italic"
                          >
                            No sales yet.
                          </td>
                        </tr>
                      ) : (
                        transactionsData?.data?.map((item: any) => (
                          <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 rounded-xl border border-background shadow-sm">
                                  <AvatarImage src={item.student?.image} />
                                  <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                                    {item.student?.name?.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-black">{item.student?.name}</span>
                                  <span className="text-[10px] opacity-40 uppercase font-bold tracking-tighter">
                                    {format(new Date(item.updatedAt), "MMM d, h:mm a")}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6 text-sm font-bold opacity-60">
                              {item.class?.name}
                            </td>
                            <td className="px-8 py-6 text-end">
                              <span className="text-base font-black text-green-600">
                                +{formatPrice(item.paidAmount)}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar: Earnings & Account */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-[2.5rem] bg-linear-to-br from-green-500 to-emerald-600 border-none shadow-2xl text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Wallet className="h-32 w-32 rotate-12" />
              </div>
              <CardHeader className="p-10 pb-0 relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                  {t("settings.monetization.netEarnings", { defaultValue: "Net Earnings (30d)" })}
                </p>
                <CardTitle className="text-5xl font-black tracking-tighter mt-2">
                  {formatPrice(marketplaceStats?.data?.netEarnings || 0)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 pt-6 relative z-10 space-y-6">
                <div className="flex items-center justify-between text-white/80">
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {t("settings.monetization.platformFees", {
                      defaultValue: "Platform Fees (10%)",
                    })}
                  </span>
                  <span className="text-sm font-black">
                    {formatPrice(marketplaceStats?.data?.platformFees || 0)}
                  </span>
                </div>
                <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest">
                      {t("settings.monetization.grossRevenue", { defaultValue: "Gross Revenue" })}
                    </span>
                    <span className="text-lg font-black">
                      {formatPrice(marketplaceStats?.data?.totalRevenue || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card/50 backdrop-blur-xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Landmark className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-black tracking-tight">
                  {t("settings.monetization.payoutSettings", { defaultValue: "Payout Settings" })}
                </h3>
              </div>

              <div className="p-6 rounded-3xl bg-success/5 border border-success/20 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-success">
                      {t("settings.monetization.accountActive", { defaultValue: "Account Active" })}
                    </p>
                    <p className="text-[10px] font-bold text-success/60 uppercase">
                      {t("settings.monetization.verifiedStripe", {
                        defaultValue: "Verified via Stripe",
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[9px] bg-success hover:bg-success/90"
                  onClick={handleConnectStripe}
                >
                  {t("settings.monetization.manageAccount", { defaultValue: "Manage Account" })}{" "}
                  <ExternalLink className="ms-2 h-3 w-3" />
                </Button>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {t("settings.monetization.payoutCycle", { defaultValue: "Payout Cycle" })}
                  </span>
                  <span className="text-xs font-black">
                    {t("settings.monetization.dailyRolling", { defaultValue: "Daily (Rolling)" })}
                  </span>
                </div>
                <div className="flex items-center justify-between px-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Currency
                  </span>
                  <span className="text-xs font-black uppercase">{currency}</span>
                </div>
              </div>
            </Card>

            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-ai-primary/5 p-8 text-start relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Trophy className="h-16 w-16" />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-ai-primary/60 mb-2">
                {t("settings.monetization.teacherPerks", { defaultValue: "Teacher Perks" })}
              </h3>
              <p className="text-sm font-bold leading-relaxed mb-6">
                You've processed over 50 enrollments this month! You are eligible for the "Top
                Educator" badge.
              </p>
              <Button
                variant="outline"
                className="rounded-full font-black uppercase tracking-widest text-[9px] border-ai-primary/20 text-ai-primary hover:bg-ai-primary/10 h-10"
              >
                {t("settings.monetization.viewRewards", { defaultValue: "View Milestone Rewards" })}
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
