import React from "react";
import { useCustom } from "@refinedev/core";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, User, ChevronRight, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const AtRiskStudentsList: React.FC = () => {
  const { t } = useTranslation();

  const { query } = useCustom({
    url: "/reports/at-risk",
    method: "get",
  });

  const students = query.data?.data || [];

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="glass-card border-none shadow-none bg-transparent">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500">
            <AlertCircle className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase tracking-tight">Zero At-Risk Students</h4>
            <p className="text-[10px] text-muted-foreground font-medium">
              Institutional academic performance is currently healthy.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {students.slice(0, 5).map((student: any) => (
        <Card
          key={student.id}
          className="border-border/40 shadow-sm hover:shadow-md transition-all group overflow-hidden bg-card/40 backdrop-blur-3xl"
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
                <div className="text-start">
                  <p className="text-xs font-black uppercase tracking-tight truncate max-w-[150px]">
                    {student.name}
                  </p>
                  <p className="text-[9px] font-bold text-muted-foreground">
                    {student.class?.name || "Class"} • {student.subject?.name || "Subject"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-end">
                  <p className="text-xs font-black text-destructive">
                    {student.currentGrade?.toFixed(1) || 0}%
                  </p>
                  <Badge
                    variant="outline"
                    className="h-4 text-[7px] font-black uppercase border-destructive/20 text-destructive bg-destructive/5"
                  >
                    Failing
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {students.length > 5 && (
        <Button
          variant="ghost"
          className="w-full h-10 text-[9px] font-black uppercase tracking-widest gap-2"
        >
          View All {students.length} Students
          <ArrowRight className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};
