import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClassComparison } from "@/types/dashboard";
import { Users } from "lucide-react";
import { formatGrade } from "@/lib/numeric";

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
        <CardDescription>Compare performance across your classes.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class Name</TableHead>
              <TableHead className="text-end">Avg Grade</TableHead>
              <TableHead className="text-end">Attendance</TableHead>
              <TableHead className="text-end">Completion</TableHead>
              <TableHead className="text-end">Students</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((cls) => (
              <TableRow key={cls.classId}>
                <TableCell className="font-medium">{cls.className}</TableCell>
                <TableCell className="text-end font-bold text-primary">
                  {formatGrade(cls.averageGrade)}
                </TableCell>
                <TableCell className="text-end">{formatGrade(cls.attendanceRate)}</TableCell>
                <TableCell className="text-end">{formatGrade(cls.completionRate)}</TableCell>
                <TableCell className="text-end">{cls.studentCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
