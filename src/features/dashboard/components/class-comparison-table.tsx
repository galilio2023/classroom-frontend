import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClassComparison } from "@/types/dashboard";
import { Users, TrendingUp, CheckCircle } from "lucide-react";

interface ClassComparisonTableProps {
  data: ClassComparison[];
}

export const ClassComparisonTable = ({ data }: ClassComparisonTableProps) => {
  return (
    <Card className="border shadow-md bg-card/50 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg font-bold">
          <Users className="h-5 w-5 text-primary" />
          Class Comparison
        </CardTitle>
        <CardDescription>
          Compare performance across your classes.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Name</TableHead>
              <TableHead className="text-right">Avg Grade</TableHead>
              <TableHead className="text-right">Attendance</TableHead>
              <TableHead className="text-right">Completion</TableHead>
              <TableHead className="text-right">Students</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((cls) => (
              <TableRow key={cls.classId}>
                <TableCell className="font-medium">{cls.className}</TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {cls.averageGrade}%
                </TableCell>
                <TableCell className="text-right">
                  {cls.attendanceRate}%
                </TableCell>
                <TableCell className="text-right">
                  {cls.completionRate}%
                </TableCell>
                <TableCell className="text-right">{cls.studentCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
