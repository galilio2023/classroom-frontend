import React from "react";
import { useCustom } from "@refinedev/core";
import { BrainCircuit, Loader2, Sparkles, Volume2, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChildGuardianPulseProps {
  childId: string;
  childName: string;
}

/**
 * 🛡️ CHILD GUARDIAN PULSE
 * Phase 4.3: Parent-facing AI insights for child progress.
 */
export const ChildGuardianPulse: React.FC<ChildGuardianPulseProps> = ({ childId, childName }) => {
  const { query } = useCustom<any>({
    url: `/ai/parent-recap/${childId}`,
    method: "get",
  });

  const { data: result, isLoading } = query;
  const recap = result?.data;

  if (isLoading) {
    return (
      <div className="p-8 rounded-[2rem] bg-purple-50/5 border border-purple-100/10 animate-pulse flex items-center justify-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">
          AI Architect is summarizing {childName}'s week...
        </span>
      </div>
    );
  }

  if (!recap) return null;

  return (
    <div className="p-6 md:p-8 rounded-[2rem] border border-purple-200/50 bg-gradient-to-br from-purple-50/40 to-indigo-50/20 dark:from-purple-950/10 dark:to-indigo-950/5 shadow-xl space-y-6 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 group-hover:scale-110 transition-transform">
            <BrainCircuit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <Badge className="bg-purple-600 text-[8px] font-black uppercase tracking-[0.2em] mb-1">
              AI GUARDIAN INSIGHT
            </Badge>
            <h4 className="text-sm font-black uppercase tracking-tight text-purple-900 dark:text-purple-100">
              {childName}'s Weekly Pulse
            </h4>
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full h-10 w-10 text-purple-600 bg-purple-100/50"
        >
          <Volume2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-purple-600/60 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Excelling In
          </span>
          <p className="text-sm font-medium leading-relaxed">{recap.excelling_in}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-black text-indigo-600/60 uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="h-3 w-3" /> Focus Areas
          </span>
          <p className="text-sm font-medium leading-relaxed">{recap.struggled_with}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-purple-100 dark:border-purple-900/30 flex items-center justify-between gap-4">
        <p className="text-[11px] italic text-muted-foreground leading-snug">
          "{recap.parent_tip}"
        </p>
        <Button className="shrink-0 rounded-xl bg-purple-600 hover:bg-purple-700 text-[10px] font-black uppercase tracking-widest h-10 px-5 shadow-lg shadow-purple-500/20">
          View Analytics
        </Button>
      </div>
    </div>
  );
};
