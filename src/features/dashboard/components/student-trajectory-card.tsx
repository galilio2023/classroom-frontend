import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { StudentTrajectory } from "@/types/dashboard";
import { cn } from "@/lib/utils";

interface StudentTrajectoryCardProps {
  student: StudentTrajectory;
}

export const StudentTrajectoryCard = ({ student }: StudentTrajectoryCardProps) => {
  const { studentName, currentGrade, predictedGrade, trend } = student;
  const isImproving = predictedGrade > currentGrade;
  const isDeclining = predictedGrade < currentGrade;
  const _isStablee = predictedGrade === currentGrade;

  const trendIcon = isImproving ? (
    <TrendingUp className="text-green-500" />
  ) : isDeclining ? (
    <TrendingDown className="text-red-500" />
  ) : (
    <Minus className="text-muted-foreground" />
  );

  const trendColor = isImproving
    ? "text-green-500"
    : isDeclining
      ? "text-red-500"
      : "text-muted-foreground";

  return (
    <Card className="border shadow-sm bg-card/50 backdrop-blur-xl hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium truncate">{studentName}</CardTitle>
        <CardDescription className="text-xs">Current Grade: {currentGrade}%</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Predicted Final</span>
            <span className={cn("text-2xl font-bold", trendColor)}>{predictedGrade}%</span>
          </div>
          <div className="p-2 bg-muted/20 rounded-full">{trendIcon}</div>
        </div>
        <div className="mt-4 h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500",
              isImproving ? "bg-green-500" : isDeclining ? "bg-red-500" : "bg-primary"
            )}
            style={{ width: `${Math.min(predictedGrade, 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};
