import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";
import { AssignmentCompletionTrend } from "@/types/dashboard";
import { NoChartData } from "./no-chart-data";

interface AssignmentCompletionChartProps {
  data: AssignmentCompletionTrend[];
}

export const AssignmentCompletionChart = ({ data }: AssignmentCompletionChartProps) => {
  const hasData = data && data.length > 0;

  return (
    <Card className="border shadow-md bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
          </div>
          Assignment Completion Trend
        </CardTitle>
        <CardDescription>Completion rates over time for recent assignments.</CardDescription>
      </CardHeader>
      <CardContent className="h-64 pt-4">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
              <XAxis 
                dataKey="assignmentTitle" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                tickLine={false}
                axisLine={false}
                unit="%"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))', 
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => [`${value}%`, 'Completion Rate']}
              />
              <Line 
                type="monotone" 
                dataKey="completionRate" 
                stroke="#6366f1" // Indigo-500
                strokeWidth={3}
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: 'white' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <NoChartData icon={TrendingUp} message="No assignment data available" />
        )}
      </CardContent>
    </Card>
  );
};
