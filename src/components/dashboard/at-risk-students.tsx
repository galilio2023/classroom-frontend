import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, UserX } from "lucide-react";

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
          <div key={student.id} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-destructive/10">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-destructive/20">
                <AvatarImage src={student.image} />
                <AvatarFallback>{student.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold leading-none">{student.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {student.reason === "Low Grades" ? (
                    <TrendingDown className="h-3 w-3 text-destructive" />
                  ) : (
                    <UserX className="h-3 w-3 text-destructive" />
                  )}
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {student.reason}
                  </span>
                </div>
              </div>
            </div>
            <Badge variant="destructive" className="text-[10px] font-black px-2 py-0.5">
              {student.value}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
