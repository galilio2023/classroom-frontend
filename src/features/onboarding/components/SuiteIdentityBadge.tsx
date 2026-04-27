import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Building2, Library, ShieldCheck } from "lucide-react";
import { useCapabilities } from "@/hooks/use-capabilities";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

export const SuiteIdentityBadge: React.FC = () => {
  const { suiteType } = useCapabilities();
  const { open, isMobile } = useSidebar();

  const SUITE_CONFIGS = {
    private: {
      icon: Sparkles,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      label: "Private",
    },
    school: {
      icon: Building2,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      label: "School",
    },
    faculty: {
      icon: Library,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
      label: "Faculty",
    },
    corporate: {
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      label: "Corporate",
    },
  };

  const suiteConfig =
    SUITE_CONFIGS[suiteType as keyof typeof SUITE_CONFIGS] || SUITE_CONFIGS.private;

  const Icon = suiteConfig.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2.5 py-1 rounded-lg border transition-all duration-500",
        suiteConfig.bg,
        suiteConfig.border,
        !open && !isMobile ? "p-1.5" : "px-2.5"
      )}
    >
      <Icon className={cn("w-3.5 h-3.5", suiteConfig.color)} />
      <AnimatePresence>
        {(open || isMobile) && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className={cn("text-[10px] font-black uppercase tracking-widest", suiteConfig.color)}
          >
            {suiteConfig.label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

// Internal re-export to avoid circular or missing hook issues in this turn
import { useSidebar as useShadcnSidebar } from "@/components/ui/sidebar";
