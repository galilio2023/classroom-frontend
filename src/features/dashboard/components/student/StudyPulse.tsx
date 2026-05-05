import React from "react";
import { useCustom } from "@refinedev/core";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Loader2, Sparkles, Target, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * 🛰️ STUDY PULSE WIDGET
 * Phase 3.3: Personalized AI Remediation Dashboard for Students.
 */
export const StudyPulse: React.FC = () => {
  const { query } = useCustom<any>({
    url: "/infrastructure/study-plans/my",
    method: "get",
  });

  const { data: result, isLoading } = query;
  const plan = result?.data?.content;

  if (isLoading) {
    return (
      <Card className="border-purple-100 bg-purple-50/10 animate-pulse h-[300px]">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </CardContent>
      </Card>
    );
  }

  if (!plan) {
    return (
      <Card className="border-dashed border-2 bg-zinc-50/50 dark:bg-transparent">
        <CardHeader className="text-center">
          <Sparkles className="h-10 w-10 text-purple-300 mx-auto mb-4" />
          <CardTitle className="text-sm font-bold">Your AI Journey</CardTitle>
          <CardDescription className="text-xs">
            Finish your assignments to get personalized study recommendations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-white to-purple-50/30 dark:from-zinc-950 dark:to-purple-950/10 shadow-xl overflow-hidden group">
      <CardHeader className="pb-4 relative">
        <div className="absolute top-6 right-6 p-2 rounded-xl bg-purple-100 dark:bg-purple-900/30 group-hover:rotate-12 transition-transform">
          <BrainCircuit className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <Badge className="w-fit mb-2 bg-purple-600 hover:bg-purple-600 text-[9px] font-black tracking-widest">
          AI PERSONAL TUTOR
        </Badge>
        <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-300 dark:to-indigo-300">
          Your Success Plan
        </CardTitle>
        <CardDescription className="text-xs font-medium uppercase tracking-tighter opacity-70">
          Personalized remediation based on recent performance
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          {(plan as any[]).map((step, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-zinc-900 border shadow-sm hover:border-purple-300 transition-colors"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-purple-50 dark:bg-purple-950/40 flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 font-black text-sm">
                  {i + 1}
                </span>
              </div>
              <div className="space-y-1">
                <h5 className="text-sm font-bold leading-none">{step.title}</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <Target className="h-3 w-3 text-success" />
                  <span className="text-[10px] font-medium text-success uppercase">
                    {step.goal}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 gap-2 group/btn">
          <span>Ask Personal Tutor about this plan</span>
          <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};
