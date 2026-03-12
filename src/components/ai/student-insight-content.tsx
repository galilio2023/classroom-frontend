import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Lightbulb, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AIInsight {
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string;
  summary: string;
}

interface StudentInsightContentProps {
  insight: AIInsight;
}

export const StudentInsightContent: React.FC<StudentInsightContentProps> = ({ insight }) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6 py-4">
      {/* Summary Card */}
      <Card className="bg-primary/5 border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            {t("common.aiSummary")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed italic">
            "{insight.summary}"
          </p>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2 text-green-600">
            <TrendingUp className="h-4 w-4" />
            {t("common.strengths")}
          </h4>
          <ul className="space-y-2">
            {insight.strengths.map((s, i) => (
              <li key={i} className="text-xs bg-green-500/10 text-green-700 p-2 rounded-md border border-green-500/20">
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <h4 className="text-sm font-bold flex items-center gap-2 text-amber-600">
            <TrendingDown className="h-4 w-4" />
            {t("common.weaknesses")}
          </h4>
          <ul className="space-y-2">
            {insight.weaknesses.map((w, i) => (
              <li key={i} className="text-xs bg-amber-500/10 text-amber-700 p-2 rounded-md border border-amber-500/20">
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Improvement Plan */}
      <div className="space-y-3">
        <h4 className="text-sm font-bold flex items-center gap-2 text-primary">
          <Lightbulb className="h-4 w-4" />
          {t("common.improvementPlan")}
        </h4>
        <div className="bg-muted p-4 rounded-lg border text-sm leading-relaxed whitespace-pre-wrap">
          {insight.improvementPlan}
        </div>
      </div>
    </div>
  );
};
