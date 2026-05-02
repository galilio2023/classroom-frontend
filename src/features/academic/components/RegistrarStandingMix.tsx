import React from "react";
import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface RegistrarStandingMixProps {
  data: Array<{ standing: string; count: number }>;
}

// 🎨 HUB RULE 7: Using institutional theme variables
const CHART_COLORS = [
  "hsl(var(--ai-primary))",
  "hsl(var(--ai-primary) / 0.7)",
  "hsl(var(--ai-primary) / 0.5)",
  "hsl(var(--ai-primary) / 0.3)",
  "hsl(var(--ai-primary) / 0.1)",
];

export const RegistrarStandingMix: React.FC<RegistrarStandingMixProps> = ({ data }) => {
  const hasData = data && data.length > 0;

  return (
    <Card className="rounded-[2.5rem] border-border/40 shadow-2xl p-8">
      <CardHeader className="px-0 pt-0 pb-8">
        <CardTitle className="text-xl font-black uppercase tracking-tight">Standing Mix</CardTitle>
        <CardDescription className="font-medium italic">
          Relative split of institutional standings.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 flex flex-col items-center">
        {hasData ? (
          <>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="standing"
                  >
                    {data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "1rem",
                      border: "none",
                      boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                      fontWeight: 900,
                      textTransform: "uppercase",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-3 mt-8">
              {data.map((s, i) => (
                <div key={s.standing} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                    />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                      {s.standing}
                    </span>
                  </div>
                  <span className="text-xs font-black">{s.count}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[350px] flex flex-col items-center justify-center text-muted-foreground/20">
            <BarChart3 className="h-16 w-16 mb-4 rotate-90" />
            <p className="font-black uppercase tracking-[0.2em] text-[10px]">Mix Empty</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
