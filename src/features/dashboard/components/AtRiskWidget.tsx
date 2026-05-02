import React from "react";
import { useCustom, useNavigation } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { ShieldAlert, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useCapabilities } from "@/hooks/use-capabilities";

export const AtRiskWidget: React.FC = () => {
  const { t } = useTranslation();
  const { push } = useNavigation() as any;
  const { identity } = useCapabilities();

  const { query } = useCustom<any[]>({
    url: `${import.meta.env.VITE_API_URL}/reports/at-risk`,
    method: "get",
    queryOptions: {
      refetchInterval: 5 * 60 * 1000, // 5 minutes
    },
  });

  const { data: queryData, isLoading } = query;

  const students = (queryData?.data as any[]) || [];
  const criticalCount = students.filter((s) => s.riskLevel === "critical").length;

  if (isLoading) {
    return <Card className="h-24 animate-pulse bg-muted/10 rounded-3xl border-border/40" />;
  }

  if (criticalCount === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <Card className="overflow-hidden border-none bg-linear-to-br from-destructive/10 via-background to-destructive/5 shadow-2xl rounded-[2rem] relative group border border-destructive/20">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldAlert className="h-24 w-24 text-destructive rotate-12" />
          </div>

          <CardContent className="p-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-destructive flex items-center justify-center shadow-lg shadow-destructive/30 animate-pulse shrink-0">
                  <span className="text-2xl font-black text-white">{criticalCount}</span>
                </div>
                <div className="flex flex-col text-start">
                  <h3 className="font-black text-sm uppercase tracking-tighter text-destructive italic flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    Critical Risk Alert
                  </h3>
                  <p className="text-xs font-bold text-muted-foreground mt-0.5 max-w-sm">
                    {criticalCount === 1
                      ? "One student requires immediate pedagogical intervention."
                      : `${criticalCount} students require immediate pedagogical intervention.`}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => push("/reports/at-risk")}
                variant="ghost"
                size="sm"
                className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[9px] gap-2 hover:bg-destructive hover:text-white transition-all group/btn shrink-0"
              >
                View All
                <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
