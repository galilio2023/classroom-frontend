import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertTriangle, Activity, Sparkles, ShieldCheck, Info, ArrowRight } from "lucide-react";
import { AtRiskStudentItem } from "./at-risk-student-item";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

interface AtRiskStudent {
  id: string;
  name: string;
  image?: string;
  reason: string;
  value: string;
  riskLevel?: "medium" | "high" | "critical";
  riskAssessmentId?: number;
  interventionStatus?: string;
  suggestedResources?: { title: string; url: string }[];
  aiAnalysis?: {
    strengths: string[];
    weaknesses: string[];
    improvementPlan: string[];
    summary: string;
  };
}

interface AtRiskStudentsProps {
  students: AtRiskStudent[];
}

export const AtRiskStudents = ({ students }: AtRiskStudentsProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  if (students.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="border-none shadow-2xl bg-success/[0.02] backdrop-blur-xl rounded-[2rem] overflow-hidden group">
          <div className="h-1.5 bg-success/20 w-full" />
          <CardHeader className="p-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-success/10 text-success group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className={cn(
                    "text-xl text-success",
                    isArabic ? "font-bold" : "font-black tracking-tight"
                )}>
                    {t("dashboard.staff.atRiskStudents.allClear")}
                </CardTitle>
                <CardDescription className="font-medium text-success/60">
                  {t("dashboard.staff.atRiskStudents.allClearDescription")}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-none shadow-2xl bg-destructive/[0.02] backdrop-blur-xl rounded-[2rem] overflow-hidden group">
        <div className="h-1.5 bg-destructive/20 w-full animate-pulse" />
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-destructive/10 text-destructive group-hover:scale-110 transition-transform duration-500">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <CardTitle className={cn(
                    "text-xl text-destructive",
                    isArabic ? "font-bold" : "font-black tracking-tight"
                )}>
                    {t("dashboard.staff.atRiskStudents.title")}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3 w-3 text-ai-primary opacity-40" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{t("dashboard.staff.atRiskStudents.aiDetected")}</span>
                </div>
              </div>
            </div>
            <Badge variant="destructive" className="rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest animate-pulse border-none shadow-lg shadow-destructive/20">
              {new Intl.NumberFormat(isArabic ? 'ar-EG' : 'en-US').format(students.length)} {isArabic ? "حالات" : "Critical"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4 space-y-4">
          <div className="grid gap-3">
            <AnimatePresence mode="popLayout">
              {students.map((student, idx) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <AtRiskStudentItem student={student} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          <div className="pt-4 border-t border-black/[0.03] dark:border-white/[0.03] flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
            <Info className="h-3 w-3" />
            <span>{t("dashboard.staff.atRiskStudents.interventionRecommended")}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
