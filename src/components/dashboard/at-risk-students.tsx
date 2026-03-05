import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, TrendingDown, Clock, Activity } from "lucide-react";
import { AtRiskStudentItem } from "./at-risk-student-item";
import { Badge } from "@/components/ui/badge";

interface AtRiskStudent {
  id: string;
  name: string;
  image?: string;
  reason: string;
  value: string;
  riskLevel?: "medium" | "high" | "critical";
  aiAnalysis?: string;
}

interface AtRiskStudentsProps {
  students: AtRiskStudent[];
}

export const AtRiskStudents = ({ students }: AtRiskStudentsProps) => {
  if (students.length === 0) {
    return (
        <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg text-green-700">All Clear</CardTitle>
                </div>
                <CardDescription className="text-green-600/80">
                    No students are currently flagged as at-risk. Great job!
                </CardDescription>
            </CardHeader>
        </Card>
    );
  }

  return (
    <Card className="border-destructive/20 bg-destructive/5 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <CardTitle className="text-lg text-destructive">At-Risk Students</CardTitle>
            </div>
            <Badge variant="destructive" className="animate-pulse">
                {students.length} Critical
            </Badge>
        </div>
        <CardDescription>
          AI-detected students requiring immediate intervention.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {students.map((student) => (
          <AtRiskStudentItem key={student.id} student={student} />
        ))}
      </CardContent>
    </Card>
  );
};
