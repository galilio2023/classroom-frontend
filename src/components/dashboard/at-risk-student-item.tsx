import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, UserX, Send, Sparkles, Loader2, MessageSquare, X, Info, CheckCircle2, ArrowRight, BookOpen, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useCreate, useCustom, useUpdate } from "@refinedev/core";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

interface AtRiskStudent {
  id: string;
  name: string;
  image?: string;
  reason: string;
  value: string;
  riskAssessmentId?: number;
  interventionStatus?: string;
  suggestedResources?: { title: string; url: string }[];
}

interface AtRiskStudentItemProps {
  student: AtRiskStudent;
}

export const AtRiskStudentItem: React.FC<AtRiskStudentItemProps> = ({
  student,
}) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { mutate: sendNotification, mutation } = useCreate();
  const isSending = mutation.isPending;

  const { mutate: updateAssessment } = useUpdate();

  const { query: encouragementQuery } = useCustom({
    url: "/ai/generate-encouragement",
    method: "post",
    config: {
      payload: {
        studentName: student.name,
        reason: student.reason,
        value: student.value,
      },
    },
    queryOptions: {
      enabled: false,
    },
  });

  const generateEncouragement = async () => {
    setIsGenerating(true);
    try {
      const { data } = await encouragementQuery.refetch();
      if (data?.data?.message) {
        setMessage(data.data.message);
      } else {
        throw new Error("No message returned");
      }
    } catch (error) {
      const fallbacks: Record<string, string> = {
        "Low Grades": t("dashboard.staff.atRiskStudents.fallbacks.lowGrades", { name: student.name }),
        "High Absences": t("dashboard.staff.atRiskStudents.fallbacks.highAbsences", { name: student.name }),
        Inactivity: t("dashboard.staff.atRiskStudents.fallbacks.inactivity", { name: student.name }),
      };
      setMessage(
        fallbacks[student.reason] ||
          t("dashboard.staff.atRiskStudents.fallbacks.general", { name: student.name }),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    sendNotification(
      {
        resource: "notifications",
        values: {
          userId: student.id,
          title: t("dashboard.staff.atRiskStudents.interventionTitle", { name: "" }).replace(":", "").trim(),
          message: message,
          type: "achievement",
        },
      },
      {
        onSuccess: () => {
          toast.success(t("dashboard.staff.atRiskStudents.encouragementSent", { name: student.name }));
          
          if (student.riskAssessmentId) {
            updateAssessment({
              resource: "student_risk_assessments",
              id: student.riskAssessmentId,
              values: { interventionStatus: "notified_student" }
            });
          }

          setIsModalOpen(false);
          setMessage("");
        },
      },
    );
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "notified_student": return <Badge className="bg-blue-500/10 text-blue-600 border-none text-[8px] font-bold uppercase">{t("dashboard.staff.atRiskStudents.status.studentNotified")}</Badge>;
      case "notified_parent": return <Badge className="bg-purple-500/10 text-purple-600 border-none text-[8px] font-bold uppercase">{t("dashboard.staff.atRiskStudents.status.parentNotified")}</Badge>;
      case "resolved": return <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] font-bold uppercase">{t("dashboard.staff.atRiskStudents.status.resolved")}</Badge>;
      default: return <Badge variant="outline" className="text-[8px] font-bold uppercase opacity-40">{t("dashboard.staff.atRiskStudents.status.noAction")}</Badge>;
    }
  };

  return (
    <>
      <motion.div 
        whileHover={{ x: isArabic ? -5 : 5 }}
        className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-black/[0.03] dark:border-white/[0.03] hover:border-destructive/20 hover:bg-destructive/[0.02] transition-all group cursor-pointer shadow-sm text-left rtl:text-right"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-11 w-11 border-2 border-background shadow-sm group-hover:scale-110 transition-transform duration-500">
              <AvatarImage src={student.image} className="object-cover" />
              <AvatarFallback className="bg-destructive/5 text-destructive font-bold">{student.name[0]}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 size-4 bg-destructive rounded-full border-2 border-background flex items-center justify-center">
              <TrendingDown className="h-2 w-2 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className={cn("text-sm transition-colors", isArabic ? "font-bold" : "font-black tracking-tight")}>{student.name}</p>
              {getStatusBadge(student.interventionStatus)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {student.reason}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge
            variant="destructive"
            className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border-none bg-destructive/10 text-destructive shadow-sm"
          >
            {student.value}
          </Badge>
          <div className="p-2 rounded-full bg-muted/50 group-hover:bg-primary group-hover:text-primary-foreground transition-all opacity-0 group-hover:opacity-100">
            <Send className="h-3.5 w-3.5 rtl:rotate-180" />
          </div>
        </div>
      </motion.div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl bg-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto text-left rtl:text-right">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-destructive/10 text-destructive w-fit">
                <ShieldAlert className="h-6 w-6" />
              </div>
              {student.suggestedResources && student.suggestedResources.length > 0 && (
                <Badge className="bg-ai-primary/10 text-ai-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                  <Sparkles className="w-3 h-3 ltr:mr-1 rtl:ml-1" />
                  {t("dashboard.staff.atRiskStudents.aiSupportReady")}
                </Badge>
              )}
            </div>
            <DialogTitle className={cn("text-2xl", isArabic ? "font-bold" : "font-black tracking-tight")}>
                {t("dashboard.staff.atRiskStudents.interventionTitle", { name: student.name })}
            </DialogTitle>
            <DialogDescription className="font-medium">
              {t("dashboard.staff.atRiskStudents.interventionDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-8 py-6">
            {student.suggestedResources && student.suggestedResources.length > 0 && (
              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-widest text-ai-primary flex items-center gap-2">
                  <Sparkles className="h-3 w-3" />
                  {t("dashboard.staff.atRiskStudents.aiResources")}
                </Label>
                <div className="grid gap-3">
                  {student.suggestedResources.map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-ai-primary/5 border border-ai-primary/10 group hover:bg-ai-primary/10 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 shadow-sm">
                          <BookOpen className="h-4 w-4 text-ai-primary" />
                        </div>
                        <span className="text-xs font-bold">{res.title}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-ai-primary" asChild>
                        <a href={res.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("dashboard.staff.atRiskStudents.sendEncouragement")}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 relative overflow-hidden group shadow-sm"
                  onClick={generateEncouragement}
                  disabled={isGenerating}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none" />
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {t("buttons.aiSuggestion")}
                </Button>
              </div>
              <div className="relative group">
                <Textarea
                  placeholder={t("dashboard.staff.atRiskStudents.encouragementPlaceholder")}
                  className="min-h-[150px] rounded-2xl bg-muted/20 border-none focus-visible:ring-primary p-6 text-sm leading-relaxed shadow-inner transition-all resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <AnimatePresence>
                  {message && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 0.1, scale: 1 }}
                      className="absolute bottom-4 right-4"
                    >
                      <Sparkles className="h-8 w-8 text-ai-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <Info className="h-4 w-4 text-primary mt-0.5" />
              <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                {t("dashboard.staff.atRiskStudents.interventionNote")}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button variant="ghost" className="rounded-xl font-bold h-12" onClick={() => setIsModalOpen(false)}>
              {t("buttons.cancel")}
            </Button>
            <Button
              className="rounded-xl font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-primary/20 gap-2"
              onClick={handleSend}
              disabled={isSending || !message.trim()}
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {t("buttons.sendUpdateStatus")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
