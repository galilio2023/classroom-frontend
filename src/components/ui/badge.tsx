import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        secondary:
          "border-transparent bg-secondary/80 backdrop-blur-sm text-secondary-foreground hover:bg-secondary shadow-sm",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "text-foreground bg-background/50 backdrop-blur-sm border-border hover:bg-accent",
        success:
          "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        warning:
          "border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        ai: "bg-linear-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
