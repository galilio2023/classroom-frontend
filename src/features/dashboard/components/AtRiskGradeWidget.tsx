import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ShieldAlert,
  AlertTriangle,
  ChevronRight,
  User as UserIcon,
  TrendingDown,
  TrendingUp,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCustom, useNavigation } from "@refinedev/core";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const AtRiskGradeWidget: React.FC = () => {
  const { t } = useTranslation();
  const { push } = useNavigation() as any;

  const { data: queryData, isLoading } = useCustom({
    url: `${import.meta.env.VITE_API_URL}/reports/at-risk`,
    method: "get",
  } as any) as any;

  const students = (queryData?.data as any[]) || [];

  if (isLoading) {
    return <Card className="h-[400px] animate-pulse bg-muted/10 rounded-4xl border-border/40" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden border-2 border-destructive/20 shadow-2xl bg-destructive/5 backdrop-blur-xl rounded-[2.5rem] relative group">
        <CardHeader className="p-8 pb-4 relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-black flex items-center gap-3 tracking-tighter uppercase text-destructive italic">
              <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive group-hover:scale-110 transition-transform duration-500">
                <ShieldAlert className="h-6 w-6" />
              </div>
              At-Risk Performance
            </CardTitle>
            <Badge
              variant="destructive"
              className="rounded-full px-3 py-1 font-black text-[10px] uppercase tracking-widest animate-pulse"
            >
              Action Required
            </Badge>
          </div>
          <CardDescription className="font-medium text-destructive/60">
            Students currently below academic threshold.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8 pt-4 space-y-6 relative">
          <AnimatePresence mode="popLayout">
            {students.length > 0 ? (
              <div className="grid gap-3">
                {students.map((student, idx) => (
                  <motion.div
                    key={student.studentId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="flex items-center justify-between p-4 rounded-3xl bg-background/40 border border-destructive/10 hover:border-destructive/30 transition-all group/item">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="h-10 w-10 rounded-xl border border-destructive/20">
                          <AvatarImage src={student.studentImage} />
                          <AvatarFallback className="bg-destructive/10 text-destructive font-black text-xs">
                            {student.studentName.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0 text-start">
                          <span className="font-black text-sm truncate uppercase tracking-tight">
                            {student.studentName}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge
                              variant="outline"
                              className="h-4 px-1.5 rounded-full text-[7px] font-black border-destructive/20 text-destructive bg-destructive/5"
                            >
                              {student.metric}: {student.value}
                            </Badge>
                            <span className="text-[9px] font-bold text-destructive/60 truncate italic">
                              {student.reason}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 ms-4 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10"
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl hover:bg-destructive/10 transition-all opacity-0 group-hover/item:opacity-100"
                          onClick={() => push(`/users/show/${student.studentId}`)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-emerald-500/5 rounded-[2rem] border border-dashed border-emerald-500/20">
                <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-500 w-fit mx-auto mb-4">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-emerald-700">Organization Healthy</h3>
                <p className="text-xs text-emerald-600/80 font-medium max-w-[200px] mx-auto mt-2">
                  All students are meeting the minimum academic thresholds.
                </p>
              </div>
            )}
          </AnimatePresence>

          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[9px] border-destructive/20 text-destructive hover:bg-destructive/5 gap-2 mt-4"
          >
            View Full Risk Report
            <ArrowRight className="w-3 h-3" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
