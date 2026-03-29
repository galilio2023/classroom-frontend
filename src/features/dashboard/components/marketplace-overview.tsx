import { MarketplaceEarnings, TransactionItem } from "@/types/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CircleDollarSign,
  TrendingUp,
  ShoppingBag,
  ArrowUpRight,
  User,
  Calendar,
  Wallet,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface MarketplaceOverviewProps {
  earnings?: MarketplaceEarnings;
  transactions?: TransactionItem[];
}

export const MarketplaceOverview = ({ earnings, transactions }: MarketplaceOverviewProps) => {
  const { t } = useTranslation();

  if (!earnings && (!transactions || transactions.length === 0)) return null;

  const formatPrice = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 mb-2 px-2">
        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shadow-sm border border-amber-500/5">
          <CircleDollarSign className="h-5 w-5" />
        </div>
        <div className="flex flex-col text-start">
          <h2 className="text-2xl font-black tracking-tight leading-none">
            {t("dashboard.staff.marketplaceEarnings", { defaultValue: "Monetization Overview" })}
          </h2>
          <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.2em] mt-1.5">
            Earnings & Sales
          </span>
        </div>
        <div className="h-px flex-1 bg-linear-to-r from-amber-500/20 to-transparent" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-4xl border-black/5 dark:border-white/5 bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden group border-b-4 border-b-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              {t("dashboard.staff.netEarnings", { defaultValue: "Net Earnings" })}
            </CardTitle>
            <div className="p-2 rounded-xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="text-start">
            <div className="text-3xl font-black text-green-600 dark:text-green-400">
              {formatPrice(earnings?.netEarnings || 0)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">
              {t("dashboard.staff.availableForPayout", { defaultValue: "Your 90% share" })}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-4xl border-black/5 dark:border-white/5 bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              {t("dashboard.staff.totalRevenue", { defaultValue: "Total Revenue" })}
            </CardTitle>
            <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="text-start">
            <div className="text-3xl font-black">{formatPrice(earnings?.totalRevenue || 0)}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">
              {t("dashboard.staff.grossVolume", { defaultValue: "Gross volume (30d)" })}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-4xl border-black/5 dark:border-white/5 bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              {t("dashboard.staff.enrollmentSales", { defaultValue: "Class Sales" })}
            </CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="text-start">
            <div className="text-3xl font-black">{earnings?.totalSales || 0}</div>
            <p className="text-[10px] text-muted-foreground mt-1 font-bold uppercase tracking-wider">
              {t("dashboard.staff.paidEnrollments", { defaultValue: "Paid Enrollments" })}
            </p>
          </CardContent>
        </Card>
      </div>

      {transactions && transactions.length > 0 && (
        <Card className="rounded-[2.5rem] border-black/5 dark:border-white/5 bg-card/50 backdrop-blur-xl shadow-2xl shadow-black/5 overflow-hidden">
          <CardHeader className="p-8 pb-4 text-start border-b border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black tracking-tight leading-none mb-1">
                  {t("dashboard.staff.recentTransactions", { defaultValue: "Recent Transactions" })}
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                  Latest Marketplace Activity
                </CardDescription>
              </div>
              <div className="p-2.5 rounded-2xl bg-muted/50 border border-black/5 dark:border-white/5">
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {transactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 flex items-center justify-between hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 rounded-2xl border-2 border-white/10 shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <AvatarImage src={tx.studentImage} />
                      <AvatarFallback className="rounded-2xl bg-primary/10 text-primary font-black">
                        {tx.studentName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-start">
                      <h4 className="font-black text-sm tracking-tight group-hover:text-primary transition-colors">
                        {tx.studentName}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          <ShoppingBag className="h-3 w-3" />
                          {tx.className}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                        <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(tx.date), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="text-base font-black tracking-tight text-green-600 dark:text-green-400">
                      +{formatPrice(tx.amount, tx.currency)}
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-40 mt-0.5">
                      Net: {formatPrice(Math.round(tx.amount * 0.9), tx.currency)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
