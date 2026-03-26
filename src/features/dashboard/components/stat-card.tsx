import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useTranslation } from "react-i18next";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  className?: string;
  trend?: {
    value: number;
    isUp: boolean;
  };
}

const CountUp = ({ value, locale }: { value: number; locale: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    const num = Math.round(latest);
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(
      num,
    );
  });

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [count, value]);

  return <motion.span>{rounded}</motion.span>;
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  className,
  trend,
}) => {
  const { i18n } = useTranslation();
  const isNumber = typeof value === "number";
  const isArabic = i18n.language === "ar";

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Card
        className={cn(
          "h-full border border-border/80 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group bg-card/50 backdrop-blur-2xl rounded-[1.5rem] md:rounded-4xl relative",
          "after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] dark:after:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] after:pointer-events-none",
          className,
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none transition-all duration-1000",
            isArabic
              ? "translate-x-full group-hover:animate-[shine-rtl_2s_infinite]"
              : "-translate-x-full group-hover:animate-[shine_2s_infinite]",
          )}
        />

        <CardContent className="flex flex-col p-5 md:p-8 gap-4 md:gap-6 relative h-full justify-between text-start">
          <div className="absolute end-[-1rem] top-[-1rem] p-2 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 rtl:-rotate-12 ltr:rotate-12 group-hover:rotate-0 group-hover:scale-110 pointer-events-none">
            <Icon className="h-24 w-24 md:h-32 md:w-32" />
          </div>

          <div className="space-y-4 md:space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "p-2.5 md:p-3.5 rounded-xl md:rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-lg",
                  "bg-background/80 backdrop-blur-md border border-black/3 dark:border-white/3 text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5 md:h-6 md:w-6", color)} />
              </div>
              {trend && (
                <div
                  className={cn(
                    "rounded-full px-2 py-0.5 md:px-3 md:py-1 font-black text-[9px] md:text-[10px] uppercase tracking-widest border-none shadow-sm flex items-center gap-1",
                    trend.isUp
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500",
                  )}
                >
                  <span dir="ltr">
                    {trend.isUp ? "+" : "-"}
                    {new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US").format(
                      trend.value,
                    )}
                    %
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <p
                className={cn(
                  "text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 truncate",
                  isArabic ? "font-bold" : "font-black",
                )}
              >
                {label}
              </p>
              <div className="flex items-baseline gap-2">
                <h3
                  className={cn(
                    "text-2xl xs:text-3xl md:text-4xl text-foreground",
                    isArabic ? "font-bold" : "font-black tracking-tighter",
                  )}
                >
                  {isNumber ? (
                    <CountUp value={value as number} locale={i18n.language} />
                  ) : (
                    value
                  )}
                </h3>
                {isNumber && (value as number) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 }}
                    className="hidden xs:block"
                  >
                    <Sparkles className="h-4 w-4 text-primary/40" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2 md:mt-4 h-1 md:h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={cn("h-full rounded-full opacity-40 bg-primary")}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
