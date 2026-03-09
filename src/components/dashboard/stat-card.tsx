import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";

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

const CountUp: React.FC<{ value: number }> = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, value, { duration: 2, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [count, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, className, trend }) => {
  const isNumber = typeof value === "number";

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="h-full"
    >
      <Card className={cn(
        "h-full border-none shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group bg-card/50 backdrop-blur-2xl rounded-[2rem] relative",
        className
      )}>
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shine_2s_infinite] pointer-events-none" />
        
        <CardContent className="flex flex-col p-8 gap-6 relative h-full justify-between">
          {/* Background Icon for Depth */}
          <div className="absolute -right-4 -top-4 p-2 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 rotate-12 group-hover:rotate-0 group-hover:scale-110">
            <Icon className="h-32 w-32" />
          </div>

          <div className="space-y-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className={cn(
                "p-3.5 rounded-2xl transition-all duration-500 group-hover:scale-110 shadow-lg",
                "bg-background/80 backdrop-blur-md border border-black/[0.03] dark:border-white/[0.03]",
                color
              )}>
                <Icon className="h-6 w-6" />
              </div>
              {trend && (
                <Badge className={cn(
                  "rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest border-none shadow-sm",
                  trend.isUp ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                )}>
                  {trend.isUp ? "+" : "-"}{trend.value}%
                </Badge>
              )}
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">{label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black tracking-tighter text-foreground">
                  {isNumber ? <CountUp value={value as number} /> : value}
                </h3>
                {isNumber && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <Sparkles className="h-4 w-4 text-primary/40" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Accent Bar */}
          <div className="mt-4 h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={cn("h-full rounded-full opacity-40", color.replace('text-', 'bg-'))}
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", className)}>
    {children}
  </div>
);
