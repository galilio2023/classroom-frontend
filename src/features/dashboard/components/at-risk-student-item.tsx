import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  TrendingDown,
  UserX,
  Send,
  Sparkles,
  Loader2,
  MessageSquare,
  X,
  Info,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  ExternalLink,
  ShieldAlert,
  Zap,
  Trophy,
  ShieldAlert as AlertIcon,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Check,
  BrainCircuit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useCreate, useUpdate, useCustom, useCustomMutation } from "@refinedev/core";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AtRiskStudent {
  id: string;
  name: string;
  image?: string;
  reason: string;
  value: string;
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

interface AtRiskStudentItemProps {
  student: AtRiskStudent;
}

export const AtRiskStudentItem: React.FC<AtRiskStudentItemProps> = ({ student }) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"analysis" | "intervention">("analysis");
  const [feedbackSent, setFeedbackSent] = useState<"pos" | "neg" | null>(null);

  const { mutate: sendNotification, mutation } = useCreate();
  const isSending = mutation.isPending;

  const { mutate: updateAssessment } = useUpdate();
  const { mutate: sendFeedback } = useCustomMutation();

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

  const handleFeedback = (isPositive: boolean) => {
    setFeedbackSent(isPositive ? "pos" : "neg");
    sendFeedback({
      url: "/ai/feedback",
      method: "post",
      values: {
        actionType: "intervention_suggestion",
        isPositive,
        metadata: {
          studentId: student.id,
          reason: student.reason,
          riskLevel: student.aiAnalysis ? "analyzed" : "basic",
        },
      },
    });
  };

  const generateEncouragement = async () => {
    setIsGenerating(true);
    setFeedbackSent(null);
    try {
      const { data } = (await encouragementQuery.refetch()) as any;
      if (data?.data?.message) {
        setMessage(data.data.message);
      } else {
        throw new Error("No message returned");
      }
    } catch (error) {
      const fallbacks: Record<string, string> = {
        "Low Grades": t("dashboard.staff.atRiskStudents.fallbacks.lowGrades", {
          name: student.name,
        }),
        "High Absences": t("dashboard.staff.atRiskStudents.fallbacks.highAbsences", {
          name: student.name,
        }),
        Inactivity: t("dashboard.staff.atRiskStudents.fallbacks.inactivity", {
          name: student.name,
        }),
      };
      setMessage(
        fallbacks[student.reason] ||
          t("dashboard.staff.atRiskStudents.fallbacks.general", {
            name: student.name,
          })
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
          title: t("dashboard.staff.atRiskStudents.interventionTitle", {
            name: "",
          })
            .replace(":", "")
            .trim(),
          message: message,
          type: "achievement",
        },
      },
      {
        onSuccess: () => {
          toast.success(
            t("dashboard.staff.atRiskStudents.encouragementSent", {
              name: student.name,
            })
          );

          if (student.riskAssessmentId) {
            updateAssessment({
              resource: "student_risk_assessments",
              id: student.riskAssessmentId,
              values: { interventionStatus: "notified_student" },
            });
          }

          setIsModalOpen(false);
          setMessage("");
        },
      }
    );
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "notified_student":
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-none text-[8px] font-bold uppercase">
            {t("dashboard.staff.atRiskStudents.status.studentNotified")}
          </Badge>
        );
      case "notified_parent":
        return (
          <Badge className="bg-purple-500/10 text-purple-600 border-none text-[8px] font-bold uppercase">
            {t("dashboard.staff.atRiskStudents.status.parentNotified")}
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-none text-[8px] font-bold uppercase">
            {t("dashboard.staff.atRiskStudents.status.resolved")}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[8px] font-bold uppercase opacity-40">
            {t("dashboard.staff.atRiskStudents.status.noAction")}
          </Badge>
        );
    }
  };

  return (
    <>
      <motion.div
        whileHover={{ x: isArabic ? -5 : 5 }}
        className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-black/3 dark:border-white/3 hover:border-destructive/20 hover:bg-destructive/2 transition-all group cursor-pointer shadow-sm text-start rtl:text-end"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-11 w-11 border-2 border-background shadow-sm group-hover:scale-110 transition-transform duration-500">
              <AvatarImage src={student.image} className="object-cover" />
              <AvatarFallback className="bg-destructive/5 text-destructive font-bold">
                {student.name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -end-1 size-4 bg-destructive rounded-full border-2 border-background flex items-center justify-center">
              <TrendingDown className="h-2 w-2 text-white" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  "text-sm transition-colors",
                  isArabic ? "font-bold" : "font-black tracking-tight"
                )}
              >
                {student.name}
              </p>
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
        <DialogContent className="sm:max-w-[650px] rounded-4xl border-none shadow-2xl bg-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto text-start rtl:text-end p-0">
          <div className="p-8 pb-4">
            <DialogHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-destructive/10 text-destructive w-fit">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-ai-primary/10 text-ai-primary border-none font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">
                    <Sparkles className="w-3 h-3 ltr:me-1 rtl:ms-1" />
                    {t("dashboard.staff.atRiskStudents.aiSupportReady")}
                  </Badge>
                </div>
              </div>
              <DialogTitle
                className={cn("text-2xl", isArabic ? "font-bold" : "font-black tracking-tight")}
              >
                {t("dashboard.staff.atRiskStudents.interventionTitle", {
                  name: student.name,
                })}
              </DialogTitle>
              <DialogDescription className="font-medium">
                {t("dashboard.staff.atRiskStudents.interventionDescription")}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-1 p-1 mt-6 bg-muted/30 rounded-xl w-fit">
              <Button
                variant={activeTab === "analysis" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-4 h-9"
                onClick={() => setActiveTab("analysis")}
              >
                {t("dashboard.staff.atRiskStudents.tabs.analysis")}
              </Button>
              <Button
                variant={activeTab === "intervention" ? "secondary" : "ghost"}
                size="sm"
                className="rounded-lg font-bold text-[10px] uppercase tracking-widest px-4 h-9"
                onClick={() => setActiveTab("intervention")}
              >
                {t("dashboard.staff.atRiskStudents.tabs.intervention")}
              </Button>
            </div>
          </div>

          <div className="px-8 py-4 pb-8 space-y-8">
            <AnimatePresence mode="wait">
              {activeTab === "analysis" ? (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* SUMMARY SECTION */}
                  <div className="p-6 rounded-3xl bg-ai-primary/3 border border-ai-primary/10 space-y-3 relative overflow-hidden group">
                    <div className="absolute top-0 end-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Sparkles className="w-12 h-12 text-ai-primary" />
                    </div>
                    <Label className="text-[10px] font-black uppercase tracking-widest text-ai-primary flex items-center gap-2">
                      <Info className="h-3 w-3" />
                      {t("dashboard.staff.atRiskStudents.guardianSummary")}
                    </Label>
                    <p className="text-sm leading-relaxed font-medium break-words whitespace-pre-wrap">
                      {typeof student.aiAnalysis === "object"
                        ? student.aiAnalysis.summary
                        : student.aiAnalysis || "No analysis available."}
                    </p>
                  </div>

                  {/* STRENGTHS & WEAKNESSES GRID */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-5 rounded-3xl bg-success/3 border border-success/10 space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-success flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("dashboard.staff.atRiskStudents.strengths")}
                      </Label>
                      <div className="space-y-2">
                        {(typeof student.aiAnalysis === "object" &&
                          student.aiAnalysis.strengths?.map((s, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-[11px] font-medium text-success/80 leading-relaxed break-words"
                            >
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-success flex-shrink-0" />
                              <span className="flex-1 min-w-0">{s}</span>
                            </div>
                          ))) || (
                          <span className="text-[11px] text-muted-foreground italic">
                            No strengths identified yet.
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-5 rounded-3xl bg-destructive/3 border border-destructive/10 space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-destructive flex items-center gap-2">
                        <TrendingDown className="h-3 w-3" />
                        {t("dashboard.staff.atRiskStudents.weaknesses")}
                      </Label>
                      <div className="space-y-2">
                        {(typeof student.aiAnalysis === "object" &&
                          student.aiAnalysis.weaknesses?.map((w, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 text-[11px] font-medium text-destructive/80 leading-relaxed break-words"
                            >
                              <span className="mt-1.5 w-1 h-1 rounded-full bg-destructive flex-shrink-0" />
                              <span className="flex-1 min-w-0">{w}</span>
                            </div>
                          ))) || (
                          <span className="text-[11px] text-muted-foreground italic">
                            No risk factors identified.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* IMPROVEMENT PLAN */}
                  <div className="p-6 rounded-3xl bg-primary/3 border border-primary/10 space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Zap className="h-3 w-3" />
                      {t("dashboard.staff.atRiskStudents.plan")}
                    </Label>
                    <div className="grid gap-3">
                      {(typeof student.aiAnalysis === "object" &&
                        student.aiAnalysis.improvementPlan?.map((p, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 p-3 rounded-xl bg-background border border-black/3 shadow-sm"
                          >
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">
                              {i + 1}
                            </div>
                            <span className="text-xs font-semibold break-words">{p}</span>
                          </div>
                        ))) || (
                        <span className="text-xs text-muted-foreground italic">
                          Generating roadmap...
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="intervention"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {student.suggestedResources && student.suggestedResources.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-ai-primary flex items-center gap-2">
                        <Sparkles className="h-3 w-3" />
                        {t("dashboard.staff.atRiskStudents.aiResources")}
                      </Label>
                      <div className="grid gap-3">
                        {student.suggestedResources.map((res, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-4 rounded-2xl bg-ai-primary/5 border border-ai-primary/10 group hover:bg-ai-primary/10 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-white dark:bg-muted/10 shadow-sm">
                                <BookOpen className="h-4 w-4 text-ai-primary" />
                              </div>
                              <span className="text-xs font-bold">{res.title}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full text-ai-primary"
                              asChild
                            >
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
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {t("dashboard.staff.atRiskStudents.sendEncouragement")}
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl font-black uppercase tracking-widest text-[9px] gap-2 border-ai-primary/20 text-ai-primary hover:bg-ai-primary/5 relative overflow-hidden group shadow-sm"
                        onClick={generateEncouragement}
                        disabled={isGenerating}
                      >
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none" />
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
                            className="absolute bottom-4 end-4"
                          >
                            <Sparkles className="h-8 w-8 text-ai-primary" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 🔄 AI FEEDBACK LOOP (Teacher) */}
                    {message && !isGenerating && (
                      <div className="flex items-center gap-3 px-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                          {t("aiHub.studyLab.wasHelpful")}
                        </span>
                        <AnimatePresence mode="wait">
                          {!feedbackSent ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg hover:bg-green-500/10 hover:text-green-600"
                                onClick={() => handleFeedback(true)}
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleFeedback(false)}
                              >
                                <ThumbsDown className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="flex items-center gap-1.5 text-primary"
                            >
                              <Check className="h-3 w-3" />
                              <span className="text-[9px] font-black uppercase tracking-widest">
                                {t("notifications.thankYou")}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <Info className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                      {t("dashboard.staff.atRiskStudents.interventionNote")}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <DialogFooter className="gap-3 pt-4">
              <Button
                variant="ghost"
                className="rounded-xl font-bold h-12"
                onClick={() => setIsModalOpen(false)}
              >
                {t("buttons.cancel")}
              </Button>
              {activeTab === "intervention" && (
                <Button
                  className="rounded-xl font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-primary/20 gap-2"
                  onClick={handleSend}
                  disabled={isSending || !message.trim()}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {t("buttons.sendUpdateStatus")}
                </Button>
              )}
              {activeTab === "analysis" && (
                <Button
                  className="rounded-xl font-black uppercase tracking-widest h-12 px-8 shadow-lg shadow-primary/20 gap-2"
                  onClick={() => setActiveTab("intervention")}
                >
                  {t("buttons.takeAction")}
                  <ArrowRight className="h-4 w-4 ltr:ms-2 rtl:me-2 rtl:rotate-180" />
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
