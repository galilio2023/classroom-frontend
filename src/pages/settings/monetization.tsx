import { useGetIdentity, useCustomMutation, useCustom, useList } from "@refinedev/core";
import { User, UserRole, Enrollment } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CircleDollarSign,
  Wand2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Trophy,
  Landmark,
  TrendingUp,
  ShoppingBag,
  Wallet,
  Clock,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function MonetizationSettings() {
  const { t } = useTranslation();
  const { data: user, isLoading: userLoading, refetch: refetchUser } = useGetIdentity<User>();
  const [searchParams] = useSearchParams();

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

  const { data: statsData } = useCustom({
    url: "stats/teacher/summary", // We'll assume the dashboard data includes this or fetch specifically
    method: "get",
    queryOptions: { enabled: !!isConnected },
  }) as any;

  const stripeBalance = balanceData?.data?.balance;
  const availableBalance = stripeBalance?.available?.[0]?.amount || 0;
  const pendingBalance = stripeBalance?.pending?.[0]?.amount || 0;
  const currency = stripeBalance?.available?.[0]?.currency || "USD";

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
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 text-start">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-3">
            <CircleDollarSign className="h-10 w-10 text-primary" />
            {t("settings.monetization.title", { defaultValue: "Earnings & Payouts" })}
          </h1>
          <p className="text-muted-foreground font-medium text-lg">
            {t("settings.monetization.subtitle", {
              defaultValue:
                "Track your revenue, manage your bank account, and view student payments.",
            })}
          </p>
        </div>

        {isConnected && (
          <div className="flex gap-4">
            <Card className="bg-success/5 border-success/20 px-6 py-3 rounded-2xl flex flex-col items-end">
              <span className="text-[10px] font-bold text-success/60 uppercase tracking-widest">
                Available to Payout
              </span>
              <span className="text-xl font-black text-success">
                {balanceLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mt-1" />
                ) : (
                  formatPrice(availableBalance, currency)
                )}
              </span>
            </Card>
            <Card className="bg-muted/50 border-black/5 px-6 py-3 rounded-2xl flex flex-col items-end">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Pending
              </span>
              <span className="text-xl font-black opacity-40">
                {balanceLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mt-1" />
                ) : (
                  formatPrice(pendingBalance, currency)
                )}
              </span>
            </Card>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          {/* Hero Metrics */}
          {isConnected && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="rounded-[2.5rem] bg-card/50 backdrop-blur-xl shadow-2xl border-none overflow-hidden group border-b-4 border-b-green-500">
                <CardContent className="p-8 text-start space-y-2">
                  <div className="p-3 rounded-2xl bg-green-500/10 text-green-500 w-fit mb-4">
                    <Wallet className="h-6 w-6" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Net Earnings
                  </h3>
                  <p className="text-3xl font-black text-green-600">
                    {formatPrice(statsData?.data?.marketplaceEarnings?.netEarnings || 0)}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground">
                    Your 90% platform share
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] bg-card/50 backdrop-blur-xl shadow-2xl border-none overflow-hidden group">
                <CardContent className="p-8 text-start space-y-2">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary w-fit mb-4">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Total Revenue
                  </h3>
                  <p className="text-3xl font-black">
                    {formatPrice(statsData?.data?.marketplaceEarnings?.totalRevenue || 0)}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground">
                    Gross enrollment sales
                  </p>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] bg-card/50 backdrop-blur-xl shadow-2xl border-none overflow-hidden group">
                <CardContent className="p-8 text-start space-y-2">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 w-fit mb-4">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Paid Students
                  </h3>
                  <p className="text-3xl font-black">
                    {statsData?.data?.marketplaceEarnings?.totalSales || 0}
                  </p>
                  <p className="text-[10px] font-bold text-muted-foreground">
                    Total successful payments
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Transaction Ledger */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl bg-card/50 backdrop-blur-xl overflow-hidden">
            <CardHeader className="p-8 pb-4 text-start flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black tracking-tight">
                  Transaction Ledger
                </CardTitle>
                <CardDescription className="text-xs font-medium mt-1">
                  Granular proof of your platform income.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl font-bold uppercase tracking-widest text-[10px] opacity-50"
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
                        Date
                      </th>
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
                  <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {transactionsLoading ? (
                      [...Array(3)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="px-8 py-6 h-16 bg-muted/10" />
                        </tr>
                      ))
                    ) : transactionsData?.data?.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-8 py-20 text-center text-muted-foreground italic"
                        >
                          No transactions found yet.
                        </td>
                      </tr>
                    ) : (
                      transactionsData?.data?.map((enrollment: any) => (
                        <tr
                          key={enrollment.id}
                          className="hover:bg-muted/20 transition-colors group"
                        >
                          <td className="px-8 py-6">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">
                                {format(new Date(enrollment.updatedAt), "MMM d, yyyy")}
                              </span>
                              <span className="text-[10px] opacity-40 font-mono uppercase">
                                {format(new Date(enrollment.updatedAt), "h:mm a")}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={enrollment.student?.image} />
                                <AvatarFallback className="bg-primary/10 text-primary font-black text-[10px]">
                                  {enrollment.student?.name?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-black">{enrollment.student?.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-sm font-medium opacity-60">
                            {enrollment.class?.name}
                          </td>
                          <td className="px-8 py-6 text-end">
                            <div className="flex flex-col items-end">
                              <span className="text-base font-black text-green-600">
                                +{formatPrice(enrollment.paidAmount)}
                              </span>
                              <span className="text-[10px] font-bold text-muted-foreground">
                                Net share: {formatPrice(Math.round(enrollment.paidAmount * 0.9))}
                              </span>
                            </div>
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

        <div className="lg:col-span-4 space-y-8">
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl rounded-4xl overflow-hidden border-2 border-dashed border-primary/10">
            <CardHeader className="p-8 pb-4 text-start">
              <CardTitle className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" />
                {t("settings.monetization.payoutStatus", { defaultValue: "Payout Status" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-4 space-y-6">
              {isConnected ? (
                <div className="space-y-6">
                  <div className="p-6 rounded-3xl bg-success/5 border border-success/20 flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-success/10 text-success shadow-sm">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div className="text-start">
                      <h3 className="text-xl font-black text-success">
                        {t("settings.monetization.connected", { defaultValue: "Active" })}
                      </h3>
                      <p className="text-xs font-medium text-success/70">
                        Everything is set up. Your payouts are automated.
                      </p>
                    </div>
                  </div>
                  <Button
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                    onClick={handleConnectStripe}
                  >
                    Manage Stripe Account
                    <ExternalLink className="ms-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 flex flex-col items-center text-center space-y-6">
                  <div className="p-5 rounded-full bg-primary/10 text-primary">
                    <Wand2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight leading-tight">
                    Connect to Stripe to start receiving payouts.
                  </h3>
                  <Button
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                    onClick={handleConnectStripe}
                    disabled={linkLoading}
                  >
                    {linkLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin me-2" />
                    ) : (
                      <CircleDollarSign className="h-5 w-5 me-2" />
                    )}
                    Setup Payouts
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-2xl bg-primary/5 rounded-4xl p-8 text-start space-y-6">
            <h3 className="text-lg font-black uppercase tracking-widest text-primary/60">
              Platform Fees
            </h3>
            <p className="text-sm font-medium leading-relaxed opacity-70 italic">
              "We only win when you win. Our flat 10% platform fee covers hosting, AI generation
              costs, and 24/7 global student support."
            </p>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/50 dark:bg-black/20">
              <span className="text-sm font-bold">Standard Fee</span>
              <Badge className="bg-primary/10 text-primary border-none font-black">10.0%</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
import { Zap } from "lucide-react";
