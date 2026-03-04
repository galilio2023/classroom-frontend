import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { AtRiskStudentItem } from "./at-risk-student-item";

interface AtRiskStudent {
  id: string;
  name: string;
  image?: string;
  reason: string;
  value: string;
}

interface AtRiskStudentsProps {
  students: AtRiskStudent[];
}

export const AtRiskStudents = ({ students }: AtRiskStudentsProps) => {
  if (students.length === 0) return null;

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-lg">At-Risk Students</CardTitle>
        </div>
        <CardDescription>
          Students requiring immediate academic attention.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {students.map((student) => (
          <AtRiskStudentItem key={student.id} student={student} />
        ))}
      </CardContent>
    </Card>
  );
};
