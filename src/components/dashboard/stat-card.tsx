import React, { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  className?: string;
}

const CountUp: React.FC<{ value: number }> = ({ value }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return controls.stop;
  }, [count, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
};

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color, className }) => {
  const isNumber = typeof value === "number";

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card className={cn("border-none shadow-md hover:shadow-xl transition-shadow overflow-hidden group bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl", className)}>
        <CardContent className="flex items-center p-6 gap-4 relative">
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon className="h-12 w-12" />
          </div>
          <div className={cn("p-3 rounded-2xl bg-muted transition-colors group-hover:bg-primary/10", color)}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="z-10">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
            <h3 className="text-2xl font-black tracking-tight">
              {isNumber ? <CountUp value={value as number} /> : value}
            </h3>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
