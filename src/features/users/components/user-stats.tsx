import { Users as UsersIcon, ShieldAlert, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface Props {
  total: number;
  pending: number;
  active: number;
  isLoading: boolean;
  language: string;
}

export const UserStats = ({ total, pending, active, isLoading, language }: Props) => {
  const { t } = useTranslation();
  const formatter = new Intl.NumberFormat(language);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
      <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
        <div className="p-3.5 rounded-2xl bg-primary/10 text-primary">
          <UsersIcon className="h-6 w-6 md:h-7 md:w-7" />
        </div>
        <div className="text-start">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
            {t("users.governance.stats.totalUsers")}
          </p>
          <p className="text-2xl md:text-3xl font-black">
            {isLoading ? "..." : formatter.format(total)}
          </p>
        </div>
      </Card>
      <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
        <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600">
          <ShieldAlert className="h-6 w-6 md:h-7 md:w-7" />
        </div>
        <div className="text-start">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
            {t("users.governance.stats.pendingVerification")}
          </p>
          <p className="text-2xl md:text-3xl font-black text-amber-600">
            {isLoading ? "..." : formatter.format(pending)}
          </p>
        </div>
      </Card>
      <Card className="p-6 md:p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-4xl md:rounded-[2.5rem] flex items-center gap-5 shadow-sm">
        <div className="p-3.5 rounded-2xl bg-green-500/10 text-green-600">
          <UserCheck className="h-6 w-6 md:h-7 md:w-7" />
        </div>
        <div className="text-start">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">
            {t("users.governance.stats.activeAccounts")}
          </p>
          <p className="text-2xl md:text-3xl font-black text-green-600">
            {isLoading ? "..." : formatter.format(active)}
          </p>
        </div>
      </Card>
    </div>
  );
};
