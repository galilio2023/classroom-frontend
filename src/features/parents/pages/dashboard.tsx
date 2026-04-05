import { useList } from "@refinedev/core";
import { ChildOverviewCard } from "../components/child-overview-card";
import { LinkChildDialog } from "../components/link-child-dialog";
import { ShieldCheck, HeartPulse, LayoutDashboard, Loader2, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

export const ParentDashboard = () => {
  const { t } = useTranslation();

  const { query } = useList({
    resource: "guardian-portal",
  });

  const { data, isLoading, isError } = query;
  const children = data?.data || [];

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground animate-pulse">
          Synchronizing Family Data...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20 text-start">
      {/* Hero Header */}
      <header className="relative py-12 px-8 rounded-[3rem] bg-linear-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
          <ShieldCheck className="h-64 w-64" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <HeartPulse className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black tracking-tight uppercase">
              {t("guardian.dashboard.title", { defaultValue: "Family Portal" })}
            </h1>
          </div>
          <p className="max-w-2xl text-lg font-medium opacity-80 leading-relaxed">
            {t("guardian.dashboard.subtitle", {
              defaultValue:
                "Monitor your children's academic performance, attendance, and well-being in real-time.",
            })}
          </p>
        </div>
      </header>

      {/* Children Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Active Students ({children.length})
          </h2>
          <LinkChildDialog />
        </div>

        {children.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {children.map((child: any) => (
              <ChildOverviewCard key={child.id} child={child} />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-[2rem] bg-muted/20 border-2 border-dashed border-border/50 flex flex-col items-center justify-center text-center gap-4">
            <div className="p-4 rounded-full bg-muted/30">
              <Info className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-black uppercase tracking-widest text-sm">No Children Linked</h3>
              <p className="text-xs font-medium text-muted-foreground max-w-xs">
                Contact your school administrator or use an invite code to link your child's
                account.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
